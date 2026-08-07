// Schema.org description of what this site and this app actually are, for the
// crawlers that read it: Google, Bing, DuckDuckGo (via Bing), and the LLM
// scrapers that increasingly answer "is there a private alternative to X".
//
// Rendered as one <script type="application/ld+json"> block on the homepage.
// A @graph keeps the three entities cross-referenced by @id rather than
// repeating them.

const SITE = "https://clipspace.djt-group.com";

export const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "ClipSpace",
      url: SITE,
      logo: `${SITE}/icon.svg`,
      description:
        "ClipSpace builds a free, open-source, end-to-end encrypted social network with no ads and no tracking.",
      founder: {
        "@type": "Person",
        name: "Jáchym Šolta",
        url: "https://jachym.djt-group.com",
      },
      sameAs: ["https://github.com/clipspace"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "ClipSpace",
      description:
        "A free, open-source, end-to-end encrypted social network. No ads, no tracking, no big tech.",
      publisher: { "@id": `${SITE}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE}/#app`,
      name: "ClipSpace",
      applicationCategory: "SocialNetworkingApplication",
      operatingSystem: "Android",
      description:
        "An end-to-end encrypted social network. Messages are encrypted on your phone, the keys never leave it, and there is no account, no phone number and no real name to hand over.",
      url: SITE,
      isAccessibleForFree: true,
      // Free with nothing held back — the price is the whole point, so it is
      // stated rather than left for a crawler to guess.
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      author: { "@id": `${SITE}/#organization` },
      license: "https://github.com/clipspace/clipspace-web",
      featureList: [
        "End-to-end encryption",
        "No advertising",
        "No tracking or profiling",
        "No phone number or real name required",
        "Open source",
      ],
    },
  ],
} as const;
