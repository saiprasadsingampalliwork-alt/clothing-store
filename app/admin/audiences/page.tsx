"use client";

import { FormEvent, useState } from "react";
import { allAudiences, AUDIENCE_GROUPS, catalogSource, GROUP_SIZES, parseSizes, productGender, type Audience, type AudienceGroup } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { AdminHeader, SolidButton } from "@/components/admin-shell";

type Draft = { slug: string; label: string; group: AudienceGroup; shared: boolean; sizes: string; active: boolean };

const blank: Draft = { slug: "", label: "", group: "adults", shared: false, sizes: GROUP_SIZES.adults.join(", "), active: true };

export default function AudiencesPage() {
  const { saveAudience, removeAudience } = useStore();
  const audiences = allAudiences();
  const [draft, setDraft] = useState<Draft>(blank);
  const [message, setMessage] = useState<string | null>(null);

  function pieces(slug: string) {
    return catalogSource().filter((product) => productGender(product) === slug).length;
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const sizes = parseSizes(draft.sizes);
    if (!sizes.length || sizes.length > 20) {
      setMessage("Add between 1 and 20 sizes, separated by commas.");
      return;
    }
    const error = await saveAudience({ slug: draft.slug || undefined, label: draft.label, group: draft.group, shared: draft.shared, sizes, active: draft.active });
    setMessage(error ?? `${draft.label.trim()} saved.`);
    if (!error) setDraft(blank);
  }

  async function toggle(audience: Audience) {
    const error = await saveAudience({ ...audience, active: !audience.active });
    setMessage(error ?? `${audience.label} is ${audience.active ? "hidden from the shop" : "in the shop"}.`);
  }

  // Swaps display order with the neighbour in that direction.
  async function move(index: number, direction: -1 | 1) {
    const here = audiences[index];
    const there = audiences[index + direction];
    if (!here || !there) return;
    const first = await saveAudience({ ...here, sort: there.sort === here.sort ? here.sort + direction : there.sort });
    const second = first ?? (await saveAudience({ ...there, sort: here.sort }));
    if (first || second) setMessage(first ?? second);
  }

  async function remove(audience: Audience) {
    if (!window.confirm(`Remove ${audience.label}? Products cannot use it afterwards.`)) return;
    const error = await removeAudience(audience.slug);
    setMessage(error ?? `${audience.label} removed.`);
    if (!error && draft.slug === audience.slug) setDraft(blank);
  }

  function edit(audience: Audience) {
    setDraft({ slug: audience.slug, label: audience.label, group: audience.group, shared: audience.shared, sizes: audience.sizes.join(", "), active: audience.active });
    setMessage(null);
  }

  const standard = GROUP_SIZES[draft.group].join(", ");

  return (
    <div>
      <AdminHeader title="Audiences" />
      <p className="mt-3 max-w-2xl text-sm text-[#6d6960]">
        Who your pieces are for. Shoppers filter by these, and a new product takes its audience&rsquo;s sizes. A shared audience, like Unisex, also shows under every
        other audience in its group, so Girls includes Kids unisex but never adult Unisex. Switch an audience off to prepare its pieces before launch.
      </p>
      {message && <p className="mt-4 text-sm text-[#6d6960]">{message}</p>}
      <form onSubmit={(event) => void save(event)} className="mt-6 grid gap-3 border border-[#e6dfd4] bg-white p-4 sm:grid-cols-2">
        <label className="text-sm">
          Name
          <input value={draft.label} onChange={(event) => setDraft({ ...draft, label: event.target.value })} required maxLength={40} placeholder="Girls" className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none" />
        </label>
        <label className="text-sm">
          Group
          <select
            value={draft.group}
            onChange={(event) => {
              const group = event.target.value as AudienceGroup;
              const untouched = draft.sizes === GROUP_SIZES[draft.group].join(", ");
              setDraft({ ...draft, group, sizes: untouched ? GROUP_SIZES[group].join(", ") : draft.sizes });
            }}
            className="mt-1 h-10 w-full border border-[#e6dfd4] bg-white px-2"
          >
            {AUDIENCE_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm sm:col-span-2">
          Sizes
          <input value={draft.sizes} onChange={(event) => setDraft({ ...draft, sizes: event.target.value.replace(/\|/g, "") })} required placeholder={standard} className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none" />
          <span className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-[#8a847c]">
            Separate with commas, smallest first. Changing sizes here applies to products added later; existing products keep theirs.
            {draft.sizes !== standard && (
              <button type="button" className="text-[#ab6446]" onClick={() => setDraft({ ...draft, sizes: standard })}>
                Use standard {AUDIENCE_GROUPS.find((group) => group.id === draft.group)?.label.toLowerCase()} sizes
              </button>
            )}
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={draft.shared} onChange={(event) => setDraft({ ...draft, shared: event.target.checked })} className="mt-1" />
          <span>
            Shared
            <span className="block text-xs text-[#8a847c]">Shows under every audience in this group, like Unisex.</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} className="mt-1" />
          <span>
            In the shop
            <span className="block text-xs text-[#8a847c]">Off keeps it, and its products, out of the shop filters.</span>
          </span>
        </label>
        <div className="flex items-center gap-3 sm:col-span-2">
          <SolidButton type="submit">{draft.slug ? "SAVE CHANGES" : "ADD AUDIENCE"}</SolidButton>
          {draft.slug && (
            <button type="button" className="text-sm text-[#6d6960]" onClick={() => setDraft(blank)}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {AUDIENCE_GROUPS.map((group) => {
        const members = audiences.filter((audience) => audience.group === group.id);
        if (!members.length) return null;
        return (
          <section key={group.id} className="mt-8">
            <h2 className="text-[11px] tracking-[0.14em] text-[#8a847c]">{group.label.toUpperCase()}</h2>
            <ul className="mt-2 divide-y divide-[#efeae2] border border-[#e6dfd4] bg-white">
              {members.map((audience) => {
                const index = audiences.indexOf(audience);
                const count = pieces(audience.slug);
                return (
                  <li key={audience.slug} className="grid gap-3 px-4 py-4 text-sm md:grid-cols-[1fr_auto] md:items-center md:px-5">
                    <button type="button" className="min-w-0 text-left" onClick={() => edit(audience)}>
                      <span className="flex flex-wrap items-center gap-2">
                        {audience.label}
                        {audience.shared && <span className="border border-[#e6dfd4] px-1.5 text-[10px] tracking-[0.12em] text-[#6d6960]">SHARED</span>}
                        <span className={`px-1.5 text-[10px] tracking-[0.12em] ${audience.active ? "bg-[#8e9479] text-white" : "bg-[#efeae2] text-[#6d6960]"}`}>
                          {audience.active ? "IN SHOP" : "OFF"}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-[#8a847c]">
                        {count} {count === 1 ? "piece" : "pieces"} · {audience.sizes.join(", ")}
                      </span>
                    </button>
                    <span className="flex flex-wrap gap-x-4 gap-y-1 text-[#6d6960]">
                      <button type="button" className="disabled:opacity-40" disabled={index === 0} onClick={() => void move(index, -1)}>
                        Earlier
                      </button>
                      <button type="button" className="disabled:opacity-40" disabled={index === audiences.length - 1} onClick={() => void move(index, 1)}>
                        Later
                      </button>
                      <button type="button" onClick={() => void toggle(audience)}>
                        {audience.active ? "Switch off" : "Switch on"}
                      </button>
                      <button type="button" className="text-[#ab6446] disabled:text-[#c4bfb6]" disabled={count > 0} onClick={() => void remove(audience)}>
                        {count > 0 ? "In use" : "Remove"}
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

