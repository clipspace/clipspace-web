"use client";

import { useEffect, useRef, useState } from "react";
import PalSvg from "./PalSvg";

// Desktop-only scroll guide, scrollytelling style.
//
// The pal follows a hand-authored PATH: each section has a waypoint — a side
// (which gutter he parks in) and a height (where on the screen he stands) —
// plus a little pool of lines he cycles through.
//
// The trick that keeps him off the content: he stays parked in his gutter for
// almost the whole section, and only crosses to the other side during the
// brief window when the gap BETWEEN two sections is at the middle of the
// screen — i.e. he steps across through empty whitespace, never over text or
// buttons. Stop scrolling anywhere and he settles in a gutter, never mid-page.
// (Placeholder lines — the user will replace them.)
const STOPS = [
  {
    id: "hero",
    side: "left" as const,
    y: 0.5,
    lines: [
      "hey — i'm the paperclip. i hold this whole thing together.",
      "it looks like you're trying to leave big tech. want a hand?",
      "one clip, zero data harvested. good start, right?",
    ],
  },
  {
    id: "features",
    side: "right" as const,
    y: 0.42,
    lines: [
      "no ads, no tracking, no catch. all of it, yours.",
      "encrypted on your phone, unreadable everywhere else.",
      "no phone number, no real name, no problem.",
    ],
  },
  {
    id: "why",
    side: "left" as const,
    y: 0.54,
    lines: [
      "remember when software was on your side? same.",
      "your feed used to be yours. let's do that again.",
      "90s helpfulness, 2026 cryptography. weird mix, i know.",
    ],
  },
  {
    id: "opensource",
    side: "right" as const,
    y: 0.44,
    lines: [
      "every line is public. read it, fork it, trust it.",
      "don't trust us — trust the code. it's all right there.",
      "built in the open, by people who actually use it.",
    ],
  },
  {
    id: "contact",
    side: "left" as const,
    y: 0.5,
    lines: [
      "that's the tour. built with a paperclip and stubbornness.",
      "stick around. or self-host. or both. i'm easy.",
      "made with one clip and a grudge against ads.",
    ],
  },
];

const CONTENT_W = 1152; // max-w-6xl — the pal lives in the gutter beside it
const GAP = 12; // clearance between the pal and the content column
const EDGE = 8; // clearance from the screen edge
const smooth = (u: number) => u * u * (3 - 2 * u);

