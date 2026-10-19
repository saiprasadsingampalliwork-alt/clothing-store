"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useReveal() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0 },
    );

    function watch(el: Element) {
      if (!(el instanceof HTMLElement) || !el.classList.contains("reveal") || el.classList.contains("in") || seen.has(el)) return;
      seen.add(el);
      if (reduced) {
        el.classList.add("in");
        return;
      }
      io.observe(el);
    }

    function scan(root: ParentNode) {
      if (root instanceof HTMLElement) watch(root);
      root.querySelectorAll(".reveal").forEach(watch);
    }

    scan(document.body);

    const mo = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) scan(node);
        });
      });
    });

    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
}
