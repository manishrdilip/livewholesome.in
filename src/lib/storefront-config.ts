import "server-only";
import { getSettings } from "@/lib/settings";
import { getEffectivePricing } from "@/lib/pricing";

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
};

// Single source of truth for the storefront's public pricing/config —
// used to seed the initial page render (no flash of code-default values)
// and by /api/storefront-config (which the client re-fetches from).
export async function getStorefrontConfig(): Promise<StorefrontConfig> {
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);

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
  };
}
