"use client";

import { useEffect, useState } from "react";

const frames = [
  {
    src: "/photos/hero-chair.jpg",
    alt: "Olive linen shirt on a wooden chair, with a folded clay tee, in morning light",
  },
  {
    src: "/photos/trouser-rail.jpg",
    alt: "Terracotta, sand, and olive trousers hanging from a wooden rail",
  },
  {
    src: "/photos/stack.jpg",
    alt: "A clay shirt, a moss knit, and terracotta trousers folded on linen",
  },
];

export function HeroCarousel() {
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
  }, [paused]);

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
    </div>
  );
}
