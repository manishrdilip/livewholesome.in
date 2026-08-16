import { NextResponse } from "next/server";
import { getStorefrontConfig } from "@/lib/storefront-config";

// Reads live settings on every request — without this, Next.js treats a
// plain GET handler with no dynamic API usage as cacheable, and the edge
// can keep serving a stale snapshot from before an admin price/offer change.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public, read-only — only exposes storefront-safe fields (no GSTIN,
// registered address, or other business-internal settings).
export async function GET() {
  const config = await getStorefrontConfig();
  return NextResponse.json(config, { headers: { "Cache-Control": "no-store" } });
}
