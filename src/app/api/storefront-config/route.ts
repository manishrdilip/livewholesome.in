import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { getEffectivePricing } from "@/lib/pricing";

// Reads live settings on every request — without this, Next.js treats a
// plain GET handler with no dynamic API usage as cacheable, and the edge
// can keep serving a stale snapshot from before an admin price/offer change.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Public, read-only — only exposes storefront-safe fields (no GSTIN,
// registered address, or other business-internal settings).
export async function GET() {
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);

  return NextResponse.json(
    {
      ...pricing,
      shippingFee: settings.shipping_fee,
      supportPhone: settings.support_phone,
      supportEmail: settings.support_email?.toLowerCase() ?? null,
      fssaiLicense: settings.fssai_license,
      facebookUrl: settings.facebook_url,
      instagramUrl: settings.instagram_url,
      youtubeUrl: settings.youtube_url,
      paymentGatewayEnabled: Boolean(
        process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY
      ),
      cashfreeMode: process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? "production" : "sandbox",
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
