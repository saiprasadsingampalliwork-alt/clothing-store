"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api as request, customerToken, setCustomerToken, setStaffToken, staffToken } from "./api";
import { forgetCategory, getProduct, installCatalog, installCategories, liveProduct, rememberCategory, rememberProduct, toProduct, unitsAvailable, type ApiProduct, type Product, type ProductOverride, type ShopCategory, type Size } from "./catalog";
import { defaultCoupons, evaluateCoupon, formatINR, shippingFee, type CouponRecord } from "./money";
import { applyStoreSale } from "./sale";
import type { SiteContent } from "./site";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  color: string;
  hex: string;
  size: string;
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pin: string;
  isDefault: boolean;
};

export type User = {
  name: string;
  email: string;
  phone: string;
  password: string;
  addresses: Address[];
};

export type OrderStatus =
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled"
  | "Return requested"
  | "Returned";

export type OrderItem = CartItem;

export type Order = {
  id: string;
  number: string;
  createdAt: string;
  email: string;
  phone: string;
  address: Address;
  items: OrderItem[];
  delivery: "standard" | "express";
  payment: "upi" | "card" | "netbanking" | "cod";
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
  coupon?: string;
  status: OrderStatus;
  timeline: { status: string; date: string }[];
  trackingUrl?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  notes?: string;
  gift?: { wrap: boolean; message: string; hidePrices: boolean };
  shipment?: { courier: string; tracking: string; createdAt: string };
  returnRequest?: {
    reason: string;
    comments: string;
    resolution: "refund" | "exchange";
    pickup: Address;
    status: "Awaiting review" | "Approved" | "Rejected";
    requestedAt?: string;
    decidedAt?: string;
  };
};

export type StaffRole = "Owner" | "Catalog manager" | "Order and support";

export type Staff = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: StaffRole;
};

export type StoreSettings = {
  freeShippingAt: number;
  standardShipping: number;
  expressShipping: number;
  deliveryEstimate: string;
  codEnabled: boolean;
  codFee: number;
  codMax: number;
  returnWindowDays: number;
  refundMethod: string;
  exchanges: boolean;
  businessName: string;
  gstin: string;
  pricesIncludeGst: boolean;
  announcementEnabled: boolean;
  announcementText: string;
  announcementHref: string;
  saleEnabled: boolean;
  saleName: string;
  salePercent: number;
  saleStart: string;
  saleEnd: string;
  content?: SiteContent;
};

export function announcementCopy(settings: Pick<StoreSettings, "announcementText" | "freeShippingAt" | "returnWindowDays">) {
  const custom = settings.announcementText?.trim();
  if (custom) return custom.slice(0, 140);
  const days = Math.max(0, Math.round(settings.returnWindowDays || 0));
  return `Free shipping over ${formatINR(settings.freeShippingAt)} · ${days}-day returns`;
}

export function announcementLink(value: string | undefined) {
  const href = (value ?? "").trim();
  if (href.startsWith("/") && !href.startsWith("//")) return href.slice(0, 200);
  if (/^https?:\/\//i.test(href)) return href.slice(0, 200);
  return "";
}

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  starts: string;
  ends: string;
};

type Persisted = {
  user: User | null;
  accounts: User[];
  cart: CartItem[];
  wishlist: { slug: string; color: string }[];
  orders: Order[];
  coupon: string | null;
  nextNumber: number;
  coupons: CouponRecord[];
  settings: StoreSettings;
  banners: Banner[];
  overrides: Record<string, ProductOverride>;
  blockedEmails: string[];
  staffList: Staff[];
  staff: Staff | null;
  recent: string[];
  usualSize: Size | null;
  alerts: { slug: string; color: string; size: string; contact: string }[];
};

const STORAGE_KEY = "earthen-store-v1";
const GUEST_ORDERS_KEY = "earthen-guest-orders";

function guestOrderIds() {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(GUEST_ORDERS_KEY) ?? "[]") as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rememberGuestOrder(id: string) {
  const ids = [id, ...guestOrderIds().filter((entry) => entry !== id)].slice(0, 12);
  localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(ids));
}

const demoAddress: Address = {
  id: "addr-home",
  label: "Home",
  name: "Aisha Menon",
  phone: "9876543210",
  line1: "14, Coconut Avenue",
  line2: "Indiranagar",
  city: "Bengaluru",
  state: "Karnataka",
  pin: "560038",
  isDefault: true,
};

const demoUser: User = {
  name: "Aisha Menon",
  email: "aisha@earthen.in",
  phone: "9876543210",
  password: "quietclothes",
  addresses: [demoAddress],
};

