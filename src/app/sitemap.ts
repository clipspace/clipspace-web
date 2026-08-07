import type { MetadataRoute } from "next";

const SITE = "https://clipspace.djt-group.com";

// Bump when the page's content actually changes. Deliberately not `new Date()`:
// that is evaluated per request, so every crawl would report the page as
// modified seconds ago and the signal stops meaning anything.
const HOME_UPDATED = "2026-08-07";
const PRIVACY_UPDATED = "2026-07-23";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      // No trailing slash, so this is byte-identical to the canonical tag the
      // home page renders.
      url: SITE,
      lastModified: HOME_UPDATED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: PRIVACY_UPDATED,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
