import { Logo, LogoIcon } from "@/components/Logo";

/* ---------- small building blocks ---------- */

function ChatLine({
  who,
  time,
  children,
}: {
  who: string;
  time: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 text-[15px] leading-relaxed">
      <span className="font-display text-steel">{time}</span>
      <p>
        <span className={`font-display font-semibold ${who === "you" ? "text-ballpoint" : "text-ink"}`}>
          &lt;{who}&gt;
        </span>{" "}
        {children}
      </p>
    </div>
  );
}

function CheckItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 border-t border-rule py-5 first:border-t-0">
      <span className="font-display mt-0.5 font-semibold text-ink" aria-hidden>
        [x]
      </span>
      <div>
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-ink/70">{children}</p>
      </div>
    </div>
  );
}

/* the clip pal — a real steel paperclip with eyes, no relation to anyone from Redmond */
function PaperclipPal({ size = 72, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 50 70"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M15 62 L15 14 C15 7 19 3 25 3 C31 3 35 7 35 14 L35 50 C35 55 32 58 28 58 C24 58 21 55 21 50 L21 20"
        stroke="#7C8391"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="22" cy="12" r="2.4" fill="#1C1914" />
      <circle cx="30" cy="12" r="2.4" fill="#1C1914" />
    </svg>
  );
}

/* ---------- page ---------- */

