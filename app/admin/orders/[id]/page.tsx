"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { StatusPill, OutlineButton, AdminHeader } from "@/components/admin-shell";
import { orderCode, paymentLabel, placedAt, sku } from "@/lib/admin";
import { formatINR, includedGst } from "@/lib/money";
import { useStore, type OrderStatus } from "@/lib/store";

const statuses: OrderStatus[] = ["Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered", "Cancelled", "Return requested", "Returned"];

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { orders, updateOrder, createShipment } = useStore();
  const order = orders.find((entry) => entry.id === id);
  const [status, setStatus] = useState<OrderStatus>(order?.status && statuses.includes(order.status as OrderStatus) ? (order.status as OrderStatus) : "Confirmed");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [courier, setCourier] = useState(order?.shipment?.courier ?? "Shiprocket");
  const [tracking, setTracking] = useState(order?.shipment?.tracking ?? "");
  const [message, setMessage] = useState<string | null>(null);

  if (!order) return <p>Order not found.</p>;

  const gst = order.items.reduce((sum, item) => sum + includedGst(item.price).tax * item.quantity, 0);

  async function saveStatus(event: FormEvent) {
    event.preventDefault();
    const error = await updateOrder(order!.id, { status });
    setMessage(error ?? "Status updated.");
  }

  async function saveNote(event: FormEvent) {
    event.preventDefault();
    const error = await updateOrder(order!.id, { notes });
    setMessage(error ?? "Note saved.");
  }

  async function ship(event: FormEvent) {
    event.preventDefault();
    const error = await createShipment(order!.id, { courier, tracking });
    setMessage(error ?? "Shipment created.");
    if (!error) setStatus("Shipped");
  }

  return (
    <div>
      <AdminHeader
        title={`Order ${orderCode(order.number)}`}
        actions={
          <>
            <Link href={`/order/${order.id}/invoice`} className="inline-flex h-9 items-center border border-[#2a2925] bg-white px-3 text-[11px] tracking-[0.14em]">
              PRINT INVOICE
            </Link>
            <button form="shipment" className="h-9 bg-[#2a2925] px-3 text-[11px] tracking-[0.14em] text-[#fbf8f4]">
              CREATE SHIPMENT
            </button>
          </>
        }
      />
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/orders" className="text-[#ab6446]">
          ← All orders
        </Link>
        <StatusPill status={order.status} />
        <span className="text-[#6d6960]">Placed {placedAt(order.createdAt)}</span>
      </div>
      {message && <p className="mt-3 text-sm">{message}</p>}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <section className="border border-[#e6dfd4] bg-white p-5">
            <h2 className="text-sm font-medium">Items</h2>
            <ul className="mt-4 divide-y divide-[#efeae2] border-t border-[#e6dfd4] md:hidden">
              {order.items.map((item) => (
                <li key={`${item.slug}-${item.color}-${item.size}`} className="py-3 text-sm">
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="h-8 w-8 shrink-0" style={{ background: item.hex }} />
                      <span className="min-w-0">
                        <span className="block">{item.name}</span>
                        <span className="block text-xs text-[#8a847c]">
                          {item.color} · {item.size} · Qty {item.quantity}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0">{formatINR(item.price * item.quantity)}</span>
                  </span>
                  <span className="mt-1 block text-xs text-[#8a847c]">{sku(item.slug, item.color, item.size)}</span>
                </li>
              ))}
            </ul>
            <div className="hidden md:block">
            <table className="mt-4 w-full text-left text-sm">
              <thead className="text-[11px] tracking-[0.14em] text-[#8a847c]">
                <tr className="border-b border-[#e6dfd4]">
                  <th className="py-2 font-medium">ITEM</th>
                  <th className="font-medium">SKU</th>
                  <th className="font-medium">QTY</th>
                  <th className="font-medium">PRICE</th>
                  <th className="text-right font-medium">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={`${item.slug}-${item.color}-${item.size}`} className="border-b border-[#efeae2]">
                    <td className="py-3">
                      <span className="flex items-center gap-3">
                        <span className="h-8 w-8" style={{ background: item.hex }} />
                        <span>
                          {item.name}
                          <span className="block text-xs text-[#8a847c]">
                            {item.color} · {item.size}
                          </span>
                        </span>
                      </span>
                    </td>
                    <td className="text-[#6d6960]">{sku(item.slug, item.color, item.size)}</td>
                    <td>{item.quantity}</td>
                    <td>{formatINR(item.price)}</td>
                    <td className="text-right">{formatINR(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd></div>
              <div className="flex justify-between"><dt>GST included</dt><dd>{formatINR(gst)}</dd></div>
              <div className="flex justify-between font-medium"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
            </dl>
          </section>
          <section className="border border-[#e6dfd4] bg-white p-5">
            <h2 className="text-sm font-medium">Status history</h2>
            <ol className="mt-4 space-y-3 text-sm">
              {[...order.timeline].reverse().map((event) => (
                <li key={`${event.status}-${event.date}`} className="flex justify-between gap-4">
                  <span>
                    <span className="block text-[#6d6960]">{placedAt(event.date)}</span>
                    {event.status}
                  </span>
                  <span className="text-[#8a847c]">{event.status === "Confirmed" ? "by Customer" : "by Staff"}</span>
                </li>
              ))}
            </ol>
          </section>
          <form onSubmit={saveNote} className="border border-[#e6dfd4] bg-white p-5">
            <h2 className="text-sm font-medium">Internal notes</h2>
            <p className="mt-1 text-xs text-[#8a847c]">Add a note (visible to staff only)</p>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Type a note..." className="mt-3 min-h-20 w-full border border-[#e6dfd4] p-3 text-sm outline-none" />
            <OutlineButton type="submit">SAVE NOTE</OutlineButton>
          </form>
        </div>
        <div className="space-y-4">
          <form onSubmit={saveStatus} className="border border-[#e6dfd4] bg-white p-5">
            <h2 className="text-sm font-medium">Update status</h2>
            <label className="mt-3 block text-sm text-[#6d6960]">
              Order status
              <select value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)} className="mt-1 h-11 w-full border border-[#e6dfd4] bg-white px-2 text-[#2a2925]">
                {statuses.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <button className="mt-4 h-9 bg-[#2a2925] px-3 text-[11px] tracking-[0.14em] text-[#fbf8f4]">UPDATE STATUS</button>
          </form>
          <section className="border border-[#e6dfd4] bg-white p-5 text-sm">
            <h2 className="font-medium">Customer</h2>
            <p className="mt-3">{order.address.name}</p>
            <p className="text-[#6d6960]">{order.email}</p>
            <p className="text-[#6d6960]">Mobile: {order.phone}</p>
          </section>
          <section className="border border-[#e6dfd4] bg-white p-5 text-sm">
            <h2 className="font-medium">Delivery address</h2>
            <p className="mt-3 text-[#6d6960]">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ""}
              <br />
              {order.address.city}, {order.address.state} – {order.address.pin}
            </p>
          </section>
          <section className="border border-[#e6dfd4] bg-white p-5 text-sm">
            <h2 className="font-medium">Payment</h2>
            <dl className="mt-3 space-y-2">
              <div className="flex justify-between"><dt className="text-[#6d6960]">Method</dt><dd>{paymentLabel(order.payment).replace(" · Paid", "")}</dd></div>
              <div className="flex justify-between"><dt className="text-[#6d6960]">Status</dt><dd>{order.payment === "cod" ? "Due" : "Paid"}</dd></div>
              <div className="flex justify-between"><dt className="text-[#6d6960]">Gateway ID</dt><dd className="text-[#6d6960]">{order.razorpayPaymentId || "—"}</dd></div>
            </dl>
          </section>
          <form id="shipment" onSubmit={ship} className="border border-[#e6dfd4] bg-white p-5 text-sm">
            <h2 className="font-medium">Shipment</h2>
            <label className="mt-3 block text-[#6d6960]">
              Courier
              <input value={courier} onChange={(event) => setCourier(event.target.value)} className="mt-1 h-10 w-full border border-[#e6dfd4] px-3 text-[#2a2925] outline-none" />
            </label>
            <label className="mt-3 block text-[#6d6960]">
              AWB
              <input value={tracking} onChange={(event) => setTracking(event.target.value)} required placeholder="Tracking number" className="mt-1 h-10 w-full border border-[#e6dfd4] px-3 text-[#2a2925] outline-none" />
            </label>
            <Link href={`/admin/orders/${order.id}/label`} className="mt-4 inline-flex h-9 items-center border border-[#2a2925] bg-white px-3 text-[11px] tracking-[0.14em]">
              PRINT LABEL
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
