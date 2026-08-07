import { corsPreflight, serversResponse } from "@/lib/servers-api";

// The list is edited from the admin panel, so it must be read per request
// rather than baked in at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  return serversResponse("unofficial");
}

export async function OPTIONS() {
  return corsPreflight();
}
