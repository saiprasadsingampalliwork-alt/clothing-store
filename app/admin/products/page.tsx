"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { catalogSku } from "@/lib/admin";
import { catalogSource, categoryLabel, categoryList, GENDERS, liveProduct, productGender } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, FilterChip, OutlineButton, Showing, SolidButton, StatusPill } from "@/components/admin-shell";

export default function ProductsPage() {
  const { overrides, createProduct, importProducts } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", category: "tops", categoryName: "", gender: "unisex", price: "1999", fabric: "Cotton", color: "Sand", hex: "#E4D7C4", silhouette: "tee" });
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");
  const [stock, setStock] = useState("all");
  const rows = useMemo(
    () =>
      catalogSource()
        .map((product) => liveProduct(product, overrides[product.slug]))
        .filter((product) => {
          const audience = productGender(product);
          const haystack = `${product.name} ${catalogSku(product.slug)} ${product.category} ${audience}`.toLowerCase();
          if (query && !haystack.includes(query.toLowerCase())) return false;
          if (status !== "all" && product.status !== status) return false;
          if (category !== "all" && product.category !== category) return false;
          if (gender !== "all" && audience !== gender) return false;
          const units = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
          if (stock === "in" && units === 0) return false;
          if (stock === "out" && units > 0) return false;
          return true;
        }),
    [overrides, query, status, category, gender, stock],
  );

  async function addProduct(event: FormEvent) {
    event.preventDefault();
    const error = await createProduct({ ...draft, category: draft.categoryName.trim() || draft.category, price: Number(draft.price) });
    setNotice(error ?? `${draft.name} is in the catalog.`);
    if (!error) {
      setAdding(false);
      setDraft({ name: "", category: "tops", categoryName: "", gender: "unisex", price: "1999", fabric: "Cotton", color: "Sand", hex: "#E4D7C4", silhouette: "tee" });
    }
  }

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      setNotice("The file needs a header row and one product.");
      return;
    }
    const headers = splitCsv(lines[0]).map((cell) => cell.trim().toLowerCase());
    const rows = lines.slice(1).map((line) => {
      const cells = splitCsv(line);
      return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    });
    const message = await importProducts(rows);
    setNotice(message);
  }

  return (
    <div>
      <AdminHeader
        title="Products"
        actions={
          <>
            <OutlineButton onClick={() => fileRef.current?.click()}>IMPORT CSV</OutlineButton>
            <SolidButton onClick={() => setAdding((open) => !open)}>ADD PRODUCT</SolidButton>
          </>
        }
      />
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => void onFile(event)} />
      {notice && <p className="mt-4 text-sm text-[#6d6960]">{notice}</p>}
      {adding && (
        <form onSubmit={(event) => void addProduct(event)} className="mt-4 grid gap-3 border border-[#e6dfd4] bg-white p-4 sm:grid-cols-2">
          <Field label="Name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
          <Field label="Price" value={draft.price} onChange={(price) => setDraft({ ...draft, price })} />
          <label className="text-sm">
            Category
            <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2">
              {categoryList().map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Field label="Or a new category" value={draft.categoryName} onChange={(categoryName) => setDraft({ ...draft, categoryName })} />
          <label className="text-sm">
            Gender
            <select value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value })} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2">
              {GENDERS.map((gender) => (
                <option key={gender.id} value={gender.id}>
                  {gender.label}
                </option>
              ))}
            </select>
          </label>
          <Field label="Fabric" value={draft.fabric} onChange={(fabric) => setDraft({ ...draft, fabric })} />
          <Field label="Colour" value={draft.color} onChange={(color) => setDraft({ ...draft, color })} />
          <Field label="Hex" value={draft.hex} onChange={(hex) => setDraft({ ...draft, hex })} />
          <label className="text-sm">
            Shape
            <select value={draft.silhouette} onChange={(event) => setDraft({ ...draft, silhouette: event.target.value })} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2">
              {["tee", "shirt", "overshirt", "trouser", "skirt", "cardigan", "jacket"].map((shape) => (
                <option key={shape} value={shape}>{shape}</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <SolidButton type="submit">SAVE PRODUCT</SolidButton>
          </div>
          <p className="text-xs text-[#8a847c] sm:col-span-2">CSV columns: name, category, gender, price, fabric, status. A category name that does not exist yet is created. Gender is women, men, or unisex. A matching name updates that product.</p>
        </form>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products or SKU"
          className="h-9 w-64 border border-[#e6dfd4] bg-white px-3 text-sm outline-none"
        />
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-8 border border-[#e6dfd4] bg-white px-2 text-sm">
          <option value="all">Category</option>
          {categoryList().map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
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
        <select value={gender} onChange={(event) => setGender(event.target.value)} className="h-8 border border-[#e6dfd4] bg-white px-2 text-sm">
          <option value="all">Gender</option>
          {GENDERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        {(status !== "all" || category !== "all" || gender !== "all" || stock !== "all") && (
          <FilterChip active={false} onClick={() => { setStatus("all"); setCategory("all"); setGender("all"); setStock("all"); }}>
            Clear
          </FilterChip>
        )}
      </div>
      <div id="product-table" className="mt-4 border border-[#e6dfd4] bg-white">
        <ul className="divide-y divide-[#efeae2] md:hidden">
          {rows.map((product) => {
            const units = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
            const gender = GENDERS.find((item) => item.id === productGender(product))?.label;
            return (
              <li key={product.slug}>
                <Link href={`/admin/products/${product.slug}`} className="block px-4 py-4 text-sm text-[#2a2925]">
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="h-8 w-8 shrink-0" style={{ background: product.colors[0].hex }} />
                      <span className="min-w-0">
                        <span className="block">{product.name}</span>
                        <span className="block text-xs text-[#8a847c]">{catalogSku(product.slug)}</span>
                      </span>
                    </span>
                    <StatusPill status={product.status} />
                  </span>
                  <span className="mt-2 block text-[#6d6960]">
                    {categoryLabel(product.category)} · {gender}
                  </span>
                  <span className="mt-1 block text-[#6d6960]">
                    {formatINR(product.price)} · {units} in stock
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
            <tr className="border-b border-[#e6dfd4]">
              <th className="px-5 py-3 font-medium">PRODUCT</th>
              <th className="py-3 font-medium">CATEGORY</th>
              <th className="py-3 font-medium">GENDER</th>
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
                  <td>{GENDERS.find((item) => item.id === productGender(product))?.label}</td>
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
        </div>
        <Showing shown={rows.length} total={catalogSource().length} noun="products" />
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} required className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none" />
    </label>
  );
}

function splitCsv(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      cells.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}
