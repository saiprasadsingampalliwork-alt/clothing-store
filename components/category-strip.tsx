"use client";

import Link from "next/link";
import { ScrollRow } from "@/components/scroll-row";
import { categoryPhoto, shopEntrances } from "@/lib/catalog";
import { useStore } from "@/lib/store";

/** "Shop by category": a sideways row with arrows, edge fades, and a progress line when it overflows. */
export function CategoryStrip() {
  const { overrides } = useStore();
  const categories = shopEntrances();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6" aria-labelledby="shop-by-category">
      <ScrollRow
        label="Categories"
        heading="Shop by category"
        headingId="shop-by-category"
        action={
          <Link href="/shop" className="text-sm underline-offset-4 hover:underline">
            Shop all
          </Link>
        }
      >
        {categories.map((category) => (
          <Link key={category.slug} href={`/shop?category=${category.slug}`}>
            <img src={categoryPhoto(category, overrides).src} alt="" width={800} height={1000} className="aspect-[4/5] w-full bg-[#e7e1d6] object-cover" />
            <p className="mt-3 text-sm">{category.label}</p>
            {category.blurb && <p className="mt-1 text-sm text-muted">{category.blurb}</p>}
          </Link>
        ))}
      </ScrollRow>
    </section>
  );
}
