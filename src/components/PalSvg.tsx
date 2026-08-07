// The clip pal as one reusable SVG. The body and the leg are separate paths
// so the leg can swing on its own — its pivot sits at the hip, where the leg
// wire leaves the body (15,63 in viewBox units). `walking` turns the step on.
//
// `unbending` plays the party trick: the wire straightens out and curls back
// up. The straightened shapes live in globals.css next to the keyframes, and
// they mirror the command sequence of the paths below — same commands in the
// same order is what lets the browser tween one into the other.
export default function PalSvg({
  width = 88,
  walking = false,
  unbending = false,
}: {
  width?: number;
  walking?: boolean;
  unbending?: boolean;
}) {
  const height = Math.round((width * 80) / 50);
  const classes = [
    walking ? "pal-walking" : "",
    unbending ? "pal-unbending" : "",
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
