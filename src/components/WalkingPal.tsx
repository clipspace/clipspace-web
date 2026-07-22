"use client";

import { useEffect, useRef, useState } from "react";
import PalSvg from "./PalSvg";

// The clip pal, out for a walk along the bottom of the page. He hops on his
// one leg, turns around at the edges, blinks, and every so often stops to
// share a fun fact.
const FACTS = [
  "During WWII, Norwegians wore paperclips as a quiet sign of resistance.",
  "Unbent, a standard paperclip is about 10 cm of wire.",
  "The 'Gem' paperclip you know was never actually patented.",
  "End-to-end encrypted means the server only ever sees noise.",
  "Your keys never leave your device. Not even we can peek.",
  "A paperclip holds things together. So does good encryption.",
  "Clippy walked so I could hop.",
  "Fun fact: I have exactly one leg and zero regrets.",
  "No ad has ever been shown in this chat. Ever.",
];

export default function WalkingPal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [fact, setFact] = useState<string | null>(null);

  const x = useRef(24);
  const dir = useRef<1 | -1>(1);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now();
    const speed = 0.028; // px per ms

    const edge = () => window.innerWidth - 64;
    const step = (t: number) => {
      const dt = Math.min(t - last, 50);
      last = t;
      if (!paused.current) {
        x.current += dir.current * speed * dt;
        if (x.current >= edge()) {
          x.current = edge();
          dir.current = -1;
          setFacing(-1);
        } else if (x.current <= 16) {
          x.current = 16;
          dir.current = 1;
          setFacing(1);
        }
        if (wrapRef.current) {
          wrapRef.current.style.transform = `translateX(${x.current}px)`;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // every so often, stop and share a fact
    let factTimeout: ReturnType<typeof setTimeout>;
    const scheduleFact = () => {
      factTimeout = setTimeout(() => {
        setFact(FACTS[Math.floor(Math.random() * FACTS.length)]);
        paused.current = true;
        setTimeout(() => {
          setFact(null);
          paused.current = false;
          scheduleFact();
        }, 5200);
      }, 9000 + Math.random() * 6000);
    };
    scheduleFact();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(factTimeout);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed bottom-1 left-0 z-40 block xl:hidden"
      style={{ transform: "translateX(24px)" }}
      aria-hidden
    >
      {fact ? (
        <div className="pal-say absolute bottom-[84px] left-6 w-max max-w-[240px] origin-bottom-left rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2 text-xs leading-relaxed text-cream shadow-lg">
          {fact}
        </div>
      ) : null}
      <div style={{ transform: `scaleX(${facing})` }}>
        <div className={fact ? "pal-idle" : "pal-hop"}>
          <PalSvg width={48} walking={!fact} />
        </div>
      </div>
    </div>
  );
}
