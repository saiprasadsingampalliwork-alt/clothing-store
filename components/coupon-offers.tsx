"use client";

import { useState } from "react";
import { evaluateCoupon, formatINR, type CouponRecord } from "@/lib/money";
import { useStore } from "@/lib/store";

function offerLabel(coupon: CouponRecord) {
  if (coupon.type === "percent") return `${coupon.value}% off`;
  if (coupon.type === "fixed") return `${formatINR(coupon.value)} off`;
  return "Free shipping";
}

function isListed(coupon: CouponRecord, today: string) {
  if (!coupon.active) return false;
  if (coupon.starts && today < coupon.starts) return false;
  if (coupon.ends && today > coupon.ends) return false;
  if (coupon.usageLimit > 0 && coupon.used >= coupon.usageLimit) return false;
  return true;
}

function savings(coupon: CouponRecord, subtotal: number) {
  const result = evaluateCoupon(coupon, subtotal);
  if (!result.ok) return null;
  if (coupon.type === "free_shipping") return "Waives shipping on this order";
  return `Saves ${formatINR(result.discount)} on this order`;
}

export function CouponOffers({ subtotal }: { subtotal: number }) {
  const store = useStore();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const offers = store.coupons
    .filter((coupon) => isListed(coupon, today))
    .map((coupon) => {
      const result = evaluateCoupon(coupon, subtotal);
      return { coupon, result, saving: savings(coupon, subtotal) };
    })
    .sort((a, b) => Number(b.result.ok) - Number(a.result.ok));

  function apply(value: string) {
    const error = store.applyCoupon(value);
    const applied = value.trim().toUpperCase();
    setMessage(error ?? `${applied} applied.`);
    if (!error) setCode(applied);
  }

  return (
    <div>
      <div>
        <label htmlFor="coupon" className="text-sm">
          Coupon
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="coupon"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                apply(code);
              }
            }}
            placeholder="Enter a code"
            className="h-11 flex-1 border border-line bg-paper px-3 outline-none"
          />
          <button type="button" onClick={() => apply(code)} className="h-11 border border-ink px-4 text-xs tracking-[0.14em]">
            APPLY
          </button>
        </div>
      </div>
      {message && (
        <p key={message} className="note-in mt-2 text-sm">
          {message}
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="flex h-11 w-full items-center justify-between border border-line px-3 text-left text-sm"
        >
          <span>Offers for this order{store.coupon ? ` · ${store.coupon}` : ""}</span>
          <span aria-hidden="true">{open ? "–" : "+"}</span>
        </button>
        {open &&
          (offers.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No coupons are open right now.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line border border-line">
            {offers.map(({ coupon, result, saving }) => {
              const applied = store.coupon === coupon.code && result.ok;
              return (
                <li key={coupon.code} className={`px-3 py-3 text-sm ${applied ? "bg-paper" : ""}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="tracking-[0.08em]">
                        {coupon.code}
                        {applied && <span className="ml-2 text-xs normal-case tracking-normal text-olive">Applied</span>}
                      </p>
                      <p className="mt-1 text-muted">
                        {offerLabel(coupon)}
                        {coupon.minOrder > 0 ? ` · Orders from ${formatINR(coupon.minOrder)}` : ""}
                      </p>
                      {saving && <p className="mt-1 text-olive">{saving}</p>}
                      {!result.ok && <p className="mt-1 text-muted">{result.reason}</p>}
                    </div>
                    {applied ? (
                      <button
                        type="button"
                        onClick={() => {
                          store.clearCoupon();
                          setCode("");
                          setMessage(null);
                        }}
                        className="shrink-0 text-xs tracking-[0.14em] underline"
                      >
                        REMOVE
                      </button>
                    ) : result.ok ? (
                      <button type="button" onClick={() => apply(coupon.code)} className="shrink-0 text-xs tracking-[0.14em] underline">
                        APPLY
                      </button>
                    ) : (
                      <span className="shrink-0 text-xs tracking-[0.08em] text-muted">NOT FOR THIS ORDER</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          ))}
      </div>
    </div>
  );
}
