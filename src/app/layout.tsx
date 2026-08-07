import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ScrollReveal from "@/components/ScrollReveal";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const instrument = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const TITLE = "ClipSpace – your space, your people, your keys";
const DESCRIPTION =
  "ClipSpace is a free, open-source, end-to-end encrypted social network. No ads, no tracking, no big tech. Held together by a paperclip.";

export const metadata: Metadata = {
  metadataBase: new URL("https://clipspace.djt-group.com"),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "ClipSpace",
  authors: [{ name: "Jáchym Šolta", url: "https://jachym.djt-group.com" }],
  creator: "Jáchym Šolta",
  publisher: "ClipSpace",
  category: "technology",
  // What someone actually types when they are looking for a way out of the
  // big-network default. Ignored by Google, still read by some others.
  keywords: [
    "encrypted social network",
    "open source social network",
    "end-to-end encryption",
    "privacy",
    "no ads",
    "no tracking",
    "alternative to big tech",
    "decentralised chat",
    "ClipSpace",
  ],
  // The defaults are already "index, follow", but crawlers hold back on
  // snippet and image size unless told otherwise — these say take it all.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "ClipSpace",
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ScrollReveal />
        <Analytics />
      </body>
    </html>
  );
}
