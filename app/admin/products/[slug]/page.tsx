"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { sku } from "@/lib/admin";
import { AdminHeader } from "@/components/admin-shell";
import { getProduct, liveProduct, stockKey, type ProductOverride } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export default function ProductEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  const { overrides, saveOverride, ready } = useStore();
  const saved = overrides[slug];
  const live = product ? liveProduct(product, saved) : undefined;
  const [price, setPrice] = useState(saved?.price ?? product?.price ?? 0);
  const [salePrice, setSalePrice] = useState(saved?.salePrice ? String(saved.salePrice) : "");
  const [saleStart, setSaleStart] = useState(saved?.saleStart ?? "");
  const [saleEnd, setSaleEnd] = useState(saved?.saleEnd ?? "");
  const [status, setStatus] = useState<ProductOverride["status"]>(saved?.status ?? "active");
  const [metaTitle, setMetaTitle] = useState(saved?.metaTitle ?? product?.name ?? "");
  const [metaDescription, setMetaDescription] = useState(saved?.metaDescription ?? product?.description ?? "");
  const [stock, setStock] = useState<Record<string, number>>(live?.stock ?? {});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !product) return;
    const current = liveProduct(product, overrides[slug]);
    setPrice(overrides[slug]?.price ?? product.price);
    setSalePrice(overrides[slug]?.salePrice ? String(overrides[slug]?.salePrice) : "");
    setSaleStart(overrides[slug]?.saleStart ?? "");
    setSaleEnd(overrides[slug]?.saleEnd ?? "");
    setStatus(overrides[slug]?.status ?? "active");
    setMetaTitle(overrides[slug]?.metaTitle ?? product.name);
    setMetaDescription(overrides[slug]?.metaDescription ?? product.description);
    setStock(current.stock);
  }, [ready, slug]);

  if (!product || !live) return <p>Product not found.</p>;

  async function save(event: FormEvent) {
    event.preventDefault();
    await saveOverride(product!.slug, {
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      saleStart,
      saleEnd,
      status,
      metaTitle,
      metaDescription,
      stock,
    });
    setMessage("Saved. The storefront uses this price and stock.");
  }

  return (
    <form onSubmit={save}>
      <AdminHeader title={product.name} />
      <p className="mt-3 text-sm text-[#6d6960]">
        <Link href="/admin/products" className="text-[#ab6446]">
          ← All products
        </Link>
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <div className="aspect-[4/5]" style={{ background: product.colors[0].hex }} />
          <div className="mt-3 flex gap-2">
            {product.colors.map((color) => (
              <span key={color.name} className="h-10 w-10 border border-line" style={{ background: color.hex }} title={color.name} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price (₹)" value={String(price)} onChange={(value) => setPrice(Number(value))} />
            <label className="block text-sm">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as ProductOverride["status"])} className="mt-1 h-11 w-full border border-line bg-paper px-2">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <Field label="Sale price (₹)" value={salePrice} onChange={setSalePrice} />
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">
                Sale starts
                <input type="date" value={saleStart} onChange={(event) => setSaleStart(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2" />
              </label>
              <label className="block text-sm">
                Sale ends
                <input type="date" value={saleEnd} onChange={(event) => setSaleEnd(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2" />
              </label>
            </div>
          </div>
          <label className="block text-sm">
            Search title
            <input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none" />
          </label>
          <label className="block text-sm">
            Search description
            <textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} className="mt-1 min-h-20 w-full border border-line bg-paper p-3 outline-none" />
          </label>
        </div>
      </div>
      <h2 className="mt-10 text-sm">Variants</h2>
      <div className="mt-3 overflow-auto border border-line bg-paper">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.14em] text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="py-3 font-medium">COLOUR</th>
              <th className="py-3 font-medium">SIZE</th>
              <th className="px-4 py-3 font-medium">STOCK</th>
            </tr>
          </thead>
          <tbody>
            {product.colors.flatMap((color) =>
              product.sizes.map((size) => {
                const key = stockKey(color.name, size);
                return (
                  <tr key={key} className="border-b border-line">
                    <td className="px-4 py-2">{sku(product.slug, color.name, size)}</td>
                    <td>{color.name}</td>
                    <td>{size}</td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        min={0}
                        value={stock[key] ?? 0}
                        onChange={(event) => setStock((current) => ({ ...current, [key]: Number(event.target.value) }))}
                        className="h-10 w-24 border border-line bg-cream px-2"
                      />
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
      {message && <p className="mt-4 text-sm">{message}</p>}
      <button className="mt-4 h-12 bg-ink px-6 text-xs tracking-[0.16em] text-cream">SAVE PRODUCT</button>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none" />
    </label>
  );
}
