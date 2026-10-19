"use client";

import Link from "next/link";
import { useState } from "react";
import { downloadCsv, orderCode } from "@/lib/admin";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, FilterChip, OutlineButton, StatusPill } from "@/components/admin-shell";

const filters = ["Requested", "Approved", "Rejected"] as const;

export default function ReturnsPage() {
  const { orders, decideReturn } = useStore();
  const [filter, setFilter] = useState<(typeof filters)[number]>("Requested");
  const requests = orders.filter((order) => order.returnRequest);
  const waiting = requests.filter((order) => order.returnRequest?.status === "Awaiting review");
  const pendingRefund = waiting.filter((order) => order.returnRequest?.resolution === "refund");
  const delivered = orders.filter((order) => ["Delivered", "Return requested", "Returned"].includes(order.status)).length;
  const rate = delivered ? Math.round((requests.length / delivered) * 1000) / 10 : 0;
  const decided = requests.filter((order) => order.returnRequest?.decidedAt && order.returnRequest.requestedAt);
  const averageDays = decided.length
    ? (
        decided.reduce((sum, order) => {
          const start = new Date(order.returnRequest!.requestedAt!).getTime();
          const end = new Date(order.returnRequest!.decidedAt!).getTime();
          return sum + (end - start) / 86400000;
        }, 0) / decided.length
      ).toFixed(1)
    : null;
  const oldest = waiting.reduce<number | null>((days, order) => {
    if (!order.returnRequest?.requestedAt) return days;
    const age = Math.max(0, Math.round((Date.now() - new Date(order.returnRequest.requestedAt).getTime()) / 86400000));
    return days === null ? age : Math.max(days, age);
  }, null);
  const rows = requests.filter((order) => {
    const status = order.returnRequest?.status;
    if (filter === "Requested") return status === "Awaiting review";
    if (filter === "Approved") return status === "Approved";
    return status === "Rejected";
  });

  return (
    <div>
      <AdminHeader
        title="Returns and refunds"
        actions={
          <OutlineButton
            onClick={() =>
              downloadCsv("earthen-returns.csv", [
                ["order", "customer", "reason", "type", "amount", "status"],
                ...requests.map((order) => [
                  order.number,
                  order.address.name,
                  order.returnRequest?.reason ?? "",
                  order.returnRequest?.resolution ?? "",
                  String(order.total),
                  order.returnRequest?.status ?? "",
                ]),
              ])
            }
          >
            EXPORT CSV
          </OutlineButton>
        }
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Awaiting review" value={String(waiting.length)} hint={oldest === null ? "None waiting" : `Oldest: ${oldest} days`} />
        <Metric label="Pending refunds" value={formatINR(pendingRefund.reduce((sum, order) => sum + order.total, 0))} hint={`${pendingRefund.length} requests`} />
        <Metric label="Return rate (30 days)" value={`${rate}%`} hint="Of delivered orders" />
        <Metric label="Avg. processing time" value={averageDays ? `${averageDays} days` : "—"} hint="Target: 3 days" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((item) => {
          const count =
            item === "Requested"
              ? waiting.length
              : requests.filter((order) => order.returnRequest?.status === item).length;
          return (
            <FilterChip key={item} active={filter === item} onClick={() => setFilter(item)}>
              {item} {count}
            </FilterChip>
          );
        })}
      </div>
      <div className="mt-4 border border-[#e6dfd4] bg-white">
        <ul className="divide-y divide-[#efeae2] md:hidden">
          {rows.map((order) => {
            const item = order.items[0];
            const waitingRow = order.returnRequest?.status === "Awaiting review";
            return (
              <li key={order.id} className="px-4 py-4 text-sm">
                <span className="flex items-center justify-between gap-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-[#2a2925]">{orderCode(order.number)}</Link>
                  <StatusPill status={order.returnRequest?.status ?? ""} />
                </span>
                <p className="mt-1 text-[#6d6960]">{order.address.name}</p>
                <p className="mt-1 text-[#6d6960]">
                  {item?.name} · {order.returnRequest?.reason}
                </p>
                {waitingRow ? (
                  <span className="mt-2 flex gap-4">
                    <button className="text-[#ab6446]" onClick={() => void decideReturn(order.id, "Approved")}>
                      Approve
                    </button>
                    <button className="text-[#6d6960]" onClick={() => void decideReturn(order.id, "Rejected")}>
                      Reject
                    </button>
                  </span>
                ) : (
                  <Link href={`/admin/orders/${order.id}`} className="mt-2 inline-block text-[#ab6446]">
                    Open →
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
            <tr className="border-b border-[#e6dfd4]">
              <th className="px-5 py-3 font-medium">ORDER</th>
              <th className="py-3 font-medium">ITEM</th>
              <th className="py-3 font-medium">REASON</th>
              <th className="py-3 font-medium">TYPE</th>
              <th className="py-3 font-medium">STATUS</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => {
              const item = order.items[0];
              const waitingRow = order.returnRequest?.status === "Awaiting review";
              return (
                <tr key={order.id} className="border-b border-[#efeae2]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.id}`}>{orderCode(order.number)}</Link>
                    <span className="block text-xs text-[#8a847c]">{order.address.name}</span>
                  </td>
                  <td>
                    <span className="flex items-center gap-3">
                      <span className="h-8 w-8" style={{ background: item?.hex ?? "#e6dfd4" }} />
                      <span>
                        {item?.name}
                        <span className="block text-xs text-[#8a847c]">
                          {item?.color} · {item?.size}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td>{order.returnRequest?.reason}</td>
                  <td className="capitalize">{order.returnRequest?.resolution}</td>
                  <td>
                    <StatusPill status={order.returnRequest?.status ?? ""} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {waitingRow ? (
                      <span className="space-x-3">
                        <button className="text-[#ab6446]" onClick={() => void decideReturn(order.id, "Approved")}>
                          Approve
                        </button>
                        <button className="text-[#6d6960]" onClick={() => void decideReturn(order.id, "Rejected")}>
                          Reject
                        </button>
                      </span>
                    ) : (
                      <Link href={`/admin/orders/${order.id}`} className="text-[#ab6446]">
                        Open →
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {rows.length === 0 && <p className="px-5 py-6 text-sm text-[#6d6960]">No returns in this view.</p>}
      </div>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border border-[#e6dfd4] bg-white p-4">
      <p className="text-sm text-[#6d6960]">{label}</p>
      <p className="serif mt-3 text-[32px] leading-none">{value}</p>
      <p className="mt-3 text-xs text-[#6d6960]">{hint}</p>
    </div>
  );
}
