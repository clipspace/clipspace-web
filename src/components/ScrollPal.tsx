"use client";

import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { PalLine } from "@/lib/pal-lines";
import PalSvg, {
  isPose,
  PAL_GESTURES,
  PAL_POSE_OUT_MS,
  type PalEmote,
} from "./PalSvg";

// Desktop-only scroll guide.
//
// Every stop is ANCHORED to a real element on the page — he stands next to
// the hero headline, next to the features heading, by the press clippings,
// by the terminal card, by the news heading — and rides along with it as
// the page scrolls. Walking from one anchor to the next is what gives the
// run a reason: he's off to the next thing worth pointing at.
//
// He still only ever *targets* a resting spot (never a point in between),
// so stopping mid-scroll can't strand him on top of content. The bubble
// sits above his head and grows away from whatever he's standing next to.
//
// Shown only on screens ≥1600px; below that the static pal in the "why"
// section takes over. (Placeholder lines — the user will replace them.)
type Stop = {
  id: string;
  anchor: string;
  place: "beside" | "gutter-left" | "gutter-right";
  gap?: number;
  lines: readonly PalLine[];
};

const STOPS: readonly Stop[] = [
  {
    id: "hero",
    anchor: "pal-hero-anchor",
    place: "beside", // right of "Your keys.", in the headline's air
    gap: 96, // clear the longer "Your people." line above him
    lines: [
      ["hey — i'm clip pal. i hold this whole thing together.", "wave"],
      ["it looks like you're trying to leave big tech. want a hand?", "question"],
      ["one clip, zero data harvested. good start, right?", "nod"],
      ["i've been holding this page together since the top.", "lean"],
      ["welcome. mind the wire, it's load-bearing.", "wave"],
      ["mascot and structural support. busy job, honestly.", "unbend"],
      ["first time here? there's not much to sign up for.", "question"],
      ["scroll on. i'll keep up. probably.", "hop"],
      ["made of one bent wire and a lot of opinions.", "unbend"],
      ["no cookie banner. i checked. twice.", "look"],
      ["i'd offer you a tour, but you're already on it.", "look"],
      ["bit of an odd mascot, i'll admit. grew on people.", "curl"],
      ["you can read the whole page. it's short, i promise.", "nod"],
      ["the name's clip pal. the pun was not my idea.", "shake"],
      ["tap tap. hello? anyone still out there?", "knock"],
      ["come closer, i want to tell you something.", "lean"],
      ["found a ball. watch this.", "kick"],
    ],
  },
  {
    id: "features",
    anchor: "pal-features-anchor",
    place: "beside",
    lines: [
      ["no ads, no tracking, no catch. all of it, yours.", "shake"],
      ["encrypted on your phone, unreadable everywhere else.", "curl"],
      ["no phone number, no real name, no problem.", "shake"],
      ["your keys stay in your pocket. that's the whole trick.", "curl"],
      ["small circles beat a firehose. every time.", "nod"],
      ["nobody's optimising you for engagement here.", "shake"],
      ["boring privacy defaults. the good kind of boring.", "nod"],
      ["yeah, it's free. no, there's no catch tier.", "nod"],
      ["we can't read your messages. that's not modesty.", "shake"],
      ["nothing here learns your habits. it just delivers.", "shake"],
      ["self-host it if you'd rather not trust anyone. fair.", "question"],
      ["an app that doesn't want your attention. imagine.", "look"],
      ["no engagement metrics. nobody's chasing your time.", "shake"],
      ["the good stuff is on by default. no settings dive.", "nod"],
      ["psst. this next bit is my favourite.", "lean"],
      ["look, i can jump. that's the whole trick.", "hop"],
      ["just checking on the competition. still all ads.", "look"],
    ],
  },
  {
    id: "why",
    anchor: "pal-why-anchor",
    place: "gutter-left",
    lines: [
      ["remember when software was on your side? same.", "nod"],
      ["your feed used to be yours. let's do that again.", "heart"],
      ["90s helpfulness, 2026 cryptography. weird mix, i know.", "wave"],
      ["i miss when apps just did the thing you asked.", "look"],
      ["somewhere along the way, the feed stopped being yours.", "shake"],
      ["we're not reinventing anything. just handing it back.", "shake"],
      ["old-fashioned? maybe. it worked, though.", "question"],
      ["you're the user here, not the product. novel, i know.", "heart"],
      ["nobody set out to make the internet worse. and yet.", "shake"],
      ["the web used to feel like a place. it can again.", "lean"],
      ["turns out you can just... not sell people's data.", "shake"],
      ["everything got louder. this is the quiet corner.", "curl"],
      ["small software, made on purpose. that's the pitch.", "nod"],
      ["if this feels slower, that's deliberate. enjoy it.", "unbend"],
      ["hang on — i need a proper stretch.", "unbend"],
      ["one leg and still bouncing. respect that.", "hop"],
      ["peeked at the big corporate networks. came straight back.", "look"],
    ],
  },
  {
    id: "opensource",
    anchor: "pal-open-anchor",
    place: "gutter-right",
    lines: [
      ["every line is public. read it, fork it, trust it.", "lean"],
      ["don't trust us — trust the code. it's all right there.", "lean"],
      ["built in the open, by people who actually use it.", "nod"],
      ["go read it. i'll wait, i've got nowhere to be.", "curl"],
      ["if we were lying, the source would tell on us.", "shake"],
      ["fork it and make it weird. genuinely, go ahead.", "dance"],
      ["no secret sauce. just sauce, in a public repo.", "shake"],
      ["audited by whoever feels like it. that's the point.", "nod"],
      ["found a bug? tell us. or fix it. either's great.", "question"],
      ["the crypto is the boring, well-reviewed kind.", "nod"],
      ["you don't have to like us. just check our work.", "look"],
      ["issues are open. opinions welcome, patches better.", "wave"],
      ["clone it, run it, keep it. it's yours now too.", "heart"],
      ["open source isn't a feature. it's the arrangement.", "nod"],
      ["ta-da. i've been practising that one.", "wave"],
      ["give it a boot and it still works. sturdy, this.", "kick"],
    ],
  },
  {
    id: "news",
    anchor: "pal-news-anchor",
    place: "beside",
    lines: [
      ["fresh off the press: android comes first.", "hop"],
      ["that's the tour. built with a paperclip and stubbornness.", "wave"],
      ["news travels fast when there are no algorithms.", "nod"],
      ["stick around. or self-host. or both. i'm easy.", "question"],
      ["you made it to the bottom. thorough of you.", "nod"],
      ["that's everything. no newsletter popup, promise.", "shake"],
      ["android first, then the rest. one thing at a time.", "hop"],
      ["okay, that's my whole routine. thanks for scrolling.", "dance"],
      ["we ship when it's ready. novel approach, apparently.", "nod"],
      ["no launch hype. just a build, when there's a build.", "shake"],
      ["still here? you're my favourite kind of visitor.", "heart"],
      ["that's the footer down there. mind the step.", "look"],
      ["go on then. the github link's right below me.", "lean"],
      ["same time next scroll? i'll be around.", "wave"],
      ["ahh. that's the good kind of straight.", "unbend"],
      ["oops. that'll buff out, probably.", "crack"],
    ],
  },
];

