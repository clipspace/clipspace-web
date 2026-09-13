// The two emails the feedback form sends, as text and HTML.
//
// Light on purpose: mail clients are unreliable with dark designs — Gmail's
// dark mode inverts colours, Outlook drops backgrounds — and a dark card
// with cream text came out unreadable in practice. Cream paper, dark ink, a
// brass rule, table layout, no images, no modern CSS. Boring renders
// everywhere.

const PAPER = "#f4f1e8";
const CARD = "#ffffff";
const INK = "#131f1a";
const MUTED = "#5b665f";
const BRASS = "#b8862c";
const RULE = "#e6e0d1";
const FONT = "Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// One centred card on cream paper. Tables, because that is what every mail
// client agrees on; every colour repeated inline, because <style> is not.
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
    <tr><td style="padding:0 4px 14px;font-family:${SANS};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${BRASS};font-weight:bold;">
      &#128391;&#65039; ClipSpace
    </td></tr>
    <tr><td style="background:${CARD};border:1px solid ${RULE};border-top:4px solid ${BRASS};border-radius:10px;padding:28px 28px 24px;font-family:${SANS};color:${INK};">
      ${inner}
    </td></tr>
    <tr><td style="padding:16px 4px 0;font-family:${SANS};font-size:12px;line-height:18px;color:${MUTED};">
      clipspace.djt-group.com &middot; held together by a paperclip, not a corporation
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
      <h1 style="margin:0 0 18px;font-family:${FONT};font-size:24px;line-height:30px;font-weight:bold;color:${INK};">New feedback from ${esc(who)}</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;line-height:22px;margin-bottom:20px;">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:2px 18px 2px 0;color:${MUTED};font-family:${SANS};white-space:nowrap;">${k}</td><td style="padding:2px 0;color:${INK};font-family:${SANS};">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <div style="border-top:1px solid ${RULE};padding-top:18px;font-family:${FONT};font-size:17px;line-height:27px;color:${INK};white-space:pre-wrap;">${esc(f.message)}</div>
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
  const p = `margin:0 0 16px;font-family:${FONT};font-size:17px;line-height:27px;color:${INK};`;
  const html = shell(`
      <p style="${p}">${esc(hi)}</p>
      <p style="${p}">got your feedback. a human reads every one of these, not a model &mdash; so it may take a day or two, but it will be read.</p>
      <p style="${p}">if you gave us something to fix, thank you. if you gave us something nice, also thank you.</p>
      <p style="margin:0 0 20px;font-family:${FONT};font-size:17px;line-height:27px;color:${BRASS};">&mdash; clip pal, on behalf of the ClipSpace team</p>
      <p style="margin:0;border-top:1px solid ${RULE};padding-top:14px;font-family:${SANS};font-size:12px;line-height:18px;color:${MUTED};">this is an automatic confirmation. replying to it reaches a person.</p>
  `);
  return { subject: "got it — thanks for the feedback 🖇️", text, html };
}
