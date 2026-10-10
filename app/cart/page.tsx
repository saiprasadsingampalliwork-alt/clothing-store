"use client";

import Link from "next/link";
import { useState } from "react";
import { getProduct } from "@/lib/catalog";
import { Swatch } from "@/components/product-card";
import { RollingPrice } from "@/components/rolling-price";
import { formatINR, shippingFee } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const store = useStore();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const { subtotal, discount, count } = store.totals;
  const after = Math.max(0, subtotal - discount);
  const freeShip = store.coupons.find((entry) => entry.code === store.coupon)?.type === "free_shipping";
  const shipping = shippingFee(after, "standard", freeShip, store.settings);
  const total = after + shipping;
  const remaining = Math.max(0, store.settings.freeShippingAt - after);
  const ratio = store.settings.freeShippingAt <= 0 ? 1 : Math.min(1, after / store.settings.freeShippingAt);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <h1 className="serif text-4xl">Your bag</h1>
      <p className="mt-1 text-sm text-muted">{count} {count === 1 ? "item" : "items"}</p>

      {store.cart.length === 0 ? (
        <div className="mt-10">
          <p>Your bag is empty.</p>
          <Link href="/shop" className="mt-6 inline-flex h-12 items-center bg-terra px-6 text-sm tracking-[0.16em] text-cream">
            SHOP THE COLLECTION
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {store.cart.map((item) => (
              <li key={`${item.slug}-${item.color}-${item.size}`} className="flex gap-4 py-5">
                <Swatch hex={item.hex} label={item.color} silhouette={getProduct(item.slug)?.silhouette} src={getProduct(item.slug)?.photos?.[0].src} />
                <div className="flex-1">
                  <Link href={`/product/${item.slug}`} className="text-sm">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {item.color} · Size {item.size}
                  </p>
                  <p className="mt-1 text-sm">
                    <RollingPrice value={item.price * item.quantity} />
                  </p>
                  <div className="mt-3 flex h-10 w-28 items-center border border-line">
                    <button className="h-full flex-1" onClick={() => store.updateQty(item.slug, item.color, item.size, item.quantity - 1)} aria-label="Decrease">
                      –
                    </button>
                    <span className="flex-1 text-center text-sm">{item.quantity}</span>
                    <button className="h-full flex-1" onClick={() => store.updateQty(item.slug, item.color, item.size, item.quantity + 1)} aria-label="Increase">
                      +
                    </button>
                  </div>
                  <button className="mt-2 text-sm underline" onClick={() => store.removeFromCart(item.slug, item.color, item.size)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              const error = store.applyCoupon(code);
              setMessage(error ?? `${code.toUpperCase()} applied.`);
            }}
          >
            <label htmlFor="coupon" className="text-sm">
              Coupon
            </label>
            <div className="mt-2 flex gap-2">
            <input
              id="coupon"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="h-11 flex-1 border border-line bg-paper px-3 outline-none"
            />
            <button className="h-11 border border-ink px-4 text-xs tracking-[0.14em]">APPLY</button>
            </div>
          </form>
          {message && (
            <p key={message} className="note-in mt-2 text-sm">
              {message}
            </p>
          )}
          <p className="mt-2 text-xs text-muted">If you have a code, such as WELCOME10, it applies to this order.</p>

          <div className="mt-6 h-1 bg-line">
            <div className="ship-bar h-full bg-olive" style={{ transform: `scaleX(${ratio})` }} />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={formatINR(subtotal)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : formatINR(shipping)} />
            <Row label="Discount" value={`−${formatINR(discount)}`} />
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt>Total</dt>
              <dd>
                <RollingPrice value={total} />
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-sm text-muted">
            Inclusive of GST. {remaining === 0 ? "Free shipping applied." : `Add ${formatINR(remaining)} for free standard delivery.`}
          </p>
          <Link href="/checkout" className="mt-5 flex h-12 items-center justify-center bg-terra text-sm tracking-[0.16em] text-cream">
            CHECKOUT
          </Link>
          <p className="mt-3 text-sm text-muted">Cash on delivery available at checkout.</p>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