// When the page sits still (no mouse, scroll, key or touch) he stops waiting
// on the scroll anchors, wanders off to the other side of the screen and says
// an idle line. The moment the visitor does anything again, he heads back to
// wherever the scroll position says he belongs.
const IDLE_STOP: { id: string; lines: readonly PalLine[] } = {
  id: "idle",
  lines: [
    ["you still there? wandered off to stretch my wire.", "unbend"],
    ["quiet in here. i'll keep your seat warm.", "curl"],
    ["no rush — wiggle the mouse when you're back.", "knock"],
    ["just me and the paperclips. peaceful, honestly.", "look"],
    ["i'll be here. not like i've got other pages to be on.", "shake"],
    ["taking five. scroll whenever you're ready.", "curl"],
    ["went to look out the window. nothing out there.", "look"],
    ["no notifications to check. strange feeling, isn't it?", "question"],
    ["still holding everything together, in case you wondered.", "nod"],
    ["i counted the pixels. there are a lot of them.", "look"],
    ["coffee? i'd offer, but i'm made of wire.", "question"],
    ["nothing's loading. it's just quiet. that's allowed.", "curl"],
    ["i'm not tracking how long you've been gone. promise.", "shake"],
    ["found a nice patch of whitespace over here.", "look"],
    ["if you left the tab open on purpose, respect.", "nod"],
    ["somewhere a server is idling with me. solidarity.", "heart"],
    ["take your time. the page isn't going anywhere.", "nod"],
    ["i straightened myself out a bit. bent back now.", "unbend"],
    ["knock knock. you awake in there?", "knock"],
    ["nobody's watching. might as well dance.", "dance"],
    ["hello? tap the glass if you're still there.", "knock"],
    ["looking left, looking right. no algorithms either way.", "look"],
    ["...i'll pay for the screen. put it on my tab.", "crack"],
  ],
};
const IDLE_ENTER_MS = 12000; // stillness before he wanders off
// between idle wanders while still away — long enough that he settles and
// reads as resting, instead of pacing across the screen every few seconds
const IDLE_WANDER_MS = 20000;

