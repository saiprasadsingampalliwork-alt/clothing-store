"use client";

import { useState } from "react";
import { compactINR, downloadCsv, gstSplit } from "@/lib/admin";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, FilterChip, OutlineButton } from "@/components/admin-shell";

const tabs = ["Sales", "GST", "Payments"] as const;

export default function ReportsPage() {
  const { orders } = useStore();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Sales");
  const [recent, setRecent] = useState(false);
  const now = Date.now();
  const windowed = orders.filter((order) => {
    if (!recent) return true;
    return now - new Date(order.createdAt).getTime() <= 30 * 86400000;
  });
  const live = windowed.filter((order) => order.status !== "Cancelled");
  const previous = orders.filter((order) => {
    const age = now - new Date(order.createdAt).getTime();
    return order.status !== "Cancelled" && age > 30 * 86400000 && age <= 60 * 86400000;
  });
  const net = live.reduce((sum, order) => sum + order.total, 0);
  const priorNet = previous.reduce((sum, order) => sum + order.total, 0);
  const refunds = live.filter((order) => order.status === "Returned").reduce((sum, order) => sum + order.total, 0);
  const byCategory = new Map<string, number>([
    ["Tops", 0],
    ["Bottoms", 0],
    ["Outerwear", 0],
  ]);
  const byPayment = new Map<string, number>([
    ["UPI", 0],
    ["Cards", 0],
    ["COD", 0],
    ["Net banking", 0],
  ]);
  let taxable = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  const months = new Map<string, { label: string; orders: number; taxable: number; cgst: number; sgst: number; igst: number }>();
  for (const order of live) {
    const method = order.payment === "card" ? "Cards" : order.payment === "cod" ? "COD" : order.payment === "netbanking" ? "Net banking" : "UPI";
    byPayment.set(method, (byPayment.get(method) ?? 0) + order.total);
    const gst = gstSplit(order);
    taxable += gst.taxable;
    cgst += gst.cgst;
    sgst += gst.sgst;
    igst += gst.igst;
    const date = new Date(order.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const current = date.getMonth() === new Date().getMonth() && date.getFullYear() === new Date().getFullYear();
    const name = date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const bucket = months.get(key) ?? { label: name, orders: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    if (current) bucket.label = `${date.toLocaleDateString("en-GB", { month: "long" })} ${date.getFullYear()} (to date)`;
    bucket.orders += 1;
    bucket.taxable += gst.taxable;
    bucket.cgst += gst.cgst;
    bucket.sgst += gst.sgst;
    bucket.igst += gst.igst;
    months.set(key, bucket);
    for (const item of order.items) {
      const category = item.slug.includes("trouser") || item.slug.includes("skirt") ? "Bottoms" : item.slug.includes("cardigan") || item.slug.includes("jacket") ? "Outerwear" : "Tops";
      byCategory.set(category, (byCategory.get(category) ?? 0) + item.price * item.quantity);
    }
  }
  const categoryTotal = [...byCategory.values()].reduce((sum, value) => sum + value, 0) || 1;
  const paymentTotal = [...byPayment.values()].reduce((sum, value) => sum + value, 0) || 1;
  const change = priorNet ? Math.round(((net - priorNet) / priorNet) * 100) : 0;

  function exportReport() {
    downloadCsv("earthen-gst.csv", [
      ["order", "date", "state", "payment", "taxable", "cgst", "sgst", "igst", "total"],
      ...live.map((order) => {
        const gst = gstSplit(order);
        return [order.number, order.createdAt.slice(0, 10), order.address.state, order.payment, String(gst.taxable), String(gst.cgst), String(gst.sgst), String(gst.igst), String(order.total)];
      }),
    ]);
  }

  return (
    <div>
      <AdminHeader
        title="Reports"
        actions={
          <>
            <OutlineButton onClick={exportReport}>EXPORT CSV</OutlineButton>
            <OutlineButton onClick={exportReport}>EXPORT EXCEL</OutlineButton>
          </>
        }
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <FilterChip key={item} active={tab === item && !recent} onClick={() => { setTab(item); setRecent(false); }}>
            {item}
          </FilterChip>
        ))}
        <FilterChip active={recent} onClick={() => setRecent(true)}>
          Last 30 days
        </FilterChip>
      </div>
      {(tab === "Sales" || recent) && (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Net sales" value={compactINR(net)} hint={priorNet ? `${change >= 0 ? "+" : ""}${change}% vs previous 30 days` : "This period"} />
            <Stat label="Orders" value={String(live.length)} hint={`Avg. order ${formatINR(live.length ? Math.round(net / live.length) : 0)}`} />
            <Stat label="GST collected" value={formatINR(cgst + sgst + igst)} hint="Included in sales" />
            <Stat label="Refunds" value={formatINR(refunds)} hint={net ? `${Math.round((refunds / net) * 1000) / 10}% of sales` : "0% of sales"} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <BarCard title="Sales by category" rows={[...byCategory.entries()].map(([label, total]) => ({ label, total, share: Math.round((total / categoryTotal) * 100) }))} />
            {(tab === "Sales" || recent) && <BarCard title="Payment methods" rows={[...byPayment.entries()].map(([label, total]) => ({ label, total, share: Math.round((total / paymentTotal) * 100) }))} />}
          </div>
        </>
      )}
      {tab === "Payments" && !recent && (
        <div className="mt-4">
          <BarCard title="Payment methods" rows={[...byPayment.entries()].map(([label, total]) => ({ label, total, share: Math.round((total / paymentTotal) * 100) }))} />
        </div>
      )}
      {(tab === "GST" || tab === "Sales" || recent) && (
        <section className="mt-4 border border-[#e6dfd4] bg-white">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-medium">GST report</h2>
            <button onClick={exportReport} className="text-sm text-[#ab6446]">
              Download →
            </button>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
              <tr className="border-y border-[#e6dfd4]">
                <th className="px-5 py-3 font-medium">MONTH</th>
                <th className="py-3 font-medium">ORDERS</th>
                <th className="py-3 font-medium">TAXABLE VALUE</th>
                <th className="py-3 font-medium">CGST</th>
                <th className="py-3 font-medium">SGST</th>
                <th className="py-3 font-medium">IGST</th>
                <th className="px-5 py-3 font-medium">TOTAL GST</th>
              </tr>
            </thead>
            <tbody>
              {[...months.entries()]
                .sort((a, b) => (a[0] < b[0] ? 1 : -1))
                .map(([key, row]) => (
                  <tr key={key} className="border-b border-[#efeae2]">
                    <td className="px-5 py-3">{row.label}</td>
                    <td>{row.orders}</td>
                    <td>{formatINR(row.taxable)}</td>
                    <td>{formatINR(row.cgst)}</td>
                    <td>{formatINR(row.sgst)}</td>
                    <td>{formatINR(row.igst)}</td>
                    <td className="px-5 py-3">{formatINR(row.cgst + row.sgst + row.igst)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border border-[#e6dfd4] bg-white p-4">
      <p className="text-sm text-[#6d6960]">{label}</p>
      <p className="serif mt-3 text-[32px] leading-none">{value}</p>
      <p className="mt-3 text-xs text-[#6d6960]">{hint}</p>
    </div>
  );
}

function BarCard({ title, rows }: { title: string; rows: { label: string; total: number; share: number }[] }) {
  return (
    <section className="border border-[#e6dfd4] bg-white p-5">
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-4 space-y-3">
        {rows.map((row) => (
          <li key={row.label} className="grid grid-cols-[110px_1fr_auto] items-center gap-3 text-sm">
            <span>{row.label}</span>
            <span className="h-2 bg-[#efeae2]">
              <span className="block h-2 bg-[#5b6043]" style={{ width: `${row.share}%` }} />
            </span>
            <span className="text-[#6d6960]">{row.share}%</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
