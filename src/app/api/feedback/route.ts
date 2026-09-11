import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { adminEmail, autoReplyEmail } from "@/lib/feedback-email";

// The feedback form's back end. Sends one email to the team through Resend's
// REST API (plain fetch, no SDK) and, when the visitor left an address, a
// short confirmation back to them.
//
// Abuse protections, because the auto-reply makes this a spam vector
// otherwise: same-origin check, per-IP rate limit, honeypot field, and the
// confirmation never echoes visitor-controlled text back out.
//
// Accepts JSON from the client component and form-encoded posts from the
// no-JS fallback; the latter is answered with a redirect back to the form.

const FROM = process.env.FEEDBACK_FROM || "clipspace@djt-group.com";
const TO = process.env.FEEDBACK_TO || "clipspace@djt-group.com";

const RATE_LIMIT = 5; // per IP...
const RATE_WINDOW_MS = 10 * 60 * 1000; // ...per ten minutes

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Drop control characters (CR/LF etc. — header-injection defence) and cap
// the length. `keepNewlines` preserves \n and \t for the message body only.
function clean(v: unknown, max: number, keepNewlines = false): string {
  let out = "";
  // Cap before iterating so a multi-MB field can't burn CPU.
  for (const ch of String(v ?? "").slice(0, max * 2)) {
    const c = ch.charCodeAt(0);
    if (c === 127) continue;
    if (c < 32 && !(keepNewlines && (c === 10 || c === 9))) continue;
    out += ch;
  }
  return out.trim().slice(0, max);
}

function send(key: string, payload: Record<string, unknown>) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

type Body = Record<string, unknown>;

async function readBody(req: NextRequest): Promise<{ body: Body; isForm: boolean }> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data")) {
    const fd = await req.formData();
    const body: Body = {};
    fd.forEach((v, k) => {
      body[k] = typeof v === "string" ? v : "";
    });
    return { body, isForm: true };
  }
  return { body: (await req.json()) as Body, isForm: false };
}

export async function POST(req: NextRequest) {
  // The no-JS form has no way to read JSON, so it gets sent back to the
  // section with the outcome in the hash.
  let isForm = false;
  const reply = (status: number, message: string, outcome: "sent" | "error") => {
    if (isForm) {
      const url = new URL(`/?feedback=${outcome}#feedback`, req.url);
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json({ ok: outcome === "sent", message }, { status });
  };

  // Reject cross-site posts outright; browsers always send Origin on
  // cross-origin form and fetch POSTs.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
    }
  }

  const ip = clientIp(req.headers);
  const limit = rateLimit(`feedback:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, message: "Too many messages. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const read = await readBody(req);
    isForm = read.isForm;
    const body = read.body;

    // Honeypot: invisible to humans, bots fill it in. Pretend success.
    if (clean(body.website, 100)) {
      return reply(200, "Sent.", "sent");
    }

    const name = clean(body.name, 100);
    const email = clean(body.email, 254);
    const message = clean(body.message, 4000, true);
    const page = clean(body.page, 120);

    if (!message || message.length < 3) {
      return reply(400, "Write something first.", "error");
    }
    if (email && !EMAIL_RE.test(email)) {
      return reply(400, "That email address doesn't look right.", "error");
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      console.error("Feedback: RESEND_API_KEY not set");
      return reply(503, "Feedback is switched off right now — email us instead.", "error");
    }

    const admin = adminEmail({ name, email, message, page });
    const adminRes = await send(key, {
      from: `ClipSpace feedback <${FROM}>`,
      to: [TO],
      ...(email ? { reply_to: email } : {}),
      subject: admin.subject,
      text: admin.text,
      html: admin.html,
    });
    if (!adminRes.ok) {
      const err = await adminRes.text().catch(() => "");
      console.error("Resend admin error:", adminRes.status, err);
      return reply(502, "Couldn't send that. Try again, or email us.", "error");
    }

    // Best-effort confirmation — a bounce here must not fail the request.
    if (email) {
      const auto = autoReplyEmail(name);
      const autoRes = await send(key, {
        from: `clip pal <${FROM}>`,
        to: [email],
        reply_to: TO,
        subject: auto.subject,
        text: auto.text,
        html: auto.html,
      });
      if (!autoRes.ok) {
        const err = await autoRes.text().catch(() => "");
        console.error("Resend auto-reply error:", autoRes.status, err);
      }
    }

    return reply(200, "Sent.", "sent");
  } catch (e) {
    console.error("Feedback error:", e);
    return reply(500, "Something broke on our side. Try again in a bit.", "error");
  }
}
