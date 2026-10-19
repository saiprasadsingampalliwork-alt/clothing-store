"use client";

import { FormEvent, useState } from "react";
import { catalogSource, categoryList } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { AdminHeader, SolidButton } from "@/components/admin-shell";
import { ImageUpload } from "@/components/image-upload";

const blank = { slug: "", label: "", blurb: "", image: "", chart: "upper" as "upper" | "lower" };

export default function CategoriesPage() {
  const { saveCategory, removeCategory } = useStore();
  const categories = categoryList();
  const [draft, setDraft] = useState(blank);
  const [message, setMessage] = useState<string | null>(null);

  async function save(event: FormEvent) {
    event.preventDefault();
    const error = await saveCategory({
      slug: draft.slug || undefined,
      label: draft.label,
      blurb: draft.blurb,
      image: draft.image,
      chart: draft.chart,
    });
    setMessage(error ?? `${draft.label.trim()} saved.`);
    if (!error) setDraft(blank);
  }

  async function remove(slug: string, label: string) {
    const error = await removeCategory(slug);
    setMessage(error ?? `${label} removed.`);
    if (!error && draft.slug === slug) setDraft(blank);
  }

  return (
    <div>
      <AdminHeader title="Categories" />
      <p className="mt-3 max-w-xl text-sm text-[#6d6960]">
        Add a category here, then choose it on a product. The shop, header, and homepage use this list. New in stays a filter for pieces marked new.
      </p>
      {message && <p className="mt-4 text-sm text-[#6d6960]">{message}</p>}
      <form onSubmit={(event) => void save(event)} className="mt-6 grid gap-3 border border-[#e6dfd4] bg-white p-4 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <input value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} required className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none" />
        </label>
        <label className="text-sm">
          Size chart
          <select value={draft.chart} onChange={(event) => setDraft({ ...draft, chart: event.target.value as "upper" | "lower" })} className="mt-1 h-10 w-full border border-[#e6dfd4] bg-white px-2">
            <option value="upper">Upper body</option>
            <option value="lower">Lower body</option>
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          Short line
          <input value={draft.blurb} onChange={(event) => setDraft({ ...draft, blurb: event.target.value })} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none" />
        </label>
        <div className="text-sm sm:col-span-2">
          <span>Category photo</span>
          <div className="mt-1 flex items-center gap-3">
            {draft.image ? <img src={draft.image} alt="" className="h-16 w-12 object-cover" /> : <span className="h-16 w-12 bg-[#f3efe8]" />}
            <ImageUpload label={draft.image ? "REPLACE" : "UPLOAD"} onUploaded={(image) => setDraft({ ...draft, image })} />
          </div>
          <p className="mt-2 text-xs text-[#8a847c]">Portrait, 4:5. The tile crops to that shape.</p>
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <SolidButton type="submit">{draft.slug ? "SAVE CHANGES" : "ADD CATEGORY"}</SolidButton>
          {draft.slug && (
            <button type="button" className="text-sm text-[#6d6960]" onClick={() => setDraft(blank)}>
              Cancel
            </button>
          )}
        </div>
      </form>
      <div className="mt-6 border border-[#e6dfd4] bg-white">
        <ul className="divide-y divide-[#efeae2] md:hidden">
          {categories.map((category) => {
            const pieces = catalogSource().filter((product) => product.category === category.slug).length;
            return (
              <li key={category.slug} className="px-4 py-4 text-sm">
                <span className="flex items-start justify-between gap-3">
                  <button className="min-w-0 text-left" onClick={() => setDraft({ slug: category.slug, label: category.label, blurb: category.blurb, image: category.image, chart: category.chart })}>
                    <span className="block">{category.label}</span>
                    <span className="mt-1 block text-xs text-[#8a847c]">{category.blurb || category.slug}</span>
                  </button>
                  <button type="button" className="shrink-0 text-[#ab6446] disabled:text-[#c4bfb6]" disabled={pieces > 0} onClick={() => void remove(category.slug, category.label)}>
                    {pieces > 0 ? "In use" : "Remove"}
                  </button>
                </span>
                <p className="mt-2 text-[#6d6960]">
                  {pieces} {pieces === 1 ? "piece" : "pieces"} · {category.chart === "lower" ? "Lower body" : "Upper body"}
                </p>
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
            <tr className="border-b border-[#e6dfd4]">
              <th className="px-5 py-3 font-medium">NAME</th>
              <th className="py-3 font-medium">PIECES</th>
              <th className="py-3 font-medium">CHART</th>
              <th className="px-5 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => {
              const pieces = catalogSource().filter((product) => product.category === category.slug).length;
              return (
                <tr key={category.slug} className="border-b border-[#efeae2]">
                  <td className="px-5 py-3">
                    <button className="text-left" onClick={() => setDraft({ slug: category.slug, label: category.label, blurb: category.blurb, image: category.image, chart: category.chart })}>
                      {category.label}
                      <span className="block text-xs text-[#8a847c]">{category.blurb || category.slug}</span>
                    </button>
                  </td>
                  <td>{pieces}</td>
                  <td>{category.chart === "lower" ? "Lower body" : "Upper body"}</td>
                  <td className="px-5 py-3 text-right">
                    <button type="button" className="text-[#ab6446] disabled:text-[#c4bfb6]" disabled={pieces > 0} onClick={() => void remove(category.slug, category.label)}>
                      {pieces > 0 ? "In use" : "Remove"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
