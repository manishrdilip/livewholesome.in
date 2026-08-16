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
};

export async function getSettings(): Promise<Settings> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.from("settings").select("*").single();
  if (error || !data) throw new Error("Settings row is missing — run the Phase 1 migrations.");
  return data;
}
