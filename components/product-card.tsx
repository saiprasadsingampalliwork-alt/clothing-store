"use client";

import Link from "next/link";
import { useRef } from "react";
import { ProductVisual } from "@/components/product-visual";
import type { Product } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { studioSrc, type Silhouette } from "@/lib/studio";

export function ProductCard({ product }: { product: Product }) {
  const swatch = product.colors[0];
  const start = useRef({ x: 0, y: 0 });

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
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
        slug={product.slug}
        name={product.name}
        hex={swatch.hex}
        colorName={swatch.name}
        silhouette={product.silhouette}
        photos={product.photos}
      />
      <div className="mt-4">
        <p className="text-sm">{product.name}</p>
        <p className="mt-1 text-sm text-muted">{product.fabric}</p>
        <p className="mt-1 text-xs text-muted">{product.colors.map((color) => color.name).join(" · ")}</p>
        <p className="mt-2 text-sm">{formatINR(product.price)}</p>
      </div>
    </Link>
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
