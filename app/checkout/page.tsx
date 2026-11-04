"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { CouponOffers } from "@/components/coupon-offers";
import { Fold } from "@/components/fold";
import { api } from "@/lib/api";
import { formatINR, shippingFee } from "@/lib/money";
import { AddressFields, addressProblem, emptyAddressDraft, type AddressDraft, type PinStatus } from "@/components/address-fields";
import { canonicalState, offStates } from "@/lib/india";
import { loadRazorpay, openRazorpay, type RazorpaySession } from "@/lib/razorpay";
import { useStore, type Address, type Order } from "@/lib/store";

const payments: { id: Order["payment"]; label: string; hint: string }[] = [
  { id: "upi", label: "UPI", hint: "GPay, PhonePe, BHIM" },
  { id: "card", label: "Card", hint: "Visa, Mastercard, RuPay" },
  { id: "netbanking", label: "Net banking", hint: "All major banks" },
  { id: "cod", label: "Cash on delivery", hint: "Fee and limit are set by the studio" },
];


export default function CheckoutPage() {
  const store = useStore();
  const router = useRouter();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<Order["payment"]>("upi");
  const [email, setEmail] = useState(store.user?.email ?? "");
  const [form, setForm] = useState<AddressDraft>({ ...emptyAddressDraft, name: store.user?.name ?? "", phone: store.user?.phone ?? "" });
  const [pinStatus, setPinStatus] = useState<PinStatus>({ state: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState({ contact: true, address: true, delivery: true, payment: true, gift: false });
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [hidePrices, setHidePrices] = useState(false);
  const [paying, setPaying] = useState(false);
  // live: Razorpay charges online orders. demo: online orders complete without a charge. off: cash on delivery only.
  const [mode, setMode] = useState<"live" | "demo" | "off" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const onlineOff = mode === "off";

  const { subtotal, discount } = store.totals;
  const rules = store.settings;
  const after = Math.max(0, subtotal - discount);
  const freeShip = store.coupons.find((entry) => entry.code === store.coupon)?.type === "free_shipping";
  const shipping = shippingFee(after, delivery, freeShip, rules);
  const codFee = payment === "cod" ? rules.codFee : 0;
  const total = after + shipping + codFee;
  const codBlocked = rules.codEnabled === false || after + shipping + rules.codFee > rules.codMax;

  const saved = store.user?.addresses ?? [];

  useEffect(() => {
    if (onlineOff && payment !== "cod") setPayment("cod");
  }, [onlineOff, payment]);

  // A payment that went through but whose order could not be confirmed (connection dropped) is confirmed here,
  // so the customer is never asked to pay twice.
  useEffect(() => {
    if (!store.ready) return;
    const pending = readPending();
    if (!pending) return;
    let stopped = false;
    setConfirming(true);
    void confirmPaid(pending.input, pending.razorpay).then((result) => {
      if (stopped) return;
      setConfirming(false);
      if (typeof result === "string") setError(result);
    });
    return () => {
      stopped = true;
    };
  }, [store.ready]);

  /** Places the order for a completed payment, retrying if the connection drops. The API returns the same order on a repeat. */
  async function confirmPaid(input: PendingPayment["input"], razorpay: PendingPayment["razorpay"]) {
    savePending({ input, razorpay });
    let result: Awaited<ReturnType<typeof store.placeOrder>> = "";
    for (const wait of [0, 1500, 4000]) {
      if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
      result = await store.placeOrder({ ...input, razorpay });
      if (typeof result !== "string" || !isNetworkError(result)) break;
    }
    if (typeof result === "string") {
      if (isNetworkError(result)) {
        return "Your payment went through, but we could not confirm the order yet. Please do not pay again: refresh this page in a minute and we will finish it.";
      }
      clearPending();
      return result;
    }
    clearPending();
    sessionStorage.setItem("earthen-placed", result.id);
    router.push(`/order/${result.id}`);
    return null;
  }

  useEffect(() => {
    if (!store.ready) return;
    let cancelled = false;
    api<{ configured: boolean; mode?: "live" | "demo" | "off" }>("/payments/status")
      .then((data) => {
        if (!cancelled) setMode(data.mode ?? (data.configured ? "live" : "demo"));
      })
      .catch(() => {
        if (!cancelled) setMode("off");
      });
    return () => {
      cancelled = true;
    };
  }, [store.ready]);

  useEffect(() => {
    if (!store.user) return;
    setEmail((current) => current || store.user!.email);
    setForm((current) => ({
      ...current,
      name: current.name || store.user!.name,
      phone: current.phone || store.user!.phone,
    }));
  }, [store.user]);

  function toggleSection(key: keyof typeof sections) {
    setSections((current) => ({ ...current, [key]: !current[key] }));
  }


  function useSaved(address: Address) {
    setForm({
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      landmark: address.landmark ?? "",
      city: address.city,
      state: canonicalState(address.state),
      pin: address.pin,
    });
    setEmail(store.user?.email ?? email);
  }

  async function place(event: FormEvent) {
    event.preventDefault();
    if (store.cart.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    const problem = addressProblem(form, pinStatus, offStates(rules), true);
    if (problem) {
      setError(problem);
      setSections((current) => ({ ...current, address: true }));
      return;
    }
    if (payment !== "cod" && onlineOff) {
      setError("Online payment is not available yet. Choose cash on delivery.");
      return;
    }
    if (payment === "cod" && rules.codEnabled === false) {
      setError("Cash on delivery is turned off.");
      return;
    }
    if (payment === "cod" && total > rules.codMax) {
      setError(`Cash on delivery is available on orders up to ${formatINR(rules.codMax)}.`);
      return;
    }
    const address: Address = {
      id: `addr-${Date.now()}`,
      label: "Delivery",
      ...form,
      isDefault: false,
    };
    const orderInput = {
      email,
      phone: form.phone,
      address,
      delivery,
      payment,
      gift: giftWrap || giftMessage.trim() || hidePrices ? { wrap: giftWrap, message: giftMessage.trim(), hidePrices } : undefined,
    };
    setPaying(true);
    setError(null);
    try {
      let razorpay: { orderId: string; paymentId: string; signature: string } | undefined;
      if (payment !== "cod") {
        try {
          const session = await api<{ configured: false } | RazorpaySession>("/payments/checkout", {
            method: "POST",
            body: JSON.stringify({
              ...orderInput,
              coupon: store.coupon ?? undefined,
              items: store.cart.map((item) => ({ slug: item.slug, color: item.color, size: item.size, quantity: item.quantity })),
            }),
          });
          if (session.configured) {
            const loaded = await loadRazorpay();
            if (!loaded) {
              setError("The payment window could not be opened. Try again in a moment.");
              return;
            }
            const proof = await openRazorpay(session, { name: form.name, email, contact: form.phone }, payment);
            if (!proof) {
              setError("Payment was not completed.");
              return;
            }
            razorpay = proof;
          }
        } catch (error) {
          setError(error instanceof TypeError ? "We could not reach the payment service. Check your connection and try again." : error instanceof Error ? error.message : "Payment could not be started.");
          return;
        }
      }
      if (razorpay) {
        const failure = await confirmPaid(orderInput, razorpay);
        if (failure) setError(failure);
        return;
      }
      const result = await store.placeOrder({ ...orderInput, razorpay });
      if (typeof result === "string") {
        setError(result);
        return;
      }
      sessionStorage.setItem("earthen-placed", result.id);
      router.push(`/order/${result.id}`);
    } finally {
      setPaying(false);
    }
  }

  if (!store.ready) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:grid md:grid-cols-[1fr_320px] md:gap-12 md:px-6">
      <form
        onSubmit={place}
        onInvalid={() => setSections((current) => ({ ...current, contact: true, address: true, delivery: true, payment: true }))}
        className="space-y-8"
      >
        <div>
          <h1 className="serif settle text-4xl [--i:0]">Checkout</h1>
          <p className="settle mt-2 text-sm text-muted [--i:1]">No account needed. The receipt goes to your email, and a short update goes to your mobile.</p>
        </div>

        <Fold title="Contact" open={sections.contact} onToggle={() => toggleSection("contact")}>
          <label className="block text-sm">
            Email
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
          </label>
        </Fold>

        <Fold title="Shipping address" open={sections.address} onToggle={() => toggleSection("address")}>
          {saved.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {saved.map((address) => (
                <button type="button" key={address.id} onClick={() => useSaved(address)} className="border border-line px-3 py-2 text-left text-sm">
                  {address.label}
                  {address.isDefault ? " · Default" : ""}
                  <span className="block text-muted">{address.city}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mt-3">
            <AddressFields value={form} onChange={setForm} off={offStates(rules)} blockOff onStatus={setPinStatus} />
            <p className="mt-2 text-xs text-muted">The mobile is for the courier, and for order updates by email and WhatsApp. No promotions unless you ask for them.</p>
            <p className="text-sm leading-6 text-muted mt-3">
              We'll WhatsApp this number about the order: when it is confirmed, packed, shipped, out for delivery, and delivered, and if you cancel or return. The receipt still goes to the email above. Placing the order agrees to those messages.
            </p>
          </div>
        </Fold>

        <Fold title="Delivery" open={sections.delivery} onToggle={() => toggleSection("delivery")}>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Choice
              selected={delivery === "standard"}
              onClick={() => setDelivery("standard")}
              title="Standard"
              text={after >= rules.freeShippingAt || freeShip ? "Free · 3–5 days" : `${formatINR(rules.standardShipping)} · 3–5 days`}
            />
            <Choice
              selected={delivery === "express"}
              onClick={() => setDelivery("express")}
              title="Express"
              text={freeShip ? "Free · 1–2 days" : `${formatINR(rules.expressShipping)} · 1–2 days`}
            />
          </div>
        </Fold>

        <Fold title="Gift" open={sections.gift} onToggle={() => toggleSection("gift")}>
          <label className="mt-3 flex items-start gap-3 text-sm">
            <input type="checkbox" checked={giftWrap} onChange={(event) => setGiftWrap(event.target.checked)} className="mt-1" />
            <span>
              Gift wrap
              <span className="block text-muted">Tissue, a recycled mailer, and a card. Included.</span>
            </span>
          </label>
          <label className="mt-4 block text-sm">
            Message for the card
            <textarea
              value={giftMessage}
              maxLength={140}
              onChange={(event) => setGiftMessage(event.target.value)}
              className="mt-1 min-h-24 w-full border border-line bg-paper p-3 outline-none"
            />
          </label>
          <label className="mt-3 flex items-start gap-3 text-sm">
            <input type="checkbox" checked={hidePrices} onChange={(event) => setHidePrices(event.target.checked)} className="mt-1" />
            <span>
              Leave prices off the packing slip
              <span className="block text-muted">The invoice we email still shows them.</span>
            </span>
          </label>
        </Fold>

        <section>
          <CouponOffers subtotal={subtotal} />
        </section>

        <Fold title="Payment" open={sections.payment} onToggle={() => toggleSection("payment")}>
          <div className="mt-3 grid gap-3">
            {payments.map((option) => {
              const disabled = option.id === "cod" ? codBlocked : onlineOff;
              return (
                <button
                  type="button"
                  key={option.id}
                  disabled={disabled}
                  onClick={() => setPayment(option.id)}
                  className={`border px-4 py-3 text-left ${payment === option.id ? "border-ink bg-paper" : "border-line"} disabled:opacity-40`}
                >
                  <span className="block text-sm">{option.label}</span>
                  <span className="text-sm text-muted">{disabled ? (option.id !== "cod" ? "Coming soon. Pay by cash on delivery for now." : rules.codEnabled === false ? "Turned off in studio settings" : `Unavailable above ${formatINR(rules.codMax)}`) : option.id === "cod" ? `${formatINR(rules.codFee)} fee · up to ${formatINR(rules.codMax)}` : option.hint}</span>
                </button>
              );
            })}
          </div>
          {payment === "cod" && (
            <p className="mt-3 text-sm text-muted">
              A cash on delivery fee of {formatINR(rules.codFee)} is added. Maximum order value {formatINR(rules.codMax)}.
            </p>
          )}
        </Fold>

        {error && (
          <p key={error} className="note-in text-sm">
            {error}
          </p>
        )}
        {confirming && <p className="text-sm">We received your payment. Confirming your order…</p>}
        {onlineOff && codBlocked && <p className="text-sm">This order cannot be paid for yet: online payment is coming soon and cash on delivery is not available for it.</p>}
        <button disabled={paying || confirming || (onlineOff && codBlocked)} className="h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream disabled:opacity-60">
          {paying || confirming ? "PLEASE WAIT" : "PLACE ORDER"}
        </button>
        <p className="text-center text-xs text-muted">
          {mode === "live"
            ? "UPI, cards, and net banking are collected by Razorpay. Cash on delivery is paid to the courier."
            : mode === "demo"
              ? "Demo mode: online orders are placed without taking any payment."
              : "Cash on delivery is paid to the courier. Online payment is coming soon."}{" "}
          <Link href="/cart" className="underline">
            Return to bag
          </Link>
        </p>
      </form>

      <aside className="mt-10 md:mt-0">
        <button className="flex w-full items-center justify-between border border-line px-4 py-3 md:hidden" onClick={() => setSummaryOpen((value) => !value)}>
          <span className="text-sm">Order summary</span>
          <span className="text-sm">{formatINR(total)}</span>
        </button>
        <div className={`${summaryOpen ? "block" : "hidden"} md:block md:border md:border-line md:p-5`}>
          <Summary subtotal={subtotal} discount={discount} shipping={shipping} codFee={codFee} total={total} />
        </div>
      </aside>
    </div>
  );
}

function Summary({
  subtotal,
  discount,
  shipping,
  codFee,
  total,
}: {
  subtotal: number;
  discount: number;
  shipping: number;
  codFee: number;
  total: number;
}) {
  const store = useStore();
  return (
    <div className="border border-line p-4 md:border-0 md:p-0">
      <ul className="space-y-3 text-sm">
        {store.cart.map((item) => (
          <li key={`${item.slug}-${item.color}-${item.size}`} className="flex justify-between gap-3">
            <span>
              {item.name} · {item.color} / {item.size} × {item.quantity}
            </span>
            <span>{formatINR(store.priceOf(item.slug, item.price) * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
        <div className="flex justify-between">
          <dt>Discount{discount > 0 && store.coupon ? ` · ${store.coupon}` : ""}</dt>
          <dd>−{formatINR(discount)}</dd>
        </div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd></div>
        {codFee > 0 && <div className="flex justify-between"><dt>COD fee</dt><dd>{formatINR(codFee)}</dd></div>}
        <div className="flex justify-between border-t border-line pt-2 text-base"><dt>Total</dt><dd>{formatINR(total)}</dd></div>
      </dl>
      <p className="mt-2 text-xs text-muted">Inclusive of GST.</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm ${className}`}>
      {label}
      <input required={label !== "Area"} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
    </label>
  );
}

function Choice({ selected, onClick, title, text }: { selected: boolean; onClick: () => void; title: string; text: string }) {
  return (
    <button type="button" onClick={onClick} className={`border px-4 py-3 text-left ${selected ? "border-ink bg-paper" : "border-line"}`}>
      <span className="block text-sm">{title}</span>
      <span className="text-sm text-muted">{text}</span>
    </button>
  );
}

type PendingPayment = {
  input: Omit<Parameters<ReturnType<typeof useStore>["placeOrder"]>[0], "razorpay">;
  razorpay: { orderId: string; paymentId: string; signature: string };
};

const PENDING_KEY = "earthen-pending-payment";

function readPending(): PendingPayment | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(PENDING_KEY) ?? "null") as PendingPayment | null;
    return value?.razorpay?.paymentId ? value : null;
  } catch {
    return null;
  }
}

function savePending(value: PendingPayment) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(value));
  } catch {
    // Without storage the retries in this page still run.
  }
}

function clearPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // Nothing to clear.
  }
}

// Not a definite answer: a dropped connection ("Failed to fetch" in Chrome, "NetworkError…" in Firefox, "Load failed" in Safari),
// a server or proxy error, or Razorpay not confirming yet. The paid order is retried instead of given up.
function isNetworkError(message: string) {
  return /failed to fetch|networkerror|load failed|network request failed|internal server error|could not complete that|could not confirm your payment/i.test(message);
}
