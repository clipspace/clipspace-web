import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "privacy policy – clipspace",
  description:
    "How the clipspace website handles your data: no cookies, no analytics, no trackers. Just server logs at our hosting provider.",
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
        <p className="mt-3 text-sm text-muted">Last updated: 22 July 2026</p>

        <div className="mt-8 rounded-xl border border-brass/40 bg-surface p-5 leading-relaxed">
          <p className="font-display font-bold text-brass">The short version</p>
          <p className="mt-2 text-muted">
            This website sets <strong className="text-cream">no cookies</strong>, runs{" "}
            <strong className="text-cream">no analytics</strong>, embeds{" "}
            <strong className="text-cream">no trackers</strong>, and has no accounts or
            forms. The only data that exists at all are standard server logs at our
            hosting provider. We couldn&apos;t sell your data even if we wanted to –
            we don&apos;t have any.
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
            the site reliably and protecting it from abuse. Logs are kept only for the
            short retention period applied by Vercel and are not used by us to
            identify visitors.
          </p>
        </Section>

        <Section title="What is NOT happening">
          <ul className="list-inside list-disc space-y-1">
            <li>No cookies are set – which is why there is no cookie banner.</li>
            <li>No analytics or measurement of any kind.</li>
            <li>No advertising, no third-party embeds, no social media pixels.</li>
            <li>No accounts, no forms, no newsletter – we collect nothing from you.</li>
            <li>No data is sold or shared with anyone beyond the hosting described above.</li>
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
            If clipspace ever launches features that touch personal data (accounts,
            a waitlist), this policy will be updated first and the date above will
            change. The whole site is{" "}
            <a
              href="https://github.com/OckoTajny/clipspace-web"
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
