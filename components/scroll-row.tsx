"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A row of cards that scrolls sideways when it overflows, and shows it: arrows, a soft fade on the hidden
 * edge, and a thin progress line (the scrollbar itself is hidden). With `centered`, cards that fit sit in the
 * middle; once they overflow, the row scrolls from the first card.
 *
 * With a `heading`, the arrows sit beside it; without one they float at the row's sides.
 */
export function ScrollRow({
  label,
  heading,
  headingId,
  action,
  centered = false,
  cards = "wide",
  children,
}: {
  /** What the row holds, for screen readers ("Categories"). */
  label: string;
  heading?: ReactNode;
  headingId?: string;
  action?: ReactNode;
  centered?: boolean;
  /** "wide": four across on desktop. "compact": fixed, smaller cards. */
  cards?: "wide" | "compact";
  children: ReactNode;
}) {
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
    // Cards can be added after the first render (data arriving); measure again when they change.
    const mutations = new MutationObserver(measure);
    mutations.observe(row, { childList: true });
    return () => {
      row.removeEventListener("scroll", measure);
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  function page(direction: -1 | 1) {
    const row = rowRef.current;
    if (!row) return;
    const card = row.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(row).columnGap || "0");
    // Move by the cards that fit, so the next set lines up.
    const step = card ? Math.max(card.offsetWidth + gap, Math.floor(row.clientWidth / (card.offsetWidth + gap)) * (card.offsetWidth + gap)) : row.clientWidth;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollBy({ left: direction * step, behavior: smooth ? "smooth" : "auto" });
  }

  const arrows = (floating: boolean) =>
    view.overflow && (
      <>
        <RowArrow direction={-1} disabled={view.atStart} onClick={() => page(-1)} floating={floating} label={label} />
        <RowArrow direction={1} disabled={view.atEnd} onClick={() => page(1)} floating={floating} label={label} />
      </>
    );

  return (
    <div>
      {(heading || action) && (
        <div className="flex items-end justify-between gap-4">
          {heading && (
            <h2 id={headingId} className="serif text-3xl">
              {heading}
            </h2>
          )}
          <div className="flex items-center gap-4">
            {action}
            <div className="hidden items-center gap-2 md:flex">{arrows(false)}</div>
          </div>
        </div>
      )}

      <div className={`relative ${heading || action ? "mt-8" : ""}`}>
        <div
          ref={rowRef}
          className={`snap-row pb-2 ${centered ? "snap-row-centered" : ""} ${cards === "compact" ? "snap-row-compact" : ""}`}
          role="region"
          aria-label={label}
          tabIndex={0}
        >
          {children}
        </div>
        <div aria-hidden="true" className={`strip-fade strip-fade-left ${view.overflow && !view.atStart ? "on" : ""}`} />
        <div aria-hidden="true" className={`strip-fade strip-fade-right ${view.overflow && !view.atEnd ? "on" : ""}`} />
        {!heading && !action && <div className="pointer-events-none absolute inset-x-0 top-[38%] hidden justify-between px-2 md:flex">{arrows(true)}</div>}
      </div>

      {view.overflow && (
        <div className="strip-track mt-4" aria-hidden="true">
          <span style={{ width: `${Math.max(12, view.visible * 100)}%`, left: `${view.progress * (100 - Math.max(12, view.visible * 100))}%` }} />
        </div>
      )}
    </div>
  );
}

function RowArrow({ direction, disabled, onClick, floating, label }: { direction: -1 | 1; disabled: boolean; onClick: () => void; floating: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction < 0 ? "Previous" : "Next"} ${label.toLowerCase()}`}
      className={`pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-ink text-ink transition-opacity hover:bg-ink hover:text-cream disabled:pointer-events-none ${floating ? "bg-cream/90 shadow-sm disabled:opacity-0" : "disabled:opacity-25"}`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d={direction < 0 ? "M9 2L4 7l5 5" : "M5 2l5 5-5 5"} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
