import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";
import { getEffectivePricing } from "@/lib/pricing";

// Public, read-only — only exposes storefront-safe fields (no GSTIN,
// registered address, or other business-internal settings).
export async function GET() {
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);

  return NextResponse.json({
    ...pricing,
    shippingFee: settings.shipping_fee,
    supportPhone: settings.support_phone,
    supportEmail: settings.support_email,
    fssaiLicense: settings.fssai_license,
    facebookUrl: settings.facebook_url,
    instagramUrl: settings.instagram_url,
    youtubeUrl: settings.youtube_url,
  });
}
