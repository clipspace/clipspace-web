import { Logo } from "@/components/Logo";
import ChatDemo from "@/components/ChatDemo";
import PalSvg from "@/components/PalSvg";

/* ---------- small building blocks ---------- */

/* tiny brass line icons – primitives only, no icon font */
function FeatureIcon({ kind }: { kind: string }) {
  const s = {
    stroke: "#D9A441",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
      {kind === "lock" && (
        <>
          <rect x="5" y="10.5" width="14" height="9" rx="2" {...s} />
          <path d="M8 10.5 V7.5 a4 4 0 0 1 8 0 v3" {...s} />
          <circle cx="12" cy="15" r="1.3" fill="#D9A441" />
        </>
      )}
      {kind === "code" && (
        <>
          <path d="M8.5 7 L4 12 L8.5 17" {...s} />
          <path d="M15.5 7 L20 12 L15.5 17" {...s} />
        </>
      )}
      {kind === "free" && (
        <>
          <circle cx="12" cy="12" r="8.5" {...s} />
          <path d="M15.5 8.5 L8.5 15.5" {...s} />
        </>
      )}
      {kind === "spaces" && (
        <>
          <circle cx="8.5" cy="9" r="3.2" {...s} />
          <circle cx="15.5" cy="9" r="3.2" {...s} />
          <circle cx="12" cy="15.5" r="3.2" {...s} />
        </>
      )}
      {kind === "home" && (
        <>
          <path d="M4.5 11 L12 4.5 L19.5 11" {...s} />
          <path d="M6.5 10 V19 h11 V10" {...s} />
        </>
      )}
      {kind === "nophone" && (
        <>
          <rect x="7.5" y="4" width="9" height="16" rx="2" {...s} />
          <path d="M4.5 4.5 L19.5 19.5" {...s} />
        </>
      )}
    </svg>
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
    <div className="rounded-xl border border-line bg-surface p-6 transition-colors hover:border-brass/40">
      <FeatureIcon kind={icon} />
      <h3 className="font-display mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{children}</p>
    </div>
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
          <a href="#features" className="transition-colors hover:text-cream">Features</a>
          <a href="#why" className="transition-colors hover:text-cream">Why</a>
          <a href="#opensource" className="transition-colors hover:text-cream">Open source</a>
        </nav>
        <a
          href="https://github.com/clipspace/clipspace-web"
          className="rounded-full border border-line px-4 py-2 text-sm text-cream transition-colors hover:border-brass hover:text-brass"
        >
          GitHub ↗
        </a>
      </header>

      {/* hero */}
      <section id="hero">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-14 md:grid-cols-2 md:pt-20">
          <div data-reveal className="min-w-0">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-brass">
              work in progress, coming soon
            </p>
            <h1 className="font-display mt-6 text-5xl font-bold leading-[1.05] md:text-6xl">
              Your space.
              <br />
              Your people.
              <br />
              <span className="text-brass">Your keys.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Clipspace is a social network that belongs to the people on it.
              Everything is encrypted end to end, the code is public, and it
              costs nothing. We couldn&apos;t read your messages if we tried,
              which is exactly the point.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#opensource"
                className="font-display rounded-full bg-brass px-6 py-3 font-bold text-bg transition-colors hover:bg-brass-soft"
              >
                Follow the build
              </a>
              <a
                href="#features"
                className="font-display rounded-full border border-line px-6 py-3 font-bold text-cream transition-colors hover:border-brass hover:text-brass"
              >
                See how it works
              </a>
            </div>
            <p className="mt-6 text-xs text-muted">
              held together by a paperclip, not a corporation 🖇️
            </p>
          </div>

          {/* mock chat card */}
          <div data-reveal className="min-w-0">
            <div className="animate-float rounded-2xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="font-display flex h-8 w-8 items-center justify-center rounded-full border border-brass/40 bg-brass/15 text-sm font-bold text-brass">
                    t
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold">tommy</p>
                    <p className="text-xs text-muted">online · encrypted</p>
                  </div>
                </div>
                <span className="rounded-full border border-brass/40 px-2.5 py-1 text-xs font-medium text-brass">
                  e2ee
                </span>
              </div>
              <ChatDemo />
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-center text-3xl font-bold md:text-4xl" data-reveal>
          Everything a social network should be.
          <br />
          <span className="text-muted">Nothing it shouldn&apos;t.</span>
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-reveal-stagger>
          <Feature icon="lock" title="End-to-end encrypted">
            Every message, post and photo is encrypted on your device. Your keys
            never leave your pocket, so nobody in between can read a thing.
          </Feature>
          <Feature icon="code" title="100% open source">
            All of it: clients, server, crypto. You don&apos;t have to trust
            us. Read the code, or find someone who did.
          </Feature>
          <Feature icon="free" title="Free forever">
            No ads, no premium tiers for privacy, no selling your attention.
            Privacy is the default, not a subscription.
          </Feature>
          <Feature icon="spaces" title="Spaces, not feeds">
            Small circles of real people instead of an algorithmic firehose.
            You choose who&apos;s in your space and what you see.
          </Feature>
          <Feature icon="home" title="Self-hostable">
            Run your own server for your friends, family or community, or
            just join one you trust. Your data lives where you say.
          </Feature>
          <Feature icon="nophone" title="No phone number">
            Sign up without a phone number or real name. Who you are on
            clipspace is up to you.
          </Feature>
        </div>
      </section>

      {/* why */}
      <section id="why" className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[auto_1fr] min-[1600px]:grid-cols-2 min-[1600px]:gap-16">
          {/* the clip pal keeps you company here up to 1600px; on wide
              desktops the walking guide passes through instead */}
          <div className="mx-auto md:mx-0 min-[1600px]:hidden" data-reveal>
            <div className="animate-float">
              <div className="pal-idle">
                <PalSvg width={90} />
              </div>
            </div>
          </div>
          <div data-reveal>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Remember when software was on <em>your</em> side?
            </h2>
            <p className="mt-5 max-w-2xl leading-relaxed text-muted">
              Somewhere along the way, social networks stopped working{" "}
              <em>for</em> the people on them and started working{" "}
              <em>on</em> the people on them. Feeds got angrier, ads got
              creepier, and everything you typed became someone else&apos;s
              asset.
            </p>
            <p className="mt-4 max-w-2xl leading-relaxed text-muted">
              Clipspace is our way back: the earnest, slightly dorky
              helpfulness of 90s software with the cryptography of 2026. It
              looks like you&apos;re trying to talk to your friends in
              private. We can help with that.
            </p>
          </div>
          {/* wide screens only: a stack of real press clippings — other
              people saying the same thing, held together by the clip */}
          <div className="hidden min-[1600px]:block" data-reveal>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-muted">
              don&apos;t just take our word for it
            </p>
            <div className="mt-6 space-y-4">
              <a
                href="https://jacobin.com/2025/10/internet-enshittification-antitrust-tech-doctorow"
                target="_blank"
                rel="noopener noreferrer"
                className="block -rotate-1 rounded-lg border border-line bg-surface-2 px-5 py-4 shadow-lg transition-all hover:rotate-0 hover:border-brass/40"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                  Jacobin
                </p>
                <p className="font-display mt-1.5 font-bold leading-snug">
                  How to save the internet from &ldquo;enshittification&rdquo;
                </p>
              </a>
              <a
                href="https://www.vice.com/en/article/targeted-advertising-is-ruining-the-internet-and-breaking-the-world/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rotate-[1.2deg] rounded-lg border border-line bg-surface-2 px-5 py-4 shadow-lg transition-all hover:rotate-0 hover:border-brass/40"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                  VICE
                </p>
                <p className="font-display mt-1.5 font-bold leading-snug">
                  Targeted advertising is ruining the internet and breaking
                  the world
                </p>
              </a>
              <a
                href="https://privacyinternational.org/long-read/2967/ad-supported-internet-broken-inefficient-and-privacy-nightmare-lets-fix-it"
                target="_blank"
                rel="noopener noreferrer"
                className="block -rotate-[0.6deg] rounded-lg border border-line bg-surface-2 px-5 py-4 shadow-lg transition-all hover:rotate-0 hover:border-brass/40"
              >
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">
                  Privacy International
                </p>
                <p className="font-display mt-1.5 font-bold leading-snug">
                  The ad-supported internet is broken, inefficient and a
                  privacy nightmare
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* open source */}
      <section id="opensource" className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div data-reveal>
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Built in the open.
            </h2>
            <p className="mt-5 leading-relaxed text-muted">
              Clipspace is being built right now, in public, on GitHub.
              It&apos;s not ready yet. Star the repo to follow along, open
              issues, send patches, or just watch us bend the wire into
              shape.
            </p>
            <a
              href="https://github.com/clipspace/clipspace-web"
              className="font-display mt-8 inline-block rounded-full border border-line px-6 py-3 font-bold transition-colors hover:border-brass hover:text-brass"
            >
              Star on GitHub ↗
            </a>
          </div>
          <div className="rounded-xl border border-line bg-surface p-6 font-mono text-sm leading-relaxed" data-reveal>
            <p className="text-muted"># coming soon</p>
            <p className="mt-2">
              <span className="text-brass">$</span> git clone
              github.com/clipspace/clipspace
            </p>
            <p>
              <span className="text-brass">$</span> cd clipspace
            </p>
            <p>
              <span className="text-brass">$</span> make freedom
            </p>
            <p className="mt-2 text-muted">
              generating your keys… done.
              <br />
              welcome to your space. 🖇️
            </p>
          </div>
        </div>
      </section>

      {/* what's new */}
      <section id="news" className="border-t border-line bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl font-bold md:text-4xl" data-reveal>
            What&apos;s new?
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2" data-reveal-stagger>
            <div className="rounded-xl border border-line bg-bg p-6">
              <span className="rounded-full border border-brass/40 px-2.5 py-1 text-xs font-medium text-brass">
                in progress
              </span>
              <h3 className="font-display mt-4 text-lg font-bold">
                First version for Android
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                The first clipspace app is being built for Android right now,
                and we&apos;re working toward going public with the first
                version of the server alongside it.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-bg p-6">
              <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-muted">
                planned
              </span>
              <h3 className="font-display mt-4 text-lg font-bold">
                iOS, web &amp; desktop
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                A version for Apple devices will be released sometime in the
                future, along with a web version and desktop apps for Windows
                and Linux. But right now, Android is the one on its way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer id="contact" className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center">
          <Logo size={28} textClass="text-lg" />
          <p className="max-w-md text-sm text-muted">
            Free. Open source. Encrypted. Yours.
          </p>
          <p className="text-xs text-muted">
            © 2026 clipspace · made with 🖇️ and stubbornness
          </p>
          <p className="text-xs text-muted">
            <a href="/privacy" className="hover:text-brass hover:underline">Privacy</a>
            {" · "}
            <a href="https://github.com/clipspace/clipspace-web" className="hover:text-brass hover:underline">GitHub</a>
            {" · "}
            <a href="mailto:jachym@djt-group.com" className="hover:text-brass hover:underline">Contact</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
