export const FREE_SHIPPING_AT = 1999;
export const STANDARD_SHIPPING = 99;
export const EXPRESS_SHIPPING = 149;
export const COD_FEE = 40;
export const COD_MAX = 10000;

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export type Coupon = {
  code: string;
  label: string;
  apply: (subtotal: number) => number;
};

export const COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    label: "10% off",
    apply: (subtotal) => Math.round(subtotal * 0.1),
  },
  {
    code: "EARTHEN200",
    label: "₹200 off orders over ₹1,999",
    apply: (subtotal) => (subtotal >= 1999 ? 200 : 0),
  },
  {
    code: "FREESHIP",
    label: "Free shipping",
    apply: () => 0,
  },
];

export type CouponRecord = {
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  starts: string;
  ends: string;
  active: boolean;
};

export const defaultCoupons: CouponRecord[] = [
  { code: "WELCOME10", type: "percent", value: 10, minOrder: 0, usageLimit: 500, used: 0, starts: "", ends: "", active: true },
  { code: "EARTHEN200", type: "fixed", value: 200, minOrder: 1999, usageLimit: 200, used: 0, starts: "", ends: "", active: true },
  { code: "FREESHIP", type: "free_shipping", value: 0, minOrder: 0, usageLimit: 200, used: 0, starts: "", ends: "", active: true },
];

export function findCoupon(code: string) {
  return COUPONS.find((coupon) => coupon.code === code.trim().toUpperCase());
}

export function evaluateCoupon(coupon: CouponRecord, subtotal: number): { ok: true; discount: number } | { ok: false; reason: string } {
  const today = new Date().toISOString().slice(0, 10);
  if (!coupon.active) return { ok: false, reason: "That coupon is not active." };
  if (coupon.starts && today < coupon.starts) return { ok: false, reason: "That coupon is not active yet." };
  if (coupon.ends && today > coupon.ends) return { ok: false, reason: "That coupon has expired." };
  if (coupon.usageLimit > 0 && coupon.used >= coupon.usageLimit) return { ok: false, reason: "That coupon has reached its usage limit." };
  if (subtotal < coupon.minOrder) return { ok: false, reason: `${coupon.code} needs an order of ${formatINR(coupon.minOrder)} or more.` };
  if (coupon.type === "percent") return { ok: true, discount: Math.round(subtotal * (coupon.value / 100)) };
  if (coupon.type === "fixed") return { ok: true, discount: Math.min(coupon.value, subtotal) };
  return { ok: true, discount: 0 };
}

export type ShippingRules = {
  freeShippingAt: number;
  standardShipping: number;
  expressShipping: number;
};

export function shippingFee(
  subtotalAfterDiscount: number,
  method: "standard" | "express",
  freeShipCoupon: boolean,
  rules?: ShippingRules,
) {
  const freeAt = rules?.freeShippingAt ?? FREE_SHIPPING_AT;
  const standard = rules?.standardShipping ?? STANDARD_SHIPPING;
  const express = rules?.expressShipping ?? EXPRESS_SHIPPING;
  if (freeShipCoupon) return 0;
  if (method === "express") return express;
  return subtotalAfterDiscount >= freeAt ? 0 : standard;
}

/** GST is included in the shelf price. Apparel: 5% up to ₹1,000, 12% above. */
export function includedGst(price: number) {
  const rate = price <= 1000 ? 0.05 : 0.12;
  const tax = Math.round((price * rate) / (1 + rate));
  return { rate, tax, taxable: price - tax };
}
