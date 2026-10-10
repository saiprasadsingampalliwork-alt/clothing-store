"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { catalogSku, downloadCsv } from "@/lib/admin";
import { categoryLabel, liveProduct, products } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, FilterChip, OutlineButton, Showing, SolidButton, StatusPill } from "@/components/admin-shell";

export default function ProductsPage() {
  const { overrides } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const rows = useMemo(
    () =>
      products
        .map((product) => liveProduct(product, overrides[product.slug]))
        .filter((product) => {
          const haystack = `${product.name} ${catalogSku(product.slug)} ${product.category}`.toLowerCase();
          if (query && !haystack.includes(query.toLowerCase())) return false;
          if (status !== "all" && product.status !== status) return false;
          if (category !== "all" && product.category !== category) return false;
          const units = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
          if (stock === "in" && units === 0) return false;
          if (stock === "out" && units > 0) return false;
          return true;
        }),
    [overrides, query, status, category, stock],
  );

  return (
    <div>
      <AdminHeader
        title="Products"
        actions={
          <>
            <OutlineButton
              onClick={() =>
                downloadCsv("earthen-products.csv", [
                  ["sku", "name", "category", "price", "stock", "status"],
                  ...products.map((product) => {
                    const live = liveProduct(product, overrides[product.slug]);
                    const units = Object.values(live.stock).reduce((sum, qty) => sum + qty, 0);
                    return [catalogSku(product.slug), product.name, categoryLabel(product.category), String(live.price), String(units), live.status];
                  }),
                ])
              }
            >
              IMPORT CSV
            </OutlineButton>
            <SolidButton onClick={() => document.getElementById("product-table")?.scrollIntoView({ behavior: "smooth" })}>ADD PRODUCT</SolidButton>
          </>
        }
      />
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products or SKU"
          className="h-9 w-64 border border-[#e6dfd4] bg-white px-3 text-sm outline-none"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-8 border border-[#e6dfd4] bg-white px-2 text-sm">
          <option value="all">Category</option>
          <option value="tops">Tops</option>
          <option value="bottoms">Bottoms</option>
          <option value="outerwear">Outerwear</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-8 border border-[#e6dfd4] bg-white px-2 text-sm">
          <option value="all">Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select value={stock} onChange={(event) => setStock(event.target.value)} className="h-8 border border-[#e6dfd4] bg-white px-2 text-sm">
          <option value="all">Stock</option>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </select>
        {(status !== "all" || category !== "all" || stock !== "all") && (
          <FilterChip active={false} onClick={() => { setStatus("all"); setCategory("all"); setStock("all"); }}>
            Clear
          </FilterChip>
        )}
      </div>
      <div id="product-table" className="mt-4 overflow-auto border border-[#e6dfd4] bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
            <tr className="border-b border-[#e6dfd4]">
              <th className="px-5 py-3 font-medium">PRODUCT</th>
              <th className="py-3 font-medium">CATEGORY</th>
              <th className="py-3 font-medium">VARIANTS</th>
              <th className="py-3 font-medium">STOCK</th>
              <th className="py-3 font-medium">PRICE</th>
              <th className="px-5 py-3 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((product) => {
              const units = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
              return (
                <tr key={product.slug} className="border-b border-[#efeae2]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/products/${product.slug}`} className="flex items-center gap-3">
                      <span className="h-8 w-8 shrink-0" style={{ background: product.colors[0].hex }} />
                      <span>
                        {product.name}
                        <span className="block text-xs text-[#8a847c]">{catalogSku(product.slug)}</span>
                      </span>
                    </Link>
                  </td>
                  <td>{categoryLabel(product.category)}</td>
                  <td>{product.colors.length * product.sizes.length}</td>
                  <td>{units}</td>
                  <td>{formatINR(product.price)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={product.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Showing shown={rows.length} total={products.length} noun="products" />
      </div>
    </div>
  );
}
