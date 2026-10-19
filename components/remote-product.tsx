"use client";

import { ProductView } from "@/components/product-view";
import { getProduct } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export function RemoteProduct({ slug }: { slug: string }) {
  const { ready } = useStore();
  const product = getProduct(slug);
  if (!ready) return null;
  if (!product) return <p className="px-4 py-16">This piece is not in the shop.</p>;
  return <ProductView product={product} />;
}
