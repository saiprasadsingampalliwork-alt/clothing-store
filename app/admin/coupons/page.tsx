"use client";

import { FormEvent, useState } from "react";
import { formatINR, type CouponRecord } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, FilterChip, SolidButton, StatusPill } from "@/components/admin-shell";

const blankCoupon: CouponRecord = {
  code: "",
  type: "percent",
  value: 10,
  minOrder: 0,
  usageLimit: 100,
  used: 0,
  starts: "",
  ends: "",
  active: true,
};

type CouponState = "active" | "scheduled" | "expired";

function couponState(coupon: CouponRecord, today: string): CouponState {
  if (coupon.starts && today < coupon.starts) return "scheduled";
  if (!coupon.active || (coupon.ends && today > coupon.ends)) return "expired";
  return "active";
}

function offer(coupon: CouponRecord) {
  if (coupon.type === "percent") return `${coupon.value}% off`;
  if (coupon.type === "fixed") return `${formatINR(coupon.value)} off`;
  return "Free shipping";
}

function till(iso: string) {
  if (!iso) return "No end";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function CouponsPage() {
  const { coupons, saveCoupon, removeCoupon } = useStore();
  const [draft, setDraft] = useState<CouponRecord>(blankCoupon);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CouponState>("active");
  const [message, setMessage] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const counts = {
    active: coupons.filter((coupon) => couponState(coupon, today) === "active").length,
    scheduled: coupons.filter((coupon) => couponState(coupon, today) === "scheduled").length,
    expired: coupons.filter((coupon) => couponState(coupon, today) === "expired").length,
  };
  const rows = coupons.filter((coupon) => couponState(coupon, today) === filter && coupon.code.toLowerCase().includes(query.toLowerCase()));

  async function saveCode(event: FormEvent) {
    event.preventDefault();
    const error = await saveCoupon(draft);
    setMessage(error ?? `${draft.code.toUpperCase()} saved.`);
    if (!error) {
      setDraft(blankCoupon);
      setOpen(false);
    }
  }

  return (
    <div>
      <AdminHeader
        title="Coupons"
        actions={
          <SolidButton
            onClick={() => {
              setDraft(blankCoupon);
              setOpen(true);
            }}
          >
            ADD COUPON
          </SolidButton>
        }
      />
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search coupon code"
          className="h-9 w-64 border border-[#e6dfd4] bg-white px-3 text-sm outline-none"
        />
        <FilterChip active={filter === "active"} onClick={() => setFilter("active")}>
          Active {counts.active}
        </FilterChip>
        <FilterChip active={filter === "scheduled"} onClick={() => setFilter("scheduled")}>
          Scheduled {counts.scheduled}
        </FilterChip>
        <FilterChip active={filter === "expired"} onClick={() => setFilter("expired")}>
          Expired {counts.expired}
        </FilterChip>
      </div>
      <div className="mt-4 overflow-auto border border-[#e6dfd4] bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
            <tr className="border-b border-[#e6dfd4]">
              <th className="px-5 py-3 font-medium">CODE</th>
              <th className="py-3 font-medium">DISCOUNT</th>
              <th className="py-3 font-medium">MIN ORDER</th>
              <th className="py-3 font-medium">USED / LIMIT</th>
              <th className="py-3 font-medium">VALID TILL</th>
              <th className="px-5 py-3 font-medium">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((coupon) => {
              const state = couponState(coupon, today);
              return (
                <tr key={coupon.code} className="border-b border-[#efeae2]">
                  <td className="px-5 py-3">
                    <button
                      className="tracking-wide"
                      onClick={() => {
                        setDraft(coupon);
                        setOpen(true);
                      }}
                    >
                      {coupon.code}
                    </button>
                  </td>
                  <td>{offer(coupon)}</td>
                  <td>{coupon.minOrder ? formatINR(coupon.minOrder) : "—"}</td>
                  <td>
                    {coupon.used} / {coupon.usageLimit || "No limit"}
                  </td>
                  <td>{till(coupon.ends)}</td>
                  <td className="px-5 py-3">
                    <StatusPill status={state} />
                    <button className="ml-3 text-xs text-[#ab6446]" onClick={() => void removeCoupon(coupon.code)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-5 py-6 text-sm text-[#6d6960]">No coupons in this view.</p>}
      </div>
      {open && (
        <form onSubmit={saveCode} className="mt-4 grid gap-3 border border-[#e6dfd4] bg-white p-5 sm:grid-cols-2">
          <h2 className="text-sm font-medium sm:col-span-2">Add coupon</h2>
          <input required value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value.toUpperCase() })} placeholder="CODE" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
          <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as CouponRecord["type"] })} className="h-11 border border-[#e6dfd4] px-2">
            <option value="percent">Percent</option>
            <option value="fixed">Fixed amount</option>
            <option value="free_shipping">Free shipping</option>
          </select>
          <input type="number" value={draft.value} onChange={(event) => setDraft({ ...draft, value: Number(event.target.value) })} placeholder="Value" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
          <input type="number" value={draft.minOrder} onChange={(event) => setDraft({ ...draft, minOrder: Number(event.target.value) })} placeholder="Minimum order" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
          <input type="number" value={draft.usageLimit} onChange={(event) => setDraft({ ...draft, usageLimit: Number(event.target.value) })} placeholder="Usage limit" className="h-11 border border-[#e6dfd4] px-3 outline-none" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />
            Active
          </label>
          <input type="date" value={draft.starts} onChange={(event) => setDraft({ ...draft, starts: event.target.value })} className="h-11 border border-[#e6dfd4] px-2" />
          <input type="date" value={draft.ends} onChange={(event) => setDraft({ ...draft, ends: event.target.value })} className="h-11 border border-[#e6dfd4] px-2" />
          <div className="flex gap-2 sm:col-span-2">
            <SolidButton type="submit">SAVE COUPON</SolidButton>
            <button type="button" className="h-9 px-3 text-sm text-[#6d6960]" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
