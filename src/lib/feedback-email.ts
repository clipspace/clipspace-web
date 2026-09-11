// The two emails the feedback form sends, as text and HTML. Kept in the site
// palette — racing green, brass, cream — and deliberately plain: a table, a
// message, no images, so they render in every client.

const BG = "#131f1a";
const SURFACE = "#1b2a23";
const CREAM = "#f2ede0";
const MUTED = "#9daa9f";
const BRASS = "#d9a441";
const LINE = "rgba(242,237,224,0.12)";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;padding:32px 16px;background:${BG};font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:${CREAM}">
<div style="max-width:560px;margin:0 auto">
  <p style="margin:0 0 20px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:${BRASS};font-weight:700">🖇️ ClipSpace</p>
  <div style="background:${SURFACE};border:1px solid ${LINE};border-radius:14px;padding:24px">${inner}</div>
  <p style="margin:20px 0 0;font-size:12px;color:${MUTED}">clipspace.djt-group.com · held together by a paperclip, not a corporation</p>
</div></body></html>`;
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
    <h1 style="margin:0 0 16px;font-size:20px">New feedback from ${esc(who)}</h1>
    <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:4px 16px 4px 0;color:${MUTED}">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <div style="white-space:pre-wrap;font-size:15px;line-height:1.6;border-top:1px solid ${LINE};padding-top:16px">${esc(f.message)}</div>
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
  const html = shell(`
    <p style="margin:0 0 14px;font-size:16px">${esc(hi)}</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6">got your feedback. a human reads every one of these, not a model — so it may take a day or two, but it will be read.</p>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.6">if you gave us something to fix, thank you. if you gave us something nice, also thank you.</p>
    <p style="margin:0;font-size:15px;color:${BRASS}">— clip pal, on behalf of the ClipSpace team</p>
    <p style="margin:18px 0 0;font-size:12px;color:${MUTED}">this is an automatic confirmation. replying to it reaches a person.</p>
  `);
  return { subject: "got it — thanks for the feedback 🖇️", text, html };
}
