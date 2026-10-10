"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { OrderDetail } from "@/components/order-detail";
import { useStore } from "@/lib/store";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const { orders, ready } = useStore();
  const order = orders.find((entry) => entry.id === id);
  if (!ready) return null;
  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="serif text-4xl">Order not found</h1>
        <Link href="/account/orders" className="mt-4 inline-block text-sm underline">
          View your orders
        </Link>
      </div>
    );
  }
  return <OrderDetail order={order} confirmation />;
}
