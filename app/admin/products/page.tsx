"use client";

import Link from "next/link";
import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { catalogSku, parsePrice, parseUnits } from "@/lib/admin";
import { catalogSource, categoryLabel, categoryList, allAudiences, allStyles, audienceLabel, liveProduct, PLACEHOLDER_IMAGE, productGender, type Product } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, AudienceOptions, FabricOptions, FilterChip, FilterSelect, StyleChecks, OutlineButton, Showing, SolidButton, StatusPill } from "@/components/admin-shell";

export default function ProductsPage() {
  const { overrides, createProduct, importProducts } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const palette = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string }>();
    for (const product of catalogSource()) {
      for (const color of product.colors) {
        if (/^#[0-9a-fA-F]{6}$/.test(color.hex) && !seen.has(color.name.toLowerCase())) seen.set(color.name.toLowerCase(), { name: color.name, hex: color.hex.toUpperCase() });
      }
    }
    return [...seen.values()].slice(0, 16);
  }, [overrides]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [gender, setGender] = useState("all");
  const [style, setStyle] = useState("all");
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
          if (style !== "all" && !(product.styles ?? []).includes(style)) return false;
          const units = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
          if (stock === "in" && units === 0) return false;
          if (stock === "out" && units > 0) return false;
          return true;
        }),
    [overrides, query, status, category, gender, style, stock],
  );

  async function addProduct(event: FormEvent) {
    event.preventDefault();
    const price = parsePrice(draft.price);
    if (price === null) {
      setNotice("Enter a price above zero in rupees, for example 1499.");
      return;
    }
    const category = draft.category === NEW_CATEGORY ? draft.categoryName.trim() : draft.category;
    if (!category) {
      setNotice("Name the new category, or pick an existing one.");
      return;
    }
    const stockEach = parseUnits(draft.stockEach);
    if (stockEach === null) {
      setNotice("Enter how many units you have of each size, as a whole number. Use 0 if none yet.");
      return;
    }
    const color = draft.color.replace(/\|/g, "").trim();
    if (!color) {
      setNotice("Give the colour a name, for example Olive.");
      return;
    }
    const error = await createProduct({
      name: draft.name,
      price,
      category,
      gender: draft.gender,
      fabric: draft.fabric,
      fabricDetail: draft.fabricDetail.trim(),
      color,
      hex: draft.hex,
      status: draft.status,
      stockEach,
      isNew: draft.isNew,
      styles: draft.styles,
    });
    setNotice(error ?? (draft.status === "draft" ? `${draft.name} is saved as a draft. Add photos, then set it to Active.` : `${draft.name} is live in the shop.`));
    if (!error) {
      setAdding(false);
      setDraft(EMPTY_DRAFT);
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
          <label className="text-sm">
            Price (₹)
            <input
              value={draft.price}
              onChange={(event) => setDraft({ ...draft, price: event.target.value })}
              inputMode="decimal"
              required
              placeholder="1499"
              aria-invalid={draft.price !== "" && parsePrice(draft.price) === null}
              className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none aria-[invalid=true]:border-[#b4532a]"
            />
            {draft.price !== "" && parsePrice(draft.price) === null && <span className="mt-1 block text-xs text-[#b4532a]">Use a number above zero, like 1499.</span>}
          </label>
          <label className="text-sm">
            Category
            <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2">
              {categoryList().map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.label}
                </option>
              ))}
              <option value={NEW_CATEGORY}>+ New category…</option>
            </select>
          </label>
          {draft.category === NEW_CATEGORY && (
            <Field label="New category name" value={draft.categoryName} onChange={(categoryName) => setDraft({ ...draft, categoryName })} />
          )}
          <label className="text-sm">
            Units per size
            <input
              value={draft.stockEach}
              onChange={(event) => setDraft({ ...draft, stockEach: event.target.value })}
              inputMode="numeric"
              required
              placeholder="0"
              aria-invalid={draft.stockEach !== "" && parseUnits(draft.stockEach) === null}
              className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none aria-[invalid=true]:border-[#b4532a]"
            />
            <span className="mt-1 block text-xs text-[#8a847c]">Applied to every size of the audience. Fine-tune per size after saving.</span>
          </label>
          <label className="text-sm">
            Status
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as Draft["status"] })} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2">
              <option value="draft">Draft (hidden from the shop)</option>
              <option value="active">Active (live in the shop)</option>
            </select>
          </label>
          <div className="text-sm sm:col-span-2">
            Style <span className="text-[#8a847c]">(choose any that fit)</span>
            <StyleChecks value={draft.styles} onChange={(styles) => setDraft({ ...draft, styles })} />
          </div>
          <label className="flex items-start gap-2 self-end pb-2 text-sm">
            <input type="checkbox" checked={draft.isNew} onChange={(event) => setDraft({ ...draft, isNew: event.target.checked })} className="mt-1" />
            <span>
              Show in New in
              <span className="block text-xs text-[#8a847c]">Lists it under New in at the top of the menu. Turn off once it is no longer new.</span>
            </span>
          </label>
          <label className="text-sm">
            Audience
            <select value={draft.gender} onChange={(event) => setDraft({ ...draft, gender: event.target.value })} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2">
              <AudienceOptions />
            </select>
            <span className="mt-1 block text-xs text-[#8a847c]">Sizes: {(allAudiences().find((audience) => audience.slug === draft.gender)?.sizes ?? []).join(", ")}</span>
          </label>
          <label className="text-sm">
            Fabric
            <select value={draft.fabric} onChange={(event) => setDraft({ ...draft, fabric: event.target.value })} required className="mt-1 h-10 w-full border border-[#e6dfd4] px-2">
              <FabricOptions current={draft.fabric} />
            </select>
            <Link href="/admin/fabrics" className="mt-1 block text-xs text-[#ab6446]">Add or rename fabrics</Link>
          </label>
          <label className="text-sm">
            Weight or detail <span className="text-[#8a847c]">(optional)</span>
            <input value={draft.fabricDetail} onChange={(event) => setDraft({ ...draft, fabricDetail: event.target.value })} maxLength={80} placeholder="160 gsm" className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none" />
            <span className="mt-1 block text-xs text-[#8a847c]">Shown as {draft.fabric || "Fabric"}{draft.fabricDetail.trim() ? `, ${draft.fabricDetail.trim()}` : ""}.</span>
          </label>
          <div className="text-sm sm:col-span-2">
            Colour
            <div className="mt-1 flex items-center gap-3">
              <input
                type="color"
                value={draft.hex}
                onChange={(event) => setDraft({ ...draft, hex: event.target.value.toUpperCase() })}
                className="h-10 w-14 shrink-0 cursor-pointer border border-[#e6dfd4] bg-white"
                aria-label="Pick the colour"
              />
              <input
                value={draft.color}
                onChange={(event) => setDraft({ ...draft, color: event.target.value.replace(/\|/g, "") })}
                required
                maxLength={40}
                placeholder="Colour name, e.g. Olive"
                aria-label="Colour name"
                className="h-10 w-full border border-[#e6dfd4] px-2 outline-none"
              />
              <span className="shrink-0 text-xs tabular-nums text-[#8a847c]">{draft.hex}</span>
            </div>
            {palette.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5" role="list" aria-label="Colours already in the catalog">
                {palette.map((swatch) => (
                  <button
                    key={swatch.name}
                    type="button"
                    role="listitem"
                    title={`${swatch.name} ${swatch.hex}`}
                    aria-label={`Use ${swatch.name}`}
                    onClick={() => setDraft({ ...draft, color: swatch.name, hex: swatch.hex })}
                    className={`h-6 w-6 border ${draft.hex === swatch.hex && draft.color === swatch.name ? "border-[#2a2925] ring-1 ring-[#2a2925]" : "border-[#e6dfd4]"}`}
                    style={{ background: swatch.hex }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="flex items-end">
            <SolidButton type="submit">SAVE PRODUCT</SolidButton>
          </div>
          <p className="text-xs text-[#8a847c] sm:col-span-2">CSV columns: name, category, gender, price, fabric (like "Washed linen, 160 gsm"; new fabrics are added to the list), styles (like "Ethnic; Formal"; new styles are added), status, stock (units per size for new products, 0 if left out). A category name that does not exist yet is created. Audience is the name of one under Audiences, such as Women or Girls; new products take its sizes. A matching name updates that product.</p>
        </form>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search products or SKU"
          className="h-9 w-64 border border-[#e6dfd4] bg-white px-3 text-sm outline-none"
        />
        <FilterSelect label="Category" value={category} onChange={setCategory}>
          {categoryList().map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
            </option>
          ))}
        </FilterSelect>
        <FilterSelect label="Status" value={status} onChange={setStatus}>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </FilterSelect>
        <FilterSelect label="Stock" value={stock} onChange={setStock}>
          <option value="in">In stock</option>
          <option value="out">Out of stock</option>
        </FilterSelect>
        <FilterSelect label="Audience" value={gender} onChange={setGender}>
          <AudienceOptions compact />
        </FilterSelect>
        <FilterSelect label="Style" value={style} onChange={setStyle}>
          {allStyles().map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.label}
              {item.active ? "" : " · off"}
            </option>
          ))}
        </FilterSelect>
        {(status !== "all" || category !== "all" || gender !== "all" || style !== "all" || stock !== "all") && (
          <FilterChip active={false} onClick={() => { setStatus("all"); setCategory("all"); setGender("all"); setStyle("all"); setStock("all"); }}>
            Clear
          </FilterChip>
        )}
      </div>
      <div id="product-table" className="mt-4 border border-[#e6dfd4] bg-white">
        <ul className="divide-y divide-[#efeae2] md:hidden">
          {rows.map((product) => {
            const units = Object.values(product.stock).reduce((sum, qty) => sum + qty, 0);
            const gender = audienceLabel(productGender(product));
            return (
              <li key={product.slug}>
                <Link href={`/admin/products/${product.slug}`} className="block px-4 py-4 text-sm text-[#2a2925]">
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <Thumb product={product} />
                      <span className="min-w-0">
                        <span className="block">{product.name}</span>
                        <span className="block text-xs text-[#8a847c]">{catalogSku(product.slug)}</span>
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      {product.isNew && <span className="text-[10px] tracking-[0.12em] text-[#8a847c]">NEW IN</span>}
                      <StatusPill status={product.status} />
                    </span>
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
              <th className="py-3 font-medium">AUDIENCE</th>
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
                      <Thumb product={product} />
                      <span>
                        {product.name}
                        <span className="block text-xs text-[#8a847c]">{catalogSku(product.slug)}</span>
                      </span>
                    </Link>
                  </td>
                  <td>{categoryLabel(product.category)}</td>
                  <td>{audienceLabel(productGender(product))}</td>
                  <td>{product.colors.length * product.sizes.length}</td>
                  <td>{units}</td>
                  <td>{formatINR(product.price)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2">
                      {product.isNew && <span className="text-[10px] tracking-[0.12em] text-[#8a847c]">NEW IN</span>}
                      <StatusPill status={product.status} />
                    </span>
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

// The first photo, as on the shop card; products without one show their first colour.
function Thumb({ product }: { product: Product }) {
  const photo = product.photos?.find((item) => item.src && item.src !== PLACEHOLDER_IMAGE);
  if (photo) return <img src={photo.src} alt="" loading="lazy" className="h-10 w-8 shrink-0 bg-[#f1ece4] object-cover" />;
  return <span className="h-10 w-8 shrink-0" style={{ background: product.colors[0]?.hex ?? "#E4D7C4" }} title="No photo yet" />;
}

const NEW_CATEGORY = "__new__";

type Draft = { name: string; category: string; categoryName: string; gender: string; price: string; fabric: string; fabricDetail: string; color: string; hex: string; status: "active" | "draft"; stockEach: string; isNew: boolean; styles: string[] };

const EMPTY_DRAFT: Draft = { name: "", category: "tops", categoryName: "", gender: "unisex", price: "1999", fabric: "Cotton", fabricDetail: "", color: "Sand", hex: "#E4D7C4", status: "draft", stockEach: "", isNew: true, styles: ["casual"] };

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
