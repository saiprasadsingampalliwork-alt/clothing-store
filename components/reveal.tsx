"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades its content up the first time it scrolls into view. React owns the `in` class, so the
 * server HTML and the first client render match and hydration stays clean. Give it a new `key`
 * to play the fade again, as the shop grid does when filters change.
 */
export function Reveal({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: 0 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal${shown ? " in" : ""} ${className}`}>
      {children}
    </div>
  );
}
