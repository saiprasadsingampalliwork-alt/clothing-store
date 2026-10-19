"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { sku } from "@/lib/admin";
import { AdminHeader } from "@/components/admin-shell";
import { categoryList, GENDERS, getProduct, liveProduct, productGender, stockKey, type Colorway, type Gender, type ProductOverride, type ProductPhoto, type Size } from "@/lib/catalog";
import { ImageUpload } from "@/components/image-upload";
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
  const [gender, setGender] = useState<Gender>(product ? productGender(product) : "unisex");
  const [category, setCategory] = useState(product?.category ?? "tops");
  const [newCategory, setNewCategory] = useState("");
  const [metaTitle, setMetaTitle] = useState(saved?.metaTitle ?? product?.name ?? "");
  const [metaDescription, setMetaDescription] = useState(saved?.metaDescription ?? product?.description ?? "");
  const [stock, setStock] = useState<Record<string, number>>(live?.stock ?? {});
  const [photos, setPhotos] = useState<ProductPhoto[]>(product?.photos ?? []);
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [fabric, setFabric] = useState(product?.fabric ?? "");
  const [care, setCare] = useState((product?.care ?? []).join("\n"));
  const [colors, setColors] = useState<Colorway[]>(product?.colors ?? []);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !product) return;
    const current = liveProduct(product, overrides[slug]);
    setPrice(overrides[slug]?.price ?? product.price);
    setSalePrice(overrides[slug]?.salePrice ? String(overrides[slug]?.salePrice) : "");
    setSaleStart(overrides[slug]?.saleStart ?? "");
    setSaleEnd(overrides[slug]?.saleEnd ?? "");
    setStatus(overrides[slug]?.status ?? "active");
    setGender(productGender(product));
    setCategory(product.category);
    setNewCategory("");
    setMetaTitle(overrides[slug]?.metaTitle ?? product.name);
    setMetaDescription(overrides[slug]?.metaDescription ?? product.description);
    setStock(current.stock);
    setPhotos(product.photos ?? []);
    setName(product.name);
    setDescription(product.description);
    setFabric(product.fabric);
    setCare(product.care.join("\n"));
    setColors(product.colors);
  }, [ready, slug]);

  if (!ready) return null;
  if (!product || !live) return <p>Product not found.</p>;

  async function save(event: FormEvent) {
    event.preventDefault();
    const nextColors = colors
      .map((color) => ({ name: color.name.trim(), hex: color.hex }))
      .filter((color, index, list) => color.name && list.findIndex((item) => item.name.toLowerCase() === color.name.toLowerCase()) === index);
    if (!name.trim()) {
      setMessage("A product needs a name.");
      return;
    }
    if (!nextColors.length) {
      setMessage("Keep at least one colour.");
      return;
    }
    await saveOverride(product!.slug, {
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : null,
      saleStart,
      saleEnd,
      status,
      metaTitle,
      metaDescription,
      stock,
      gender,
      category: newCategory.trim() || category,
      photos,
      name: name.trim(),
      description,
      fabric,
      care: care.split("\n").map((line) => line.trim()).filter(Boolean),
      colors: nextColors,
    });
    setMessage("Saved. The storefront uses these details.");
  }

  function removeColor(index: number) {
    const removed = colors[index]?.name ?? "";
    setColors((current) => current.filter((_, colorIndex) => colorIndex !== index));
    setStock((current) => {
      const next = { ...current };
      for (const size of product!.sizes) delete next[stockKey(removed, size)];
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
          <Field label="Fabric" value={fabric} onChange={setFabric} />
          <label className="block text-sm">
            Care notes
            <textarea value={care} onChange={(event) => setCare(event.target.value)} className="mt-1 min-h-24 w-full border border-line bg-paper p-3 outline-none" />
            <span className="mt-1 block text-xs text-[#8a847c]">One note per line.</span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price (₹)" value={String(price)} onChange={(value) => setPrice(Number(value))} />
            <label className="block text-sm">
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-2">
                {categoryList().map((item) => (
                  <option key={item.slug} value={item.slug}>
                    {item.label}
                  </option>
                ))}
                {!categoryList().some((item) => item.slug === category) && <option value={category}>{category}</option>}
              </select>
            </label>
            <label className="block text-sm">
              Or a new category
              <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none" />
            </label>
            <label className="block text-sm">
              Gender
              <select value={gender} onChange={(event) => setGender(event.target.value as Gender)} className="mt-1 h-11 w-full border border-line bg-paper px-2">
                {GENDERS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
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
      <h2 className="mt-10 text-sm">Colours</h2>
      <ul className="mt-3 space-y-2">
        {colors.map((color, index) => (
          <li key={index} className="flex flex-wrap items-center gap-2">
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(color.hex) ? color.hex : "#E4D7C4"} onChange={(event) => setColors((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, hex: event.target.value.toUpperCase() } : item)))} className="h-11 w-14 border border-line bg-paper" aria-label={`${color.name || "Colour"} swatch`} />
            <input value={color.name} onChange={(event) => {
              const next = renameColor(colors, stock, index, event.target.value, product.sizes);
              setColors(next.colors);
              setStock(next.stock);
            }} className="h-11 min-w-40 flex-1 border border-line bg-paper px-3 outline-none" aria-label="Colour name" />
            <button type="button" className="text-sm text-[#ab6446] disabled:opacity-40" disabled={colors.length === 1} onClick={() => removeColor(index)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      {colors.length < 8 && (
        <button type="button" className="mt-3 text-sm text-[#ab6446]" onClick={() => setColors((current) => [...current, { name: nextColorName(current), hex: "#E4D7C4" }])}>
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
        {colors.filter((color) => color.name.trim()).flatMap((color) =>
          product.sizes.map((size) => {
            const key = stockKey(color.name, size);
            return (
              <li key={key} className="p-4 text-sm">
                <p>{color.name} · {size}</p>
                <p className="mt-1 text-xs text-[#8a847c]">{sku(product.slug, color.name, size)}</p>
                <label className="mt-3 block text-[#6d6960]">
                  Stock
                  <input
                    type="number"
                    min={0}
                    value={stock[key] ?? 0}
                    onChange={(event) => setStock((current) => ({ ...current, [key]: Number(event.target.value) }))}
                    className="mt-1 h-11 w-full border border-line bg-cream px-3 text-[#2a2925] outline-none"
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
            {colors.filter((color) => color.name.trim()).flatMap((color) =>
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

function renameColor(colors: Colorway[], stock: Record<string, number>, index: number, name: string, sizes: Size[]) {
  const previous = colors[index]?.name ?? "";
  const nextColors = colors.map((color, colorIndex) => (colorIndex === index ? { ...color, name } : color));
  const trimmed = name.trim();
  if (!trimmed || trimmed === previous) return { colors: nextColors, stock };
  const nextStock = { ...stock };
  for (const size of sizes) {
    const from = stockKey(previous, size);
    const to = stockKey(trimmed, size);
    if (from === to || !(from in nextStock)) continue;
    nextStock[to] = nextStock[from];
    delete nextStock[from];
  }
  return { colors: nextColors, stock: nextStock };
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-3 outline-none" />
    </label>
  );
}
