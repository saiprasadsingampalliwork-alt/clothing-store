"use client";

import { FormEvent, useState } from "react";
import { allStyles, catalogSource, type Style } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { AdminHeader, SolidButton } from "@/components/admin-shell";

const blank = { slug: "", label: "", active: true };

export default function StylesPage() {
  const { saveStyle, removeStyle, reorderStyles } = useStore();
  const styles = allStyles();
  const [draft, setDraft] = useState(blank);
  const [message, setMessage] = useState<string | null>(null);

  function pieces(slug: string) {
    return catalogSource().filter((product) => (product.styles ?? []).includes(slug)).length;
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const error = await saveStyle({ slug: draft.slug || undefined, label: draft.label, active: draft.active });
    setMessage(error ?? `${draft.label.trim()} ${draft.slug ? "saved" : "added"}.`);
    if (!error) setDraft(blank);
  }

  async function toggle(style: Style) {
    const error = await saveStyle({ slug: style.slug, label: style.label, active: !style.active });
    setMessage(error ?? `${style.label} is ${style.active ? "hidden from the shop filters" : "in the shop filters"}.`);
  }

  async function move(index: number, direction: -1 | 1) {
    const order = styles.map((style) => style.slug);
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    const error = await reorderStyles(order);
    if (error) setMessage(error);
  }

  async function remove(style: Style) {
    if (!window.confirm(`Remove ${style.label}?`)) return;
    const error = await removeStyle(style.slug);
    setMessage(error ?? `${style.label} removed.`);
    if (!error && draft.slug === style.slug) setDraft(blank);
  }

  return (
    <div>
      <AdminHeader title="Styles" />
      <p className="mt-3 max-w-2xl text-sm text-[#6d6960]">
        The occasion or look of a piece, across every category and audience: Casual, Formal, Ethnic, and so on. A product can have several. Shoppers filter by
        them and find them in the menu, in this order. Switch a style off to hide it from the shop while you tag pieces; the pieces themselves stay on sale.
      </p>
      {message && <p className="mt-4 text-sm text-[#6d6960]">{message}</p>}
      <form onSubmit={(event) => void save(event)} className="mt-6 flex flex-wrap items-end gap-3 border border-[#e6dfd4] bg-white p-4">
        <label className="min-w-56 flex-1 text-sm">
          {draft.slug ? "Name" : "Style"}
          <input
            value={draft.label}
            onChange={(event) => setDraft({ ...draft, label: event.target.value })}
            required
            maxLength={40}
            placeholder="Festive"
            className="mt-1 h-10 w-full border border-[#e6dfd4] px-2 outline-none"
          />
        </label>
        <label className="flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />
          In the shop
        </label>
        <SolidButton type="submit">{draft.slug ? "SAVE" : "ADD STYLE"}</SolidButton>
        {draft.slug && (
          <button type="button" className="h-9 text-sm text-[#6d6960]" onClick={() => setDraft(blank)}>
            Cancel
          </button>
        )}
      </form>

      <ul className="mt-6 divide-y divide-[#efeae2] border border-[#e6dfd4] bg-white">
        {styles.map((style, index) => {
          const count = pieces(style.slug);
          return (
            <li key={style.slug} className="grid gap-2 px-4 py-3 text-sm md:grid-cols-[1fr_auto] md:items-center md:px-5">
              <span>
                <span className="flex flex-wrap items-center gap-2">
                  {style.label}
                  <span className={`px-1.5 text-[10px] tracking-[0.12em] ${style.active ? "bg-[#8e9479] text-white" : "bg-[#efeae2] text-[#6d6960]"}`}>
                    {style.active ? "IN SHOP" : "OFF"}
                  </span>
                </span>
                <span className="block text-xs text-[#8a847c]">
                  {count} {count === 1 ? "product" : "products"}
                </span>
              </span>
              <span className="flex flex-wrap gap-x-4 gap-y-1 text-[#6d6960]">
                <button type="button" className="disabled:opacity-40" disabled={index === 0} onClick={() => void move(index, -1)}>
                  Earlier
                </button>
                <button type="button" className="disabled:opacity-40" disabled={index === styles.length - 1} onClick={() => void move(index, 1)}>
                  Later
                </button>
                <button type="button" onClick={() => setDraft({ slug: style.slug, label: style.label, active: style.active })}>
                  Rename
                </button>
                <button type="button" onClick={() => void toggle(style)}>
                  {style.active ? "Switch off" : "Switch on"}
                </button>
                <button type="button" className="text-[#ab6446] disabled:text-[#c4bfb6]" disabled={count > 0} onClick={() => void remove(style)}>
                  {count > 0 ? "In use" : "Remove"}
                </button>
              </span>
            </li>
          );
        })}
        {styles.length === 0 && <li className="px-4 py-6 text-sm text-[#8a847c]">No styles yet. Add the first one above.</li>}
      </ul>
    </div>
  );
}
