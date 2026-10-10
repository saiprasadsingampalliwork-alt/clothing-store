"use client";

import Link from "next/link";
import { RecentShelf } from "@/components/recent-shelf";
import { getProduct } from "@/lib/catalog";
import { formatINR } from "@/lib/money";
import { useStore } from "@/lib/store";

export default function AccountHome() {
  const { user, orders, wishlist, alerts } = useStore();
  if (!user) return null;
  const mine = orders.filter((order) => order.email.toLowerCase() === user.email.toLowerCase());
  return (
    <div>
      <h1 className="serif text-4xl">Your account</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card href="/account/orders" label="Orders" value={String(mine.length)} />
        <Card href="/wishlist" label="Wishlist" value={String(wishlist.length)} />
        <Card href="/account/profile" label="Addresses" value={String(user.addresses.length)} />
      </div>
      {mine[0] && (
        <div className="mt-8">
          <h2 className="text-sm">Latest order</h2>
          <Link href={`/order/${mine[0].id}`} className="mt-2 block border border-line p-4 text-sm">
            {mine[0].number} · {mine[0].status} · {formatINR(mine[0].total)}
          </Link>
        </div>
      )}
      {alerts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm">Waiting to come back</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {alerts.map((alert) => (
              <li key={`${alert.slug}-${alert.color}-${alert.size}`}>
                {getProduct(alert.slug)?.name ?? alert.slug} · {alert.color} · {alert.size} · {alert.contact}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4">
        <RecentShelf plain />
      </div>
    </div>
  );
}

function Card({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <Link href={href} className="border border-line bg-paper p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="serif mt-1 text-3xl">{value}</p>
    </Link>
  );
}
