"use client";

import { useState } from "react";
import { downloadCsv } from "@/lib/admin";
import { useStore, type OrderStatus } from "@/lib/store";
import { AdminHeader, FilterChip, OrdersTable, OutlineButton, Showing } from "@/components/admin-shell";

const filters: Array<OrderStatus | "all"> = ["all", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const { orders } = useStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const rows = orders.filter((order) => {
    const haystack = `${order.number} ${order.address.name} ${order.email} ${order.phone}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (status !== "all" && order.status !== status) return false;
    return true;
  });

  return (
    <div>
      <AdminHeader
        title="Orders"
        actions={
          <OutlineButton
            onClick={() =>
              downloadCsv("earthen-orders.csv", [
                ["order", "date", "customer", "items", "total", "payment", "status"],
                ...rows.map((order) => [
                  order.number,
                  order.createdAt.slice(0, 10),
                  order.address.name,
                  String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
                  String(order.total),
                  order.payment,
                  order.status,
                ]),
              ])
            }
          >
            EXPORT CSV
          </OutlineButton>
        }
      />
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search order, name or phone"
          className="h-9 w-64 border border-[#e6dfd4] bg-white px-3 text-sm outline-none"
        />
        {filters.map((item) => {
          const count = item === "all" ? orders.length : orders.filter((order) => order.status === item).length;
          const label = item === "all" ? "All" : item;
          return (
            <FilterChip key={item} active={status === item} onClick={() => setStatus(item)}>
              {label} {count}
            </FilterChip>
          );
        })}
      </div>
      <div className="mt-4 border border-[#e6dfd4] bg-white">
        <OrdersTable orders={rows} showDate />
        <Showing shown={rows.length} total={orders.length} noun="orders" />
      </div>
    </div>
  );
}
