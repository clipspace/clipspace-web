// The card people see when the link is pasted into a chat, and what image
// search and some crawlers pick up. Generated rather than checked in so it
// stays in step with the brand colours in globals.css.
//
// Rendered by satori, which supports a subset of CSS: flexbox only, and every
// element with more than one child needs an explicit `display: flex`.
import { ImageResponse } from "next/og";

export const alt =
  "ClipSpace – a free, open-source, end-to-end encrypted social network";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#131f1a";
const CREAM = "#f2ede0";
const BRASS = "#d9a441";
const MUTED = "#9daa9f";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: BG,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px 100px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {/* the same single-wire paperclip bubble as the site logo */}
          <svg width="112" height="112" viewBox="0 0 64 64" fill="none">
            <path
              d="M24 61 L24 46 L17 46 C10.4 46 6 41.6 6 35 L6 17 C6 10.4 10.4 6 17 6 L47 6 C53.6 6 58 10.4 58 17 L58 35 C58 41.6 53.6 46 47 46 L36 46 C28 46 22 41 22 34 L22 24 C22 19.6 25 17 29.5 17 L44 17 C48 17 50 19.5 50 23 L50 28"
              stroke={BRASS}
              strokeWidth="5.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="30" cy="31.5" r="2.9" fill={CREAM} />
            <circle cx="38.5" cy="31.5" r="2.9" fill={CREAM} />
          </svg>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
            <span style={{ color: CREAM }}>Clip</span>
            <span style={{ color: BRASS }}>Space</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 58,
            fontWeight: 700,
            color: CREAM,
            lineHeight: 1.2,
          }}
        >
          your space, your people, your keys
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 32,
            color: MUTED,
          }}
        >
          Free · open source · end-to-end encrypted · no ads, no tracking
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            color: BRASS,
          }}
        >
          clipspace.djt-group.com
        </div>
      </div>
    ),
    { ...size },
  );
}
