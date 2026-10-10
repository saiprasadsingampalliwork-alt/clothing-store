"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getProduct } from "@/lib/catalog";
import { RollingPrice } from "@/components/rolling-price";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";

export function MiniCart() {
  const store = useStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { subtotal, discount } = store.totals;
  const after = Math.max(0, subtotal - discount);
  const goal = store.settings.freeShippingAt;
  const ratio = goal <= 0 ? 1 : Math.min(1, after / goal);
  const remaining = Math.max(0, goal - after);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function openBag() {
      setOpen(true);
    }
    window.addEventListener("earthen:bag", openBag);
    return () => window.removeEventListener("earthen:bag", openBag);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button className="drawer-backdrop absolute inset-0 bg-ink/40" aria-label="Close bag" onClick={() => setOpen(false)} />
      <aside className="drawer absolute inset-y-0 right-0 flex w-[min(100%,380px)] flex-col bg-cream shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <p className="text-sm">Your bag</p>
          <button className="text-sm text-muted" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <ul className="flex-1 divide-y divide-line overflow-auto px-5">
          {store.cart.map((item, index) => {
            const photo = getProduct(item.slug)?.photos?.[0].src;
            return (
            <li key={`${item.slug}-${item.color}-${item.size}`} className="settle flex gap-4 py-4" style={{ ["--i" as string]: index }}>
              {photo ? (
                <img src={photo} alt="" width={56} height={70} className="h-16 w-14 shrink-0 object-cover" />
              ) : (
                <span className="h-16 w-14 shrink-0" style={{ background: item.hex }} />
              )}
              <span className="min-w-0 flex-1">
                <span className="block text-sm">{item.name}</span>
                <span className="mt-1 block text-sm text-muted">
                  {item.color} · {item.size} · × {item.quantity}
                </span>
                <span className="mt-1 block text-sm">
                  <RollingPrice value={item.price * item.quantity} />
                </span>
              </span>
            </li>
            );
          })}
        </ul>
        <div className="border-t border-line px-5 py-5">
          <div className="h-1 bg-line">
            <div className="ship-bar h-full bg-olive" style={{ transform: `scaleX(${ratio})` }} />
          </div>
          <p className="mt-2 text-sm text-muted">
            {remaining === 0 ? "Free shipping applied." : `Add ${formatINR(remaining)} for free standard delivery.`}
          </p>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <RollingPrice value={after} />
          </div>
          <Link href="/cart" className="mt-4 flex h-12 items-center justify-center border border-ink text-xs tracking-[0.16em]" onClick={() => setOpen(false)}>
            VIEW BAG
          </Link>
          <Link href="/checkout" className="mt-2 flex h-12 items-center justify-center bg-terra text-sm tracking-[0.16em] text-cream" onClick={() => setOpen(false)}>
            CHECKOUT
          </Link>
        </div>
      </aside>
    </div>
  );
}
