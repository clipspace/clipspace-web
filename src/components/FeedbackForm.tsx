"use client";

import { type FormEvent, useState, useSyncExternalStore } from "react";

// The feedback form. Posts JSON to /api/feedback; without JavaScript the
// same <form> submits itself the ordinary way and the route redirects back
// here with ?feedback=sent|error, which the effect below picks up.
type State =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

const inputClass =
  "w-full rounded-lg border border-line bg-bg px-4 py-3 text-sm text-cream placeholder:text-muted/70 outline-none transition-colors focus:border-brass/60";

// The no-JS fallback comes back as ?feedback=sent|error. Read once on the
// client; the server snapshot is null so the markup matches on hydration.
const noop = () => () => {};
const readOutcome = () => new URLSearchParams(window.location.search).get("feedback");

export default function FeedbackForm() {
  const outcome = useSyncExternalStore(noop, readOutcome, () => null);
  const fromUrl: State =
    outcome === "sent"
      ? { kind: "sent" }
      : outcome === "error"
        ? { kind: "error", message: "That didn't go through. Try again, or email us." }
        : { kind: "idle" };
  const [override, setState] = useState<State | null>(null);
  const state = override ?? fromUrl;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
          page: window.location.pathname + window.location.hash,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (res.ok && json.ok) {
        form.reset();
        setState({ kind: "sent" });
      } else {
        setState({
          kind: "error",
          message: json.message || "That didn't go through. Try again, or email us.",
        });
      }
    } catch {
      setState({ kind: "error", message: "No connection. Try again in a moment." });
    }
  }

  if (state.kind === "sent") {
    return (
      <div
        className="rounded-xl border border-brass/40 bg-surface p-6"
        role="status"
        aria-live="polite"
      >
        <p className="font-display text-lg font-bold text-brass">sent. 🖇️</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          clip pal has it, and a human will read it — not a model. If you left
          an email, you&apos;ll get a short confirmation and we&apos;ll reply
          there.
        </p>
        <button
          type="button"
          onClick={() => setState({ kind: "idle" })}
          className="mt-4 text-sm text-cream underline-offset-4 hover:text-brass hover:underline"
        >
          Send another
        </button>
      </div>
    );
  }

  const sending = state.kind === "sending";

  return (
    <form
      method="post"
      action="/api/feedback"
      onSubmit={onSubmit}
      className="relative rounded-xl border border-line bg-surface p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
            Name <span className="font-normal normal-case tracking-normal">(optional)</span>
          </span>
          <input name="name" type="text" maxLength={100} autoComplete="name" className={inputClass} placeholder="who's this?" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
            Email <span className="font-normal normal-case tracking-normal">(optional, if you want a reply)</span>
          </span>
          <input name="email" type="email" maxLength={254} autoComplete="email" className={inputClass} placeholder="you@example.org" />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted">
          Message
        </span>
        <textarea
          name="message"
          required
          minLength={3}
          maxLength={4000}
          rows={5}
          className={`${inputClass} resize-y`}
          placeholder="a bug, an idea, a feeling, a complaint about the paperclip…"
        />
      </label>
      {/* Honeypot: hidden from people, filled in by bots. The route treats a
          value here as spam and pretends to succeed. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
        <p className="text-xs leading-relaxed text-muted">
          Goes straight to{" "}
          <a href="mailto:clipspace@djt-group.com" className="hover:text-brass hover:underline">
            clipspace@djt-group.com
          </a>
          . No account, no tracking; see the{" "}
          <a href="/privacy#feedback" className="hover:text-brass hover:underline">
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={sending}
          className="font-display rounded-full bg-brass px-6 py-3 font-bold text-bg transition-colors hover:bg-brass-soft disabled:cursor-wait disabled:opacity-70"
        >
          {sending ? "sending…" : "Send feedback"}
        </button>
      </div>
      {state.kind === "error" && (
        <p className="mt-4 text-sm text-brass" role="alert">
          {state.message}
        </p>
      )}
    </form>
  );
}