const MIN_PAL_W = 46; // below this he's too small to read; hide him instead
const GAP = 12; // clearance between the pal and the content column
const EDGE = 8; // clearance from the screen edge

// How fast he moves, in pixels per SECOND — deliberately not per frame. A
// per-frame step covers twice the ground on a 120Hz screen as it does on a
// 60Hz one, so the same walk reads as a sprint depending on the display (and
// on whatever else the browser is doing). These numbers are the old per-frame
// values converted at 60Hz, so the pace is unchanged on a 60Hz screen and
// finally the same everywhere else.
const SPEED_X = 480; // was 8px/frame
const SPEED_Y = 540; // was 9px/frame — he claws back ground during fast scrolls
// Exponential ease toward the target, expressed as a rate rather than a
// per-frame fraction: 1 - e^(-EASE/60) ≈ 0.1, the old pull.
const EASE = 6.32;
const LEAN_EASE = 7.67; // likewise, ≈0.12 per frame at 60Hz
const WALK_SPEED = 27; // px/s above which he counts as walking (was 0.45/frame)
const FACE_SPEED = 36; // px/s above which he turns to face his direction
const RETARGET_MS = 330; // how often to re-measure the anchors
// Beat between the bubble appearing and the trick, so the line is on screen
// first and the emote reads as him acting it out rather than a coincidence.
const EMOTE_DELAY_MS = 500;