export default function Home() {
  return (
    <main className="flex-1">
      {/* nav */}
      <header className="border-b-[1.5px] border-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Logo size={30} textClass="text-lg" />
          <nav className="font-display hidden items-center gap-7 text-sm sm:flex">
            <a href="#features" className="hover:text-ballpoint hover:underline">features</a>
            <a href="#why" className="hover:text-ballpoint hover:underline">why</a>
            <a href="#opensource" className="hover:text-ballpoint hover:underline">source</a>
          </nav>
          <a
            href="https://github.com/OckoTajny/clipspace-web"
            className="font-display border-[1.5px] border-ink px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
          >
            github ↗
          </a>
        </div>
      </header>

      {/* memo header + hero */}
      <section className="mx-auto max-w-5xl px-6 pt-12 md:pt-16">
        <div className="font-display space-y-1 text-sm text-ink/60">
          <p>MEMO № 001 · {new Date().getFullYear()}</p>
          <p>FROM: the people building clipspace</p>
          <p>TO: everyone tired of being the product</p>
          <p>
            RE: <span className="text-redpen">your privacy</span>
          </p>
          <p>
            STATUS: <span className="hl font-medium text-ink">work in progress — not ready yet, being built right now</span>
          </p>
        </div>

        <div className="mt-10 grid items-start gap-12 md:grid-cols-[1.1fr_1fr] md:gap-10">
          <div>
            <h1 className="font-display text-4xl font-bold leading-[1.15] tracking-tight md:text-[3.4rem] md:leading-[1.1]">
              Your space.
              <br />
              Your people.
              <br />
              <span className="hl">Your keys.</span>
            </h1>
            <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-ink/80">
              Clipspace is a social network that belongs to the people using
              it. End-to-end encrypted, fully open source, free forever. No
              ads, no tracking, no big tech reading over your shoulder.
            </p>
            <div className="font-display mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#opensource"
                className="border-[1.5px] border-ink bg-ink px-6 py-3 font-semibold text-paper transition-transform hover:-translate-y-0.5"
              >
                get early access
              </a>
              <a
                href="#features"
                className="border-[1.5px] border-ink px-6 py-3 font-semibold transition-colors hover:bg-highlighter"
              >
                see how it works
              </a>
            </div>
            <p className="font-display mt-8 text-xs text-ink/50">
              held together by a paperclip — not by a corporation
            </p>
          </div>

          {/* printed transcript, clip pal holding the corner */}
          <div className="relative mt-4 md:mt-0">
            <PaperclipPal
              size={38}
              className="absolute -top-7 left-6 z-10 -rotate-6"
            />
            <div className="paper-card rotate-[0.6deg] p-6">
              <div className="font-display flex items-baseline justify-between border-b border-rule pb-3 text-sm">
                <span className="font-semibold">#weekend-crew</span>
                <span className="text-steel">transcript · 4 people</span>
              </div>
              <div className="space-y-3 py-5">
                <ChatLine who="marek" time="19:02">
                  so… no ads in here? ever?
                </ChatLine>
                <ChatLine who="you" time="19:02">
                  ever. and nobody can read this — not even the server.
                </ChatLine>
                <ChatLine who="marek" time="19:03">
                  okay this is what the internet was supposed to be
                </ChatLine>
                <ChatLine who="lucie" time="19:03">
                  <span className="text-steel">is typing…</span>
                </ChatLine>
              </div>
              <div className="stamp absolute -right-3 top-24 px-3 py-1.5 text-sm font-bold">
                ENCRYPTED
              </div>
              <div className="font-display border-t border-rule pt-3 text-xs text-steel">
                keys generated on-device · server stores ciphertext only
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features as a typed checklist */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Everything a social network should be.
          <br />
          <span className="text-steel">Nothing it shouldn&apos;t.</span>
        </h2>
        <div className="mt-8 grid gap-x-14 md:grid-cols-2">
          <div>
            <CheckItem title="end-to-end encrypted">
              Every message, post and photo is encrypted on your device. Your
              keys never leave your pocket — nobody in between can read a
              thing.
            </CheckItem>
            <CheckItem title="100% open source">
              All of it — clients, server, crypto. Audit it, fork it, break
              it, fix it. Trust that&apos;s verified, not promised.
            </CheckItem>
            <CheckItem title="free forever">
              No ads, no premium tier for privacy, no selling your attention.
              Privacy is the default, not a subscription.
            </CheckItem>
          </div>
          <div>
            <CheckItem title="spaces, not feeds">
              Small circles of real people instead of an algorithmic
              firehose. You choose who&apos;s in your space and what you see.
            </CheckItem>
            <CheckItem title="self-hostable">
              Run your own server for your friends, family or community — or
              join one you trust. Your data lives where you say.
            </CheckItem>
            <CheckItem title="no phone number">
              Sign up without a phone number or real name. Who you are on
              clipspace is up to you.
            </CheckItem>
          </div>
        </div>
      </section>

      {/* why */}
      <section id="why" className="border-y-[1.5px] border-ink bg-[#fffef9]">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 py-16 md:grid-cols-[auto_1fr] md:py-20">
          <PaperclipPal size={84} className="mx-auto" />
          <div>
            <h2 className="font-display max-w-[30ch] text-2xl font-bold tracking-tight md:text-3xl">
              Remember when software was on <span className="redline">your</span> side?
            </h2>
            <p className="mt-5 max-w-[62ch] leading-relaxed text-ink/80">
              Somewhere along the way, social networks stopped working{" "}
              <em>for</em> the people on them and started working{" "}
              <em>on</em> the people on them. Feeds got angrier, ads got
              creepier, and everything you typed became someone else&apos;s
              asset.
            </p>
            <p className="mt-4 max-w-[62ch] leading-relaxed text-ink/80">
              Clipspace is our way back — the earnest, slightly dorky
              helpfulness of 90s software with the cryptography of 2026. It
              looks like you&apos;re trying to talk to your friends in
              private. We can help with that.
            </p>
          </div>
        </div>
      </section>

      {/* open source */}
      <section id="opensource" className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Built in the open.
            </h2>
            <p className="mt-5 max-w-[52ch] leading-relaxed text-ink/80">
              Clipspace is being built right now, in public, under a free
              software license. Star the repo to follow along, open issues,
              send patches — or just watch us bend the wire into shape.
            </p>
            <a
              href="https://github.com/OckoTajny/clipspace-web"
              className="font-display mt-8 inline-block border-[1.5px] border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-paper"
            >
              star on github ↗
            </a>
          </div>
          <div className="paper-card -rotate-[0.5deg] p-6">
            <p className="font-display text-xs text-steel"># coming soon</p>
            <div className="font-display mt-3 space-y-1 text-sm leading-relaxed">
              <p>
                <span className="text-ballpoint">$</span> git clone
                github.com/clipspace/clipspace
              </p>
              <p>
                <span className="text-ballpoint">$</span> cd clipspace
              </p>
              <p>
                <span className="text-ballpoint">$</span> make freedom
              </p>
              <p className="mt-3 text-steel">
                generating your keys… done.
                <br />
                welcome to your space.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t-[1.5px] border-ink">
        <div className="mx-auto flex max-w-5xl flex-col items-start gap-3 px-6 py-10">
          <Logo size={26} textClass="text-base" />
          <p className="font-display text-xs text-ink/50">
            free · open source · encrypted · yours — © {new Date().getFullYear()} clipspace,
            made with a paperclip and stubbornness
          </p>
        </div>
      </footer>
    </main>
  );
}
