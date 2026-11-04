"use client";

import { FormEvent, useState } from "react";
import { catalogSource, fabricList, type Fabric } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { AdminHeader, SolidButton } from "@/components/admin-shell";

const blank = { slug: "", label: "" };

export default function FabricsPage() {
  const { saveFabric, removeFabric } = useStore();
  const fabrics = fabricList();
  const [draft, setDraft] = useState(blank);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const shown = fabrics.filter((fabric) => fabric.label.toLowerCase().includes(query.trim().toLowerCase()));

  function pieces(label: string) {
    return catalogSource().filter((product) => product.fabric === label).length;
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const renaming = fabrics.find((fabric) => fabric.slug === draft.slug);
    const error = await saveFabric({ slug: draft.slug || undefined, label: draft.label });
    if (error) {
      setMessage(error);
      return;
    }
    const count = renaming ? pieces(draft.label.trim()) : 0;
    setMessage(renaming ? `Renamed to ${draft.label.trim()}${count ? ` on ${count} ${count === 1 ? "product" : "products"}` : ""}.` : `${draft.label.trim()} added.`);
    setDraft(blank);
  }

  async function remove(fabric: Fabric) {
    const error = await removeFabric(fabric.slug);
    setMessage(error ?? `${fabric.label} removed.`);
    if (!error && draft.slug === fabric.slug) setDraft(blank);
  }

  return (
    <div>
      <AdminHeader title="Fabrics" />
      <p className="mt-3 max-w-2xl text-sm text-[#6d6960]">
        The materials you choose from when adding or editing a product. Keep the weight out of the name: pick Washed linen here, then write 160 gsm in the
        product&rsquo;s weight box. Renaming a fabric renames it on every product that uses it.
      </p>
      {message && <p className="mt-4 text-sm text-[#6d6960]">{message}</p>}
      <form onSubmit={(event) => void save(event)} className="mt-6 flex flex-wrap items-end gap-3 border border-[#e6dfd4] bg-white p-4">
        <label className="min-w-56 flex-1 text-sm">
          {draft.slug ? "New name" : "Fabric"}
          <input
            value={draft.label}
            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            required
            maxLength={60}
            placeholder="Washed linen"
            className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none"
          />
        </label>
        <SolidButton type="submit">{draft.slug ? "RENAME" : "ADD FABRIC"}</SolidButton>
        {draft.slug && (
          <button type="button" className="h-9 text-sm text-[#6d6960]" onClick={() => setDraft(blank)}>
            Cancel
          </button>
        )}
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search fabrics"
          className="h-9 w-64 border border-[#e6dfd4] bg-white px-3 text-sm outline-none"
        />
        <p className="text-sm text-[#8a847c]">
          {shown.length} of {fabrics.length} fabrics
        </p>
      </div>
      <ul className="mt-3 divide-y divide-[#efeae2] border border-[#e6dfd4] bg-white">
        {shown.map((fabric) => {
          const count = pieces(fabric.label);
          return (
            <li key={fabric.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm md:px-5">
              <span>
                {fabric.label}
                <span className="block text-xs text-[#8a847c]">
                  {count} {count === 1 ? "product" : "products"}
                </span>
              </span>
              <span className="flex gap-4">
                <button type="button" className="text-[#6d6960]" onClick={() => setDraft({ slug: fabric.slug, label: fabric.label })}>
                  Rename
                </button>
                <button type="button" className="text-[#ab6446] disabled:text-[#c4bfb6]" disabled={count > 0} onClick={() => void remove(fabric)}>
                  {count > 0 ? "In use" : "Remove"}
                </button>
              </span>
            </li>
          );
        })}
        {shown.length === 0 && <li className="px-4 py-6 text-sm text-[#8a847c]">{fabrics.length ? "No fabric matches that search." : "No fabrics yet. Add the first one above."}</li>}
      </ul>
    </div>
  );
}
