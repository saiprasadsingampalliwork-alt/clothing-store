"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { parsePrice, parseUnits, sku } from "@/lib/admin";
import { AdminHeader, AudienceOptions, FabricOptions, StyleChecks } from "@/components/admin-shell";
import { categoryList, categorySlug, audienceOf, getProduct, parseSizes, liveProduct, productGender, stockKey, type Colorway, type Gender, type ProductOverride, type ProductPhoto, type Size } from "@/lib/catalog";
import { ImageUpload } from "@/components/image-upload";
import { useStore } from "@/lib/store";

export default function ProductEditorPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const product = getProduct(slug);
  const { overrides, saveOverride, deleteProduct, ready } = useStore();
  const saved = overrides[slug];
  const live = product ? liveProduct(product, saved) : undefined;
  const [price, setPrice] = useState(String(saved?.price ?? product?.price ?? ""));
  const [salePrice, setSalePrice] = useState(saved?.salePrice ? String(saved.salePrice) : "");
  const [saleStart, setSaleStart] = useState(saved?.saleStart ?? "");
  const [saleEnd, setSaleEnd] = useState(saved?.saleEnd ?? "");
  const [status, setStatus] = useState<ProductOverride["status"]>(saved?.status ?? "active");
  const [isNew, setIsNew] = useState(Boolean(product?.isNew));
  const [styles, setStyles] = useState<string[]>(product?.styles ?? []);
  const [gender, setGender] = useState<Gender>(product ? productGender(product) : "unisex");
  const [sizeText, setSizeText] = useState((product?.sizes ?? []).join(", "));
  const [category, setCategory] = useState(product?.category ?? "tops");
  const [newCategory, setNewCategory] = useState("");
  const [metaTitle, setMetaTitle] = useState(saved?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(saved?.metaDescription ?? "");
  const [photos, setPhotos] = useState<ProductPhoto[]>(product?.photos ?? []);
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [fabric, setFabric] = useState(product?.fabric ?? "");
  const [fabricDetail, setFabricDetail] = useState(product?.fabricDetail ?? "");
  const [care, setCare] = useState((product?.care ?? []).join("\n"));
  const [colors, setColors] = useState<EditColor[]>(() => withIds(product?.colors ?? []));
  const [stock, setStock] = useState<Record<string, string>>(() => stockById(colors, live?.stock ?? {}, product?.sizes ?? []));
  // The stock this page started from; the server refuses a save if orders have moved it since.
  const [baseStock, setBaseStock] = useState<Record<string, number>>(live?.stock ?? {});
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !product) return;
    const current = liveProduct(product, overrides[slug]);
    setPrice(String(overrides[slug]?.price ?? product.price));
    setSalePrice(overrides[slug]?.salePrice ? String(overrides[slug]?.salePrice) : "");
    setSaleStart(overrides[slug]?.saleStart ?? "");
    setSaleEnd(overrides[slug]?.saleEnd ?? "");
    setStatus(overrides[slug]?.status ?? "active");
    setIsNew(Boolean(product.isNew));
    setStyles(product.styles ?? []);
    setGender(productGender(product));
    setSizeText(product.sizes.join(", "));
    setCategory(product.category);
    setNewCategory("");
    setMetaTitle(overrides[slug]?.metaTitle ?? "");
    setMetaDescription(overrides[slug]?.metaDescription ?? "");
    setPhotos(product.photos ?? []);
    setName(product.name);
    setDescription(product.description);
    setFabric(product.fabric);
    setFabricDetail(product.fabricDetail ?? "");
    setCare(product.care.join("\n"));
    const loaded = withIds(product.colors);
    setColors(loaded);
    setStock(stockById(loaded, current.stock, product.sizes));
    setBaseStock(current.stock);
  }, [ready, slug]);

  if (!ready) return null;
  if (!product || !live) return <p>Product not found.</p>;

  const sizes = parseSizes(sizeText);
  const audienceSizes = audienceOf(gender)?.sizes ?? [];
  const sizesDiffer = sizes.join("|") !== audienceSizes.join("|");

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setMessage("Error: A product needs a name.");
      return;
    }
    const nextPrice = parsePrice(price);
    if (nextPrice === null) {
      setMessage("Error: Enter a price above zero in rupees, for example 1499.");
      return;
    }
    const nextSale = salePrice.trim() ? parsePrice(salePrice) : null;
    if (salePrice.trim() && (nextSale === null || nextSale >= nextPrice)) {
      setMessage("Error: The sale price must be a number below the regular price. Leave it empty for no sale.");
      return;
    }
    if (saleStart && saleEnd && saleEnd < saleStart) {
      setMessage("Error: The sale cannot end before it starts.");
      return;
    }
    const nextCategory = category === NEW_CATEGORY ? newCategory.trim() : category;
    if (!nextCategory) {
      setMessage("Error: Name the new category, or pick an existing one.");
      return;
    }
    const nextColors = colors.map((color) => ({ ...color, name: color.name.replace(/\|/g, "").trim() }));
    if (nextColors.some((color) => !color.name)) {
      setMessage("Error: Every colour needs a name.");
      return;
    }
    const clash = nextColors.find((color, index) => nextColors.findIndex((item) => item.name.toLowerCase() === color.name.toLowerCase()) !== index);
    if (clash) {
      setMessage(`Error: Two colours are both called "${clash.name}". Rename one of them.`);
      return;
    }
    if (!sizes.length || sizes.length > 20) {
      setMessage("Error: Add between 1 and 20 sizes, separated by commas.");
      return;
    }
    const sizesChanged = sizes.join("|") !== product!.sizes.join("|");
    const nextStock: Record<string, number> = {};
    for (const color of nextColors) {
      for (const size of sizes) {
        const units = parseUnits(stock[`${color.id}|${size}`] ?? "0");
        if (units === null) {
          setMessage(`Error: Stock for ${color.name} in ${size} must be a whole number, 0 or more.`);
          return;
        }
        nextStock[stockKey(color.name, size)] = units;
      }
    }
    const stockChanged = !sameStock(nextStock, baseStock);
    try {
      const error = await saveOverride(product!.slug, {
        price: nextPrice,
        salePrice: nextSale,
        saleStart,
        saleEnd,
        status,
        isNew,
        styles,
        metaTitle,
        metaDescription,
        ...(stockChanged ? { stock: nextStock, stockBase: baseStock } : {}),
        ...(sizesChanged ? { sizes } : {}),
        gender,
        category: nextCategory,
        photos,
        name: name.trim(),
        description,
        fabric,
        fabricDetail: fabricDetail.trim(),
        care: care.split("\n").map((line) => line.trim()).filter(Boolean),
        colors: nextColors.map(({ name, hex }) => ({ name, hex })),
      });
      if (error) {
        setMessage(`Error: ${error}`);
        return;
      }
      if (stockChanged) setBaseStock(nextStock);
      if (category === NEW_CATEGORY) {
        setCategory(categorySlug(nextCategory));
        setNewCategory("");
      }
      setMessage("Saved. The storefront uses these details.");
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : "Could not save product."}`);
    }
  }

  async function removeThisProduct() {
    if (!window.confirm(`Are you sure you want to delete "${product?.name}"? This cannot be undone.`)) return;
    const error = await deleteProduct(product!.slug);
    if (error) {
      setMessage(`Error: ${error}`);
      return;
    }
    router.push("/admin/products");
  }

  function removeColor(id: string) {
    setColors((current) => current.filter((color) => color.id !== id));
    setStock((current) => {
      const next = { ...current };
      for (const size of sizes) delete next[`${id}|${size}`];
      return next;
    });
  }

  return (
    <form onSubmit={save}>
      <AdminHeader title={name.trim() || product.name} />
      <p className="mt-3 text-sm text-[#6d6960]">
        <Link href="/admin/products" className="text-[#ab6446]">
          ← All products
        </Link>
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          {photos[0] ? (
            <img src={photos[0].src} alt={photos[0].alt} className="aspect-[4/5] w-full object-cover" />
          ) : (
            <div className="aspect-[4/5]" style={{ background: colors[0]?.hex ?? "#E4D7C4" }} />
          )}
          <div className="mt-3 flex gap-2">
            {colors.map((color) => (
              <span key={`${color.name}-${color.hex}`} className="h-10 w-10 border border-line" style={{ background: color.hex }} title={color.name} />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Field label="Name" value={name} onChange={setName} />
          <label className="block text-sm">
            Description
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1 min-h-24 w-full border border-line bg-paper p-3 outline-none" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              Fabric
              <select value={fabric} onChange={(event) => setFabric(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2">
                <FabricOptions current={fabric} />
              </select>
              <Link href="/admin/fabrics" className="mt-1 block text-xs text-[#ab6446]">Add or rename fabrics</Link>
            </label>
            <label className="block text-sm">
              Weight or detail <span className="text-[#8a847c]">(optional)</span>
              <input value={fabricDetail} onChange={(event) => setFabricDetail(event.target.value)} maxLength={80} placeholder="160 gsm" className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none" />
              <span className="mt-1 block text-xs text-[#8a847c]">Shown as {fabric}{fabricDetail.trim() ? `, ${fabricDetail.trim()}` : ""}.</span>
            </label>
          </div>
          <label className="block text-sm">
            Care notes
            <textarea value={care} onChange={(event) => setCare(event.target.value)} className="mt-1 min-h-24 w-full border border-line bg-paper p-3 outline-none" />
            <span className="mt-1 block text-xs text-[#8a847c]">One note per line.</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price (₹)" value={price} onChange={setPrice} invalid={parsePrice(price) === null} hint="Use a number above zero, like 1499." />
            <label className="block text-sm">
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2">
                {categoryList().map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
                {category !== NEW_CATEGORY && !categoryList().some((item) => item.slug === category) && <option value={category}>{category}</option>}
                <option value={NEW_CATEGORY}>+ New category…</option>
              </select>
            </label>
            {category === NEW_CATEGORY && <Field label="New category name" value={newCategory} onChange={setNewCategory} />}
            <label className="block text-sm">
              Audience
              <select value={gender} onChange={(event) => setGender(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2">
                <AudienceOptions />
              </select>
            </label>
            <label className="block text-sm sm:col-span-2">
              Sizes
              <input value={sizeText} onChange={(event) => setSizeText(event.target.value.replace(/\|/g, ""))} placeholder="XS, S, M, L, XL" className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none" />
              <span className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-[#8a847c]">
                Separate with commas, smallest first. Removing a size drops its stock.
                {sizesDiffer && audienceSizes.length > 0 && (
                  <button type="button" className="text-[#ab6446]" onClick={() => setSizeText(audienceSizes.join(", "))}>
                    Use {audienceOf(gender)?.label} sizes ({audienceSizes.join(", ")})
                  </button>
                )}
              </span>
            </label>
            <label className="block text-sm">
              Status
              <select value={status} onChange={(event) => setStatus(event.target.value as ProductOverride["status"])} className="mt-1 h-11 w-full border border-line bg-paper px-2">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <div className="block text-sm sm:col-span-2">
              Style <span className="text-[#8a847c]">(choose any that fit)</span>
              <StyleChecks value={styles} onChange={setStyles} />
            </div>
            <label className="flex items-start gap-2 self-end pb-2 text-sm">
              <input type="checkbox" checked={isNew} onChange={(event) => setIsNew(event.target.checked)} className="mt-1" />
              <span>
                Show in New in
                <span className="block text-xs text-[#8a847c]">Lists it under New in at the top of the menu. Turn off once it is no longer new.</span>
              </span>
            </label>
            <Field
              label="Sale price (₹)"
              value={salePrice}
              onChange={setSalePrice}
              invalid={salePrice.trim() !== "" && (parsePrice(salePrice) === null || (parsePrice(price) !== null && parsePrice(salePrice)! >= parsePrice(price)!))}
              hint="Must be below the regular price. Leave empty for no sale."
            />
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-sm">
                Sale starts
                <input type="date" value={saleStart} onChange={(event) => setSaleStart(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2" />
              </label>
              <label className="block text-sm">
                Sale ends
                <input type="date" value={saleEnd} min={saleStart || undefined} onChange={(event) => setSaleEnd(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2" />
              </label>
            </div>
          </div>
          <label className="block text-sm">
            Search title
            <input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} placeholder={name.trim() || product.name} className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none" />
            <span className="mt-1 block text-xs text-[#8a847c]">Leave empty to use the product name.</span>
          </label>
          <label className="block text-sm">
            Search description
            <textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} placeholder={description} className="mt-1 min-h-20 w-full border border-line bg-paper p-3 outline-none" />
            <span className="mt-1 block text-xs text-[#8a847c]">Leave empty to use the description.</span>
          </label>
        </div>
      </div>
      <h2 className="mt-10 text-sm">Colours</h2>
      <ul className="mt-3 space-y-2">
        {colors.map((color) => (
          <li key={color.id} className="flex flex-wrap items-center gap-2">
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(color.hex) ? color.hex : "#E4D7C4"} onChange={(event) => setColors((current) => current.map((item) => (item.id === color.id ? { ...item, hex: event.target.value.toUpperCase() } : item)))} className="h-11 w-14 border border-line bg-paper" aria-label={`${color.name || "Colour"} swatch`} />
            <input value={color.name} maxLength={40} onChange={(event) => setColors((current) => current.map((item) => (item.id === color.id ? { ...item, name: event.target.value.replace(/\|/g, "") } : item)))} className="h-11 min-w-40 flex-1 border border-line bg-paper px-3 outline-none" aria-label="Colour name" />
            <button type="button" className="text-sm text-[#ab6446] disabled:opacity-40" disabled={colors.length === 1} onClick={() => removeColor(color.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      {colors.length < 8 && (
        <button type="button" className="mt-3 text-sm text-[#ab6446]" onClick={() => setColors((current) => [...current, { id: newColorId(), name: nextColorName(current), hex: "#E4D7C4" }])}>
          Add a colour
        </button>
      )}
      <h2 className="mt-10 text-sm">Photos</h2>
      <p className="mt-2 max-w-xl text-sm text-[#6d6960]">
        Up to 8. The first photo is the one on the shop card. Use a portrait, 4:5, about 1600 × 2000. JPEG, PNG, or WebP, under 6 MB.
        {photos.length === 0 ? " Until you add one, the shop keeps the current picture or the studio drawing." : " Removing every photo brings that original picture back."}
      </p>
      <ul className="mt-4 space-y-3">
        {photos.map((photo, index) => (
          <li key={photo.id} className="grid items-center gap-3 border border-line bg-paper p-3 sm:grid-cols-[4.5rem_1fr_auto]">
            <img src={photo.src} alt="" className="aspect-[4/5] w-16 object-cover" />
            <div className="grid gap-2">
              <input value={photo.label} onChange={(event) => setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, label: event.target.value } : item)))} className="h-10 border border-line px-3 outline-none" aria-label="Photo label" />
              <input value={photo.alt} onChange={(event) => setPhotos((current) => current.map((item) => (item.id === photo.id ? { ...item, alt: event.target.value } : item)))} className="h-10 border border-line px-3 outline-none" aria-label="Photo description" />
            </div>
            <div className="flex gap-3 text-sm">
              <button type="button" className="text-[#6d6960] disabled:opacity-40" disabled={index === 0} onClick={() => setPhotos((current) => movePhoto(current, index, -1))}>
                Earlier
              </button>
              <button type="button" className="text-[#6d6960] disabled:opacity-40" disabled={index === photos.length - 1} onClick={() => setPhotos((current) => movePhoto(current, index, 1))}>
                Later
              </button>
              <button type="button" className="text-[#ab6446]" onClick={() => setPhotos((current) => current.filter((item) => item.id !== photo.id))}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {photos.length < 8 && (
        <div className="mt-3">
          <ImageUpload
            label="ADD PHOTO"
            onUploaded={(src) => setPhotos((current) => [...current, { id: `photo-${Date.now()}`, label: `Photo ${current.length + 1}`, src, alt: product.name }])}
          />
        </div>
      )}
      <h2 className="mt-10 text-sm">Variants</h2>
      <ul className="mt-3 divide-y divide-line border border-line bg-paper md:hidden">
        {colors.flatMap((color) =>
          sizes.map((size) => {
            const key = `${color.id}|${size}`;
            return (
              <li key={key} className="p-4 text-sm">
                <p>{color.name} · {size}</p>
                <p className="mt-1 text-xs text-[#8a847c]">{sku(product.slug, color.name, size)}</p>
                <label className="mt-3 block text-[#6d6960]">
                  Stock
                  <input
                    inputMode="numeric"
                    value={stock[key] ?? "0"}
                    aria-invalid={parseUnits(stock[key] ?? "0") === null}
                    onChange={(event) => setStock((current) => ({ ...current, [key]: event.target.value }))}
                    className="mt-1 h-11 w-full border border-line bg-cream px-3 text-[#2a2925] outline-none aria-[invalid=true]:border-[#ab6446]"
                  />
                </label>
              </li>
            );
          }),
        )}
      </ul>
      <div className="mt-3 hidden overflow-auto border border-line bg-paper md:block">
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
            {colors.flatMap((color) =>
              sizes.map((size) => {
                const key = `${color.id}|${size}`;
                return (
                  <tr key={key} className="border-b border-line">
                    <td className="px-4 py-2">{sku(product.slug, color.name, size)}</td>
                    <td>{color.name}</td>
                    <td>{size}</td>
                    <td className="px-4 py-2">
                      <input
                        inputMode="numeric"
                        value={stock[key] ?? "0"}
                        aria-invalid={parseUnits(stock[key] ?? "0") === null}
                        onChange={(event) => setStock((current) => ({ ...current, [key]: event.target.value }))}
                        className="h-10 w-24 border border-line bg-cream px-2 aria-[invalid=true]:border-[#ab6446]"
                      />
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
      {message && (
        <p className={`mt-4 text-sm ${message.startsWith("Error:") ? "text-[#ab6446]" : "text-[#2a2925]"}`}>
          {message}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" className="h-12 bg-ink px-6 text-xs tracking-[0.16em] text-cream">SAVE PRODUCT</button>
        <button
          type="button"
          onClick={() => void removeThisProduct()}
          className="h-12 border border-[#ab6446] px-6 text-xs tracking-[0.16em] text-[#ab6446] hover:bg-[#ab6446] hover:text-white transition-colors"
        >
          DELETE PRODUCT
        </button>
      </div>
    </form>
  );
}

const NEW_CATEGORY = "__new__";

// Colours carry a local id while editing so stock follows the colour, not its name.
type EditColor = Colorway & { id: string };

let colorSeq = 0;
function newColorId() {
  colorSeq += 1;
  return `c${colorSeq}`;
}

function withIds(colors: Colorway[]): EditColor[] {
  return colors.map((color) => ({ ...color, id: newColorId() }));
}

function stockById(colors: EditColor[], stock: Record<string, number>, sizes: Size[]) {
  const rows: Record<string, string> = {};
  for (const color of colors) {
    for (const size of sizes) rows[`${color.id}|${size}`] = String(stock[stockKey(color.name, size)] ?? 0);
  }
  return rows;
}


function sameStock(left: Record<string, number>, right: Record<string, number>) {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  return [...keys].every((key) => (left[key] ?? 0) === (right[key] ?? 0));
}

function nextColorName(colors: Colorway[]) {
  const used = new Set(colors.map((color) => color.name.trim().toLowerCase()));
  let name = "New colour";
  let count = 2;
  while (used.has(name.toLowerCase())) {
    name = `New colour ${count}`;
    count += 1;
  }
  return name;
}

function movePhoto(photos: ProductPhoto[], index: number, direction: -1 | 1) {
  const next = [...photos];
  const target = index + direction;
  const [photo] = next.splice(index, 1);
  next.splice(target, 0, photo);
  return next;
}

function Field({ label, value, onChange, invalid = false, hint }: { label: string; value: string; onChange: (value: string) => void; invalid?: boolean; hint?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={invalid} className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none aria-[invalid=true]:border-[#ab6446]" />
      {invalid && hint && <span className="mt-1 block text-xs text-[#ab6446]">{hint}</span>}
    </label>
  );
}
