"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { ProductVisual } from "@/components/product-visual";
import { GENDERS, liveProduct, productGender, unitsAvailable, type Product } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { withStoreSale } from "@/lib/sale";
import { studioSrc, type Silhouette } from "@/lib/studio";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";

export function ProductCard({ product, transitionName }: { product: Product; transitionName?: string }) {
  const { addToCart, toggleWishlist, wished, usualSize, overrides, settings } = useStore();
  const hydrated = useHydrated();
  const listed = liveProduct(product, hydrated ? overrides[product.slug] : undefined);
  const live = hydrated ? withStoreSale(listed, settings) : listed;
  const swatch = live.colors[0];
  const saved = wished(live.slug);
  const start = useRef({ x: 0, y: 0 });
  const [picker, setPicker] = useState<"bag" | "heart" | null>(null);
  const [color, setColor] = useState(swatch.name);
  const [size, setSize] = useState(live.sizes.includes(usualSize ?? "M") ? (usualSize ?? "M") : live.sizes[0]);
  const [note, setNote] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pop, setPop] = useState(false);
  const [added, setAdded] = useState(false);
  const left = unitsAvailable(live, color, size);

  useEffect(() => {
    if (!picker) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPicker(null);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [picker]);

  function choose(kind: "bag" | "heart") {
    const nextColor = live.colors[0].name;
    const preferred = usualSize && live.sizes.includes(usualSize) ? usualSize : live.sizes[0];
    const inStock = live.sizes.find((option) => unitsAvailable(live, nextColor, option) > 0) ?? preferred;
    setColor(nextColor);
    setSize(inStock);
    setQuantity(1);
    setNote(null);
    setPicker(kind);
  }

  function quickBag() {
    choose("bag");
  }

  function quickHeart() {
    if (saved || live.colors.length === 1) {
      if (!saved) setPop(true);
      toggleWishlist(live.slug, saved ? color : live.colors[0].name);
      return;
    }
    choose("heart");
  }

  function confirm() {
    if (picker === "heart") {
      if (!saved) setPop(true);
      toggleWishlist(live.slug, color);
      setPicker(null);
      return;
    }
    const error = addToCart(live, color, size, quantity);
    if (error) {
      setNote(error);
      return;
    }
    setPicker(null);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 700);
    window.dispatchEvent(new CustomEvent("earthen:bag", { detail: { slug: live.slug, color, size } }));
  }

  return (
    <div className="group relative">
      <Link
        href={`/product/${live.slug}`}
        className="block"
        onPointerDown={(event) => {
          start.current = { x: event.clientX, y: event.clientY };
        }}
        onClick={(event) => {
          const dx = Math.abs(event.clientX - start.current.x);
          const dy = Math.abs(event.clientY - start.current.y);
          if (dx > 12 || dy > 12) event.preventDefault();
        }}
      >
        <ProductVisual
          slug={live.slug}
          name={live.name}
          hex={swatch.hex}
          colorName={swatch.name}
          silhouette={live.silhouette}
          photos={live.photos}
          transitionName={transitionName}
        />
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{GENDERS.find((gender) => gender.id === productGender(live))?.label}</p>
          <p className="mt-1 text-sm">{live.name}</p>
          <p className="mt-1 text-sm text-muted">{live.fabric}</p>
          <p className="mt-1 text-xs text-muted">{live.colors.map((entry) => entry.name).join(" · ")}</p>
          <p className="mt-2 text-sm">
            {formatINR(live.price)}
            {live.price < live.basePrice && <span className="ml-2 text-muted line-through">{formatINR(live.basePrice)}</span>}
          </p>
        </div>
      </Link>
      <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5]">
        <div className="pointer-events-auto absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={quickHeart}
            aria-label={saved ? `Remove ${live.name} from wishlist` : `Save ${live.name} to wishlist`}
            aria-pressed={saved}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream/95 text-ink"
          >
            <Heart filled={saved} pop={pop} onDone={() => setPop(false)} />
          </button>
          <button
            type="button"
            onClick={quickBag}
            aria-label={`Add ${live.name} to bag`}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream/95 text-ink"
          >
            <Icon name="bag" className={`h-4 w-4 ${added ? "bag-pop" : ""}`} />
          </button>
        </div>
      </div>
      {picker && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={`pick-${live.slug}`}>
          <button type="button" className="drawer-backdrop absolute inset-0 bg-ink/40" aria-label="Close" onClick={() => setPicker(null)} />
          <div className="settle relative w-full max-w-sm bg-cream p-5 sm:shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p id={`pick-${live.slug}`} className="text-sm">
                  {live.name}
                </p>
                <p className="mt-1 text-sm text-muted">{picker === "heart" ? "Choose a colour to save it." : "Choose a colour, size, and quantity."}</p>
              </div>
              <button type="button" className="flex h-11 w-11 items-center justify-center text-muted" aria-label="Close" onClick={() => setPicker(null)}>
                <Icon name="close" />
              </button>
            </div>
            <div className="mt-4 flex gap-2">
              {live.colors.map((entry) => (
                <button
                  key={entry.name}
                  type="button"
                  aria-label={entry.name}
                  aria-pressed={entry.name === color}
                  onClick={() => {
                    setColor(entry.name);
                    setQuantity((current) => Math.min(current, Math.max(1, unitsAvailable(live, entry.name, size) || 1)));
                    setNote(null);
                  }}
                  className={`h-8 w-8 rounded-full border ${entry.name === color ? "border-ink" : "border-line"}`}
                  style={{ background: entry.hex }}
                />
              ))}
            </div>
            <p className="mt-2 text-sm text-muted">{color}</p>
            {picker === "bag" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {live.sizes.map((option) => {
                  const units = unitsAvailable(live, color, option);
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={units <= 0}
                      onClick={() => {
                        setSize(option);
                        setQuantity((current) => Math.min(current, Math.max(1, units)));
                        setNote(null);
                      }}
                      className={`h-11 w-11 border text-sm ${option === size ? "border-ink bg-ink text-cream" : "border-line"} disabled:text-muted disabled:line-through`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
            {picker === "bag" && (
              <div className="mt-4 flex h-11 w-28 items-center border border-line">
                <button type="button" className="h-full flex-1 disabled:opacity-40" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
                  –
                </button>
                <span className="flex-1 text-center text-sm">{quantity}</span>
                <button type="button" className="h-full flex-1 disabled:opacity-40" aria-label="Increase quantity" disabled={left <= 0 || quantity >= left} onClick={() => setQuantity((current) => Math.min(left, current + 1))}>
                  +
                </button>
              </div>
            )}
            {picker === "bag" && left > 0 && left <= 3 && <p className="mt-2 text-sm text-muted">Only {left} left in {color}, size {size}.</p>}
            {note && <p className="note-in mt-2 text-sm text-muted">{note}</p>}
            <button type="button" onClick={confirm} disabled={picker === "bag" && left <= 0} className="mt-5 h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream disabled:opacity-40">
              {picker === "heart" ? "SAVE" : "ADD TO BAG"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Heart({ filled, pop, onDone }: { filled: boolean; pop: boolean; onDone: () => void }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      onAnimationEnd={onDone}
      className={`heart ${pop ? "is-pop" : ""} ${filled ? "fill-terra text-terra" : "fill-none text-ink"}`}
    >
      <path d="M8 13.2 2.4 8.1a3.2 3.2 0 0 1 4.3-4.7L8 4.6l1.3-1.2a3.2 3.2 0 0 1 4.3 4.7Z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function Swatch({ hex, label, silhouette, src }: { hex: string; label?: string; silhouette?: Silhouette; src?: string }) {
  if (src) {
    return <img src={src} alt={label ?? ""} width={80} height={100} className="h-20 w-16 shrink-0 object-cover" />;
  }
  if (!silhouette) {
    return <span className="inline-block h-20 w-16 shrink-0 border border-black/5" style={{ background: hex }} aria-label={label} />;
  }
  return <img src={studioSrc("flat", hex, silhouette)} alt={label ?? ""} width={80} height={100} className="h-20 w-16 shrink-0 object-cover" />;
}
