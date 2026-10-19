"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { downloadCsv, orderCode, shortDate } from "@/lib/admin";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";
import { AdminHeader, FilterChip, OutlineButton, Showing, StatusPill } from "@/components/admin-shell";

export default function CustomersPage() {
  const { accounts, orders, blockedEmails, setBlocked } = useStore();
  const [query, setQuery] = useState("");
  const [repeat, setRepeat] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const rows = useMemo(() => {
    const map = new Map<string, { email: string; name: string; phone: string; spent: number; count: number; last?: string }>();
    for (const account of accounts) {
      map.set(account.email.toLowerCase(), { email: account.email, name: account.name, phone: account.phone, spent: 0, count: 0 });
    }
    for (const order of orders) {
      const key = order.email.toLowerCase();
      const current = map.get(key) ?? { email: order.email, name: order.address.name, phone: order.phone, spent: 0, count: 0 };
      current.count += 1;
      if (order.status !== "Cancelled") current.spent += order.total;
      if (!current.last || order.createdAt > current.last) current.last = order.createdAt;
      map.set(key, current);
    }
    return [...map.values()].filter((row) => {
      if (repeat && row.count < 2) return false;
      return `${row.name} ${row.email} ${row.phone}`.toLowerCase().includes(query.toLowerCase());
    });
  }, [accounts, orders, query, repeat]);
  const everyone = useMemo(() => {
    const emails = new Set<string>();
    for (const account of accounts) emails.add(account.email.toLowerCase());
    for (const order of orders) emails.add(order.email.toLowerCase());
    return emails.size;
  }, [accounts, orders]);

  return (
    <div>
      <AdminHeader
        title="Customers"
        actions={
          <OutlineButton
            onClick={() =>
              downloadCsv("earthen-customers.csv", [
                ["name", "email", "orders", "spent", "last order"],
                ...rows.map((row) => [row.name, row.email, String(row.count), String(row.spent), row.last ?? ""]),
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
          placeholder="Search name, email or phone"
          className="h-9 w-64 border border-[#e6dfd4] bg-white px-3 text-sm outline-none"
        />
        <FilterChip active={!repeat} onClick={() => setRepeat(false)}>
          All customers
        </FilterChip>
        <FilterChip active={repeat} onClick={() => setRepeat(true)}>
          Repeat buyers
        </FilterChip>
      </div>
      <div className="mt-4 border border-[#e6dfd4] bg-white">
        <ul className="divide-y divide-[#efeae2] md:hidden">
          {rows.map((row) => {
            const blocked = blockedEmails.some((email) => email.toLowerCase() === row.email.toLowerCase());
            const history = orders.filter((order) => order.email.toLowerCase() === row.email.toLowerCase());
            return (
              <li key={row.email} className="px-4 py-4 text-sm">
                <span className="flex items-center justify-between gap-3">
                  <span>{row.name}</span>
                  <StatusPill status={blocked ? "Blocked" : "Active"} />
                </span>
                <p className="mt-1 text-[#6d6960]">{row.email}</p>
                <p className="mt-1 text-[#6d6960]">
                  {row.count} {row.count === 1 ? "order" : "orders"} · {formatINR(row.spent)}
                </p>
                <button className="mt-2 text-[#ab6446]" onClick={() => setOpen(open === row.email ? null : row.email)}>
                  {open === row.email ? "Hide" : "View →"}
                </button>
                {open === row.email && (
                  <ul className="mt-2 space-y-1 text-[#6d6960]">
                    {history.map((order) => (
                      <li key={order.id}>
                        <Link href={`/admin/orders/${order.id}`}>{orderCode(order.number)}</Link> · {order.status}
                      </li>
                    ))}
                    <li>
                      <button className="text-[#ab6446]" onClick={() => void setBlocked(row.email, !blocked)}>
                        {blocked ? "Unblock" : "Block"}
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <div className="hidden overflow-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
            <tr className="border-b border-[#e6dfd4]">
              <th className="px-5 py-3 font-medium">CUSTOMER</th>
              <th className="py-3 font-medium">EMAIL</th>
              <th className="py-3 font-medium">ORDERS</th>
              <th className="py-3 font-medium">TOTAL SPENT</th>
              <th className="py-3 font-medium">LAST ORDER</th>
              <th className="py-3 font-medium">STATUS</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const blocked = blockedEmails.some((email) => email.toLowerCase() === row.email.toLowerCase());
              const history = orders.filter((order) => order.email.toLowerCase() === row.email.toLowerCase());
              return (
                <tr key={row.email} className="border-b border-[#efeae2] align-top">
                  <td className="px-5 py-3">
                    {row.name}
                    {open === row.email && (
                      <ul className="mt-2 space-y-1 text-[#6d6960]">
                        {history.map((order) => (
                          <li key={order.id}>
                            <Link href={`/admin/orders/${order.id}`}>{orderCode(order.number)}</Link> · {order.status}
                          </li>
                        ))}
                        <li>
                          <button className="text-[#ab6446]" onClick={() => void setBlocked(row.email, !blocked)}>
                            {blocked ? "Unblock" : "Block"}
                          </button>
                        </li>
                      </ul>
                    )}
                  </td>
                  <td className="py-3 text-[#6d6960]">{row.email}</td>
                  <td className="py-3">{row.count}</td>
                  <td className="py-3">{formatINR(row.spent)}</td>
                  <td className="py-3">{row.last ? shortDate(row.last) : "—"}</td>
                  <td className="py-3">
                    <StatusPill status={blocked ? "Blocked" : "Active"} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-[#ab6446]" onClick={() => setOpen(open === row.email ? null : row.email)}>
                      View →
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        <Showing shown={rows.length} total={everyone} noun="customers" />
      </div>
    </div>
  );
}
