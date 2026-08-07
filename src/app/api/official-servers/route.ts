import { headers } from "next/headers";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { listServers } from "@/lib/servers-db";

// The list is edited from the admin panel, so it must be read per request
// rather than baked in at build time.
export const dynamic = "force-dynamic";

// Generous for a list that changes rarely and is CDN-cached for a minute:
// normal clients poll far below this, abusive ones hit the wall.
const LIMIT = 60;
const WINDOW_MS = 60_000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET() {
  const ip = clientIp(await headers());
  const limit = rateLimit(`api:official-servers:${ip}`, LIMIT, WINDOW_MS);

  if (!limit.ok) {
    return Response.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          "Retry-After": String(limit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const servers = await listServers();
    return Response.json(
      { servers },
      {
        headers: {
          ...CORS_HEADERS,
          // Most traffic should be answered by the CDN, never reaching the
          // function or the database at all.
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    console.error("Failed to load official servers", error);
    return Response.json(
      { error: "Server list is unavailable." },
      { status: 503, headers: { ...CORS_HEADERS, "Cache-Control": "no-store" } },
    );
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
