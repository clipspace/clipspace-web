import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "privacy policy – ClipSpace",
  description:
    "How the ClipSpace website handles your data: no cookies, no ad trackers, no accounts. Just hosting logs and cookieless, aggregate analytics.",
  alternates: { canonical: "/privacy" },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

export default function Privacy() {
  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo size={30} textClass="text-lg" />
        </Link>
        <Link href="/" className="text-sm text-muted transition-colors hover:text-cream">
          ← back
        </Link>
      </header>

      <article className="mx-auto max-w-3xl px-6 pb-24 pt-8">
        <h1 className="font-display text-4xl font-bold">Privacy policy</h1>
        <p className="mt-3 text-sm text-muted">Last updated: 7 August 2026</p>

        <div className="mt-8 rounded-xl border border-brass/40 bg-surface p-5 leading-relaxed">
          <p className="font-display font-bold text-brass">The short version</p>
          <p className="mt-2 text-muted">
            This website sets <strong className="text-cream">no cookies</strong>,
            embeds <strong className="text-cream">no ad trackers</strong>, and has
            no accounts or forms. We use privacy-friendly, cookieless analytics that
            counts visits in aggregate and never identifies you – so there is
            nothing about you to sell, and no reason for a cookie banner.
          </p>
        </div>

        <Section title="Who is responsible">
          <p>
            This website (clipspace.djt-group.com) is run by Jáchym Šolta as the data
            controller in the sense of the EU General Data Protection Regulation
            (GDPR). Contact:{" "}
            <a href="mailto:jachym@djt-group.com" className="text-brass hover:underline">
              jachym@djt-group.com
            </a>
            .
          </p>
        </Section>

        <Section title="What data is processed">
          <p>
            When you visit this site, our hosting provider{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              className="text-brass hover:underline"
              rel="noopener noreferrer"
            >
              Vercel Inc.
            </a>{" "}
            (as our data processor) automatically processes standard technical server
            logs: your IP address, browser user-agent, requested URL, and time of
            request. This happens on every website on the internet – it&apos;s how
            web servers work.
          </p>
          <p>
            The legal basis is our legitimate interest (Art. 6(1)(f) GDPR) in serving
            the site reliably and protecting it from abuse. We do not store these logs
            ourselves and cannot search them; they are retained only for the period
            Vercel applies under its own policy, and we never use them to identify
            visitors. You can object to this processing at any time under Art. 21 GDPR
            using the contact address above.
          </p>
          <p>
            To keep the public API endpoints from being hammered, the server also
            counts recent requests per IP address in memory. Those counters are never
            written to disk and disappear within minutes.
          </p>
        </Section>

        <Section title="Where your data goes">
          <p>
            Vercel Inc. is based in the United States, so serving this site can
            involve transferring the technical data described above outside the
            European Economic Area. Those transfers are covered by the standard
            contractual clauses in{" "}
            <a
              href="https://vercel.com/legal/dpa"
              className="text-brass hover:underline"
              rel="noopener noreferrer"
            >
              Vercel&apos;s data processing addendum
            </a>
            , the safeguard foreseen by Art. 46 GDPR. Requests from Europe are served
            from Vercel&apos;s Frankfurt region.
          </p>
          <p>
            No other company receives your data. We use no advertising networks, no
            content delivery networks of our own, and no third-party embeds – every
            font, script and image on this site is served from this domain.
          </p>
        </Section>

        <Section title="Analytics">
          <p>
            We use{" "}
            <a
              href="https://vercel.com/docs/analytics/privacy-policy"
              className="text-brass hover:underline"
              rel="noopener noreferrer"
            >
              Vercel Web Analytics
            </a>
            , a privacy-friendly analytics tool. It counts page views and tells us
            roughly where visitors come from (country, referrer, device type) in
            aggregate. It sets <strong className="text-cream">no cookies</strong>,
            uses no cross-site tracking, and does not build a profile of you or
            store data that identifies you – which is why this site needs no cookie
            banner.
          </p>
        </Section>

        <Section title="What is NOT happening">
          <ul className="list-inside list-disc space-y-1">
            <li>
              No cookies are set when you browse this site – which is why there is
              no cookie banner. (The one exception is the sign-in cookie on our own
              password-protected admin page, which is strictly necessary and which
              visitors never reach.)
            </li>
            <li>No Google Analytics, no advertising, no social media pixels.</li>
            <li>
              No accounts, no forms, no newsletter – there is nothing here for you
              to fill in, so you never hand us anything directly.
            </li>
            <li>
              No fingerprinting, no cross-site tracking, no profiles, and no
              automated decision-making about you.
            </li>
            <li>No data is sold or shared with anyone beyond the services described above.</li>
          </ul>
        </Section>

        <Section title="Your rights">
          <p>
            Under the GDPR you have the right to access, rectify, or erase personal
            data concerning you, the right to restrict or object to processing, and
            the right to data portability. Since we hold no data about you beyond
            transient hosting logs we cannot ourselves search, exercising these
            rights will usually be quick: email us and we&apos;ll help.
          </p>
          <p>
            You also have the right to lodge a complaint with a supervisory
            authority – in the Czech Republic that is the Office for Personal Data
            Protection (
            <a href="https://uoou.gov.cz" className="text-brass hover:underline" rel="noopener noreferrer">
              ÚOOÚ
            </a>
            ), or the authority in your own EU country.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            If ClipSpace ever launches features that touch personal data (accounts,
            a waitlist), this policy will be updated first and the date above will
            change. The whole site is{" "}
            <a
              href="https://github.com/clipspace/clipspace-web"
              className="text-brass hover:underline"
              rel="noopener noreferrer"
            >
              versioned on GitHub
            </a>
            , so every historical version of this policy stays publicly auditable.
          </p>
        </Section>
      </article>
    </main>
  );
}
