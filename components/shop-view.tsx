"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { allAudiences, catalogSource, onSale, styleLabel, styleList, categoryLabel, filterProducts, audienceLabel, audienceList, liveProduct, popularSearches, products } from "@/lib/catalog";
import { withStoreSale } from "@/lib/sale";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/use-hydrated";
import { Reveal } from "@/components/reveal";

const PAGE_SIZE = 20;

const sorts = [
  { id: "newest", label: "Newest" },
  { id: "popular", label: "Popularity" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
];

export function ShopView({ path = "/shop" }: { path?: string }) {
  const params = useSearchParams();
  const { overrides, settings } = useStore();
  const hydrated = useHydrated();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isSearch = path === "/search";
  const catalog = hydrated ? catalogSource() : products;

  const category = params.get("category") ?? "all";
  const query = isSearch ? (params.get("q") ?? "") : "";
  const sort = params.get("sort") ?? (isSearch ? "popular" : "newest");
  const sizes = params.getAll("size");
  const colors = params.getAll("color");
  const genders = params.getAll("gender");
  const styles = params.getAll("style");
  const inStock = params.get("stock") === "1";
  const min = params.get("min") ? Number(params.get("min")) : undefined;
  const max = params.get("max") ? Number(params.get("max")) : undefined;

  // Every size on sale, in audience order: adults XS–XL, then kids, then baby.
  const sizeOptions = sizeOrder(catalog.flatMap((product) => product.sizes));
  const colorOptions = [...new Set(catalog.flatMap((product) => product.colors.map((color) => color.name)))];

  const originals = new Map(catalog.map((product) => [product.slug, product]));
  const selling = catalog.map((product) => {
    const listed = liveProduct(product, hydrated ? overrides[product.slug] : undefined);
    return hydrated ? withStoreSale(listed, settings) : listed;
  });
  const list = filterProducts({ category, query, sort, sizes, colors, genders, styles, inStock, min, max, source: selling }).filter(
    (product) => onSale(product.slug, overrides),
  );
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const requested = Number(params.get("page")) || 1;
  const current = Math.min(Math.max(1, requested), pages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = list.slice(start, start + PAGE_SIZE);
  const audience = genders.length === 1 ? audienceLabel(genders[0]) : undefined;
  const categoryTitle = category === "all" ? "All clothing" : categoryLabel(category);
  const styleTitle = styles.length === 1 ? styleLabel(styles[0]) : undefined;
  const title = isSearch ? "Search" : audience && category === "all" ? audience : styleTitle && category === "all" ? styleTitle : categoryTitle;

  function update(next: URLSearchParams, keepPage = false) {
    if (!keepPage) next.delete("page");
    const search = next.toString();
    router.push(search ? `${path}?${search}` : path);
  }

  function setPage(value: number) {
    const next = new URLSearchParams(params.toString());
    if (value <= 1) next.delete("page");
    else next.set("page", String(value));
    update(next, true);
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
    if (!isSearch && category !== "all") next.set("category", category);
    if (query) next.set("q", query);
    update(next);
    setOpen(false);
  }

  const browsing = !isSearch || query.trim().length > 0;

  const chips = [
    ...sizes.map((size) => ({ key: "size", value: size, label: size })),
    ...colors.map((color) => ({ key: "color", value: color, label: color })),
    ...genders.map((gender) => ({ key: "gender", value: gender, label: audienceLabel(gender) })),
    ...styles.map((style) => ({ key: "style", value: style, label: styleLabel(style) })),
    ...(inStock ? [{ key: "stock", value: "1", label: "In stock" }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <p className="text-sm text-muted">
        Home{audience && !isSearch && category !== "all" ? ` / ${audience}` : ""} / {title}
      </p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <h1 className="serif text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {isSearch ? (query ? `${list.length} results for “${query}”` : "Try one of these, or type a word in the search bar.") : `${list.length} pieces`}
            {sharedNote(genders)}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {browsing && (
            <button className="h-11 border border-line px-3 md:hidden" onClick={() => setOpen(true)}>
              Filter
            </button>
          )}
          <label className={`${browsing ? "hidden md:flex" : "hidden"} items-center gap-2`}>
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

      {browsing && (
      <div className="mt-6 hidden border-y border-line md:block">
        <Filters
          layout="bar"
          sizes={sizes}
          colors={colors}
          genders={genders}
          styles={styles}
          colorOptions={colorOptions}
          sizeOptions={sizeOptions}
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
      </div>
      )}

      {!browsing && (
        <div className="mt-6">
          <p className="eyebrow text-muted">Shop by</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {audienceList().map((gender) => (
              <Link key={gender.slug} href={`/shop?gender=${gender.slug}`} className="border border-line px-3 py-2 text-sm">
                {gender.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="border border-line px-3 py-2 text-sm">
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}

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

      {browsing && (
      <div>
        <Reveal key={`${category}-${query}-${sort}-${current}`} className="mt-8 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.slug} product={originals.get(product.slug) ?? product} />
          ))}
          {list.length === 0 && (
            <p className="col-span-full text-muted">
              {isSearch && chips.length === 0 ? `Nothing matches “${query}”.` : "Nothing matches those filters. Try clearing one."}
            </p>
          )}
        </Reveal>
        {pages > 1 && (
          <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Pages">
            <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="h-11 border border-line px-4 text-sm disabled:opacity-40">
              Previous
            </button>
            {Array.from({ length: pages }, (_, index) => {
              const number = index + 1;
              const selected = number === current;
              return (
                <button
                  key={number}
                  type="button"
                  aria-current={selected ? "page" : undefined}
                  onClick={() => setPage(number)}
                  className={`h-11 w-11 border text-sm ${selected ? "border-ink bg-ink text-cream" : "border-line"}`}
                >
                  {number}
                </button>
              );
            })}
            <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className="h-11 border border-line px-4 text-sm disabled:opacity-40">
              Next
            </button>
          </nav>
        )}
        {list.length > 0 && (
          <p className="mt-4 text-center text-sm text-muted">
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, list.length)} of {list.length}
          </p>
        )}
      </div>
      )}

      {open && browsing && (
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
              genders={genders}
              styles={styles}
              colorOptions={colorOptions}
              sizeOptions={sizeOptions}
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
  layout = "stack",
  sizes,
  colors,
  genders,
  styles,
  colorOptions,
  sizeOptions,
  inStock,
  sort,
  onToggle,
  onStock,
  onSort,
  onClear,
}: {
  layout?: "bar" | "stack";
  sizes: string[];
  colors: string[];
  genders: string[];
  styles: string[];
  colorOptions: string[];
  sizeOptions: string[];
  inStock: boolean;
  sort: string;
  onToggle: (key: string, value: string) => void;
  onStock: () => void;
  onSort: (value: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState<"size" | "color" | "gender" | "style" | "stock" | null>(null);

  if (layout === "bar") {
    return (
      <div
        className="relative z-20 text-sm"
        onMouseLeave={() => setOpen(null)}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (!(next instanceof Node) || !event.currentTarget.contains(next)) setOpen(null);
        }}
      >
        <div className="flex items-center gap-8">
          <FilterHover
            id="size"
            label={sizes.length > 0 ? `Size ${sizes.length}` : "Size"}
            open={open === "size"}
            onOpen={() => setOpen("size")}
            onToggle={() => setOpen((current) => (current === "size" ? null : "size"))}
          >
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onToggle("size", size)}
                  className={`h-10 min-w-10 border px-2 ${sizes.includes(size) ? "border-ink bg-ink text-cream" : "border-line bg-paper"}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </FilterHover>
          <FilterHover
            id="color"
            label={colors.length > 0 ? `Colour ${colors.length}` : "Colour"}
            open={open === "color"}
            onOpen={() => setOpen("color")}
            onToggle={() => setOpen((current) => (current === "color" ? null : "color"))}
          >
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onToggle("color", color)}
                  className={`border px-3 py-1.5 ${colors.includes(color) ? "border-ink bg-ink text-cream" : "border-line bg-paper"}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </FilterHover>
          <FilterHover
            id="gender"
            label={genders.length > 0 ? `Shop for ${genders.length}` : "Shop for"}
            open={open === "gender"}
            onOpen={() => setOpen("gender")}
            onToggle={() => setOpen((current) => (current === "gender" ? null : "gender"))}
          >
            <div className="flex flex-wrap gap-2">
              {audienceList().map((gender) => (
                <button
                  key={gender.slug}
                  type="button"
                  onClick={() => onToggle("gender", gender.slug)}
                  className={`border px-3 py-1.5 ${genders.includes(gender.slug) ? "border-ink bg-ink text-cream" : "border-line bg-paper"}`}
                >
                  {gender.label}
                </button>
              ))}
            </div>
          </FilterHover>
          {styleList().length > 0 && (
            <FilterHover
              id="style"
              label={styles.length > 0 ? `Style ${styles.length}` : "Style"}
              open={open === "style"}
              onOpen={() => setOpen("style")}
              onToggle={() => setOpen((current) => (current === "style" ? null : "style"))}
            >
              <div className="flex flex-wrap gap-2">
                {styleList().map((style) => (
                  <button
                    key={style.slug}
                    type="button"
                    onClick={() => onToggle("style", style.slug)}
                    className={`border px-3 py-1.5 ${styles.includes(style.slug) ? "border-ink bg-ink text-cream" : "border-line bg-paper"}`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </FilterHover>
          )}
          <FilterHover
            id="stock"
            label={inStock ? "In stock · On" : "In stock"}
            open={open === "stock"}
            onOpen={() => setOpen("stock")}
            onToggle={() => setOpen((current) => (current === "stock" ? null : "stock"))}
          >
            <label className="flex w-fit items-center gap-3">
              In stock only
              <input type="checkbox" checked={inStock} onChange={onStock} className="h-4 w-4" />
            </label>
          </FilterHover>
          <button type="button" onMouseEnter={() => setOpen(null)} onClick={onClear} className="ml-auto text-muted underline">
            Clear all
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-sm">
      <div>
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
          {sizeOptions.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onToggle("size", size)}
              className={`h-10 min-w-10 border px-2 ${sizes.includes(size) ? "border-ink bg-ink text-cream" : "border-line"}`}
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
              type="button"
              onClick={() => onToggle("color", color)}
              className={`border px-3 py-1.5 ${colors.includes(color) ? "border-ink bg-ink text-cream" : "border-line"}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow text-muted">Shop for</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {audienceList().map((gender) => (
            <button
              key={gender.slug}
              type="button"
              onClick={() => onToggle("gender", gender.slug)}
              className={`border px-3 py-1.5 ${genders.includes(gender.slug) ? "border-ink bg-ink text-cream" : "border-line"}`}
            >
              {gender.label}
            </button>
          ))}
        </div>
      </div>
      {styleList().length > 0 && (
        <div>
          <p className="eyebrow text-muted">Style</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {styleList().map((style) => (
              <button
                key={style.slug}
                type="button"
                onClick={() => onToggle("style", style.slug)}
                className={`border px-3 py-1.5 ${styles.includes(style.slug) ? "border-ink bg-ink text-cream" : "border-line"}`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <label className="flex items-center justify-between gap-3">
        In stock only
        <input type="checkbox" checked={inStock} onChange={onStock} className="h-4 w-4" />
      </label>
      <button type="button" onClick={onClear} className="text-muted underline">
        Clear all
      </button>
    </div>
  );
}

function FilterHover({
  id,
  label,
  open,
  onOpen,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onOpen: () => void;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div onMouseEnter={onOpen} onFocus={onOpen}>
      <button
        type="button"
        className={`eyebrow h-12 ${open ? "text-ink" : "text-muted"}`}
        aria-expanded={open}
        aria-controls={`filter-${id}`}
        onClick={() => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
          onToggle();
        }}
      >
        {label}
      </button>
      {open && (
        <div id={`filter-${id}`} className="absolute left-0 right-0 top-full z-30 border border-line bg-cream px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

export type ShopCategory = string;

// "Including Unisex pieces." when the chosen audiences pull in their group's shared cuts.
function sharedNote(genders: string[]) {
  if (!genders.length) return "";
  const audiences = allAudiences();
  const chosen = audiences.filter((audience) => genders.includes(audience.slug));
  if (!chosen.length) return "";
  if (chosen.every((audience) => audience.shared)) return " Only the shared cuts.";
  const groups = new Set(chosen.filter((audience) => !audience.shared).map((audience) => audience.group));
  const shared = audiences.filter((audience) => audience.shared && audience.active && groups.has(audience.group) && !genders.includes(audience.slug));
  return shared.length ? ` Including ${shared.map((audience) => audience.label).join(" and ")} pieces.` : "";
}

function sizeOrder(sizes: string[]) {
  const known = allAudiences().flatMap((audience) => audience.sizes);
  const rank = (size: string) => {
    const index = known.indexOf(size);
    return index < 0 ? known.length : index;
  };
  return [...new Set(sizes)].sort((left, right) => rank(left) - rank(right) || left.localeCompare(right));
}
