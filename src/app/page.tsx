import { Logo, LogoIcon } from "@/components/Logo";

/* ---------- small building blocks ---------- */

function ChatBubble({
  side,
  children,
  tone = "them",
}: {
  side: "left" | "right";
  children: React.ReactNode;
  tone?: "them" | "me";
}) {
  return (
    <div className={`flex ${side === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          tone === "me"
            ? "bg-gradient-to-br from-[#6D8BFF] to-[#7d6bfa] text-white rounded-br-md"
            : "bg-white/8 text-[#e7eaf6] rounded-bl-md"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white/2 p-6 transition-colors hover:bg-white/4">
      <div className="text-2xl">{icon}</div>
      <h3 className="font-display mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p>
    </div>
  );
}

/* an original friendly paperclip — wire body, two eyes. not that other clip. */
function PaperclipPal({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 50 70" fill="none" aria-hidden>
      <path
        d="M15 62 L15 14 C15 7 19 3 25 3 C31 3 35 7 35 14 L35 50 C35 55 32 58 28 58 C24 58 21 55 21 50 L21 20"
        stroke="url(#palwire)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="palwire" x1="15" y1="3" x2="35" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6D8BFF" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="12" r="2.4" fill="#E7EAF6" />
      <circle cx="30" cy="12" r="2.4" fill="#E7EAF6" />
    </svg>
  );
}

/* ---------- page ---------- */

export default function Home() {
  return (
    <main className="flex-1">
      {/* nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo size={34} textClass="text-xl" />
        <nav className="hidden items-center gap-8 text-sm text-muted sm:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#why" className="transition-colors hover:text-foreground">Why</a>
          <a href="#opensource" className="transition-colors hover:text-foreground">Open source</a>
        </nav>
        <a
          href="#opensource"
          className="rounded-full border border-line px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          GitHub ↗
        </a>
      </header>

      {/* hero */}
      <section className="hero-glow">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-16 md:grid-cols-2 md:pt-24">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-widest text-accent">
              free · open source · end-to-end encrypted
            </p>
            <h1 className="font-display mt-4 text-5xl font-bold leading-[1.05] md:text-6xl">
              Your space.
              <br />
              Your people.
              <br />
              <span className="bg-gradient-to-r from-[#6D8BFF] to-[#8B5CF6] bg-clip-text text-transparent">
                Your keys.
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Clipspace is a social network that belongs to the people using it.
              End-to-end encrypted, fully open source, free forever. No ads, no
              tracking, no big tech reading over your shoulder.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#opensource"
                className="rounded-full bg-gradient-to-r from-[#6D8BFF] to-[#8B5CF6] px-6 py-3 font-display font-bold text-white shadow-lg shadow-[#6d8bff33] transition-transform hover:scale-[1.03]"
              >
                Get early access
              </a>
              <a
                href="#features"
                className="rounded-full border border-line px-6 py-3 font-display font-bold text-foreground transition-colors hover:border-accent"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 text-xs text-muted">
              📎 held together by a paperclip — not by a corporation
            </p>
          </div>

          {/* mock chat card */}
          <div className="animate-float">
            <div className="rounded-3xl border border-line bg-[#121520]/80 p-5 shadow-2xl shadow-black/40 backdrop-blur">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <LogoIcon size={28} />
                  <div>
                    <p className="font-display text-sm font-bold">weekend crew</p>
                    <p className="text-xs text-muted">4 people · encrypted</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-300">
                  🔒 e2ee
                </span>
              </div>
              <div className="flex flex-col gap-3 py-5">
                <ChatBubble side="left">so… no ads in here? ever?</ChatBubble>
                <ChatBubble side="right" tone="me">
                  ever. and nobody can read this — not even the server
                </ChatBubble>
                <ChatBubble side="left">okay this is what the internet was supposed to be</ChatBubble>
                <div className="flex items-center gap-1.5 pl-2 pt-1">
                  <span className="dot-blink h-2 w-2 rounded-full bg-muted" />
                  <span className="dot-blink-2 h-2 w-2 rounded-full bg-muted" />
                  <span className="dot-blink-3 h-2 w-2 rounded-full bg-muted" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-full border border-line px-4 py-2.5 text-sm text-muted">
                <span>Message weekend crew…</span>
                <span className="ml-auto text-accent">➤</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-center text-3xl font-bold md:text-4xl">
          Everything a social network should be.
          <br />
          <span className="text-muted">Nothing it shouldn&apos;t.</span>
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Feature icon="🔐" title="End-to-end encrypted">
            Every message, post and photo is encrypted on your device. Your keys
            never leave your pocket — so nobody in between can read a thing.
          </Feature>
          <Feature icon="📖" title="100% open source">
            All of it — clients, server, crypto. Audit it, fork it, break it,
            fix it. Trust that&apos;s verified, not promised.
          </Feature>
          <Feature icon="🆓" title="Free forever">
            No ads, no premium tiers for privacy, no selling your attention.
            Privacy is the default, not a subscription.
          </Feature>
          <Feature icon="🪐" title="Spaces, not feeds">
            Small circles of real people instead of an algorithmic firehose.
            You choose who&apos;s in your space and what you see.
          </Feature>
          <Feature icon="🏠" title="Self-hostable">
            Run your own server for your friends, family or community —
            or just join one you trust. Your data lives where you say.
          </Feature>
          <Feature icon="👻" title="No phone number">
            Sign up without a phone number or real name. Who you are on
            clipspace is up to you.
          </Feature>
        </div>
      </section>

      {/* why */}
      <section id="why" className="border-y border-line bg-white/2">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 md:grid-cols-[auto_1fr]">
          <div className="mx-auto animate-float">
            <PaperclipPal size={90} />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Remember when software was on <em>your</em> side?
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted">
              Somewhere along the way, social networks stopped working for the
              people on them and started working on the people on them. Feeds
              got angrier, ads got creepier, and everything you typed became
              someone else&apos;s asset.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Clipspace is our way back — a network with the earnest, slightly
              dorky helpfulness of 90s software and the cryptography of 2026.
              It looks like you&apos;re trying to talk to your friends in
              private. We can help with that.
            </p>
          </div>
        </div>
      </section>

      {/* open source */}
      <section id="opensource" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Built in the open.
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Clipspace is being built right now, in public, under a free
              software license. Star the repo to follow along, open issues,
              send patches — or just watch us bend the wire into shape.
            </p>
            <a
              href="#"
              className="mt-8 inline-block rounded-full border border-line px-6 py-3 font-display font-bold transition-colors hover:border-accent hover:text-accent"
            >
              ⭐ Star on GitHub
            </a>
          </div>
          <div className="rounded-2xl border border-line bg-[#121520] p-6 font-mono text-sm leading-relaxed shadow-xl">
            <p className="text-muted"># coming soon</p>
            <p className="mt-2">
              <span className="text-emerald-300">$</span> git clone
              https://github.com/clipspace/clipspace
            </p>
            <p>
              <span className="text-emerald-300">$</span> cd clipspace
            </p>
            <p>
              <span className="text-emerald-300">$</span> make freedom
            </p>
            <p className="mt-2 text-muted">
              🔒 generating your keys… done.
              <br />
              📎 welcome to your space.
            </p>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center">
          <Logo size={28} textClass="text-lg" />
          <p className="max-w-md text-sm text-muted">
            Free. Open source. Encrypted. Yours.
          </p>
          <p className="text-xs text-muted">
            © 2026 clipspace · made with 📎 and stubbornness
          </p>
        </div>
      </footer>
    </main>
  );
}
