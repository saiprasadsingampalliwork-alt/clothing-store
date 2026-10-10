"use client";

import { ProductCard } from "@/components/product-card";
import { getProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function RecentShelf({ plain = false }: { plain?: boolean }) {
  const { recent } = useStore();
  const items = recent.map((slug) => getProduct(slug)).filter((product) => product != null).slice(0, 3);
  if (items.length === 0) return null;

  const grid = (
    <div className={`grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 ${plain ? "" : "lg:grid-cols-3"}`}>
      {items.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );

  if (plain) {
    return (
      <section className="mt-12">
        <h2 className="serif text-3xl">Recently viewed</h2>
        <div className="mt-6">{grid}</div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h2 className="serif text-3xl">Recently viewed</h2>
      <div className="mt-8">{grid}</div>
    </section>
  );
}
