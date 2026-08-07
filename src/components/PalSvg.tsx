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
  kick: 4200, // a ball rolls in, he boots it away
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
      {/* The crack he leaves in the screen. It radiates from (42,30) — the
          exact point his leg reaches on the strike — and is drawn behind him,
          so he stands in front of the damage. */}
      <g
        className="pal-crack"
        stroke="#F2EDE0"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M42 30 L48.5 30.0 M42 30 L48.5 22.2 M42 30 L42.0 19.0 M42 30 L34.2 22.2 M42 30 L31.0 30.0 M42 30 L34.2 37.8 M42 30 L42.0 41.0 M42 30 L48.5 37.8 M46.5 30.0 L45.2 26.8 L42.0 25.5 L38.8 26.8 L37.5 30.0 L38.8 33.2 L42.0 34.5 L45.2 33.2 Z M48.5 30.0 L48.0 24.0 L42.0 21.5 L36.0 24.0 L33.5 30.0 L36.0 36.0 L42.0 38.5 L48.0 36.0 Z" />
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

      {/* The football, parked off to his right until he kicks it. Solid with a
          dark panel — a bare ring just read as a hoop. */}
      <g className="pal-ball">
        <circle cx="42" cy="72" r="5.4" fill="#F2EDE0" />
        <path
          d="M42 69.6 L44.3 71.3 L43.4 74 L40.6 74 L39.7 71.3 Z"
          fill="#131f1a"
        />
        <path
          d="M42 69.6 L42 66.6 M44.3 71.3 L47.2 70.4 M43.4 74 L45.2 76.4 M40.6 74 L38.8 76.4 M39.7 71.3 L36.8 70.4"
          stroke="#131f1a"
          strokeWidth="0.9"
          fill="none"
        />
      </g>
    </svg>
  );
}
