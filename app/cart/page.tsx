"use client";

import Link from "next/link";
import { CouponOffers } from "@/components/coupon-offers";
import { getProduct } from "@/lib/catalog";
import { Swatch } from "@/components/product-card";
import { RollingPrice } from "@/components/rolling-price";
import { formatINR, shippingFee } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function CartPage() {
  const store = useStore();
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
      {store.user && count > 0 && (
        <p className="mt-2 text-sm text-muted">If these are still in your bag in an hour, we'll WhatsApp the mobile on your account.</p>
      )}

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
                    <RollingPrice value={store.priceOf(item.slug, item.price) * item.quantity} />
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

          <div className="mt-6">
            <CouponOffers subtotal={subtotal} />
          </div>

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
