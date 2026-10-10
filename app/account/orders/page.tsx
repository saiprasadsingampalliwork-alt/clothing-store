"use client";

import Link from "next/link";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function OrdersPage() {
  const { user, orders } = useStore();
  if (!user) return null;
  const mine = orders.filter((order) => order.email.toLowerCase() === user.email.toLowerCase());

  return (
    <div>
      <h1 className="serif text-4xl">Orders</h1>
      {mine.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No orders yet.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {mine.map((order) => (
            <li key={order.id}>
              <Link href={`/order/${order.id}`} className="flex items-center justify-between gap-4 py-4 text-sm">
                <span>
                  <span className="block">{order.number}</span>
                  <span className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")} · {order.status}
                  </span>
                </span>
                <span>{formatINR(order.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