export default function ScrollPal() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const palRef = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState(STOPS[0].lines[0][0]);
  const [leftGutter, setLeftGutter] = useState(true);
  const [bubbleOn, setBubbleOn] = useState(true);
  const [typing, setTyping] = useState(true);
  const [arrivalId, setArrivalId] = useState(0);
  const [walking, setWalking] = useState(false);
  // `out` flips a held pose into its unfolding half, so he never snaps back
  // into a paperclip mid-shape
  const [emote, setEmote] = useState<{ name: PalEmote; out: boolean } | null>(
    null,
  );
  // the pose he is currently holding, tracked synchronously so the walk
  // handler can unfold it without waiting on a render
  const pose = useRef<PalEmote | null>(null);
  const [palW, setPalW] = useState(88);
  const [bubbleW, setBubbleW] = useState(240);
  const [bubSize, setBubSize] = useState<{ w: number; h: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const target = useRef({ x: 40, y: 0 });
  const cur = useRef({ x: 40, y: 0, lean: 0, facing: 1 as 1 | -1 });
  const palWRef = useRef(88);
  const nearRef = useRef<{ id: string; lines: readonly PalLine[] }>(STOPS[0]);
  const idle = useRef(false);
  // drag state: while `dragging` he follows the pointer instead of his target,
  // and `dropped` keeps him where he was let go until the next scroll
  const dragging = useRef(false);
  const dropped = useRef(false);
  const grab = useRef({ x: 0, y: 0 });
  const [grabbed, setGrabbed] = useState(false);
  // false when the side gutter is too narrow to hold him — better to hide
  // him entirely than to have him stand on top of the text
  const [roomy, setRoomy] = useState(true);
  // the line last played at each stop, so a random pick can avoid repeating it
  const lineIdx = useRef<Record<string, number>>({});

  // measure the bubble's content so the box itself can smoothly grow from
  // the little typing bubble into the full line (width/height transition)
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    setBubSize({ w: el.offsetWidth + 2, h: el.offsetHeight + 2 }); // +2 for the border
  }, [typing, line, bubbleW, palW, arrivalId]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // The content column's width lives in --content-w (globals.css) and both
    // it and the root font size change across breakpoints, so read them each
    // time rather than hardcoding pixels. The variable is authored in rem;
    // fall back to the base 72rem if it ever goes missing.
    const contentW = () => {
      const root = getComputedStyle(document.documentElement);
      const rem = parseFloat(root.fontSize);
      const declared = parseFloat(root.getPropertyValue("--content-w"));
      return (Number.isFinite(declared) ? declared : 72) * rem;
    };
    const gutter = () => Math.max(0, (window.innerWidth - contentW()) / 2);

    const sizePal = () => {
      // as big as the gutter can hold, within a sensible range
      const room = gutter() - GAP - EDGE;
      // Below his minimum width there is no gutter left to stand in, and
      // clamping would park him on top of the content instead. The root font
      // size scales with the viewport, so this can happen at any width.
      setRoomy(room >= MIN_PAL_W);
      const w = Math.max(MIN_PAL_W, Math.min(92, Math.floor(room)));
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

    const computeTarget = () => {
      sizePal();
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

      const pw = palWRef.current;
      const a = document.getElementById(near.anchor)?.getBoundingClientRect();

      // where he stands: next to his anchor element, or in a gutter beside it
      let x: number;
      if (near.place === "gutter-left") x = parkLeft();
      else if (near.place === "gutter-right") x = parkRight();
      else if (a)
        x = Math.min(
          window.innerWidth - EDGE - pw,
          a.right + ("gap" in near && near.gap ? near.gap : 26),
        );
      else x = parkLeft();

      // ...and at his anchor's height, riding along as the page scrolls,
      // but never drifting off screen
      const yCenter = a ? a.top + a.height / 2 : vc;
      const yLimit = h / 2 - 150;
      const y = Math.max(-yLimit, Math.min(yLimit, yCenter - vc));

      target.current = { x, y };
      nearRef.current = near;
      setLeftGutter(near.place === "gutter-left");
      // the bubble grows away from whatever he stands next to
      const space =
        near.place === "gutter-left"
          ? x + pw - EDGE
          : window.innerWidth - x - pw - EDGE;
      setBubbleW(Math.round(Math.max(150, Math.min(260, space))));
    };

    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    // pick a resting spot on the far side of the screen from where he stands,
    // at a random height, and grow the bubble toward the near screen edge
    const wanderSpot = () => {
      sizePal();
      const pw = palWRef.current;
      const onLeft = cur.current.x < window.innerWidth / 2;
      const x = onLeft ? parkRight() : parkLeft();
      const yLimit = window.innerHeight / 2 - 180;
      target.current = {
        x,
        y: Math.round((Math.random() * 2 - 1) * Math.max(0, yLimit)),
      };
      const left = !onLeft; // ends up in the left gutter?
      setLeftGutter(left);
      const space = left ? x + pw - EDGE : window.innerWidth - x - pw - EDGE;
      setBubbleW(Math.round(Math.max(150, Math.min(260, space))));
      nearRef.current = IDLE_STOP;
    };

    const idleTick = () => {
      if (!idle.current) return;
      wanderSpot();
      idleTimer = setTimeout(idleTick, IDLE_WANDER_MS);
    };
    const enterIdle = () => {
      if (idle.current) return;
      idle.current = true;
      wanderSpot();
      idleTimer = setTimeout(idleTick, IDLE_WANDER_MS);
    };
    const exitIdle = () => {
      if (!idle.current) return;
      idle.current = false;
      computeTarget(); // straight back to his scroll anchor
    };
    // any interaction wakes him and restarts the stillness countdown
    const activity = () => {
      clearTimeout(idleTimer);
      exitIdle();
      idleTimer = setTimeout(enterIdle, IDLE_ENTER_MS);
    };

    let raf = 0;
    let wasWalking = false;
    let shownStop: string | null = null; // stop whose line the bubble shows
    let typeTimer: ReturnType<typeof setTimeout> | undefined;
    let emoteTimer: ReturnType<typeof setTimeout> | undefined;
    let emoteEnd: ReturnType<typeof setTimeout> | undefined;
    let last = performance.now();
    let lastRetarget = 0;

    const loop = (now: number) => {
      const c = cur.current;
      // Seconds since the previous frame, floored at 20fps: coming back to a
      // backgrounded tab hands us one enormous gap, and without the clamp he
      // would teleport across the screen on the first frame back.
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;

      // being dragged: he goes exactly where the pointer puts him, and his
      // target follows so he doesn't snap back the instant he's released
      if (dragging.current) {
        target.current.x = c.x;
        target.current.y = c.y;
        if (wrapRef.current) {
          wrapRef.current.style.transform = `translate(${c.x}px, calc(-50% + ${c.y}px))`;
        }
        raf = requestAnimationFrame(loop);
        return;
      }

      // re-measure a few times a second: reveal animations and layout
      // shifts move the anchors without firing a scroll event. Skipped while
      // he's been dropped somewhere, so he stays put until the next scroll.
      if (now - lastRetarget > RETARGET_MS) {
        lastRetarget = now;
        if (!idle.current && !dropped.current) computeTarget();
      }

      // Ease toward the target, then cap the result — so he sets off at a
      // steady walk and slows down as he arrives, at the same pace on any
      // refresh rate. Velocities are px/s; multiplying by dt gives the step.
      const ease = 1 - Math.exp(-EASE * dt);
      const dx = target.current.x - c.x;
      let vx = (dx * ease) / dt;
      if (vx > SPEED_X) vx = SPEED_X;
      if (vx < -SPEED_X) vx = -SPEED_X;
      if (Math.abs(dx) > 0.4) c.x += vx * dt;
      // vertical follow is a touch quicker: he lags behind fast scrolls and
      // catches up, like he's actually running after his anchor
      let vy = ((target.current.y - c.y) * ease) / dt;
      if (vy > SPEED_Y) vy = SPEED_Y;
      if (vy < -SPEED_Y) vy = -SPEED_Y;
      c.y += vy * dt;

      // lean into the stride, straighten out when idle
      const leanTarget = Math.max(-9, Math.min(9, (vx / SPEED_X) * 12.8));
      c.lean += (leanTarget - c.lean) * (1 - Math.exp(-LEAN_EASE * dt));
      if (Math.abs(vx) > FACE_SPEED) c.facing = vx > 0 ? 1 : -1;

      const isWalking = Math.abs(vx) > WALK_SPEED;
      if (isWalking !== wasWalking) {
        wasWalking = isWalking;
        setWalking(isWalking);
        if (isWalking) {
          // he sets off — put the bubble away until he arrives. A held pose
          // unfolds on the way out; cutting the class here is what used to
          // make him teleport back into a paperclip.
          clearTimeout(typeTimer);
          clearTimeout(emoteTimer);
          clearTimeout(emoteEnd);
          if (pose.current) {
            setEmote({ name: pose.current, out: true });
            pose.current = null;
            emoteEnd = setTimeout(() => setEmote(null), PAL_POSE_OUT_MS);
          } else {
            setEmote(null);
          }
          setBubbleOn(false);
          shownStop = null;
        }
      }
      // speak whenever he's standing at a stop he hasn't announced yet —
      // this also covers two same-side stops, where there's no walk at all
      if (!isWalking && shownStop !== nearRef.current.id) {
        const s = nearRef.current;
        shownStop = s.id;
        clearTimeout(typeTimer);
        // random line, but never the same one twice running — with this many
        // per stop an immediate repeat is the only ordering that reads as a bug
        const last = lineIdx.current[s.id];
        let i = Math.floor(Math.random() * s.lines.length);
        if (s.lines.length > 1 && i === last) i = (i + 1) % s.lines.length;
        lineIdx.current[s.id] = i;
        const [text, acts] = s.lines[i];
        setLine(text);
        setBubbleOn(true);
        setTyping(true);
        setBubSize(null); // fresh bubble starts at the dots' natural size
        setArrivalId((n) => n + 1);
        typeTimer = setTimeout(() => setTyping(false), 850);

        // Every line comes with the trick that belongs to it — he acts out
        // what he just said, a beat after the bubble lands. Poses then stay
        // put; gestures clear themselves when their animation is done.
        clearTimeout(emoteTimer);
        clearTimeout(emoteEnd);
        const begin = () => {
          setEmote({ name: acts, out: false });
          if (isPose(acts)) {
            pose.current = acts;
          } else {
            emoteEnd = setTimeout(() => setEmote(null), PAL_GESTURES[acts]);
          }
        };
        if (pose.current) {
          // two stops on the same side, no walk between them: unfold the old
          // shape before folding into the new one
          setEmote({ name: pose.current, out: true });
          pose.current = null;
          emoteTimer = setTimeout(begin, PAL_POSE_OUT_MS);
        } else {
          setEmote(null);
          emoteTimer = setTimeout(begin, EMOTE_DELAY_MS);
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

    const onScroll = () => {
      activity();
      dropped.current = false; // scrolling sends him back to his post
      computeTarget();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", computeTarget);
    window.addEventListener("mousemove", activity, { passive: true });
    window.addEventListener("keydown", activity);
    window.addEventListener("pointerdown", activity, { passive: true });
    window.addEventListener("touchstart", activity, { passive: true });
    window.addEventListener("wheel", activity, { passive: true });
    idleTimer = setTimeout(enterIdle, IDLE_ENTER_MS); // start the countdown

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(typeTimer);
      clearTimeout(idleTimer);
      clearTimeout(emoteTimer);
      clearTimeout(emoteEnd);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", computeTarget);
      window.removeEventListener("mousemove", activity);
      window.removeEventListener("keydown", activity);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("touchstart", activity);
      window.removeEventListener("wheel", activity);
    };
  }, []);

  // Drag handlers live outside the animation effect because they only touch
  // refs the loop already reads. Pointer capture means a fast drag can't
  // outrun the element and drop him mid-flight.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    grab.current = {
      x: e.clientX - cur.current.x,
      y: e.clientY - (window.innerHeight / 2 + cur.current.y),
    };
    dragging.current = true;
    dropped.current = true;
    setGrabbed(true);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    cur.current.x = e.clientX - grab.current.x;
    cur.current.y = e.clientY - grab.current.y - window.innerHeight / 2;
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragging.current = false;
    setGrabbed(false);
  };

  return (
    <div
      ref={wrapRef}
      className={`pointer-events-none fixed left-0 top-1/2 z-40 hidden ${
        roomy ? "min-[1600px]:block" : ""
      }`}
      style={{ transform: "translate(40px, -50%)" }}
      aria-hidden
    >
      <div className="relative">
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
        {/* the only interactive part — the wrapper stays click-through so he
            never steals a click from the page behind him */}
        <div
          ref={palRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={`pointer-events-auto touch-none select-none ${
            grabbed ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          <div className={walking ? "pal-walk" : "pal-idle"}>
            <PalSvg
              width={palW}
              walking={walking}
              emote={emote?.name ?? null}
              emoteOut={emote?.out ?? false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
