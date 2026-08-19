"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query.
 *
 * Subscribed to rather than read in an effect, because the answer usually
 * decides what a component renders or whether it starts an animation loop at
 * all — so it has to be available during render, not one commit later.
 *
 * The server has no viewport and no user preferences, so it always answers
 * `false`; components have to be written so that "false" is the safe, quiet
 * default. That matches the CSS, where the pal is `hidden` until a
 * `min-[1600px]` rule turns him on and motion is on until the visitor asks
 * for less.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
