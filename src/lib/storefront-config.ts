import "server-only";
import { getSettings } from "@/lib/settings";
import { getEffectivePricing } from "@/lib/pricing";
import { createServiceClient } from "@/lib/supabase/server";

export type StorefrontConfig = {
  basePrice: number;
  offerPrice: number;
  discountPercent: number;
  subscribePrice: number;
  subscribeDiscountPercent: number;
  shippingFee: number;
  supportPhone: string | null;
  supportEmail: string | null;
  fssaiLicense: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  paymentGatewayEnabled: boolean;
  cashfreeMode: "sandbox" | "production";
  /** Kitchen's daily production cap, in units (500g pouches). Admin-configurable. */
  dailyOrderLimitUnits: number;
  /** Units already ordered today (India time), across all non-cancelled orders. */
  unitsOrderedToday: number;
};

// Single source of truth for the storefront's public pricing/config —
// used to seed the initial page render (no flash of code-default values)
// and by /api/storefront-config (which the client re-fetches from).
export async function getStorefrontConfig(): Promise<StorefrontConfig> {
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);

  const supabase = createServiceClient();
  const { data: unitsUsed } = await supabase.rpc("daily_order_units_used");

  return {
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
    dailyOrderLimitUnits: settings.daily_order_limit_units,
    unitsOrderedToday: unitsUsed ?? 0,
  };
}
