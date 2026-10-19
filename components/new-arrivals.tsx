"use client";

import { ProductCard } from "@/components/product-card";
import { catalogSource, liveProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function NewArrivals() {
  const { overrides, ready } = useStore();
  const arrivals = catalogSource()
    .map((product) => liveProduct(product, overrides[product.slug]))
    .filter((product) => product.isNew && (!ready || product.status === "active"))
    .slice(0, 4);

  return (
    <div className="reveal mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {arrivals.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
