"use client";

import { FormEvent, useState } from "react";
import { brand } from "@/lib/brand";
import { phoneHref, siteContent } from "@/lib/site";
import { useStore } from "@/lib/store";

export default function ContactPage() {
  const { settings } = useStore();
  const studio = siteContent(settings);
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:px-6">
      <h1 className="serif text-4xl">Contact</h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        {studio.legalName}
        <br />
        {studio.address}
        <br />
        GSTIN {settings.gstin || brand.gstin}
      </p>
      <p className="mt-3 text-sm leading-6">
        <a href={phoneHref(studio.phone)} className="underline">
          {studio.phone}
        </a>
        <span className="mx-2 text-muted">·</span>
        <a href={`mailto:${studio.email}`} className="underline">
          {studio.email}
        </a>
      </p>
      <p className="mt-2 text-sm text-muted">{studio.hours}</p>
      {sent ? (
        <p className="mt-8 text-sm">Message received. We reply within one working day.</p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-3">
          <label className="block text-sm">
            Name
            <input required name="name" className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
          </label>
          <label className="block text-sm">
            Email
            <input required type="email" name="email" className="mt-1 h-12 w-full border border-line bg-paper px-3 outline-none" />
          </label>
          <label className="block text-sm">
            Message
            <textarea required name="message" className="mt-1 min-h-32 w-full border border-line bg-paper p-3 outline-none" />
          </label>
          <button className="h-12 w-full bg-terra text-sm tracking-[0.16em] text-cream">SEND</button>
        </form>
      )}
    </div>
  );
}
