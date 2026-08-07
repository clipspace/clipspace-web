"use client";

import { useEffect, useRef, useState } from "react";
import { LINE_EMOTES, PAL_LINES } from "@/lib/pal-lines";
import PalSvg, {
  PAL_EMOTES,
  PAL_EMOTE_NAMES,
  type PalEmote,
} from "./PalSvg";

// The standing pal, for phones and narrower desktops where the walking guide
// never runs. Every so often a bubble appears over his head, he says one line,
// and it goes away again.
const TYPING_MS = 850; // dots before the line lands
const SHOW_MS = 10_000; // how long the bubble stays up
const GAP_MS = 20_000; // silence between bubbles
const FIRST_MS = 1_500; // beat after he scrolls into view, before the first line
const EMOTE_ODDS = 0.3; // chance a line comes with one of his tricks

export default function PalCompanion({ width = 90 }: { width?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState<string>(PAL_LINES[0]);
  const [shown, setShown] = useState(false);
  const [typing, setTyping] = useState(true);
  const [emote, setEmote] = useState<PalEmote | null>(null);
  const lastEmote = useRef<PalEmote | null>(null);
  // remounts the bubble so its entrance animation replays each time
  const [turn, setTurn] = useState(0);
  const lastLine = useRef(-1);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // The dots are the only motion here; without them the line just appears.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Two handles rather than a list: the typing timer and the phase timer are
    // the only two that can ever be pending at once, and reusing the slots
    // keeps the cycle from accumulating handles as it runs.
    let typeTimer: ReturnType<typeof setTimeout> | undefined;
    let phaseTimer: ReturnType<typeof setTimeout> | undefined;
    let emoteTimer: ReturnType<typeof setTimeout> | undefined;
    let running = false;

    const stop = () => {
      clearTimeout(typeTimer);
      clearTimeout(phaseTimer);
      clearTimeout(emoteTimer);
      running = false;
      setShown(false);
      setEmote(null);
    };

    // random trick, never the same one twice running
    const pickEmote = (): PalEmote => {
      let i = Math.floor(Math.random() * PAL_EMOTE_NAMES.length);
      if (PAL_EMOTE_NAMES[i] === lastEmote.current) {
        i = (i + 1) % PAL_EMOTE_NAMES.length;
      }
      return PAL_EMOTE_NAMES[i];
    };

    const speak = () => {
      // random line, never the same one twice running
      let i = Math.floor(Math.random() * PAL_LINES.length);
      if (i === lastLine.current) i = (i + 1) % PAL_LINES.length;
      lastLine.current = i;

      setLine(PAL_LINES[i]);
      setTyping(!reduced);
      setTurn((n) => n + 1);
      setShown(true);

      if (!reduced) typeTimer = setTimeout(() => setTyping(false), TYPING_MS);

      // Now and then he bends himself into something else while the line is on
      // screen — always the matching trick when the line names one. Skipped
      // under reduced motion along with the typing dots.
      const asked = LINE_EMOTES[PAL_LINES[i]];
      if (!reduced && (asked || Math.random() < EMOTE_ODDS)) {
        const e = asked ?? pickEmote();
        lastEmote.current = e;
        clearTimeout(emoteTimer);
        setEmote(e);
        emoteTimer = setTimeout(() => setEmote(null), PAL_EMOTES[e]);
      }

      phaseTimer = setTimeout(() => {
        setShown(false);
        phaseTimer = setTimeout(speak, GAP_MS);
      }, SHOW_MS);
    };

    // He only talks while he's actually on screen — otherwise the cycle burns
    // through lines in a part of the page nobody is looking at.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (running) return;
          running = true;
          phaseTimer = setTimeout(speak, FIRST_MS);
        } else {
          stop();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      stop();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative">
      {/* Absolutely positioned so the layout never shifts when he starts or
          stops talking. */}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2">
        <div
          key={turn}
          className={`${shown ? "pal-say" : "pal-bubble-hide"} relative origin-bottom`}
        >
          <div className="rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-lg">
            <div className="w-max max-w-[15rem] text-sm leading-relaxed text-cream">
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
          {/* tail, aimed down at his head */}
          <span className="absolute -bottom-[7px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b border-r border-line bg-surface" />
        </div>
      </div>

      <div className="animate-float">
        <div className="pal-idle">
          <PalSvg width={width} emote={emote} />
        </div>
      </div>
    </div>
  );
}
