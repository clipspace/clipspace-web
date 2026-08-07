"use client";

import { useEffect, useRef, useState } from "react";
import { PAL_LINES } from "@/lib/pal-lines";
import PalSvg, {
  isPose,
  PAL_GESTURES,
  PAL_POSE_OUT_MS,
  type PalEmote,
} from "./PalSvg";

// The standing pal, for phones and narrower desktops where the walking guide
// never runs. Every so often a bubble appears over his head, he says one line,
// and it goes away again.
const TYPING_MS = 850; // dots before the line lands
const SHOW_MS = 10_000; // how long the bubble stays up
const GAP_MS = 20_000; // silence between bubbles
const FIRST_MS = 1_500; // beat after he scrolls into view, before the first line
// Beat between the bubble appearing and the trick, so the line is on screen
// first and the emote reads as him acting it out.
const EMOTE_DELAY_MS = 500;

export default function PalCompanion({ width = 90 }: { width?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState<string>(PAL_LINES[0][0]);
  const [shown, setShown] = useState(false);
  const [typing, setTyping] = useState(true);
  const [emote, setEmote] = useState<{ name: PalEmote; out: boolean } | null>(
    null,
  );
  const pose = useRef<PalEmote | null>(null);
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
    let emoteEnd: ReturnType<typeof setTimeout> | undefined;
    let running = false;

    const stop = () => {
      clearTimeout(typeTimer);
      clearTimeout(phaseTimer);
      clearTimeout(emoteTimer);
      clearTimeout(emoteEnd);
      running = false;
      setShown(false);
      setEmote(null);
      pose.current = null;
    };

    const speak = () => {
      // random line, never the same one twice running
      let i = Math.floor(Math.random() * PAL_LINES.length);
      if (i === lastLine.current) i = (i + 1) % PAL_LINES.length;
      lastLine.current = i;

      const [text, acts] = PAL_LINES[i];
      setLine(text);
      setTyping(!reduced);
      setTurn((n) => n + 1);
      setShown(true);

      if (!reduced) typeTimer = setTimeout(() => setTyping(false), TYPING_MS);

      // He acts out what he just said, a beat after the bubble lands. Skipped
      // under reduced motion along with the typing dots.
      clearTimeout(emoteTimer);
      clearTimeout(emoteEnd);
      setEmote(null);
      pose.current = null;
      if (!reduced) {
        emoteTimer = setTimeout(() => {
          setEmote({ name: acts, out: false });
          if (isPose(acts)) {
            // a pose stays until the bubble goes away again
            pose.current = acts;
          } else {
            emoteEnd = setTimeout(() => setEmote(null), PAL_GESTURES[acts]);
          }
        }, EMOTE_DELAY_MS);
      }

      phaseTimer = setTimeout(() => {
        setShown(false);
        // he comes out of the shape as the bubble goes, never by cutting to a
        // paperclip
        if (pose.current) {
          setEmote({ name: pose.current, out: true });
          pose.current = null;
          emoteEnd = setTimeout(() => setEmote(null), PAL_POSE_OUT_MS);
        }
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
          <PalSvg
            width={width}
            emote={emote?.name ?? null}
            emoteOut={emote?.out ?? false}
          />
        </div>
      </div>
    </div>
  );
}
