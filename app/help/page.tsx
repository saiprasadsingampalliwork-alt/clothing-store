"use client";

import Link from "next/link";
import { useState } from "react";

const topics = [
  {
    title: "Shipping",
    href: "/shipping-policy",
    body: "Free standard delivery over ₹1,999. Express is ₹149. We check your PIN code before you pay.",
  },
  {
    title: "Returns",
    href: "/returns-policy",
    body: "7 days from delivery. Refund to the original method, or an exchange. We arrange pickup.",
  },
  {
    title: "Payments",
    href: "/help",
    body: "UPI, cards, net banking, and cash on delivery. COD has a ₹40 fee and a ₹10,000 limit.",
  },
];

const faqs = [
  { q: "When will my order arrive?", a: "Standard delivery is 3–5 days. Express is 1–2 days, after the courier picks up." },
  { q: "Can I pay cash on delivery?", a: "Yes, on orders up to ₹10,000. A ₹40 fee is added at checkout before you place the order." },
  { q: "How do I return something?", a: "Open the order after it is delivered and choose return or exchange. You have 7 days. We arrange the pickup." },
  { q: "Will you text me?", a: "Yes. At checkout you can choose SMS or WhatsApp. The messages are short, and only about that order." },
  { q: "How should it fit?", a: "Each piece says whether it fits true to size, and the size guide is in centimetres. Reviews include the height and size the person wore." },
  { q: "Do prices include GST?", a: "Yes. The invoice splits CGST and SGST for Karnataka, and IGST for other states." },
];

export default function HelpPage() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="serif text-4xl">Help centre</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {topics.map((topic) => (
          <Link key={topic.title} href={topic.href} className="border border-line bg-paper p-4">
            <p>{topic.title}</p>
            <p className="mt-2 text-sm text-muted">{topic.body}</p>
          </Link>
        ))}
      </div>
      <h2 className="serif mt-12 text-2xl">Questions</h2>
      <div className="mt-4 divide-y divide-line border-y border-line">
        {faqs.map((faq, index) => (
          <div key={faq.q}>
            <button className="flex w-full items-center justify-between py-4 text-left text-sm" onClick={() => setOpen(open === index ? null : index)}>
              {faq.q}
              <span>{open === index ? "–" : "+"}</span>
            </button>
            {open === index && <p className="pb-4 text-sm text-muted">{faq.a}</p>}
          </div>
        ))}
      </div>
      <Link href="/contact" className="mt-8 inline-flex h-12 items-center border border-ink px-5 text-xs tracking-[0.14em]">
        CONTACT US
      </Link>
    </div>
  );
}