function seedOrder(): Order {
  return {
    id: "order-seed",
    number: "EH-10421",
    createdAt: daysAgo(4),
    email: demoUser.email,
    phone: demoUser.phone,
    address: demoAddress,
    items: [
      {
        slug: "knit-cardigan",
        name: "Knit Cardigan",
        price: 3890,
        color: "Moss",
        hex: "#8A9168",
        size: "M",
        quantity: 1,
      },
    ],
    delivery: "standard",
    payment: "upi",
    subtotal: 3890,
    discount: 0,
    shipping: 0,
    codFee: 0,
    total: 3890,
    status: "Delivered",
    timeline: [
      { status: "Confirmed", date: daysAgo(4) },
      { status: "Packed", date: daysAgo(3) },
      { status: "Shipped", date: daysAgo(3) },
      { status: "Out for delivery", date: daysAgo(2) },
      { status: "Delivered", date: daysAgo(2) },
    ],
    trackingUrl: "https://www.shiprocket.in/",
  };
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function isoDate(days: number) {
  return daysAgo(days).slice(0, 10);
}

function extraOrders(): Order[] {
  const meera: Address = { ...demoAddress, id: "addr-meera", name: "Meera Shah", phone: "9845011122", city: "Hyderabad", state: "Telangana", pin: "500034" };
  const dev: Address = { ...demoAddress, id: "addr-dev", name: "Dev Patel", phone: "9820099001", city: "Mumbai", state: "Maharashtra", pin: "400001" };
  const rahul: Address = { ...demoAddress, id: "addr-rahul", name: "Rahul Iyer", phone: "9900012345", city: "Chennai", state: "Tamil Nadu", pin: "600004" };
  const leela: Address = { ...demoAddress, id: "addr-leela", name: "Leela Nair", phone: "9811122233", city: "Kochi", state: "Kerala", pin: "682001" };
  return [
    {
      id: "order-week-6",
      number: "EH-10418",
      createdAt: daysAgo(6),
      email: "meera@example.com",
      phone: meera.phone,
      address: meera,
      items: [{ slug: "everyday-shirt", name: "Everyday Shirt", price: 2490, color: "Ivory", hex: "#F3EEE4", size: "S", quantity: 1 }],
      delivery: "standard",
      payment: "upi",
      subtotal: 2490,
      discount: 0,
      shipping: 0,
      codFee: 0,
      total: 2490,
      status: "Delivered",
      timeline: [
        { status: "Confirmed", date: daysAgo(6) },
        { status: "Packed", date: daysAgo(5) },
        { status: "Shipped", date: daysAgo(5) },
        { status: "Delivered", date: daysAgo(4) },
      ],
    },
    {
      id: "order-week-3",
      number: "EH-10419",
      createdAt: daysAgo(3),
      email: "dev@example.com",
      phone: dev.phone,
      address: dev,
      items: [{ slug: "relaxed-cotton-tee", name: "Relaxed Cotton Tee", price: 1299, color: "Sand", hex: "#D9C6AE", size: "L", quantity: 2 }],
      delivery: "express",
      payment: "card",
      subtotal: 2598,
      discount: 0,
      shipping: 149,
      codFee: 0,
      total: 2747,
      status: "Delivered",
      timeline: [
        { status: "Confirmed", date: daysAgo(3) },
        { status: "Shipped", date: daysAgo(3) },
        { status: "Delivered", date: daysAgo(2) },
      ],
    },
    {
      id: "order-return",
      number: "EH-10420",
      createdAt: daysAgo(5),
      email: "rahul@example.com",
      phone: rahul.phone,
      address: rahul,
      items: [{ slug: "wide-leg-trousers", name: "Wide-Leg Trousers", price: 2799, color: "Terracotta", hex: "#C4785A", size: "M", quantity: 1 }],
      delivery: "standard",
      payment: "cod",
      subtotal: 2799,
      discount: 0,
      shipping: 0,
      codFee: 40,
      total: 2839,
      status: "Return requested",
      timeline: [
        { status: "Confirmed", date: daysAgo(5) },
        { status: "Shipped", date: daysAgo(4) },
        { status: "Delivered", date: daysAgo(2) },
      ],
      returnRequest: {
        reason: "Size or fit",
        comments: "The leg is longer than I expected.",
        resolution: "refund",
        pickup: rahul,
        status: "Awaiting review",
        requestedAt: daysAgo(1),
      },
    },
    {
      id: "order-pack",
      number: "EH-10423",
      createdAt: daysAgo(1),
      email: "leela@example.com",
      phone: leela.phone,
      address: leela,
      items: [{ slug: "linen-overshirt", name: "Linen Overshirt", price: 3499, color: "Olive", hex: "#6E764E", size: "M", quantity: 1 }],
      delivery: "standard",
      payment: "upi",
      subtotal: 3499,
      discount: 0,
      shipping: 0,
      codFee: 0,
      total: 3499,
      status: "Packed",
      timeline: [
        { status: "Confirmed", date: daysAgo(1) },
        { status: "Packed", date: daysAgo(0) },
      ],
    },
  ];
}

const defaultStaff: Staff[] = [
  { id: "staff-owner", name: "Sai", email: "owner@earthen.in", password: "studio", role: "Owner" },
  { id: "staff-catalog", name: "Anika Rao", email: "catalog@earthen.in", password: "studio", role: "Catalog manager" },
  { id: "staff-orders", name: "Kabir Sen", email: "orders@earthen.in", password: "studio", role: "Order and support" },
];

const defaultSettings: StoreSettings = {
  freeShippingAt: 1999,
  standardShipping: 99,
  expressShipping: 149,
  deliveryEstimate: "3–5 days",
  codEnabled: true,
  codFee: 40,
  codMax: 10000,
  returnWindowDays: 7,
  refundMethod: "Original payment",
  exchanges: true,
  businessName: "Earthen",
  gstin: "29AABCE1234F1Z5",
  pricesIncludeGst: true,
  announcementEnabled: true,
  announcementText: "",
  announcementHref: "",
  saleEnabled: false,
  saleName: "",
  salePercent: 0,
  saleStart: "",
  saleEnd: "",
};

const empty: Persisted = {
  user: null,
  accounts: [demoUser],
  cart: [],
  wishlist: [],
  orders: [seedOrder(), ...extraOrders()],
  coupon: null,
  nextNumber: 10424,
  coupons: defaultCoupons,
  settings: defaultSettings,
  banners: [
    {
      id: "banner-aw26",
      title: "Autumn / Winter 2026",
      subtitle: "Quiet clothes for every day",
      href: "/shop?category=new",
      starts: isoDate(7),
      ends: isoDate(-40),
    },
  ],
  overrides: {},
  blockedEmails: [],
  staffList: defaultStaff,
  staff: null,
  recent: [],
  usualSize: null,
  alerts: [],
};

type Store = Persisted & {
  ready: boolean;
  priceOf: (slug: string, fallback: number) => number;
  addToCart: (product: Product, color: string, size: string, quantity?: number) => string | null;
  updateQty: (slug: string, color: string, size: string, quantity: number) => void;
  removeFromCart: (slug: string, color: string, size: string) => void;
  applyCoupon: (code: string) => string | null;
  clearCoupon: () => void;
  toggleWishlist: (slug: string, color: string) => void;
  wished: (slug: string) => boolean;
  noteView: (slug: string) => void;
  setUsualSize: (size: Size) => void;
  askRestock: (entry: { slug: string; color: string; size: string; contact: string }) => Promise<string | null>;
  register: (input: { name: string; email: string; phone: string; password: string }) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  requestSignInCode: (phone: string) => Promise<{ error: string | null; previewCode?: string }>;
  signInWithCode: (phone: string, code: string) => Promise<string | null>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<{ error: string | null; previewUrl?: string }>;
  requestPasswordCode: (phone: string) => Promise<{ error: string | null; previewCode?: string }>;
  resetPassword: (token: string, password: string) => Promise<string | null>;
  resetPasswordWithCode: (phone: string, code: string, password: string) => Promise<string | null>;
  updateProfile: (patch: Partial<Pick<User, "name" | "phone">>) => Promise<void>;
  saveAddress: (address: Address) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  placeOrder: (input: {
    email: string;
    phone: string;
    address: Address;
    delivery: "standard" | "express";
    payment: Order["payment"];
    gift?: Order["gift"];
    razorpay?: { orderId: string; paymentId: string; signature: string };
  }) => Promise<Order | string>;
  cancelOrder: (id: string) => Promise<string | null>;
  requestReturn: (id: string, request: NonNullable<Order["returnRequest"]>) => Promise<string | null>;
  staffSignIn: (email: string, password: string) => Promise<string | null>;
  staffSignOut: () => void;
  inviteStaff: (input: { name: string; email: string; role: StaffRole }) => Promise<string | null>;
  updateOrder: (id: string, patch: Partial<Pick<Order, "status" | "notes">>) => Promise<string | null>;
  createShipment: (id: string, shipment: { courier: string; tracking: string }) => Promise<string | null>;
  decideReturn: (id: string, decision: "Approved" | "Rejected") => Promise<string | null>;
  setBlocked: (email: string, blocked: boolean) => Promise<void>;
  saveOverride: (slug: string, patch: ProductOverride & { gender?: string; category?: string; name?: string; description?: string; fabric?: string; care?: string[]; colors?: { name: string; hex: string }[]; photos?: { id: string; label: string; src: string; alt: string }[] }) => Promise<void>;
  saveCategory: (input: { slug?: string; label: string; blurb: string; image: string; chart: "upper" | "lower" }) => Promise<string | null>;
  removeCategory: (slug: string) => Promise<string | null>;
  saveCoupon: (coupon: CouponRecord) => Promise<string | null>;
  removeCoupon: (code: string) => Promise<void>;
  saveBanner: (banner: Banner) => Promise<void>;
  removeBanner: (id: string) => Promise<void>;
  saveSettings: (settings: StoreSettings) => Promise<void>;
  submitReview: (slug: string, input: { rating: number; text: string; fit: string; heightCm?: number }) => Promise<string | null>;
  createProduct: (input: { name: string; price: number; category: string; gender: string; fabric: string; color: string; hex: string; silhouette: string }) => Promise<string | null>;
  importProducts: (rows: Record<string, string>[]) => Promise<string | null>;
  totals: {
    subtotal: number;
    discount: number;
    count: number;
  };
};

const StoreContext = createContext<Store | null>(null);

type RemoteState = {
  overrides: Persisted["overrides"];
  coupons: Persisted["coupons"];
  settings: StoreSettings;
  banners: Persisted["banners"];
  nextNumber: number;
  orders: Order[];
  accounts: Array<Omit<User, "password"> & { addresses?: Address[] }>;
  blockedEmails: string[];
  staffList: Staff[];
  user: (Omit<User, "password"> & { addresses?: Address[] }) | null;
  products?: ApiProduct[];
  categories?: ShopCategory[];
  bag?: { cart: CartItem[]; wishlist: { slug: string; color: string }[] } | null;
};

let studioUp = false;
let bagTimer: number | undefined;

function queueBag(cart: CartItem[], wishlist: { slug: string; color: string }[]) {
  if (!studioUp || !customerToken()) return;
  window.clearTimeout(bagTimer);
  bagTimer = window.setTimeout(() => {
    void request("/customers/me/bag", { method: "PUT", body: JSON.stringify({ cart, wishlist }) }).catch(() => undefined);
  }, 300);
}

function mergeCart(saved: CartItem[], local: CartItem[]) {
  const keys = new Set(saved.map((item) => `${item.slug}|${item.color}|${item.size}`));
  return [...saved, ...local.filter((item) => !keys.has(`${item.slug}|${item.color}|${item.size}`))];
}

function mergeWishlist(saved: { slug: string; color: string }[], local: { slug: string; color: string }[]) {
  const keys = new Set(saved.map((item) => item.slug));
  return [...saved, ...local.filter((item) => !keys.has(item.slug))];
}

async function withGuestOrders(data: RemoteState): Promise<RemoteState> {
  const known = new Set((data.orders ?? []).map((order) => order.id));
  const extras = await Promise.all(
    guestOrderIds()
      .filter((id) => !known.has(id))
      .map((id) => request<Order>(`/orders/${id}`).catch(() => null)),
  );
  return { ...data, orders: [...extras.filter((order): order is Order => Boolean(order)), ...(data.orders ?? [])] };
}

function applyRemote(current: Persisted, data: RemoteState): Persisted {
  return {
    ...current,
    overrides: data.overrides ?? {},
    coupons: data.coupons?.length ? data.coupons : current.coupons,
    settings: { ...current.settings, ...data.settings },
    banners: data.banners ?? current.banners,
    nextNumber: data.nextNumber || current.nextNumber,
    orders: data.orders ?? [],
    accounts: data.accounts?.length
      ? data.accounts.map((account) => ({ ...account, password: "", addresses: account.addresses ?? [] }))
      : current.accounts,
    blockedEmails: data.blockedEmails ?? [],
    staffList: data.staffList?.length ? data.staffList : current.staffList,
    user: data.user ? { ...data.user, password: "", addresses: data.user.addresses ?? [] } : current.user,
    cart: data.bag ? mergeCart(data.bag.cart ?? [], current.cart) : current.cart,
    wishlist: data.bag ? mergeWishlist(data.bag.wishlist ?? [], current.wishlist) : current.wishlist,
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(empty);
  const [ready, setReady] = useState(false);
  const [catalogTick, setCatalogTick] = useState(0);
  const remote = useRef(false);

  useEffect(() => {
    let local: Partial<Persisted> = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) local = JSON.parse(raw) as Partial<Persisted>;
    } catch {
      local = {};
    }
    request<RemoteState>("/bootstrap")
      .then(async (data) => {
        remote.current = true;
        studioUp = true;
        installCatalog(data.products);
        installCategories(data.categories);
        const withGuest = await withGuestOrders(data);
        setState((current) => {
          const next = applyRemote(
            {
              ...current,
              cart: local.cart ?? [],
              wishlist: local.wishlist ?? [],
              coupon: local.coupon ?? null,
              recent: local.recent ?? [],
              usualSize: local.usualSize ?? null,
              alerts: local.alerts ?? [],
              staff: staffToken() ? local.staff ?? null : null,
              user: customerToken() ? local.user ?? null : null,
            },
            withGuest,
          );
          if (data.bag && customerToken()) queueBag(next.cart, next.wishlist);
          return next;
        });
        setCatalogTick((tick) => tick + 1);
      })
      .catch(() => {
        if (local.orders || local.accounts) {
          const known = new Set((local.orders ?? []).map((order) => order.id));
          const orders = [...(local.orders ?? [])];
          for (const order of empty.orders) {
            if (!known.has(order.id)) orders.push(order);
          }
          setState({
            ...empty,
            ...local,
            accounts: local.accounts?.length ? local.accounts : [demoUser],
            orders,
            coupons: local.coupons?.length ? local.coupons : empty.coupons,
            settings: { ...empty.settings, ...(local.settings ?? {}) },
            banners: local.banners ?? empty.banners,
            overrides: local.overrides ?? {},
            blockedEmails: local.blockedEmails ?? [],
            staffList: local.staffList?.length ? local.staffList : empty.staffList,
            staff: local.staff ?? null,
          });
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const api = useMemo<Store>(() => {
    const priceOf = (slug: string, fallback: number) => {
      const product = getProduct(slug);
      if (!product) return fallback;
      const live = liveProduct(product, state.overrides[slug]);
      return applyStoreSale(live.basePrice, live.price, state.settings);
    };
    const subtotal = state.cart.reduce((sum, item) => sum + priceOf(item.slug, item.price) * item.quantity, 0);
    const coupon = state.coupons.find((entry) => entry.code === state.coupon);
    const priced = coupon ? evaluateCoupon(coupon, subtotal) : undefined;
    const discount = priced && priced.ok && coupon?.type !== "free_shipping" ? priced.discount : 0;

    async function openSession(result: { token: string; user: Omit<User, "password"> & { addresses?: Address[] } }, password: string) {
      setCustomerToken(result.token);
      const user = { ...result.user, password, addresses: result.user.addresses ?? [] };
      const snapshot = await request<RemoteState>("/bootstrap");
      setState((current) => {
        const next = applyRemote({ ...current, user }, snapshot);
        if (snapshot.bag) queueBag(next.cart, next.wishlist);
        return next;
      });
    }

    return {
      ...state,
      ready,
      priceOf,
      totals: {
        subtotal,
        discount,
        count: state.cart.reduce((sum, item) => sum + item.quantity, 0),
      },
      addToCart: (product, color, size, quantity = 1) => {
        const listed = liveProduct(getProduct(product.slug) ?? product, state.overrides[product.slug]);
        const live = { ...listed, price: applyStoreSale(listed.basePrice, listed.price, state.settings) };
        if (live.status !== "active") return "That piece is not for sale.";
        const available = unitsAvailable(live, color, size);
        if (available <= 0) return "That size is out of stock.";
        let message: string | null = null;
        setState((current) => {
          const existing = current.cart.find((item) => item.slug === product.slug && item.color === color && item.size === size);
          const nextQty = (existing?.quantity ?? 0) + quantity;
          if (nextQty > available) {
            message = `Only ${available} left in ${color}, size ${size}.`;
            return current;
          }
          const colorway = product.colors.find((entry) => entry.name === color);
          const item: CartItem = {
            slug: product.slug,
            name: product.name,
            price: live.price,
            color,
            hex: colorway?.hex ?? "#6E764E",
            size,
            quantity: nextQty,
          };
          const cart = existing
            ? current.cart.map((entry) => (entry === existing ? item : entry))
            : [...current.cart, item];
          queueBag(cart, current.wishlist);
          return { ...current, cart };
        });
        return message;
      },
      updateQty: (slug, color, size, quantity) => {
        setState((current) => {
          const cart = current.cart.flatMap((item) => {
            if (item.slug !== slug || item.color !== color || item.size !== size) return [item];
            if (quantity <= 0) return [];
            const product = getProduct(slug);
            const available = product ? unitsAvailable(liveProduct(product, current.overrides[slug]), color, size) : quantity;
            return [{ ...item, quantity: Math.min(quantity, available) }];
          });
          queueBag(cart, current.wishlist);
          return { ...current, cart };
        });
      },
      removeFromCart: (slug, color, size) => {
        setState((current) => {
          const cart = current.cart.filter((item) => !(item.slug === slug && item.color === color && item.size === size));
          queueBag(cart, current.wishlist);
          return { ...current, cart };
        });
      },
      applyCoupon: (code) => {
        const coupon = state.coupons.find((entry) => entry.code === code.trim().toUpperCase());
        if (!coupon) return "That coupon is not valid.";
        const sub = state.cart.reduce((sum, item) => sum + priceOf(item.slug, item.price) * item.quantity, 0);
        const result = evaluateCoupon(coupon, sub);
        if (!result.ok) return result.reason;
        setState((current) => ({ ...current, coupon: coupon.code }));
        return null;
      },
      clearCoupon: () => setState((current) => ({ ...current, coupon: null })),
      toggleWishlist: (slug, color) => {
        setState((current) => {
          const exists = current.wishlist.some((item) => item.slug === slug);
          const wishlist = exists ? current.wishlist.filter((item) => item.slug !== slug) : [...current.wishlist, { slug, color }];
          queueBag(current.cart, wishlist);
          return { ...current, wishlist };
        });
      },
      wished: (slug) => state.wishlist.some((item) => item.slug === slug),
      noteView: (slug) => {
        setState((current) => {
          if (current.recent[0] === slug) return current;
          return { ...current, recent: [slug, ...current.recent.filter((entry) => entry !== slug)].slice(0, 8) };
        });
      },
      setUsualSize: (size) => setState((current) => ({ ...current, usualSize: size })),
      askRestock: async ({ slug, color, size, contact }) => {
        const value = contact.trim();
        const email = value.includes("@") && value.includes(".");
        const mobile = /^\d{10}$/.test(value);
        if (!email && !mobile) return "Enter an email address or a 10-digit mobile number.";
        const already = state.alerts.some((entry) => entry.slug === slug && entry.color === color && entry.size === size && entry.contact === value);
        if (!already) {
          setState((current) => ({ ...current, alerts: [...current.alerts, { slug, color, size, contact: value }] }));
        }
        if (remote.current && email) {
          try {
            const result = await request<{ message: string }>(`/catalog/${slug}/restock`, {
              method: "POST",
              body: JSON.stringify({ color, size, contact: value }),
            });
            return result.message;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not save that restock note.";
          }
        }
        return `We'll write to ${value} when ${color} in ${size} is back.`;
      },
      register: async (input) => {
        if (!remote.current) {
          if (state.accounts.some((account) => account.email.toLowerCase() === input.email.toLowerCase())) {
            return "An account with that email already exists.";
          }
          const user: User = { ...input, addresses: [] };
          setState((current) => ({ ...current, accounts: [...current.accounts, user], user }));
          return null;
        }
        try {
          const result = await request<{ token: string; user: Omit<User, "password"> & { addresses?: Address[] } }>("/customers/register", {
            method: "POST",
            body: JSON.stringify(input),
          });
          setCustomerToken(result.token);
          const user = { ...result.user, password: input.password, addresses: result.user.addresses ?? [] };
          setState((current) => ({ ...current, user, accounts: [...current.accounts.filter((account) => account.email !== user.email), user] }));
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not create the account.";
        }
      },
      signIn: async (email, password) => {
        if (!remote.current) {
          const account = state.accounts.find(
            (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
          );
          if (!account) return "Email or password is incorrect.";
          if (state.blockedEmails.some((entry) => entry.toLowerCase() === email.toLowerCase())) {
            return "This account is blocked. Write to the studio if this is a mistake.";
          }
          setState((current) => ({ ...current, user: account }));
          return null;
        }
        try {
          const result = await request<{ token: string; user: Omit<User, "password"> & { addresses?: Address[] } }>("/customers/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          await openSession(result, password);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not sign in.";
        }
      },
      requestSignInCode: async (phone) => {
        if (!remote.current) return { error: "The studio API is not running." };
        try {
          const result = await request<{ ok: true; previewCode?: string }>("/customers/login-code", {
            method: "POST",
            body: JSON.stringify({ phone }),
          });
          return { error: null, previewCode: result.previewCode };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not send the code." };
        }
      },
      signInWithCode: async (phone, code) => {
        if (!remote.current) return "The studio API is not running.";
        try {
          const result = await request<{ token: string; user: Omit<User, "password"> & { addresses?: Address[] } }>("/customers/login-code/verify", {
            method: "POST",
            body: JSON.stringify({ phone, code }),
          });
          await openSession(result, "");
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not sign in.";
        }
      },
      signOut: () => {
        setCustomerToken(null);
        setState((current) => ({ ...current, user: null }));
      },
      requestPasswordReset: async (email) => {
        if (!remote.current) return { error: "The studio API is not running." };
        try {
          const result = await request<{ ok: true; previewUrl?: string }>("/customers/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
          });
          return { error: null, previewUrl: result.previewUrl };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not send the reset link." };
        }
      },
      requestPasswordCode: async (phone) => {
        if (!remote.current) return { error: "The studio API is not running." };
        try {
          const result = await request<{ ok: true; previewCode?: string }>("/customers/forgot-password", {
            method: "POST",
            body: JSON.stringify({ phone }),
          });
          return { error: null, previewCode: result.previewCode };
        } catch (error) {
          return { error: error instanceof Error ? error.message : "Could not send the code." };
        }
      },
      resetPassword: async (token, password) => {
        if (!remote.current) return "The studio API is not running.";
        try {
          await request("/customers/reset-password", { method: "POST", body: JSON.stringify({ token, password }) });
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not reset the password.";
        }
      },
      resetPasswordWithCode: async (phone, code, password) => {
        if (!remote.current) return "The studio API is not running.";
        try {
          await request("/customers/reset-password", { method: "POST", body: JSON.stringify({ phone, code, password }) });
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not reset the password.";
        }
      },
      updateProfile: async (patch) => {
        if (!remote.current || !customerToken()) {
          setState((current) => {
            if (!current.user) return current;
            const user = { ...current.user, ...patch };
            return { ...current, user, accounts: current.accounts.map((account) => (account.email === current.user!.email ? user : account)) };
          });
          return;
        }
        const user = await request<Omit<User, "password"> & { addresses?: Address[] }>("/customers/me", {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
        setState((current) => ({ ...current, user: { ...user, password: current.user?.password ?? "", addresses: user.addresses ?? [] } }));
      },
      saveAddress: async (address) => {
        if (!remote.current || !customerToken()) {
          setState((current) => {
            if (!current.user) return current;
            const addresses = current.user.addresses.some((entry) => entry.id === address.id)
              ? current.user.addresses.map((entry) => (entry.id === address.id ? address : entry))
              : [...current.user.addresses, address];
            const normalized = address.isDefault ? addresses.map((entry) => ({ ...entry, isDefault: entry.id === address.id })) : addresses;
            const user = { ...current.user, addresses: normalized };
            return { ...current, user, accounts: current.accounts.map((account) => (account.email === user.email ? user : account)) };
          });
          return;
        }
        const user = await request<Omit<User, "password"> & { addresses?: Address[] }>("/customers/me/addresses", {
          method: "POST",
          body: JSON.stringify(address),
        });
        setState((current) => ({ ...current, user: { ...user, password: current.user?.password ?? "", addresses: user.addresses ?? [] } }));
      },
      removeAddress: async (id) => {
        if (!remote.current || !customerToken()) {
          setState((current) => {
            if (!current.user) return current;
            const user = { ...current.user, addresses: current.user.addresses.filter((address) => address.id !== id) };
            return { ...current, user, accounts: current.accounts.map((account) => (account.email === user.email ? user : account)) };
          });
          return;
        }
        const user = await request<Omit<User, "password"> & { addresses?: Address[] }>(`/customers/me/addresses/${id}`, { method: "DELETE" });
        setState((current) => ({ ...current, user: { ...user, password: current.user?.password ?? "", addresses: user.addresses ?? [] } }));
      },
      placeOrder: async (input) => {
        if (remote.current) {
          try {
            const order = await request<Order>("/orders", {
              method: "POST",
              body: JSON.stringify({
                ...input,
                coupon: state.coupon,
                items: state.cart.map((item) => ({ slug: item.slug, color: item.color, size: item.size, quantity: item.quantity })),
              }),
            });
            const saved = { ...order, gift: input.gift };
            rememberGuestOrder(saved.id);
            setState((current) => {
              queueBag([], current.wishlist);
              return { ...current, orders: [saved, ...current.orders.filter((entry) => entry.id !== saved.id)], cart: [], coupon: null };
            });
            return saved;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not place the order.";
          }
        }
        if (state.blockedEmails.some((entry) => entry.toLowerCase() === input.email.toLowerCase())) {
          return "This account is blocked and cannot place an order.";
        }
        if (state.cart.length === 0) return "Your bag is empty.";
        for (const item of state.cart) {
          const product = getProduct(item.slug);
          const live = product ? liveProduct(product, state.overrides[item.slug]) : undefined;
          if (!live || live.status !== "active" || unitsAvailable(live, item.color, item.size) < item.quantity) {
            return `${item.name} in ${item.color}, size ${item.size} is no longer available.`;
          }
        }
        const pricedItems = state.cart.map((item) => ({ ...item, price: priceOf(item.slug, item.price) }));
        const sub = pricedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const applied = state.coupons.find((entry) => entry.code === state.coupon);
        const priced = applied ? evaluateCoupon(applied, sub) : undefined;
        if (applied && priced && !priced.ok) return priced.reason;
        const discount = priced && priced.ok && applied?.type !== "free_shipping" ? priced.discount : 0;
        const afterDiscount = Math.max(0, sub - discount);
        const shipping = shippingFee(afterDiscount, input.delivery, applied?.type === "free_shipping", state.settings);
        const codFee = input.payment === "cod" ? state.settings.codFee : 0;
        const total = afterDiscount + shipping + codFee;
        if (input.payment === "cod" && total > state.settings.codMax) {
          return `Cash on delivery is available on orders up to ₹${state.settings.codMax.toLocaleString("en-IN")}.`;
        }
        const order: Order = {
          id: `order-${Date.now()}`,
          number: `EH-${state.nextNumber}`,
          createdAt: new Date().toISOString(),
          email: input.email,
          phone: input.phone,
          address: input.address,
          items: pricedItems,
          delivery: input.delivery,
          payment: input.payment,
          subtotal: sub,
          discount,
          shipping,
          codFee,
          total,
          coupon: applied?.code,
          status: "Confirmed",
          timeline: [{ status: "Confirmed", date: new Date().toISOString() }],
          trackingUrl: "https://www.shiprocket.in/",
          gift: input.gift,
        };
        setState((current) => ({
          ...current,
          orders: [order, ...current.orders],
          cart: [],
          coupon: null,
          nextNumber: current.nextNumber + 1,
          coupons: applied
            ? current.coupons.map((entry) => (entry.code === applied.code ? { ...entry, used: entry.used + 1 } : entry))
            : current.coupons,
        }));
        return order;
      },
      cancelOrder: async (id) => {
        if (remote.current) {
          try {
            const order = await request<Order>(`/orders/${id}/cancel`, { method: "POST" });
            setState((current) => ({ ...current, orders: current.orders.map((entry) => (entry.id === id ? order : entry)) }));
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not cancel the order.";
          }
        }
        const order = state.orders.find((entry) => entry.id === id);
        if (!order) return "Order not found.";
        if (["Shipped", "Out for delivery", "Delivered", "Cancelled", "Returned"].includes(order.status)) {
          return "This order can no longer be cancelled.";
        }
        setState((current) => ({
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === id
              ? { ...entry, status: "Cancelled", timeline: [...entry.timeline, { status: "Cancelled", date: new Date().toISOString() }] }
              : entry,
          ),
        }));
        return null;
      },
      requestReturn: async (id, returnRequest) => {
        if (remote.current) {
          try {
            const order = await request<Order>(`/orders/${id}/return`, { method: "POST", body: JSON.stringify(returnRequest) });
            setState((current) => ({ ...current, orders: current.orders.map((entry) => (entry.id === id ? order : entry)) }));
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not request the return.";
          }
        }
        const order = state.orders.find((entry) => entry.id === id);
        if (!order) return "Order not found.";
        if (order.status !== "Delivered") return "Returns open after delivery.";
        const delivered = order.timeline.find((event) => event.status === "Delivered");
        const windowMs = state.settings.returnWindowDays * 86400000;
        if (delivered && Date.now() - new Date(delivered.date).getTime() > windowMs) {
          return `The ${state.settings.returnWindowDays}-day return window has closed.`;
        }
        setState((current) => ({
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === id ? { ...entry, status: "Return requested", returnRequest: { ...returnRequest, requestedAt: new Date().toISOString() } } : entry,
          ),
        }));
        return null;
      },
      staffSignIn: async (email, password) => {
        if (!remote.current) {
          const member = state.staffList.find(
            (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
          );
          if (!member) return "Email or password is incorrect.";
          setState((current) => ({ ...current, staff: member }));
          return null;
        }
        try {
          const result = await request<{ token: string; staff: Staff }>("/staff/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          setStaffToken(result.token);
          const snapshot = await request<RemoteState>("/bootstrap");
          setState((current) => applyRemote({ ...current, staff: result.staff }, snapshot));
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not sign in.";
        }
      },
      staffSignOut: () => {
        setStaffToken(null);
        setState((current) => ({ ...current, staff: null }));
        request<RemoteState>("/bootstrap")
          .then((data) => withGuestOrders(data))
          .then((data) => setState((current) => applyRemote({ ...current, staff: null }, data)))
          .catch(() => setState((current) => ({ ...current, staff: null })));
      },
      inviteStaff: async (input) => {
        if (!remote.current) {
          if (state.staff?.role !== "Owner") return "Only the owner can invite staff.";
          if (state.staffList.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase())) {
            return "That person already has access.";
          }
          const member: Staff = { ...input, id: `staff-${Date.now()}`, password: "studio" };
          setState((current) => ({ ...current, staffList: [...current.staffList, member] }));
          return null;
        }
        try {
          const member = await request<Staff>("/staff", { method: "POST", body: JSON.stringify(input) });
          setState((current) => ({ ...current, staffList: [...current.staffList, member] }));
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not invite staff.";
        }
      },
      updateOrder: async (id, patch) => {
        if (remote.current) {
          try {
            const order = await request<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
            setState((current) => ({ ...current, orders: current.orders.map((entry) => (entry.id === id ? order : entry)) }));
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not update the order.";
          }
        }
        const order = state.orders.find((entry) => entry.id === id);
        if (!order) return "Order not found.";
        setState((current) => ({
          ...current,
          orders: current.orders.map((entry) => {
            if (entry.id !== id) return entry;
            const statusChanged = patch.status && patch.status !== entry.status;
            return {
              ...entry,
              ...patch,
              timeline: statusChanged
                ? [...entry.timeline, { status: patch.status!, date: new Date().toISOString() }]
                : entry.timeline,
            };
          }),
        }));
        return null;
      },
      createShipment: async (id, shipment) => {
        if (remote.current) {
          try {
            const order = await request<Order>(`/orders/${id}/shipment`, { method: "POST", body: JSON.stringify(shipment) });
            setState((current) => ({ ...current, orders: current.orders.map((entry) => (entry.id === id ? order : entry)) }));
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not create the shipment.";
          }
        }
        const order = state.orders.find((entry) => entry.id === id);
        if (!order) return "Order not found.";
        if (["Cancelled", "Returned"].includes(order.status)) return "This order cannot be shipped.";
        setState((current) => ({
          ...current,
          orders: current.orders.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  status: "Shipped",
                  shipment: { ...shipment, createdAt: new Date().toISOString() },
                  trackingUrl: "https://www.shiprocket.in/",
                  timeline: [...entry.timeline, { status: "Shipped", date: new Date().toISOString() }],
                }
              : entry,
          ),
        }));
        return null;
      },
      decideReturn: async (id, decision) => {
        if (remote.current) {
          try {
            const order = await request<Order>(`/orders/${id}/return-decision`, { method: "POST", body: JSON.stringify({ decision }) });
            setState((current) => ({ ...current, orders: current.orders.map((entry) => (entry.id === id ? order : entry)) }));
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not update the return.";
          }
        }
        const order = state.orders.find((entry) => entry.id === id);
        if (!order?.returnRequest) return "There is no return request on this order.";
        setState((current) => ({
          ...current,
          orders: current.orders.map((entry) => {
            if (entry.id !== id || !entry.returnRequest) return entry;
            const approvedRefund = decision === "Approved" && entry.returnRequest.resolution === "refund";
            return {
              ...entry,
              status: decision === "Rejected" ? "Delivered" : approvedRefund ? "Returned" : entry.status,
              returnRequest: { ...entry.returnRequest, status: decision, decidedAt: new Date().toISOString() },
            };
          }),
        }));
        return null;
      },
      setBlocked: async (email, blocked) => {
        if (remote.current) {
          await request(`/customers/${encodeURIComponent(email)}/block`, { method: "PATCH", body: JSON.stringify({ blocked }) });
        }
        setState((current) => ({
          ...current,
          blockedEmails: blocked
            ? [...new Set([...current.blockedEmails, email.toLowerCase()])]
            : current.blockedEmails.filter((entry) => entry.toLowerCase() !== email.toLowerCase()),
        }));
      },
      saveOverride: async (slug, patch) => {
        if (remote.current) {
          const saved = await request<{ product: ApiProduct; override: ProductOverride; category?: ShopCategory | null }>(`/catalog/${slug}`, { method: "PATCH", body: JSON.stringify(patch) });
          if (saved.product) rememberProduct(toProduct(saved.product));
          if (saved.category) rememberCategory(saved.category);
          setCatalogTick((tick) => tick + 1);
          setState((current) => ({ ...current, overrides: { ...current.overrides, [slug]: saved.override } }));
          return;
        }
        setState((current) => ({
          ...current,
          overrides: { ...current.overrides, [slug]: { ...current.overrides[slug], ...patch } },
        }));
      },
      saveCoupon: async (coupon) => {
        const code = coupon.code.trim().toUpperCase();
        if (!code) return "Add a code.";
        if (remote.current) {
          try {
            const saved = await request<CouponRecord>(`/coupons/${code}`, { method: "PUT", body: JSON.stringify({ ...coupon, code }) });
            setState((current) => ({
              ...current,
              coupons: current.coupons.some((entry) => entry.code === code)
                ? current.coupons.map((entry) => (entry.code === code ? saved : entry))
                : [...current.coupons, saved],
            }));
            return null;
          } catch (error) {
            return error instanceof Error ? error.message : "Could not save the coupon.";
          }
        }
        setState((current) => {
          const exists = current.coupons.some((entry) => entry.code === code);
          const next = { ...coupon, code };
          return {
            ...current,
            coupons: exists ? current.coupons.map((entry) => (entry.code === code ? next : entry)) : [...current.coupons, next],
          };
        });
        return null;
      },
      removeCoupon: async (code) => {
        if (remote.current) await request(`/coupons/${code}`, { method: "DELETE" });
        setState((current) => ({ ...current, coupons: current.coupons.filter((entry) => entry.code !== code) }));
      },
      saveBanner: async (banner) => {
        if (remote.current) {
          const saved = await request<Banner>(`/banners/${banner.id}`, { method: "PUT", body: JSON.stringify(banner) });
          setState((current) => ({
            ...current,
            banners: current.banners.some((entry) => entry.id === saved.id)
              ? current.banners.map((entry) => (entry.id === saved.id ? saved : entry))
              : [...current.banners, saved],
          }));
          return;
        }
        setState((current) => {
          const exists = current.banners.some((entry) => entry.id === banner.id);
          return {
            ...current,
            banners: exists ? current.banners.map((entry) => (entry.id === banner.id ? banner : entry)) : [...current.banners, banner],
          };
        });
      },
      removeBanner: async (id) => {
        if (remote.current) await request(`/banners/${id}`, { method: "DELETE" });
        setState((current) => ({ ...current, banners: current.banners.filter((entry) => entry.id !== id) }));
      },
      saveCategory: async (input) => {
        if (!remote.current) return "The studio API is not running.";
        try {
          const saved = input.slug
            ? await request<ShopCategory>(`/categories/${input.slug}`, { method: "PATCH", body: JSON.stringify(input) })
            : await request<ShopCategory>("/categories", { method: "POST", body: JSON.stringify(input) });
          rememberCategory(saved);
          setCatalogTick((tick) => tick + 1);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not save the category.";
        }
      },
      removeCategory: async (slug) => {
        if (!remote.current) return "The studio API is not running.";
        try {
          await request(`/categories/${slug}`, { method: "DELETE" });
          forgetCategory(slug);
          setCatalogTick((tick) => tick + 1);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not remove the category.";
        }
      },
      saveSettings: async (settings) => {
        if (remote.current) {
          const saved = await request<StoreSettings>("/settings", { method: "PUT", body: JSON.stringify(settings) });
          setState((current) => ({ ...current, settings: saved }));
          return;
        }
        setState((current) => ({ ...current, settings }));
      },
      submitReview: async (slug, input) => {
        if (!remote.current || !customerToken()) return "Sign in to review a piece you have received.";
        try {
          const saved = await request<{ product: ApiProduct }>(`/catalog/${slug}/reviews`, { method: "POST", body: JSON.stringify(input) });
          rememberProduct(toProduct(saved.product));
          setCatalogTick((tick) => tick + 1);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not save the review.";
        }
      },
      createProduct: async (input) => {
        if (!remote.current) return "The studio API is not running.";
        try {
          const saved = await request<{ product: ApiProduct; override: ProductOverride; category?: ShopCategory | null }>("/catalog", { method: "POST", body: JSON.stringify(input) });
          const product = toProduct(saved.product);
          rememberProduct(product);
          if (saved.category) rememberCategory(saved.category);
          setState((current) => ({ ...current, overrides: { ...current.overrides, [product.slug]: saved.override } }));
          setCatalogTick((tick) => tick + 1);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not add the product.";
        }
      },
      importProducts: async (rows) => {
        if (!remote.current) return "The studio API is not running.";
        try {
          const result = await request<{ created: number; updated: number }>("/catalog/import", { method: "POST", body: JSON.stringify({ rows }) });
          const snapshot = await request<RemoteState>("/bootstrap");
          installCatalog(snapshot.products);
          installCategories(snapshot.categories);
          setState((current) => applyRemote(current, snapshot));
          setCatalogTick((tick) => tick + 1);
          return `Imported ${result.created} new and updated ${result.updated}.`;
        } catch (error) {
          return error instanceof Error ? error.message : "Could not import the file.";
        }
      },
    };
  }, [state, ready, catalogTick]);

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used within StoreProvider");
  return store;
}
