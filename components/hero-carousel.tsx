"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { salePercent, storeSaleActive } from "@/lib/sale";
import { siteContent } from "@/lib/site";
import { useStore } from "@/lib/store";

export function HeroCarousel() {
  const settings = useStore().settings;
  const frames = siteContent(settings).hero;
  const saleLive = storeSaleActive(settings);
  const saleName = settings.saleName?.trim() || "Sale";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches || paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((current) => (current + 1) % frames.length);
    }, 2000);
    return () => window.clearInterval(id);
  }, [paused, frames.length]);

  return (
    <div
      className="hero-frame relative aspect-[4/5] md:aspect-[5/6]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {frames.map((frame, frameIndex) => (
        <img
          key={frame.src}
          src={frame.src}
          alt={frameIndex === index ? frame.alt : ""}
          width={928}
          height={1152}
          aria-hidden={frameIndex !== index}
          className={`hero-slide hero-drift ${frameIndex === index ? "is-on" : ""}`}
        />
      ))}
      {saleLive && (
        <Link href="/shop" className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 bg-olive px-5 py-4 text-cream">
          <span>
            <span className="eyebrow block text-cream/80">{saleName}</span>
            <span className="serif mt-1 block text-3xl leading-none">{salePercent(settings)}% off</span>
          </span>
          <span className="pb-1 text-xs tracking-[0.16em]">SHOP</span>
        </Link>
      )}
    </div>
  );
}
