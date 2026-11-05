"use client";

import Link from "next/link";
import { categoryPhoto, shopEntrances } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function CategoryStrip() {
  const { overrides } = useStore();
  const categories = shopEntrances();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <h2 className="serif text-3xl">Shop by category</h2>
      <div className="snap-row mt-8 pb-2">
        {categories.map((category) => (
          <Link key={category.slug} href={`/shop?category=${category.slug}`}>
            <img src={categoryPhoto(category, overrides).src} alt="" width={800} height={1000} className="aspect-[4/5] w-full bg-[#e7e1d6] object-cover" />
            <p className="mt-3 text-sm">{category.label}</p>
            {category.blurb && <p className="mt-1 text-sm text-muted">{category.blurb}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
