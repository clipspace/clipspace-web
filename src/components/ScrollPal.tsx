"use client";

import { useEffect, useRef, useState } from "react";
import PalSvg from "./PalSvg";

// Desktop-only scroll guide, scrollytelling style: the pal's position is a
// smooth function of scroll progress. Between stops he sweeps across the
// screen on a gentle arc (smoothstep easing, so he lingers at stops and
// glides in between), leans into his stride, steps with his leg, and pops a
// fresh speech bubble whenever he has something new to say.
// (Placeholder lines — the user will replace them.)
const STOPS = [
  { id: "hero", pos: 0.05, line: "hey — i'm the paperclip. i hold this whole thing together." },
  { id: "features", pos: 0.93, line: "no ads, no tracking, no catch. all of it, yours." },
  { id: "why", pos: 0.08, line: "remember when software was on your side? same." },
  { id: "opensource", pos: 0.92, line: "every line is public. read it, fork it, trust it." },
  { id: "contact", pos: 0.47, line: "that's the tour. built with a paperclip and stubbornness." },
];

const PAL_W = 88;
const EDGE = 40; // minimum breathing room at either side of the screen

export default function ScrollPal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const palRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(STOPS[0].line);
  const [bubbleRight, setBubbleRight] = useState(STOPS[0].pos <= 0.5);
  const [walking, setWalking] = useState(false);

  const target = useRef({ x: EDGE, y: 0 });
  const cur = useRef({ x: EDGE, y: 0, lean: 0, facing: 1 as 1 | -1 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const posToX = (p: number) =>
      EDGE + p * (window.innerWidth - PAL_W - EDGE * 2);

    const computeTarget = () => {
      const vc = window.innerHeight / 2;
      const pts: { center: number; x: number; stop: (typeof STOPS)[number] }[] = [];
      for (const s of STOPS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        pts.push({ center: r.top + r.height / 2, x: posToX(s.pos), stop: s });
      }
      if (pts.length === 0) return;

      let x = pts[pts.length - 1].x;
      let y = 0;
      let near = pts[pts.length - 1].stop;
      // the footer can never reach the viewport center, so treat "scrolled
      // to the bottom" as arriving at the last stop
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) {
        // settled at the last stop
      } else if (vc <= pts[0].center) {
        x = pts[0].x;
        near = pts[0].stop;
      } else {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          if (vc >= a.center && vc <= b.center) {
            let t = (vc - a.center) / Math.max(b.center - a.center, 1);
            near = t < 0.5 ? a.stop : b.stop;
            t = t * t * (3 - 2 * t); // smoothstep: rest at stops, sweep between
            x = a.x + (b.x - a.x) * t;
            y = -Math.sin(t * Math.PI) * 22; // gentle arc, a little hop between stops
            break;
          }
        }
      }
      target.current = { x, y };
      setLine(near.line);
      setBubbleRight(near.pos <= 0.5);
    };

    let raf = 0;
    let wasWalking = false;

    const loop = () => {
      const c = cur.current;
      const dx = target.current.x - c.x;
      // gentle ease with a speed cap so crossing the screen reads as a
      // stroll, never a teleport
      let step = dx * 0.07;
      const MAX = 6;
      if (step > MAX) step = MAX;
      if (step < -MAX) step = -MAX;
      if (Math.abs(dx) > 0.4) c.x += step;
      c.y += (target.current.y - c.y) * 0.12;

      // lean into the stride, straighten out when idle
      const leanTarget = Math.max(-9, Math.min(9, step * 1.6));
      c.lean += (leanTarget - c.lean) * 0.12;
      if (Math.abs(step) > 0.6) c.facing = step > 0 ? 1 : -1;

      const isWalking = Math.abs(step) > 0.45;
      if (isWalking !== wasWalking) {
        wasWalking = isWalking;
        setWalking(isWalking);
      }

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate(${c.x}px, calc(-50% + ${c.y}px))`;
      }
      if (palRef.current) {
        // rotate first (screen space) so the lean isn't mirrored by the flip
        palRef.current.style.transform = `rotate(${c.lean}deg) scaleX(${c.facing})`;
      }
      raf = requestAnimationFrame(loop);
    };

    computeTarget();
    cur.current.x = target.current.x;
    cur.current.y = target.current.y;
    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", computeTarget, { passive: true });
    window.addEventListener("resize", computeTarget);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", computeTarget);
      window.removeEventListener("resize", computeTarget);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed left-0 top-1/2 z-40 hidden xl:block"
      style={{ transform: `translate(${EDGE}px, -50%)` }}
      aria-hidden
    >
      <div className="relative">
        {/* key={line} remounts the bubble so it pops every time he says
            something new; it always opens toward the middle of the screen */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${
            bubbleRight ? "left-[104px]" : "right-[104px]"
          }`}
        >
          <div
            key={line}
            className={`pal-say w-max max-w-[300px] rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-cream shadow-lg ${
              bubbleRight ? "origin-left rounded-bl-md" : "origin-right rounded-br-md"
            }`}
          >
            {line}
          </div>
        </div>
        <div ref={palRef}>
          <div className={walking ? "pal-walk" : "pal-idle"}>
            <PalSvg width={PAL_W} walking={walking} />
          </div>
        </div>
      </div>
    </div>
  );
}
