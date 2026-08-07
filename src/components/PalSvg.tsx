// The clip pal as one reusable SVG. The body and the leg are separate paths
// so the leg can swing on its own — its pivot sits at the hip, where the leg
// wire leaves the body (15,63 in viewBox units). `walking` turns the step on.
//
// `emote` plays one of his party tricks. The morphing ones rewrite the body
// and leg paths from globals.css; every target shape there keeps the exact
// command sequence of the paths below (M L C C L C C L for the body, M C C L
// for the leg), because same commands in the same order is what lets the
// browser tween one shape into the other instead of cutting between them.

// Every emote runs for the same length, so callers can time the class removal
// from one number. Must match the animation shorthands in globals.css, where
// the extra time goes into holding the shape or repeating the beat rather than
// into slowing the motion down.
export const PAL_EMOTE_MS = 5000;

export const PAL_EMOTES = [
  "unbend", // unwinds into a straight wire, holds the stretch, curls back
  "curl", // rolls himself up into a tight spiral and unrolls
  "heart", // bends into a heart
  "question", // bends into a question mark, dot and all
  "spin", // two pirouettes with a beat between
  "look", // glances left and right
  "lean", // steps up closer to say something
  "hop", // a decaying bounce on the spot
  "knock", // walks up, winds his leg, taps the glass, backs off
  "wave", // waves with his leg
  "nod", // yes
  "shake", // no
  "dance", // sways with the leg kicking out
] as const;

export type PalEmote = (typeof PAL_EMOTES)[number];

export default function PalSvg({
  width = 88,
  walking = false,
  emote = null,
}: {
  width?: number;
  walking?: boolean;
  emote?: PalEmote | null;
}) {
  const height = Math.round((width * 80) / 50);
  const classes = [walking ? "pal-walking" : "", emote ? `pal-em-${emote}` : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 50 80"
      fill="none"
      aria-hidden
      className={classes || undefined}
    >
      <g
        stroke="#D9A441"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          className="pal-body"
          d="M15 62 L15 14 C15 7 19 3 25 3 C31 3 35 7 35 14 L35 50 C35 55 32 58 28 58 C24 58 21 55 21 50 L21 20"
        />
        <path
          className="pal-leg"
          d="M15 63 C15 70 20 73 27 73 C34 73 41 69 41 61 L41 54"
        />
      </g>
      <circle className="pal-eye" cx="22" cy="12" r="2.4" fill="#F2EDE0" />
      <circle className="pal-eye" cx="30" cy="12" r="2.4" fill="#F2EDE0" />
    </svg>
  );
}
