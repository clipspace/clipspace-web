"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Reveals [data-reveal] elements as they scroll into view.
// Adds `reveal-ready` to <html> so nothing is hidden when JS is off,
// and bails out entirely under prefers-reduced-motion.
export default function ScrollReveal() {
  // This lives in the root layout, so a client-side navigation never unmounts
  // it — the pathname is what tells it a new page's elements are on screen.
  // Without it the observer would only ever watch the first page visited:
  // `reveal-ready` stays on <html> for the whole session, so every route
  // reached afterwards would keep its content at opacity 0 forever. That is
  // what left the homepage blank on the way back from /privacy.
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("reveal-ready");
    const els = document.querySelectorAll<HTMLElement>(
      "[data-reveal], [data-reveal-stagger]"
    );

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
  }, [pathname]);

  return null;
}
