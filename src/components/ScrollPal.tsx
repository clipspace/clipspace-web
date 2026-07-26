"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import PalSvg from "./PalSvg";

// Desktop-only scroll guide, in four moods.
//
// GUIDE (default) — he only ever *targets* a parking spot in a side gutter,
// never a point in between. Whatever the scroll does (anchor clicks,
// scrubbing, stopping mid-way), when he comes to rest he is standing beside
// the content, not on it. The walk between spots is an eased glide in screen
// space, so it reads as a stroll instead of a hop from element to element.
//
// The bubble sits ABOVE his head and grows toward the screen edge, so it
// lives entirely in the gutter and never covers text. It only appears while
// he stands still.
//
// AFK — once the page has been still for a while (no mouse, no keys, no
// scroll) and someone is actually looking at it, he clocks off and goes
// wandering: he strolls to a random spot anywhere on the screen, stops, says
// something to nobody in particular, and moves on. He walks the room in fake
// perspective too — the further back he goes the higher up the screen and
// the smaller he gets, and the shorter his strides look. The first sign of
// life sends him back to his post.
//
// PARKED — he can be grabbed and dragged anywhere, for when he's standing in
// front of something you want to read. He stays where he's dropped until the
// next scroll puts him back on the job.
//
// LEAVING — dragged off a screen edge, or sent away with the × on his
// shoulder: he walks off the nearest edge and is gone until the page reloads.
//
// Shown only on screens ≥1600px, where the gutter is wide enough for him
// and his bubble; below that the static pal in the "why" section takes over.
const STOPS = [
  {
    id: "hero",
    side: "left" as const,
    y: 0.5,
    lines: [
      "hey — i'm clip pal. i hold this whole thing together.",
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
    side: "left" as const,
    y: 0.44,
    lines: [
      "every line is public. read it, fork it, trust it.",
      "don't trust us — trust the code. it's all right there.",
      "built in the open, by people who actually use it.",
    ],
  },
  {
    id: "news",
    side: "right" as const,
    y: 0.46,
    lines: [
      "fresh off the press: android comes first.",
      "that's the tour. built with a paperclip and stubbornness.",
      "news travels fast when there are no algorithms.",
      "stick around. or self-host. or both. i'm easy.",
    ],
  },
];

// what he mutters while wandering an abandoned page
const AFK_LINES = [
  "hello? ...anyone? fine. i'll walk it off.",
  "it looks like you're trying to step away from your computer.",
  "don't mind me. just stretching the one leg i have.",
  "i'll keep an eye on things while you're out.",
  "nobody's reading. this whole screen is mine now.",
  "checked again: still no ads, still no tracking.",
  "so this is what the middle of the page looks like. roomy.",
  "wiggle the mouse and i'll go back to being professional.",
  "i counted the pixels. there are a great many of them.",
  "your clips are still encrypted. i triple-checked.",
  "i'd put the kettle on, but i'm made of wire.",
  "just doing a lap. carry on whenever you're ready.",
];

// ...and what he says about being picked up and put somewhere else
const PARKED_LINES = [
  "here? sure. here is fine.",
  "sorry — was i in the way?",
  "put me down anywhere, i'm not fussy.",
];

const GAP = 12; // clearance between the pal and the content column
const EDGE = 8; // clearance from the screen edge
const IDLE_MS = 12000; // quiet time before he clocks off and wanders
const FAR = 0.82; // how small he gets at the back of the room
const NEAR = 1.28; // ...and how big right up front
const PULL_OFF = 46; // dropped this close to an edge means "off you go"

type Mode = "guide" | "afk" | "parked" | "leaving";

export default function ScrollPal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const palRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(STOPS[0].lines[0]);
  const [leftGutter, setLeftGutter] = useState(true);
  const [bubbleOn, setBubbleOn] = useState(true);
  const [typing, setTyping] = useState(true);
  const [arrivalId, setArrivalId] = useState(0);
  const [walking, setWalking] = useState(false);
  const [held, setHeld] = useState(false);
  const [gone, setGone] = useState(false);
  const [palW, setPalW] = useState(88);
  const [bubbleW, setBubbleW] = useState(240);
  const [bubSize, setBubSize] = useState<{ w: number; h: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: 40, y: 0, s: 1 });
  const cur = useRef({ x: 40, y: 0, s: 1, lean: 0, facing: 1 as 1 | -1 });
  const palWRef = useRef(88);
  const mode = useRef<Mode>("guide");
  const drag = useRef({ on: false, ox: 0, oy: 0 });
  // where he's headed and what he'll say once he gets there — the line is
  // picked when the destination is chosen, not on arrival
  const spot = useRef({ key: STOPS[0].id, line: STOPS[0].lines[0] });
  // first arrival at each stop shows lines[0]; each later visit advances
  const lineIdx = useRef<Record<string, number>>({});
  // handles the pal's own pointer handlers reach into
  const api = useRef<{
    grab: (e: ReactPointerEvent) => void;
    sendAway: () => void;
  } | null>(null);

  // measure the bubble's content so the box itself can smoothly grow from
  // the little typing bubble into the full line (width/height transition)
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setBubSize({ w: el.offsetWidth + 2, h: el.offsetHeight + 2 }); // +2 for the border
  }, [typing, line, bubbleW, palW, arrivalId]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // the content box is 72rem wide and the root font size scales up on big
    // screens, so measure the rem instead of hardcoding pixels
    const contentW = () =>
      72 * parseFloat(getComputedStyle(document.documentElement).fontSize);
    const gutter = () => Math.max(0, (window.innerWidth - contentW()) / 2);
    const palH = () => (palWRef.current * 80) / 50;

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

    // one line per destination: stops rotate through their own lines, the
    // wander and the drop pull from shuffled bags so he doesn't repeat
    const stopLine = (s: (typeof STOPS)[number]) => {
      const i = lineIdx.current[s.id] ?? 0;
      lineIdx.current[s.id] = i + 1;
      return s.lines[i % s.lines.length];
    };
    const bags = new Map<string[], string[]>();
    const fromBag = (src: string[]) => {
      let bag = bags.get(src);
      if (!bag || bag.length === 0) {
        bag = src.slice();
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        bags.set(src, bag);
      }
      return bag.pop() as string;
    };
    const aimAt = (key: string, pickLine: () => string) => {
      if (spot.current.key !== key) spot.current = { key, line: pickLine() };
    };

    // the bubble hangs off whichever of his shoulders has the room. `cx` is
    // the middle of him, `s` how big he currently is
    const aimBubble = (cx: number, s: number) => {
      const w = window.innerWidth;
      const hw = (palWRef.current * s) / 2;
      const toLeft = cx > w / 2;
      setLeftGutter(toLeft);
      const room = (toLeft ? cx + hw : w - cx + hw) - EDGE;
      // it is scaled along with him, so budget in his own units
      setBubbleW(Math.round(Math.max(150, Math.min(260, room / s))));
    };

    const computeTarget = () => {
      sizePal();
      if (mode.current !== "guide") return; // he's off doing something else
      const h = window.innerHeight;
      const vc = h / 2;

      // deterministic: he belongs to whichever section the middle of the
      // screen is inside — the divider between two sections is the exact
      // switch point, the same in both scroll directions, no in-between zone
      let near: (typeof STOPS)[number] | null = null;
      let fallback = STOPS[0];
      let bestD = Infinity;
      for (const s of STOPS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (vc >= r.top && vc <= r.bottom) {
          near = s;
          break;
        }
        // center sits in a gap or past the ends — nearest section edge wins
        const d = Math.min(Math.abs(r.top - vc), Math.abs(r.bottom - vc));
        if (d < bestD) {
          bestD = d;
          fallback = s;
        }
      }
      if (near === null) near = fallback;
      // the footer can never reach the viewport center, so treat "scrolled
      // to the bottom" as arriving at the last stop
      const atBottom =
        h + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) near = STOPS[STOPS.length - 1];

      const stop = near;
      target.current = { x: stopX(stop), y: (stop.y - 0.5) * h, s: 1 };
      aimAt(stop.id, () => stopLine(stop));
      setLeftGutter(stop.side === "left");
      setBubbleW(Math.round(Math.max(150, Math.min(260, gutter() - 20))));
    };

    let raf = 0;
    let wasWalking = false;
    let shownSpot: string | null = null; // destination whose line is showing
    let typeTimer: ReturnType<typeof setTimeout> | undefined;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    let goneTimer: ReturnType<typeof setTimeout> | undefined;
    let nextRoamAt = Infinity; // when he sets off for the next wander spot
    let roamN = 0;

    // pick somewhere new to stand — anywhere on the screen, near or far,
    // far enough away to be worth the walk
    const roam = () => {
      sizePal();
      const pw = palWRef.current;
      const ph = palH();
      const w = window.innerWidth;
      const h = window.innerHeight;

      // depth: 0 is the back of the room, 1 is right up against the glass.
      // further back = higher up the screen and smaller, so walking between
      // depths reads as coming toward you or going away
      const d = Math.random();
      const s = FAR + d * (NEAR - FAR);
      const footY = h * (0.32 + d * 0.6);
      const y = footY - h / 2 - ph / 2;

      // ...and anywhere across the width
      const hw = (pw * s) / 2;
      const minC = EDGE + hw;
      const maxC = Math.max(minC, w - EDGE - hw);
      const from = cur.current.x + pw / 2;
      let cx = minC + Math.random() * (maxC - minC);
      if (Math.abs(cx - from) < w * 0.22) {
        // too close to be a walk — send him across instead of shuffling
        const far = w * (0.3 + Math.random() * 0.4);
        cx = Math.max(minC, Math.min(maxC, from < w / 2 ? from + far : from - far));
      }

      target.current = { x: cx - pw / 2, y, s };
      aimAt(`afk-${++roamN}`, () => fromBag(AFK_LINES));
      nextRoamAt = Infinity; // rescheduled once he arrives and speaks
      aimBubble(cx, s);
    };

    const goAfk = () => {
      if (mode.current === "afk" || mode.current === "leaving") return;
      if (document.hidden) return; // no show without an audience
      mode.current = "afk";
      roam();
    };

    const idleMs = () =>
      // #afk in the url makes the wander easy to see without the wait
      window.location.hash === "#afk" ? 2000 : IDLE_MS;
    const restartIdleClock = () => {
      clearTimeout(idleTimer);
      if (mode.current !== "leaving") idleTimer = setTimeout(goAfk, idleMs());
    };

    // a sign of life: back to the job, and the idle clock starts over
    const wake = () => {
      restartIdleClock();
      if (mode.current === "afk") {
        mode.current = "guide";
        nextRoamAt = Infinity;
        computeTarget();
      }
    };

    // send him off the nearest edge, for good
    const sendAway = () => {
      if (mode.current === "leaving") return;
      mode.current = "leaving";
      clearTimeout(idleTimer);
      clearTimeout(typeTimer);
      setBubbleOn(false);
      const pw = palWRef.current;
      const w = window.innerWidth;
      const off = cur.current.x + pw / 2 < w / 2 ? -pw - 60 : w + 60;
      target.current = { x: off, y: cur.current.y, s: cur.current.s };
      goneTimer = setTimeout(() => setGone(true), 2600);
    };

    // --- being carried ------------------------------------------------
    const onGrab = (e: ReactPointerEvent) => {
      if (mode.current === "leaving") return;
      (e.target as Element).setPointerCapture?.(e.pointerId);
      e.preventDefault();
      mode.current = "parked";
      drag.current = {
        on: true,
        ox: e.clientX - cur.current.x,
        oy: e.clientY - (window.innerHeight / 2 + cur.current.y),
      };
      clearTimeout(typeTimer);
      setBubbleOn(false);
      setHeld(true);
      shownSpot = null;
      nextRoamAt = Infinity;
      clearTimeout(idleTimer);
    };

    const onDragMove = (e: PointerEvent) => {
      if (!drag.current.on) return;
      const c = cur.current;
      const nx = e.clientX - drag.current.ox;
      if (Math.abs(nx - c.x) > 1) c.facing = nx > c.x ? 1 : -1;
      c.x = nx;
      c.y = e.clientY - window.innerHeight / 2 - drag.current.oy;
      target.current = { x: c.x, y: c.y, s: c.s };
    };

    const onDrop = () => {
      if (!drag.current.on) return;
      drag.current.on = false;
      setHeld(false);
      const pw = palWRef.current;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = cur.current.x + pw / 2;
      const cy = h / 2 + cur.current.y;
      // dropped against an edge: he takes the hint and leaves
      if (
        cx < PULL_OFF ||
        cx > w - PULL_OFF ||
        cy < PULL_OFF ||
        cy > h - PULL_OFF
      ) {
        sendAway();
        return;
      }
      // otherwise he stays where he was put, and says so
      aimAt(`parked-${Math.round(cx)}-${Math.round(cy)}`, () =>
        fromBag(PARKED_LINES),
      );
      aimBubble(cx, cur.current.s);
      restartIdleClock();
    };

    // --- the loop -----------------------------------------------------
    const loop = () => {
      const c = cur.current;
      let step = 0;
      let stepY = 0;
      let ds = 0;

      if (!drag.current.on) {
        const dx = target.current.x - c.x;
        // gentle ease with a speed cap so crossing the screen reads as a
        // stroll, never a teleport. distance shortens his stride on screen
        step = dx * 0.11;
        const MAX = 11 * c.s;
        if (step > MAX) step = MAX;
        if (step < -MAX) step = -MAX;
        if (Math.abs(dx) > 0.4) c.x += step;
        // same treatment vertically, so a diagonal stays a walk
        stepY = (target.current.y - c.y) * 0.1;
        const MAXY = 9 * c.s;
        if (stepY > MAXY) stepY = MAXY;
        if (stepY < -MAXY) stepY = -MAXY;
        c.y += stepY;
        // ...and he grows or shrinks as he comes forward or goes back
        ds = (target.current.s - c.s) * 0.08;
        c.s += ds;
      }

      // lean into the stride, straighten out when idle or carried
      const leanTarget = drag.current.on
        ? 0
        : Math.max(-9, Math.min(9, (step / (c.s || 1)) * 1.6));
      c.lean += (leanTarget - c.lean) * 0.12;
      if (Math.abs(step) > 0.6) c.facing = step > 0 ? 1 : -1;

      const isWalking =
        !drag.current.on &&
        (Math.abs(step) > 0.45 || Math.abs(stepY) > 0.7 || Math.abs(ds) > 0.0015);
      if (isWalking !== wasWalking) {
        wasWalking = isWalking;
        setWalking(isWalking);
        if (isWalking) {
          // he sets off — put the bubble away until he arrives
          clearTimeout(typeTimer);
          setBubbleOn(false);
          shownSpot = null;
        }
      }
      // speak whenever he's standing somewhere he hasn't announced yet —
      // this also covers two same-side stops, where there's no walk at all
      if (
        !isWalking &&
        !drag.current.on &&
        mode.current !== "leaving" &&
        shownSpot !== spot.current.key
      ) {
        shownSpot = spot.current.key;
        clearTimeout(typeTimer);
        setLine(spot.current.line);
        setBubbleOn(true);
        setTyping(true);
        setBubSize(null); // fresh bubble starts at the dots' natural size
        setArrivalId((n) => n + 1);
        typeTimer = setTimeout(() => setTyping(false), 850);
        // arrived on a wander: hang around a beat, then move along
        if (mode.current === "afk") {
          nextRoamAt = performance.now() + 2800 + Math.random() * 3000;
        }
      }

      if (wrapRef.current) {
        wrapRef.current.style.transform =
          `translate(${c.x}px, calc(-50% + ${c.y}px)) scale(${c.s.toFixed(3)})`;
      }
      if (palRef.current) {
        // rotate first (screen space) so the lean isn't mirrored by the flip
        palRef.current.style.transform = `rotate(${c.lean}deg) scaleX(${c.facing})`;
      }

      if (mode.current === "afk" && !isWalking && performance.now() >= nextRoamAt)
        roam();
      raf = requestAnimationFrame(loop);
    };

    computeTarget();
    cur.current.x = target.current.x;
    cur.current.y = target.current.y;
    raf = requestAnimationFrame(loop);
    restartIdleClock();
    api.current = { grab: onGrab, sendAway };

    // real movement only: a resting hand on a trackpad twitches by a pixel
    // or two, and that shouldn't count as someone being at the keyboard
    let ptr: { x: number; y: number } | null = null;
    const onPointerMove = (e: PointerEvent) => {
      if (drag.current.on) return;
      const far = !ptr || Math.hypot(e.clientX - ptr.x, e.clientY - ptr.y) > 6;
      ptr = { x: e.clientX, y: e.clientY };
      if (far) wake();
    };
    const onScroll = () => {
      wake();
      if (mode.current === "parked") mode.current = "guide"; // back on the job
      computeTarget();
    };
    // don't clock off while the tab is in the background: the wander would
    // play to an empty room and be over before anyone looked
    const onVisibility = () => {
      if (document.hidden) clearTimeout(idleTimer);
      else wake();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", wake, { passive: true });
    window.addEventListener("keydown", wake, { passive: true });
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("touchstart", wake, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeTarget);
    window.addEventListener("pointermove", onDragMove);
    window.addEventListener("pointerup", onDrop);
    window.addEventListener("pointercancel", onDrop);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(typeTimer);
      clearTimeout(idleTimer);
      clearTimeout(goneTimer);
      api.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", wake);
      window.removeEventListener("keydown", wake);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchstart", wake);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeTarget);
      window.removeEventListener("pointermove", onDragMove);
      window.removeEventListener("pointerup", onDrop);
      window.removeEventListener("pointercancel", onDrop);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed left-0 top-1/2 z-40 hidden min-[1600px]:block"
      style={{ transform: "translate(40px, -50%)", transformOrigin: "50% 100%" }}
      aria-hidden
    >
      <div className="group/pal relative">
        {/* above his head, growing toward the screen edge — it stays in the
            gutter, so it can never cover text. types on arrival (key
            remount), then holds the line until he walks off */}
        <div
          className="absolute bottom-full mb-3"
          style={leftGutter ? { right: 0 } : { left: 0 }}
        >
          <div
            key={arrivalId}
            className={`${bubbleOn ? "pal-say" : "pal-bubble-hide"} relative ${
              leftGutter ? "origin-bottom-right" : "origin-bottom-left"
            }`}
          >
            {/* the box animates its size, so it morphs smoothly from the
                little typing bubble into the full line */}
            <div
              className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-lg transition-[width,height] duration-300 ease-out ${
                leftGutter ? "ml-auto rounded-br-md" : "rounded-bl-md"
              }`}
              style={
                bubSize ? { width: bubSize.w, height: bubSize.h } : undefined
              }
            >
              {/* content at its natural size — the box above is what's
                  measured against it and clipped while growing */}
              <div
                ref={contentRef}
                className="w-max px-4 py-2.5 text-sm leading-relaxed text-cream"
                style={{
                  maxWidth: bubbleW,
                  // never narrower than the pal — keeps the tail well
                  // inside the bubble even with just the typing dots
                  minWidth: palW + 8,
                }}
              >
                {typing ? (
                  <span className="flex items-center justify-center gap-1 py-1.5">
                    <span className="dot-blink inline-block h-1.5 w-1.5 rounded-full bg-muted" />
                    <span className="dot-blink-2 inline-block h-1.5 w-1.5 rounded-full bg-muted" />
                    <span className="dot-blink-3 inline-block h-1.5 w-1.5 rounded-full bg-muted" />
                  </span>
                ) : (
                  <span className="pal-line-in">{line}</span>
                )}
              </div>
            </div>
            {/* the tail: a rotated square poking out of the bottom edge,
                aimed at the pal's head so the bubble clearly comes from him */}
            <span
              className="absolute -bottom-[7px] h-3.5 w-3.5 rotate-45 border-b border-r border-line bg-surface"
              style={
                leftGutter
                  ? { right: Math.max(10, palW / 2 - 7) }
                  : { left: Math.max(10, palW / 2 - 7) }
              }
            />
          </div>
        </div>
        <div ref={palRef}>
          <div className={walking ? "pal-walk" : "pal-idle"}>
            {/* he's the only interactive part: grab him and put him wherever
                suits you, or drop him on an edge to send him away */}
            <div
              className={`pointer-events-auto touch-none select-none ${
                held ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerDown={(e) => api.current?.grab(e)}
              title="drag me out of the way"
            >
              <PalSvg width={palW} walking={walking} />
            </div>
          </div>
        </div>
        {/* ...or dismiss him outright */}
        <button
          type="button"
          tabIndex={-1}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => api.current?.sendAway()}
          title="send clip pal away"
          className="pointer-events-auto absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full border border-line bg-surface text-xs leading-none text-muted opacity-0 transition-opacity duration-200 group-hover/pal:opacity-100 hover:text-cream"
        >
          ×
        </button>
      </div>
    </div>
  );
}
