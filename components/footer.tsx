"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { brand } from "@/lib/brand";
import { shopEntrances } from "@/lib/catalog";
import { phoneHref, siteContent } from "@/lib/site";
import { Icon } from "@/components/icons";
import { useStore } from "@/lib/store";

const audiences = [
  { href: "/shop?gender=women", label: "Women" },
  { href: "/shop?gender=men", label: "Men" },
  { href: "/shop?gender=unisex", label: "Unisex" },
];

const help = [
  { href: "/help", label: "Help centre" },
  { href: "/shipping-policy", label: "Shipping" },
  { href: "/returns-policy", label: "Returns" },
  { href: "/contact", label: "Contact" },
];

const company = [
  { href: "/about", label: "Our story" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function Footer() {
  const { recent, settings } = useStore();
  const studio = siteContent(settings);
  const shop = [...shopEntrances().map((category) => ({ href: `/shop?category=${category.slug}`, label: category.label })), ...audiences];
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const showList = recent.length > 0;

  function subscribe(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return;
    setJoined(true);
  }

  return (
    <footer>
      {showList && (
        <div className="border-t border-line bg-cream">
          <form onSubmit={subscribe} className="mx-auto max-w-6xl px-4 py-12 md:grid md:grid-cols-2 md:items-end md:gap-16 md:px-6">
            <div>
              <h2 className="serif text-3xl">Join the Earthen list</h2>
              <p className="mt-2 text-sm leading-6 text-muted">New pieces and restocks, and 10% off your first order. No other mail.</p>
            </div>
            {joined ? (
              <p className="mt-6 text-sm md:mt-0">You are on the list. Use WELCOME10 at checkout.</p>
            ) : (
              <div className="mt-6 flex gap-2 md:mt-0">
                <label className="sr-only" htmlFor="list-email">
                  Email address
                </label>
                <input
                  id="list-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 min-w-0 flex-1 border border-line bg-paper px-3 outline-none"
                />
                <button className="h-12 shrink-0 bg-ink px-5 text-xs tracking-[0.16em] text-cream">SUBSCRIBE</button>
              </div>
            )}
          </form>
        </div>
      )}
      <div className="bg-footer text-cream">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
          <p className="text-lg tracking-[0.28em]">EARTHEN</p>
          <p className="mt-2 max-w-xs text-sm leading-6 text-cream/70">Quiet clothes, cut in small runs.</p>
          <div className="mt-8 md:grid md:grid-cols-3 md:gap-10">
            <FooterGroup title="Shop" links={shop} />
            <FooterGroup title="Help" links={help} />
            <FooterGroup title="Company" links={company} />
          </div>
          <p className="mt-10 text-xs leading-5 text-cream/60">
            {studio.legalName}
            <span className="mx-2">·</span>
            {studio.address}
          </p>
          <p className="mt-1 text-xs leading-5 text-cream/60">
            GSTIN {settings.gstin || brand.gstin}
            <span className="mx-2">·</span>
            <a href={phoneHref(studio.phone)} className="inline-flex items-center gap-1 underline-offset-2 hover:text-cream">
              <Icon name="phone" className="h-3.5 w-3.5" />
              {studio.phone}
            </a>
            <span className="mx-2">·</span>
            <a href={`mailto:${studio.email}`} className="inline-flex items-center gap-1 hover:text-cream">
              <Icon name="mail" className="h-3.5 w-3.5" />
              {studio.email}
            </a>
          </p>
          <p className="mt-3 text-xs tracking-[0.14em] text-cream/50">UPI · VISA · MASTERCARD · RUPAY</p>
          <p className="mt-3 text-xs text-cream/50">© {new Date().getFullYear()} Earthen. Prices in INR, inclusive of GST. {brand.delivery}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-white/15 py-1 md:border-0">
      <button
        className="flex h-12 w-full items-center justify-between text-left text-sm md:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        {title}
        <span>{open ? "–" : "+"}</span>
      </button>
      <p className="mb-3 hidden text-sm md:block">{title}</p>
      <ul className={`${open ? "block" : "hidden"} pb-3 md:block`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="block py-1.5 text-sm text-cream/75 hover:text-cream">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
