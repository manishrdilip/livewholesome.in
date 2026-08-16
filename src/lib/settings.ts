import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export type Settings = {
  business_name: string;
  registered_address: string | null;
  gstin: string | null;
  fssai_license: string | null;
  support_phone: string | null;
  support_email: string | null;
  gst_registered: boolean;
  gst_rate: number;
  hsn_code: string;
  invoice_prefix: string;
  shipping_fee: number;
  logo_path: string | null;
  ship_from_address: string | null;
  /** Overrides PRODUCT.unitPrice when set; null falls back to the code default. */
  product_price: number | null;
  /** Sitewide offer, applied on top of the effective price. 0 = no offer. */
  discount_percent: number;
  /** Extra % off when a customer picks the monthly Subscribe & Save option. */
  subscribe_discount_percent: number;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
};

export async function getSettings(): Promise<Settings> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("settings").select("*").single();
  if (error || !data) throw new Error("Settings row is missing — run the Phase 1 migrations.");
  return data;
}
