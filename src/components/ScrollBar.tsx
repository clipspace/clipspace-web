"use client";

import { useEffect, useRef, useState } from "react";

// Our own page scrollbar. The native one is hidden (globals.css) because it
// is a different size in every browser, shrinks to a sliver until hovered on
// GTK/Firefox, and ignores styling in half of them. This one is always the
// same width, always visible, and brass.
//
// Scrolling itself stays native — wheel, keys, touch all work as before;
// this only draws where the page is and lets you drag it. Hidden on small
// screens, where the finger does the scrolling and a rail would only cost
// width.
const MIN_THUMB = 140;
const MIN_VIEWPORT = 768;

export default function ScrollBar() {
  const railRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startY: number; startScroll: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MIN_VIEWPORT}px)`);
    const onMq = () => setOn(mq.matches);
    onMq();
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

  useEffect(() => {
    if (!on) return;
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail || !thumb) return;
    const doc = document.documentElement;

    // The thumb's length is the viewport's share of the page, clamped so it
    // never shrinks to a nub; its position is the scroll fraction of the
    // remaining track.
    let raf = 0;
    const place = () => {
      raf = 0;
      const railH = rail.clientHeight;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 0) {
        rail.style.opacity = "0";
        return;
      }
      rail.style.opacity = "1";
      const len = Math.max(
        MIN_THUMB,
        Math.round((window.innerHeight / doc.scrollHeight) * railH),
      );
      const y = Math.round((window.scrollY / max) * (railH - len));
      thumb.style.height = `${len}px`;
      thumb.style.transform = `translateY(${y}px)`;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(doc);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
    };
  }, [on]);

  // Dragging the thumb scrolls the page by the same fraction of the track.
  const onThumbDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startScroll: window.scrollY };
    setDragging(true);
  };
  const onThumbMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!d || !rail || !thumb) return;
    const doc = document.documentElement;
    const track = rail.clientHeight - thumb.offsetHeight;
    const max = doc.scrollHeight - window.innerHeight;
    if (track <= 0) return;
    const dy = e.clientY - d.startY;
    window.scrollTo({ top: d.startScroll + (dy / track) * max });
  };
  const onThumbUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };
  // Clicking the track jumps so the thumb centres on the click.
  const onRailDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const rail = railRef.current;
    const thumb = thumbRef.current;
    if (!rail || !thumb) return;
    const doc = document.documentElement;
    const r = rail.getBoundingClientRect();
    const track = rail.clientHeight - thumb.offsetHeight;
    const max = doc.scrollHeight - window.innerHeight;
    const y = e.clientY - r.top - thumb.offsetHeight / 2;
    window.scrollTo({
      top: (Math.max(0, Math.min(track, y)) / track) * max,
      behavior: "smooth",
    });
  };

  if (!on) return null;
  return (
    <div
      ref={railRef}
      onPointerDown={onRailDown}
      className="scrollrail fixed right-0 top-0 z-50 h-screen w-[22px] bg-surface"
      aria-hidden
    >
      <div
        ref={thumbRef}
        onPointerDown={onThumbDown}
        onPointerMove={onThumbMove}
        onPointerUp={onThumbUp}
        onPointerCancel={onThumbUp}
        className={`absolute left-[5px] top-0 w-[12px] touch-none rounded-full transition-colors ${
          dragging ? "bg-brass" : "bg-brass/70 hover:bg-brass"
        }`}
        style={{ height: MIN_THUMB }}
      />
    </div>
  );
}