export default function ScrollPal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const palRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(STOPS[0].lines[0]);
  const [bubbleRight, setBubbleRight] = useState(STOPS[0].side === "left");
  const [bubbleOn, setBubbleOn] = useState(true);
  const [typing, setTyping] = useState(true);
  const [arrivalId, setArrivalId] = useState(0);
  const [walking, setWalking] = useState(false);
  const [palW, setPalW] = useState(88);

  const target = useRef({ x: 40, y: 0 });
  const cur = useRef({ x: 40, y: 0, lean: 0, facing: 1 as 1 | -1 });
  const palWRef = useRef(88);
  const nearRef = useRef(STOPS[0]);
  // first arrival at each stop shows lines[0]; each later visit advances
  const lineIdx = useRef<Record<string, number>>({});

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // width of the empty margin on each side of the centered content box
    const gutter = () => Math.max(0, (window.innerWidth - CONTENT_W) / 2);

    const sizePal = () => {
      // as big as the gutter can hold, within a sensible range
      const room = gutter() - GAP - EDGE;
      const w = Math.max(46, Math.min(92, Math.floor(room)));
      if (w !== palWRef.current) {
        palWRef.current = w;
        setPalW(w);
      }
    };

    // park just outside the content box: his content-facing edge stops a
    // GAP short of it, so text and buttons are never covered
    const parkLeft = () => Math.max(EDGE, gutter() - GAP - palWRef.current);
    const parkRight = () =>
      Math.min(
        window.innerWidth - EDGE - palWRef.current,
        window.innerWidth - gutter() + GAP,
      );
    const stopX = (s: (typeof STOPS)[number]) =>
      s.side === "left" ? parkLeft() : parkRight();

    const computeTarget = () => {
      sizePal();
      const h = window.innerHeight;
      const vc = h / 2;
      const pts: {
        center: number;
        bottom: number;
        stop: (typeof STOPS)[number];
      }[] = [];
      for (const s of STOPS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        pts.push({ center: r.top + r.height / 2, bottom: r.bottom, stop: s });
      }
      if (pts.length === 0) return;

      let near = pts[pts.length - 1].stop;
      let x = stopX(near);
      let y = (near.y - 0.5) * h;
      // the footer can never reach the viewport center, so treat "scrolled
      // to the bottom" as arriving at the last stop
      const atBottom =
        h + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom || vc <= pts[0].center) {
        near = atBottom ? pts[pts.length - 1].stop : pts[0].stop;
        x = stopX(near);
        y = (near.y - 0.5) * h;
      } else {
        for (let i = 0; i < pts.length - 1; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          if (vc >= a.center && vc <= b.center) {
            const t = (vc - a.center) / Math.max(b.center - a.center, 1);
            near = t < 0.5 ? a.stop : b.stop;

            const ax = stopX(a.stop);
            const bx = stopX(b.stop);
            const ay = (a.stop.y - 0.5) * h;
            const by = (b.stop.y - 0.5) * h;

            // where the gap between these two sections currently sits, as a
            // fraction of the way from stop A to stop B
            const tb = Math.min(
              0.85,
              Math.max(0.15, (a.bottom - a.center) / (b.center - a.center)),
            );
            // horizontal cross: pinned to A's side, then a quick step to B's
            // side right as that gap passes the middle of the screen
            const W = 0.16;
            const hp = smooth(
              Math.min(1, Math.max(0, (t - (tb - W)) / (2 * W))),
            );
            x = ax + (bx - ax) * hp;

            // sit at his gutter height, but during the step pull toward the
            // section gap (whitespace) so he crosses through empty space
            const gapY = a.bottom - vc; // gap offset from screen center
            const yStop = ay + (by - ay) * t;
            const pull = Math.sin(hp * Math.PI);
            y = yStop + (gapY - yStop) * pull - pull * 8; // tiny hop on top
            break;
          }
        }
      }
      target.current = { x, y };
      nearRef.current = near;
      setBubbleRight(near.side === "left");
    };

    let raf = 0;
    let wasWalking = true; // start "walking" so the first idle frame counts as an arrival
    let typeTimer: ReturnType<typeof setTimeout> | undefined;

    const loop = () => {
      const c = cur.current;
      const dx = target.current.x - c.x;
      // gentle ease with a speed cap so crossing the screen reads as a
      // stroll, never a teleport
      let step = dx * 0.08;
      const MAX = 7;
      if (step > MAX) step = MAX;
      if (step < -MAX) step = -MAX;
      if (Math.abs(dx) > 0.4) c.x += step;
      c.y += (target.current.y - c.y) * 0.1;

      // lean into the stride, straighten out when idle
      const leanTarget = Math.max(-9, Math.min(9, step * 1.6));
      c.lean += (leanTarget - c.lean) * 0.12;
      if (Math.abs(step) > 0.6) c.facing = step > 0 ? 1 : -1;

      const isWalking = Math.abs(step) > 0.45;
      if (isWalking !== wasWalking) {
        wasWalking = isWalking;
        setWalking(isWalking);
        clearTimeout(typeTimer);
        if (isWalking) {
          // he sets off — put the bubble away until he arrives
          setBubbleOn(false);
        } else {
          // arrived: pick the next line from this stop's pool, type it out,
          // then hold it until he leaves again
          const s = nearRef.current;
          const i = lineIdx.current[s.id] ?? 0;
          setLine(s.lines[i % s.lines.length]);
          lineIdx.current[s.id] = i + 1;
          setBubbleOn(true);
          setTyping(true);
          setArrivalId((n) => n + 1);
          typeTimer = setTimeout(() => setTyping(false), 850);
        }
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
      clearTimeout(typeTimer);
      window.removeEventListener("scroll", computeTarget);
      window.removeEventListener("resize", computeTarget);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed left-0 top-1/2 z-40 hidden xl:block"
      style={{ transform: "translate(40px, -50%)" }}
      aria-hidden
    >
      <div className="relative">
        {/* sits up by his head; types on arrival (key remount), then holds
            the line until he walks off to the next stop */}
        <div
          className="absolute -translate-y-1/2"
          style={{
            top: "calc(50% - 72px)",
            ...(bubbleRight ? { left: palW + 14 } : { right: palW + 14 }),
          }}
        >
          <div
            key={arrivalId}
            className={`${bubbleOn ? "pal-say" : "pal-bubble-hide"} w-max max-w-[260px] rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm leading-relaxed text-cream shadow-lg ${
              bubbleRight ? "origin-bottom-left rounded-bl-md" : "origin-bottom-right rounded-br-md"
            }`}
          >
            {typing ? (
              <span className="flex items-center gap-1 py-1.5">
                <span className="dot-blink inline-block h-1.5 w-1.5 rounded-full bg-muted" />
                <span className="dot-blink-2 inline-block h-1.5 w-1.5 rounded-full bg-muted" />
                <span className="dot-blink-3 inline-block h-1.5 w-1.5 rounded-full bg-muted" />
              </span>
            ) : (
              line
            )}
          </div>
        </div>
        <div ref={palRef}>
          <div className={walking ? "pal-walk" : "pal-idle"}>
            <PalSvg width={palW} walking={walking} />
          </div>
        </div>
      </div>
    </div>
  );
}
