"use client";

import { useEffect } from "react";

// Reveals [data-reveal] elements as they scroll into view.
// Adds `reveal-ready` to <html> so nothing is hidden when JS is off,
// and bails out entirely under prefers-reduced-motion.
export default function ScrollReveal() {
  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("reveal-ready");
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
