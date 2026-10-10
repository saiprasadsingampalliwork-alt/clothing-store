"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { filterProducts, liveProduct, products, SIZES, type Category } from "@/lib/catalog";
import { useStore } from "@/lib/store";

const sorts = [
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Popularity" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
];

export function ShopView() {
  const params = useSearchParams();
  const { overrides } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const category = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "newest";
  const sizes = params.getAll("size");
  const colors = params.getAll("color");
  const inStock = params.get("stock") === "1";
  const min = params.get("min") ? Number(params.get("min")) : undefined;
  const max = params.get("max") ? Number(params.get("max")) : undefined;

  const colorOptions = useMemo(() => {
    const names = new Set<string>();
    products.forEach((product) => product.colors.forEach((color) => names.add(color.name)));
    return [...names];
  }, []);

  const list = filterProducts({ category, sort, sizes, colors, inStock, min, max })
    .map((product) => liveProduct(product, overrides[product.slug]))
    .filter((product) => product.status === "active");
  const title = category === "all" ? "All clothing" : category === "new" ? "New in" : category[0].toUpperCase() + category.slice(1);

  function update(next: URLSearchParams) {
    const query = next.toString();
    router.push(query ? `/shop?${query}` : "/shop");
  }

  function toggle(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    next.delete(key);
    const values = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    values.forEach((item) => next.append(key, item));
    update(next);
  }

  function clear() {
    const next = new URLSearchParams();
    if (category !== "all") next.set("category", category);
    update(next);
    setOpen(false);
  }

  const chips = [
    ...sizes.map((size) => ({ key: "size", value: size, label: size })),
    ...colors.map((color) => ({ key: "color", value: color, label: color })),
    ...(inStock ? [{ key: "stock", value: "1", label: "In stock" }] : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
      <p className="text-sm text-muted">Home / {title}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="serif text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">{list.length} pieces</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button className="h-11 border border-line px-3 md:hidden" onClick={() => setOpen(true)}>
            Filter
          </button>
          <label className="hidden items-center gap-2 md:flex">
            Sort
            <select
              value={sort}
              onChange={(event) => {
                const next = new URLSearchParams(params.toString());
                next.set("sort", event.target.value);
                update(next);
              }}
              className="h-11 border border-line bg-cream px-2"
            >
              {sorts.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={`${chip.key}-${chip.value}`}
              onClick={() => (chip.key === "stock" ? toggleFlag() : toggle(chip.key, chip.value))}
              className="border border-line bg-paper px-3 py-1.5 text-sm"
            >
              {chip.label} ×
            </button>
          ))}
          <button onClick={clear} className="px-2 text-sm text-muted underline">
            Clear
          </button>
        </div>
      )}

      <div className="mt-6 md:grid md:grid-cols-[220px_1fr] md:gap-10">
        <aside className="hidden md:block">
          <Filters
            sizes={sizes}
            colors={colors}
            colorOptions={colorOptions}
            inStock={inStock}
            sort={sort}
            onToggle={toggle}
            onStock={() => toggleFlag()}
            onSort={(value) => {
              const next = new URLSearchParams(params.toString());
              next.set("sort", value);
              update(next);
            }}
            onClear={clear}
          />
        </aside>
        <div className="reveal mt-10 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
          {list.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
          {list.length === 0 && <p className="text-muted sm:col-span-2">Nothing matches those filters. Try clearing one.</p>}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-ink/40 md:hidden">
          <div className="max-h-[85vh] w-full overflow-auto bg-cream p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="serif text-2xl">Filters</h2>
              <button onClick={() => setOpen(false)} aria-label="Close filters">
                Close
              </button>
            </div>
            <Filters
              sizes={sizes}
              colors={colors}
              colorOptions={colorOptions}
              inStock={inStock}
              sort={sort}
              onToggle={toggle}
              onStock={() => toggleFlag()}
              onSort={(value) => {
                const next = new URLSearchParams(params.toString());
                next.set("sort", value);
                update(next);
              }}
              onClear={clear}
            />
            <button className="mt-6 h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream" onClick={() => setOpen(false)}>
              SHOW RESULTS
            </button>
          </div>
        </div>
      )}
    </div>
  );

  function toggleFlag() {
    const next = new URLSearchParams(params.toString());
    if (next.get("stock") === "1") next.delete("stock");
    else next.set("stock", "1");
    update(next);
  }
}

function Filters({
  sizes,
  colors,
  colorOptions,
  inStock,
  sort,
  onToggle,
  onStock,
  onSort,
  onClear,
}: {
  sizes: string[];
  colors: string[];
  colorOptions: string[];
  inStock: boolean;
  sort: string;
  onToggle: (key: string, value: string) => void;
  onStock: () => void;
  onSort: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-6 text-sm">
      <div className="md:hidden">
        <p className="eyebrow text-muted">Sort</p>
        <select value={sort} onChange={(event) => onSort(event.target.value)} className="mt-2 h-11 w-full border border-line bg-paper px-2">
          {sorts.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p className="eyebrow text-muted">Size</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => onToggle("size", size)}
              className={`h-10 w-10 border ${sizes.includes(size) ? "border-ink bg-ink text-cream" : "border-line"}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow text-muted">Colour</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <button
              key={color}
              onClick={() => onToggle("color", color)}
              className={`border px-3 py-1.5 ${colors.includes(color) ? "border-ink bg-ink text-cream" : "border-line"}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <label className="flex items-center justify-between gap-3">
        In stock only
        <input type="checkbox" checked={inStock} onChange={onStock} className="h-4 w-4" />
      </label>
      <button onClick={onClear} className="text-muted underline">
        Clear all
      </button>
    </div>
  );
}

export type ShopCategory = Category | "new" | "all";
