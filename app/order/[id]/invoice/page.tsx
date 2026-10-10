"use client";

import { useParams } from "next/navigation";
import { Invoice } from "@/components/order-detail";
import { useStore } from "@/lib/store";

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const { orders, ready } = useStore();
  const order = orders.find((entry) => entry.id === id);
  if (!ready) return null;
  if (!order) return <p className="px-4 py-16">Invoice not found.</p>;
  return <Invoice order={order} />;
}
