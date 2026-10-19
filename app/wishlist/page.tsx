"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductVisual } from "@/components/product-visual";
import { formatINR } from "@/lib/money";
import { withStoreSale } from "@/lib/sale";
import { GENDERS, getProduct, liveProduct, productGender, unitsAvailable, type Product } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, user, ready } = useStore();
  if (!ready) return null;
  const items = wishlist
    .map((item) => {
      const product = getProduct(item.slug);
      return product ? { product, color: item.color } : null;
    })
    .filter((item) => item != null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="serif text-4xl">Wishlist</h1>
      {!user && <p className="mt-2 text-sm text-muted">Saved on this browser. Sign in to keep it with your account.</p>}
      {user && items.length > 0 && (
        <p className="mt-2 text-sm text-muted">If these stay saved and you haven't ordered them, we'll WhatsApp the mobile on your account after an hour.</p>
      )}
      {items.length === 0 ? (
        <div className="mt-8">
          <p>Nothing saved yet.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm underline">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="reveal mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <WishCard key={item.product.slug} product={item.product} color={item.color} />
          ))}
        </div>
      )}
    </div>
  );
}

function WishCard({ product, color }: { product: Product; color: string }) {
  const { addToCart, usualSize, overrides, settings } = useStore();
  const live = withStoreSale(liveProduct(product, overrides[product.slug]), settings);
  const swatch = product.colors.find((entry) => entry.name === color) ?? product.colors[0];
  const [size, setSize] = useState(product.sizes.includes(usualSize ?? "M") ? (usualSize ?? "M") : product.sizes[0]);
  const [note, setNote] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const left = unitsAvailable(live, swatch.name, size);

  function add() {
    if (left <= 0) {
      setNote("That size is out of stock.");
      return;
    }
    const error = addToCart(product, swatch.name, size, quantity);
    if (error) {
      setNote(error);
      return;
    }
    setNote(null);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
    window.dispatchEvent(new CustomEvent("earthen:bag", { detail: { slug: product.slug, color: swatch.name, size } }));
  }

  return (
    <div>
      <Link href={`/product/${product.slug}`}>
        <ProductVisual slug={product.slug} name={product.name} hex={swatch.hex} colorName={swatch.name} silhouette={product.silhouette} photos={product.photos} transitionName={`wish-${product.slug}`} />
      </Link>
      <p className="mt-4 text-[11px] uppercase tracking-[0.16em] text-muted">{GENDERS.find((gender) => gender.id === productGender(live))?.label}</p>
      <p className="mt-1 text-sm">{product.name}</p>
      <p className="mt-1 text-sm text-muted">{swatch.name}</p>
      <p className="mt-1 text-sm">
        {formatINR(live.price)}
        {live.price < live.basePrice && <span className="ml-2 text-muted line-through">{formatINR(live.basePrice)}</span>}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {product.sizes.map((option) => {
          const units = unitsAvailable(live, swatch.name, option);
          return (
            <button
              key={option}
              type="button"
              disabled={units <= 0}
              onClick={() => {
                setSize(option);
                setQuantity(1);
              }}
              className={`h-10 w-10 border text-sm ${option === size ? "border-ink bg-ink text-cream" : "border-line"} disabled:text-muted disabled:line-through`}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex h-10 w-28 items-center border border-line">
        <button type="button" className="h-full flex-1 disabled:opacity-40" aria-label="Decrease quantity" disabled={quantity <= 1 || left <= 0} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>
          –
        </button>
        <span className="flex-1 text-center text-sm">{quantity}</span>
        <button type="button" className="h-full flex-1 disabled:opacity-40" aria-label="Increase quantity" disabled={left <= 0 || quantity >= left} onClick={() => setQuantity((current) => Math.min(left, current + 1))}>
          +
        </button>
      </div>
      <button type="button" onClick={add} className={`motion-btn relative mt-3 h-11 border border-ink px-4 text-xs tracking-[0.14em] ${added ? "done" : ""}`}>
        <span className="lbl">ADD TO BAG</span>
        <span className="tick" aria-hidden="true">
          ✓
        </span>
      </button>
      {note && <p className="mt-2 text-sm text-muted">{note}</p>}
    </div>
  );
}
