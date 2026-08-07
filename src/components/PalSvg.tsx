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

// How long each gesture runs — must match the animation shorthands in
// globals.css. The four POSES below are absent on purpose: they have no
// duration because they hold until something tells them to unfold.
export const PAL_GESTURES = {
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

// Shapes he bends into and stays in. They fold in, hold for as long as he is
// standing there, and only unfold when he sets off again — which is why they
// are timed by the caller rather than by a fixed duration.
export const PAL_POSES = ["unbend", "curl", "heart", "question"] as const;

export const PAL_POSE_IN_MS = 900; // matches the -in animations
export const PAL_POSE_OUT_MS = 700; // matches the -out animations

export type PalGesture = keyof typeof PAL_GESTURES;
export type PalPose = (typeof PAL_POSES)[number];
export type PalEmote = PalGesture | PalPose;

export function isPose(emote: PalEmote): emote is PalPose {
  return (PAL_POSES as readonly string[]).includes(emote);
}

export default function PalSvg({
  width = 88,
  walking = false,
  emote = null,
  emoteOut = false,
}: {
  width?: number;
  walking?: boolean;
  emote?: PalEmote | null;
  /** play the pose's unfolding half rather than holding it */
  emoteOut?: boolean;
}) {
  const height = Math.round((width * 80) / 50);
  const classes = [
    walking ? "pal-walking" : "",
    emote ? `pal-em-${emote}${emoteOut ? "-out" : ""}` : "",
  ]
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

      {/* Impact rings where his fingertip meets the glass. Without these a tap
          toward the viewer has no direction to move in and just reads as
          pointing sideways — the rings are what say there is a surface there. */}
      <g
        className="pal-tap"
        stroke="#F2EDE0"
        fill="none"
        strokeLinecap="round"
      >
        <circle cx="42" cy="50" r="3.5" strokeWidth="1.8" />
        <circle cx="42" cy="50" r="6" strokeWidth="1.2" />
      </g>

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
