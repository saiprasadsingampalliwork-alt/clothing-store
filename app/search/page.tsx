"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { filterProducts } from "@/lib/catalog";

function Results() {
  const params = useSearchParams();
  const query = params.get("q") ?? "";
  const list = query ? filterProducts({ query, sort: "popular" }) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <h1 className="serif text-4xl">Search</h1>
      <p className="mt-2 text-sm text-muted">{query ? `${list.length} results for “${query}”` : "Type a word in the search bar."}</p>
      <div key={query} className="reveal mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
        {list.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <Results />
    </Suspense>
  );
}
