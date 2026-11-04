"use client";

import { ProductCard } from "@/components/product-card";
import { catalogSource, liveProduct, onSale } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { Reveal } from "@/components/reveal";

export function NewArrivals() {
  const { overrides, ready } = useStore();
  const arrivals = catalogSource()
    .map((product) => liveProduct(product, overrides[product.slug]))
    .filter((product) => product.isNew && (!ready || onSale(product.slug, overrides)))
    .slice(0, 4);

  return (
    <Reveal className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {arrivals.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </Reveal>
  );
}
