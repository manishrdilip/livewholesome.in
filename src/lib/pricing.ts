import { PRODUCT } from "@/lib/product";
import type { Settings } from "@/lib/settings";

export type EffectivePricing = {
  /** The admin-set (or code-default) price before any sitewide offer. */
  basePrice: number;
  /** basePrice after the sitewide offer, if any — what a one-time buyer pays. */
  offerPrice: number;
  discountPercent: number;
  /** offerPrice after the extra Subscribe & Save discount. */
  subscribePrice: number;
  subscribeDiscountPercent: number;
};

/** Single source of truth for pricing math — used both by the public
 * storefront-config endpoint (what the UI displays) and order creation
 * (what actually gets charged), so a tampered client-side price can never
 * be trusted over this. */
/** Orders ship free above this subtotal; below it, the admin-set flat
 * shipping_fee applies. */
export const FREE_SHIPPING_THRESHOLD = 798;

export function getEffectiveShippingFee(subtotal: number, shippingFeeSetting: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingFeeSetting;
}

export function getEffectivePricing(settings: Pick<
  Settings,
  "product_price" | "discount_percent" | "subscribe_discount_percent"
>): EffectivePricing {
  const basePrice = settings.product_price ?? PRODUCT.unitPrice;
  const discountPercent = settings.discount_percent ?? 0;
  const offerPrice = Math.round(basePrice * (1 - discountPercent / 100));
  const subscribeDiscountPercent = settings.subscribe_discount_percent ?? 0;
  const subscribePrice = Math.round(offerPrice * (1 - subscribeDiscountPercent / 100));

  return { basePrice, offerPrice, discountPercent, subscribePrice, subscribeDiscountPercent };
}
