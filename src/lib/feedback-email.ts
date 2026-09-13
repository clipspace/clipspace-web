// The two emails the feedback form sends, as text and HTML.
//
// The site's colours, but a light body on purpose: mail clients are
// unreliable with dark designs — Gmail's dark mode inverts colours, Outlook
// drops backgrounds — and a dark card with cream text came out unreadable
// in practice. So: the green header band with the pal, then cream paper
// and dark ink. Tables, inline colours, one hosted PNG. Renders everywhere.

const SITE = "https://clipspace.djt-group.com";
// the desk set: racing green, brass, cream — the same as the site
const GREEN = "#131f1a";
const BRASS = "#d9a441";
const BRASS_INK = "#b8862c"; // brass dark enough to read on cream
const CREAM = "#f2ede0";
const PAPER = "#f4f1e8";
const CARD = "#ffffff";
const INK = "#131f1a";
const MUTED = "#5b665f";
const RULE = "#e6e0d1";
const SANS = "'Instrument Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const DISPLAY = "'Bricolage Grotesque', 'Instrument Sans', -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// The site's header, then a cream card. A racing-green band with the clip
// pal standing in it and the ClipSpace wordmark in brass — the same three
// colours as the page, so the mail reads as coming from the same place.
// Tables and inline colours throughout: that is what every mail client
// agrees on. The body stays light because dark cards get inverted or
// dropped by Gmail and Outlook; the band is small enough to survive.
function shell(inner: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>ClipSpace</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
    <tr><td style="background:${GREEN};border-radius:14px 14px 0 0;padding:18px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:14px;vertical-align:middle;">
          <a href="${SITE}" style="text-decoration:none;"><img src="${SITE}/pal/clip-pal-120.png" width="30" height="48" alt="clip pal" style="display:block;border:0;width:30px;height:48px;"></a>
        </td>
        <td style="vertical-align:middle;font-family:${DISPLAY};font-size:20px;font-weight:bold;letter-spacing:-0.2px;color:${CREAM};">
          <a href="${SITE}" style="text-decoration:none;color:${CREAM};">Clip<span style="color:${BRASS};">Space</span></a>
        </td>
        <td style="vertical-align:middle;padding-left:14px;font-family:${SANS};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${BRASS};">
          your space &middot; your people &middot; your keys
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="background:${CARD};border:1px solid ${RULE};border-top:0;border-radius:0 0 14px 14px;padding:28px 28px 24px;font-family:${SANS};color:${INK};">
      ${inner}
    </td></tr>
    <tr><td style="padding:16px 6px 0;font-family:${SANS};font-size:12px;line-height:18px;color:${MUTED};">
      <a href="${SITE}" style="color:${BRASS_INK};text-decoration:none;">clipspace.djt-group.com</a> &middot; free &middot; open source &middot; end-to-end encrypted &middot; held together by a paperclip, not a corporation
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

export type FeedbackFields = {
  name: string;
  email: string;
  message: string;
  page: string;
};

export function adminEmail(f: FeedbackFields) {
  const who = f.name || "someone";
  const rows: [string, string][] = [
    ["From", f.name || "—"],
    ["Email", f.email || "— (no reply possible)"],
    ["Where", f.page || "—"],
  ];
  const text = [
    `New feedback from ${who}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    f.message,
  ].join("\n");
  const html = shell(`
      <p style="margin:0 0 6px;font-family:${SANS};font-size:11px;letter-spacing:1.8px;text-transform:uppercase;color:${BRASS_INK};font-weight:bold;">feedback</p>
      <h1 style="margin:0 0 18px;font-family:${DISPLAY};font-size:24px;line-height:30px;font-weight:bold;color:${INK};">New feedback from ${esc(who)}</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:22px;margin-bottom:20px;">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:2px 18px 2px 0;color:${MUTED};font-family:${SANS};white-space:nowrap;">${k}</td><td style="padding:2px 0;color:${INK};font-family:${SANS};">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <div style="border-top:2px solid ${BRASS};padding-top:18px;font-family:${SANS};font-size:16px;line-height:26px;color:${INK};white-space:pre-wrap;">${esc(f.message)}</div>
  `);
  return { subject: `[clipspace] feedback from ${who}`, text, html };
}

// The confirmation the visitor gets. It never repeats what they wrote —
// there is no captcha on the form, so echoing visitor text would turn this
// into a free relay for whoever fills it in with someone else's address.
export function autoReplyEmail(name: string) {
  const hi = name ? `hey ${name},` : "hey,";
  const text = [
    hi,
    "",
    "got your feedback. a human reads every one of these, not a model — so it may take a day or two, but it will be read.",
    "",
    "if you gave us something to fix, thank you. if you gave us something nice, also thank you.",
    "",
    "— clip pal, on behalf of the ClipSpace team",
    "",
    "(this is an automatic confirmation. replying to it reaches a person.)",
  ].join("\n");
  const p = `margin:0 0 16px;font-family:${SANS};font-size:16px;line-height:26px;color:${INK};`;
  const html = shell(`
      <p style="${p}">${esc(hi)}</p>
      <p style="${p}">got your feedback. a human reads every one of these, not a model &mdash; so it may take a day or two, but it will be read.</p>
      <p style="${p}">if you gave us something to fix, thank you. if you gave us something nice, also thank you.</p>
      <p style="margin:0 0 20px;font-family:${SANS};font-size:16px;line-height:26px;color:${BRASS_INK};">&mdash; clip pal, on behalf of the ClipSpace team</p>
      <p style="margin:0;border-top:1px solid ${RULE};padding-top:14px;font-family:${SANS};font-size:12px;line-height:18px;color:${MUTED};">this is an automatic confirmation. replying to it reaches a person.</p>
  `);
  return { subject: "got it — thanks for the feedback 🖇️", text, html };
}
