"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useStore, type Address } from "@/lib/store";

const reasons = ["Size or fit", "Changed my mind", "Item damaged", "Not as described", "Wrong item sent"];

export default function ReturnPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { orders, requestReturn, ready } = useStore();
  const order = orders.find((entry) => entry.id === id);
  const [reason, setReason] = useState(reasons[0]);
  const [comments, setComments] = useState("");
  const [resolution, setResolution] = useState<"refund" | "exchange">("refund");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (!ready) return null;
  if (!order) return <p className="px-4 py-16">Order not found.</p>;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!order) return;
    const pickup: Address = { ...order.address, id: `pickup-${Date.now()}`, label: "Pickup" };
    const message = await requestReturn(order.id, {
      reason,
      comments,
      resolution,
      pickup,
      status: "Awaiting review",
    });
    if (message) {
      setError(message);
      return;
    }
    setSent(true);
    window.setTimeout(() => router.push(`/order/${order.id}`), 700);
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl px-4 py-8 md:px-6">
      <h1 className="serif text-4xl">Return or exchange</h1>
      <p className="mt-2 text-sm text-muted">
        {order.number} · Requests are accepted within 7 days of delivery. We arrange the pickup.
      </p>
      <label className="mt-6 block text-sm">
        Reason
        <select value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 h-12 w-full border border-line bg-paper px-3">
          {reasons.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="mt-4 block text-sm">
        Comments
        <textarea value={comments} onChange={(event) => setComments(event.target.value)} className="mt-1 min-h-28 w-full border border-line bg-paper p-3 outline-none" />
      </label>
      <fieldset className="mt-4">
        <legend className="text-sm">Resolution</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {(["refund", "exchange"] as const).map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setResolution(option)}
              className={`h-12 border capitalize ${resolution === option ? "border-ink bg-paper" : "border-line"}`}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>
      <p className="mt-4 text-sm text-muted">
        Pickup from {order.address.line1}, {order.address.city} {order.address.pin}
      </p>
      {error && <p className="mt-3 text-sm">{error}</p>}
      <button disabled={sent} className={`motion-btn relative mt-6 h-12 w-full bg-ink text-xs tracking-[0.16em] text-cream ${sent ? "done" : ""}`}>
        <span className="lbl">SUBMIT REQUEST</span>
        <span className="tick" aria-hidden="true">
          ✓
        </span>
      </button>
    </form>
  );
}
