"use client";

import Link from "next/link";
import { includedGst, formatINR } from "@/lib/money";
import { brand } from "@/lib/brand";
import { getProduct } from "@/lib/catalog";
import { useStore, type Order } from "@/lib/store";

const steps = ["Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered"];

export function OrderDetail({ order, confirmation = false }: { order: Order; confirmation?: boolean }) {
  const { cancelOrder } = useStore();
  const canCancel = ["Confirmed", "Packed"].includes(order.status);
  const canReturn = order.status === "Delivered";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      {confirmation && (
        <div className="mb-4 text-olive">
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle className="draw-ring" cx="26" cy="26" r="24" />
            <path className="draw-check" d="M16 27.5 23 34.5 37 18.5" />
          </svg>
          <p className="eyebrow mt-3 text-olive">Order placed</p>
        </div>
      )}
      <h1 className="serif mt-2 text-4xl">{confirmation ? "Thank you" : `Order ${order.number}`}</h1>
      <p className="mt-2 text-sm text-muted">
        {order.number} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
      </p>
      <p className="mt-4 text-sm leading-6">
        A receipt will go to {order.email}.
        {order.updates === "whatsapp" ? " We'll WhatsApp " : " We'll text "}
        {order.phone} when it ships.
        Status: <span className="text-ink">{order.status}</span>
      </p>
      <div className="mt-6 border border-line bg-paper p-4 text-sm leading-6">
        <p>Packed in a recycled mailer, with tissue and a card.</p>
        {order.gift?.wrap && <p className="mt-2">This order is gift wrapped.</p>}
        {order.gift?.message && <p className="mt-2">Card: {order.gift.message}</p>}
        {order.gift?.hidePrices && <p className="mt-2">Prices are left off the packing slip. They stay on the invoice.</p>}
        <p className="mt-2 text-muted">Care for each piece is printed with the invoice.</p>
      </div>

      <ol className="mt-8 space-y-3">
        {steps.map((step) => {
          const event = order.timeline.find((entry) => entry.status === step);
          const done = Boolean(event);
          return (
            <li key={step} className="flex gap-3 text-sm">
              <span className={`mt-1 h-2.5 w-2.5 rounded-full ${done ? "bg-olive" : "bg-line"}`} />
              <span>
                <span className={done ? "" : "text-muted"}>{step}</span>
                {event && (
                  <span className="block text-muted">
                    {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ol>
      {order.trackingUrl && order.status !== "Cancelled" && (
        <a href={order.trackingUrl} className="mt-4 inline-block text-sm underline" target="_blank" rel="noreferrer">
          Courier tracking
        </a>
      )}

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.items.map((item) => (
          <li key={`${item.slug}-${item.size}`} className="flex justify-between gap-4 py-4 text-sm">
            <span>
              {item.name}
              <span className="block text-muted">
                {item.color} · Size {item.size} · × {item.quantity}
              </span>
            </span>
            <span>{formatINR(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shipping === 0 ? "Free" : formatINR(order.shipping)}</dd></div>
        <div className="flex justify-between"><dt>Discount</dt><dd>−{formatINR(order.discount)}</dd></div>
        {order.codFee > 0 && <div className="flex justify-between"><dt>COD fee</dt><dd>{formatINR(order.codFee)}</dd></div>}
        <div className="flex justify-between pt-2 text-base"><dt>Total</dt><dd>{formatINR(order.total)}</dd></div>
      </dl>
      <p className="mt-2 text-sm text-muted">
        {labelPayment(order.payment)} · {order.delivery === "express" ? "Express" : "Standard"} delivery to {order.address.city}, {order.address.pin}
      </p>

      {order.returnRequest && (
        <p className="mt-4 border border-line bg-paper p-4 text-sm">
          Return requested · {order.returnRequest.resolution} · {order.returnRequest.status}. Reason: {order.returnRequest.reason}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href={`/order/${order.id}/invoice`} className="flex h-12 items-center justify-center border border-ink px-5 text-xs tracking-[0.14em]">
          DOWNLOAD INVOICE
        </Link>
        {canCancel && (
          <button
            className="h-12 border border-line px-5 text-sm"
            onClick={async () => {
              const message = await cancelOrder(order.id);
              if (message) alert(message);
            }}
          >
            Cancel order
          </button>
        )}
        {canReturn && (
          <Link href={`/order/${order.id}/return`} className="flex h-12 items-center justify-center border border-line px-5 text-sm">
            Return or exchange
          </Link>
        )}
      </div>
      <Link href="/shop" className="mt-8 inline-block text-sm underline">
        Continue shopping
      </Link>
    </div>
  );
}

export function Invoice({ order }: { order: Order }) {
  const lines = order.items.map((item) => {
    const gst = includedGst(item.price);
    return { ...item, ...gst, lineTax: gst.tax * item.quantity, lineTaxable: gst.taxable * item.quantity };
  });
  const sameState = order.address.state === "Karnataka";
  const tax = lines.reduce((sum, line) => sum + line.lineTax, 0);

  return (
    <div className="mx-auto max-w-3xl bg-paper px-6 py-10 print:max-w-none">
      <div className="flex items-start justify-between">
        <div>
          <p className="tracking-[0.28em]">EARTHEN</p>
          <p className="mt-2 text-sm text-muted">{brand.legalName}</p>
          <p className="text-sm text-muted">{brand.address}</p>
          <p className="text-sm text-muted">GSTIN {brand.gstin}</p>
          <p className="text-sm text-muted">{brand.phone}</p>
        </div>
        <div className="text-right text-sm">
          <p>Tax invoice</p>
          <p>{order.number}</p>
          <p>{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
        </div>
      </div>
      <div className="mt-8 text-sm">
        <p>Bill to</p>
        <p className="mt-1">{order.address.name}</p>
        <p>{order.address.line1}, {order.address.line2}</p>
        <p>{order.address.city}, {order.address.state} {order.address.pin}</p>
      </div>
      <table className="mt-8 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="py-2 font-medium">Item</th>
            <th>Taxable</th>
            <th>{sameState ? "CGST + SGST" : "IGST"}</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={`${line.slug}-${line.size}`} className="border-b border-line">
              <td className="py-2">
                {line.name} · {line.color} / {line.size} × {line.quantity}
                {getProduct(line.slug) && (
                  <span className="block text-muted">Care: {getProduct(line.slug)!.care.join(". ")}.</span>
                )}
              </td>
              <td>{formatINR(line.lineTaxable)}</td>
              <td>{formatINR(line.lineTax)}</td>
              <td>{formatINR(line.price * line.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 text-sm text-muted">
        GST included in prices. {sameState ? `CGST ${formatINR(Math.round(tax / 2))} · SGST ${formatINR(tax - Math.round(tax / 2))}` : `IGST ${formatINR(tax)}`}.
      </p>
      <p className="mt-2 text-right text-lg">Total {formatINR(order.total)}</p>
      <button onClick={() => window.print()} className="mt-8 h-11 border border-ink px-4 text-xs tracking-[0.14em] print:hidden">
        PRINT OR SAVE PDF
      </button>
    </div>
  );
}

function labelPayment(payment: Order["payment"]) {
  if (payment === "upi") return "UPI";
  if (payment === "card") return "Card";
  if (payment === "netbanking") return "Net banking";
  return "Cash on delivery";
}
