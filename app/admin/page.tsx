"use client";

import Link from "next/link";
import { compactINR, downloadCsv, salesByDay } from "@/lib/admin";
import { liveProduct, products } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, OrdersTable, OutlineButton } from "@/components/admin-shell";

export default function DashboardPage() {
  const { orders, overrides } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const sum = (key: string) =>
    orders.filter((order) => order.status !== "Cancelled" && order.createdAt.slice(0, 10) === key).reduce((total, order) => total + order.total, 0);
  const revenue = sum(today);
  const prior = sum(yesterday);
  const ordersToday = orders.filter((order) => order.createdAt.slice(0, 10) === today).length;
  const ordersPrior = orders.filter((order) => order.createdAt.slice(0, 10) === yesterday).length;
  const pending = orders.filter((order) => ["Confirmed", "Packed"].includes(order.status));
  const overdue = pending.filter((order) => order.createdAt.slice(0, 10) < today).length;
  const bars = salesByDay(orders);
  const max = Math.max(...bars.map((bar) => bar.total), 1);
  const low = products.flatMap((product) => {
    const live = liveProduct(product, overrides[product.slug]);
    if (live.status !== "active") return [];
    return live.colors.flatMap((color) =>
      live.sizes
        .map((size) => ({ name: `${product.name} · ${color.name} / ${size}`, qty: live.stock[`${color.name}|${size}`] ?? 0 }))
        .filter((row) => row.qty > 0 && row.qty <= 5),
    );
  });

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        actions={
          <OutlineButton
            onClick={() =>
              downloadCsv("earthen-orders.csv", [
                ["order", "date", "customer", "total", "status", "payment"],
                ...orders.map((order) => [order.number, order.createdAt.slice(0, 10), order.address.name, String(order.total), order.status, order.payment]),
              ])
            }
          >
            EXPORT REPORT
          </OutlineButton>
        }
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Revenue today" value={formatINR(revenue)} hint={delta(revenue, prior)} />
        <Stat label="Orders today" value={String(ordersToday)} hint={countDelta(ordersToday, ordersPrior)} />
        <Stat label="Pending shipments" value={String(pending.length)} hint={`${overdue} overdue`} />
        <Stat label="Low-stock items" value={String(low.length)} hint="Reorder soon" />
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-[1.4fr_1fr]">
        <section className="border border-[#e6dfd4] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Sales, last 7 days</h2>
            <Link href="/admin/reports" className="text-sm text-[#ab6446]">
              View reports →
            </Link>
          </div>
          <div className="mt-6 flex h-44 items-end gap-3">
            {bars.map((bar, index) => (
              <div key={bar.key} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-[10px] text-[#6d6960]">{bar.total ? compactINR(bar.total) : ""}</span>
                <div className={`w-full ${index === bars.length - 1 ? "bg-[#ab6446]" : "bg-[#5b6043]"}`} style={{ height: `${Math.max(8, (bar.total / max) * 120)}px` }} />
                <span className="text-xs text-[#6d6960]">{bar.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="border border-[#e6dfd4] bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Low stock</h2>
            <Link href="/admin/products" className="text-sm text-[#ab6446]">
              View inventory →
            </Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {low.slice(0, 5).map((row) => (
              <li key={row.name} className="flex justify-between gap-3">
                <span>{row.name}</span>
                <span className="text-[#ab6446]">{row.qty} left</span>
              </li>
            ))}
            {low.length === 0 && <li className="text-[#6d6960]">Stock is comfortable.</li>}
          </ul>
        </section>
      </div>
      <section className="mt-4 border border-[#e6dfd4] bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-sm font-medium">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-[#ab6446]">
            View all orders →
          </Link>
        </div>
        <OrdersTable orders={orders.slice(0, 6)} />
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border border-[#e6dfd4] bg-white p-4">
      <p className="text-sm text-[#6d6960]">{label}</p>
      <p className="serif mt-3 text-[32px] leading-none text-[#2a2925]">{value}</p>
      <p className="mt-3 text-xs text-[#6d6960]">{hint}</p>
    </div>
  );
}

function delta(now: number, then: number) {
  if (!then) return now ? "First sales today" : "No sales yet today";
  const change = Math.round(((now - then) / then) * 100);
  return `${change >= 0 ? "+" : ""}${change}% vs yesterday`;
}

function countDelta(now: number, then: number) {
  const change = now - then;
  return `${change >= 0 ? "+" : ""}${change} vs yesterday`;
}
