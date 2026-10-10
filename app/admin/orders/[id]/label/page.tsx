"use client";

import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";

export default function LabelPage() {
  const { id } = useParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find((entry) => entry.id === id);
  if (!order) return <p className="p-8">Order not found.</p>;
  return (
    <div className="mx-auto max-w-md p-8">
      <p className="tracking-[0.28em]">EARTHEN</p>
      <h1 className="serif mt-4 text-3xl">Shipping label</h1>
      <p className="mt-2 text-sm">{order.number}</p>
      <p className="mt-6 text-sm">
        {order.address.name}
        <br />
        {order.address.line1}
        {order.address.line2 ? `, ${order.address.line2}` : ""}
        <br />
        {order.address.city}, {order.address.state} {order.address.pin}
        <br />
        {order.address.phone}
      </p>
      <p className="mt-6 font-mono text-lg tracking-[0.3em]">{order.shipment?.tracking || "AWAITING TRACKING"}</p>
      <p className="mt-1 text-sm text-muted">{order.shipment?.courier || "Courier not assigned"}</p>
      <button onClick={() => window.print()} className="mt-8 h-11 border border-ink px-4 text-xs tracking-[0.14em] print:hidden">
        PRINT
      </button>
    </div>
  );
}
