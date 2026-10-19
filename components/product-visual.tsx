"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import * as React from "react";
import type { ProductPhoto } from "@/lib/catalog";
import { STUDIO_VIEWS, studioSrc, type Silhouette, type StudioView } from "@/lib/studio";

const ViewTransition = (
  React as unknown as {
    unstable_ViewTransition?: ComponentType<{ name?: string; update?: string; children?: ReactNode }>;
  }
).unstable_ViewTransition;

function ShotImage({ src, alt, tone }: { src: string; alt: string; tone: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [sharp, setSharp] = useState(false);

  useEffect(() => {
    setSharp(false);
    const image = ref.current;
    if (image?.complete && image.naturalWidth > 0) setSharp(true);
  }, [src]);

  return (
    <>
      <div className="shot-blur" style={{ background: tone }} />
      {!sharp && <div className="shimmer" />}
      <img
        ref={ref}
        src={src}
        alt={alt}
        width={800}
        height={1000}
        draggable={false}
        onLoad={() => setSharp(true)}
        className={`shot-img${sharp ? " is-sharp" : ""}`}
      />
    </>
  );
}

export function ProductVisual({
  slug,
  name,
  hex,
  colorName,
  silhouette,
  photos,
  stage = false,
  transitionName,
}: {
  slug: string;
  name: string;
  hex: string;
  colorName: string;
  silhouette: Silhouette;
  photos?: ProductPhoto[];
  stage?: boolean;
  transitionName?: string;
}) {
  const photographed = Boolean(photos?.length);
  const frames: ProductPhoto[] = photographed
    ? photos!
    : STUDIO_VIEWS.map((entry) => ({
        id: entry.id,
        label: entry.label,
        src: studioSrc(entry.id, hex, silhouette),
        alt: `${name} in ${colorName}, ${entry.label.toLowerCase()}`,
      }));
  const [view, setView] = useState(frames[0].id);
  const [shown, setShown] = useState(photographed ? frames[0].id : `${frames[0].id}|${hex}`);
  const [incoming, setIncoming] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [reduce, setReduce] = useState(false);
  const active = frames.some((frame) => frame.id === view) ? view : frames[0].id;
  const token = photographed ? active : `${active}|${hex}`;

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (!stage || token === shown) return;
    setIncoming(token);
    const timer = window.setTimeout(() => {
      setShown(token);
      setIncoming(null);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [token, shown, stage]);

  function plate(tokenValue: string, quiet = false) {
    const [viewId, color] = tokenValue.split("|");
    const frame = frames.find((entry) => entry.id === viewId) ?? frames[0];
    const src = photographed ? frame.src : studioSrc((viewId || frame.id) as StudioView, color || hex, silhouette);
    const alt = quiet ? "" : photographed ? frame.alt : `${name} in ${colorName}, ${frame.label.toLowerCase()}`;
    return <ShotImage src={src} alt={alt} tone={hex} />;
  }

  const frame = stage ? (
    <div className="shot aspect-[4/5]">
      <div className={`absolute inset-0 ${playing ? "cloth-sway" : ""}`} onAnimationEnd={() => setPlaying(false)}>
        {plate(shown)}
        {incoming && <div className="shot-in absolute inset-0">{plate(incoming, true)}</div>}
      </div>
    </div>
  ) : (
    <div className="shot aspect-[4/5]">
      <div className="shot-row md:hidden">
        {frames.map((entry) => (
          <div key={entry.id} className="shot-slide">
            <ShotImage src={entry.src} alt={entry.alt} tone={hex} />
          </div>
        ))}
      </div>
      <div className="absolute inset-0 hidden md:block">
        <ShotImage src={frames[0].src} alt={frames[0].alt} tone={hex} />
        {frames[1] && (
          <div className="shot-detail absolute inset-0">
            <ShotImage src={frames[1].src} alt="" tone={hex} />
          </div>
        )}
      </div>
    </div>
  );

  const transition = transitionName ?? `product-${slug}`;
  const picture = !ViewTransition ? (
    <div style={{ viewTransitionName: transition }}>{frame}</div>
  ) : (
    <ViewTransition name={transition} update="none">
      {frame}
    </ViewTransition>
  );

  if (!stage) return picture;

  return (
    <div>
      {picture}
      {frames.length > 1 && (
        <div className="mt-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(frames.length, 4)}, minmax(0, 1fr))` }}>
          {frames.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={active === entry.id}
              onClick={() => setView(entry.id)}
              className={`text-left ${active === entry.id ? "outline outline-1 outline-ink" : ""}`}
            >
              <span className="shot block aspect-[4/5]">
                <ShotImage src={entry.src} alt="" tone={hex} />
              </span>
              <span className="mt-1 block text-xs text-muted">{entry.label}</span>
            </button>
          ))}
        </div>
      )}
      {active === frames[0].id && !reduce && (
        <button type="button" className="mt-3 text-sm underline" onClick={() => setPlaying(true)}>
          {playing ? "Playing" : "Play 6 seconds, no sound"}
        </button>
      )}
    </div>
  );
}
