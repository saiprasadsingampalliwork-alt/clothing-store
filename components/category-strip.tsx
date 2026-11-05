"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categoryPhoto, shopEntrances } from "@/lib/catalog";
import { useStore } from "@/lib/store";

/**
 * "Shop by category": a row that scrolls sideways. Arrows, an edge fade, and a progress line show
 * there is more than fits, since the scrollbar itself is hidden.
 */
export function CategoryStrip() {
  const { overrides } = useStore();
  const categories = shopEntrances();
  const rowRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ overflow: false, atStart: true, atEnd: true, progress: 0, visible: 1 });

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const measure = () => {
      const max = row.scrollWidth - row.clientWidth;
      setView({
        overflow: max > 4,
        atStart: row.scrollLeft <= 4,
        atEnd: row.scrollLeft >= max - 4,
        progress: max > 0 ? row.scrollLeft / max : 0,
        visible: row.scrollWidth ? row.clientWidth / row.scrollWidth : 1,
      });
    };
    measure();
    row.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => {
      row.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [categories.length]);

  function page(direction: -1 | 1) {
    const row = rowRef.current;
    if (!row) return;
    const tile = row.firstElementChild as HTMLElement | null;
    // Move by the tiles that fit, so the next set lines up; respect reduced motion.
    const step = tile ? Math.max(tile.offsetWidth, Math.floor(row.clientWidth / tile.offsetWidth) * (tile.offsetWidth + parseFloat(getComputedStyle(row).columnGap || "0"))) : row.clientWidth;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({ left: direction * step, behavior: smooth ? "smooth" : "auto" });
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:px-6" aria-labelledby="shop-by-category">
      <div className="flex items-end justify-between gap-4">
        <h2 id="shop-by-category" className="serif text-3xl">
          Shop by category
        </h2>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-sm underline-offset-4 hover:underline">
            Shop all
          </Link>
          {view.overflow && (
            <div className="hidden items-center gap-2 md:flex">
              <StripArrow direction={-1} disabled={view.atStart} onClick={() => page(-1)} />
              <StripArrow direction={1} disabled={view.atEnd} onClick={() => page(1)} />
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-8">
        <div ref={rowRef} className="snap-row pb-2" role="region" aria-label="Categories" tabIndex={0}>
          {categories.map((category) => (
            <Link key={category.slug} href={`/shop?category=${category.slug}`}>
              <img src={categoryPhoto(category, overrides).src} alt="" width={800} height={1000} className="aspect-[4/5] w-full bg-[#e7e1d6] object-cover" />
              <p className="mt-3 text-sm">{category.label}</p>
              {category.blurb && <p className="mt-1 text-sm text-muted">{category.blurb}</p>}
            </Link>
          ))}
        </div>
        {/* Soft edges where more tiles are hidden. */}
        <div aria-hidden="true" className={`strip-fade strip-fade-left ${view.overflow && !view.atStart ? "on" : ""}`} />
        <div aria-hidden="true" className={`strip-fade strip-fade-right ${view.overflow && !view.atEnd ? "on" : ""}`} />
      </div>

      {view.overflow && (
        <div className="strip-track mt-4" aria-hidden="true">
          <span style={{ width: `${Math.max(12, view.visible * 100)}%`, left: `${view.progress * (100 - Math.max(12, view.visible * 100))}%` }} />
        </div>
      )}
    </section>
  );
}

function StripArrow({ direction, disabled, onClick }: { direction: -1 | 1; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction < 0 ? "Previous categories" : "Next categories"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-ink text-ink transition-opacity hover:bg-ink hover:text-cream disabled:pointer-events-none disabled:opacity-25"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d={direction < 0 ? "M9 2L4 7l5 5" : "M5 2l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
