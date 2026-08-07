// The clip pal as one reusable SVG. The body and the leg are separate paths
// so the leg can swing on its own — its pivot sits at the hip, where the leg
// wire leaves the body (15,63 in viewBox units). `walking` turns the step on.
//
// `emote` plays one of his party tricks. The morphing ones rewrite the body
// and leg paths from globals.css; every target shape there keeps the exact
// command sequence of the paths below (M L C C L C C L for the body, M C C L
// for the leg), because same commands in the same order is what lets the
// browser tween one shape into the other instead of cutting between them.
//
// The ball and the crack are props: invisible until an emote calls for them,
// and kept inside the viewBox so nothing ever paints over the page.

// Each emote and how long its keyframes run — must match the animation
// shorthands in globals.css. The four morphing emotes are the long ones: they
// spend roughly five seconds HOLDING the shape, with a short bend in and out
// either side. The gestures run at whatever length reads naturally; stretching
// a head shake to five seconds just looks broken.
export const PAL_EMOTES = {
  unbend: 6500, // unwinds into a straight wire, holds it, curls back
  curl: 6500, // rolls up into a tight spiral, holds, unrolls
  heart: 6500, // bends into a heart and holds it
  question: 6500, // bends into a question mark, dot and all, and holds it
  lean: 4000, // steps up close and stays there while the line is read
  look: 3200, // glances left and right, with a beat on each side
  knock: 3400, // walks up, points a finger and taps on the glass
  kick: 2600, // a ball rolls in, he boots it away
  crack: 3000, // thumps the screen hard enough to crack it
  dance: 3000, // sways with the leg kicking out
  wave: 2400, // waves with his leg
  hop: 2200, // a decaying bounce on the spot
  spin: 1400, // one pirouette
  nod: 1600, // yes
  shake: 1600, // no
} as const;

export type PalEmote = keyof typeof PAL_EMOTES;

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
      {/* the crack he leaves in the screen — behind him, so he stands in front
          of the damage he just caused */}
      <g
        className="pal-crack"
        stroke="#F2EDE0"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M28 27 L49 4 M28 27 L48 26 M28 27 L45 55 M28 27 L30 1 M28 27 L8 5 M28 27 L1 24 M28 27 L6 52 M28 27 L26 62 M40 15 L47 17 M36 41 L44 40 M15 15 L10 21 M17 42 L9 44" />
      </g>

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

      {/* the football, parked off to his right until he kicks it */}
      <circle
        className="pal-ball"
        cx="45"
        cy="72"
        r="5"
        fill="none"
        stroke="#F2EDE0"
        strokeWidth="1.6"
      />
    </svg>
  );
}
