"use client";

import { useEffect, useRef, useState } from "react";

// Desktop-only scroll guide: the clip pal stays on screen and glides side to
// side as you scroll, tapping his leg (walk bob) while he moves, blinking,
// and commenting on whichever section you're looking at.
// (Placeholder lines — the user will replace them.)
const STOPS = [
  { id: "hero", side: "left" as const, line: "hey — i'm the paperclip. i hold this whole thing together." },
  { id: "features", side: "right" as const, line: "no ads, no tracking, no catch. all of it, yours." },
  { id: "why", side: "left" as const, line: "remember when software was on your side? same." },
  { id: "opensource", side: "right" as const, line: "every line is public. read it, fork it, trust it." },
  { id: "contact", side: "left" as const, line: "that's the tour. built with a paperclip and stubbornness." },
];

function PalFace({ walking }: { walking: boolean }) {
  return (
    <svg
      width="44"
      height="70"
      viewBox="0 0 50 80"
      fill="none"
      aria-hidden
      className={walking ? "pal-walk" : undefined}
    >
      <g stroke="#D9A441" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 62 L15 14 C15 7 19 3 25 3 C31 3 35 7 35 14 L35 50 C35 55 32 58 28 58 C24 58 21 55 21 50 L21 20" />
        <path d="M15 63 C15 71 20 75 27 75 C35 75 41 71 41 62 L41 54" />
      </g>
      <circle className="pal-eye" cx="22" cy="12" r="2.4" fill="#F2EDE0" />
      <circle className="pal-eye" cx="30" cy="12" r="2.4" fill="#F2EDE0" />
    </svg>
  );
}

export default function ScrollPal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(STOPS[0].line);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);

  const curX = useRef(14);
  const targetX = useRef(14);
  const activeIdx = useRef(-1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const leftX = () => 14;
    const rightX = () => window.innerWidth - 58;

    const pickStop = () => {
      const vc = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      STOPS.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const d = Math.abs(c - vc);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (best !== activeIdx.current) {
        activeIdx.current = best;
        const s = STOPS[best];
        targetX.current = s.side === "left" ? leftX() : rightX();
        setLine(s.line);
      }
    };

    let raf = 0;
    let walkTimer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      pickStop();
      setWalking(true);
      clearTimeout(walkTimer);
      walkTimer = setTimeout(() => setWalking(false), 240);
    };

    const loop = () => {
      const dx = targetX.current - curX.current;
      if (Math.abs(dx) > 0.5) {
        curX.current += dx * 0.12;
        setFacing(dx > 0 ? 1 : -1);
      }
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate(${curX.current}px, -50%)`;
      }
      raf = requestAnimationFrame(loop);
    };

    pickStop();
    curX.current = targetX.current;
    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", pickStop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(walkTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", pickStop);
    };
  }, []);

  // pal faces its walking direction; the bubble sits on the inward side
  const bubbleInwardRight = facing === 1;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed left-0 top-1/2 z-40 hidden xl:block"
      style={{ transform: "translate(14px, -50%)" }}
      aria-hidden
    >
      <div className="relative">
        <div
          className={`absolute top-1/2 w-max max-w-[220px] -translate-y-1/2 rounded-2xl border border-line bg-surface px-3.5 py-2 text-xs leading-relaxed text-cream shadow-lg ${
            bubbleInwardRight ? "left-[52px] rounded-bl-md" : "right-[52px] rounded-br-md"
          }`}
        >
          {line}
        </div>
        <div style={{ transform: `scaleX(${facing})` }}>
          <PalFace walking={walking} />
        </div>
      </div>
    </div>
  );
}
