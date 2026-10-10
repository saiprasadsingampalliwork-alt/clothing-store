"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { getProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function WishlistPage() {
  const { wishlist, user, ready } = useStore();
  if (!ready) return null;
  const items = wishlist.map((item) => getProduct(item.slug)).filter((product) => product != null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="serif text-4xl">Wishlist</h1>
      {!user && <p className="mt-2 text-sm text-muted">Saved on this browser. Sign in to keep it with your account.</p>}
      {items.length === 0 ? (
        <div className="mt-8">
          <p>Nothing saved yet.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm underline">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="reveal mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
          {items.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
