import { revalidatePath } from "next/cache";
import { getSettings } from "@/lib/settings";
import { createServiceClient } from "@/lib/supabase/server";
import { PRODUCT } from "@/lib/product";

async function updateSettings(formData: FormData) {
  "use server";

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("settings")
    .update({
      business_name: String(formData.get("business_name") ?? "").trim(),
      registered_address: String(formData.get("registered_address") ?? "").trim() || null,
      gstin: String(formData.get("gstin") ?? "").trim() || null,
      fssai_license: String(formData.get("fssai_license") ?? "").trim() || null,
      support_phone: String(formData.get("support_phone") ?? "").trim() || null,
      support_email: String(formData.get("support_email") ?? "").trim() || null,
      gst_registered: formData.get("gst_registered") === "on",
      gst_rate: Number(formData.get("gst_rate") ?? 0),
      hsn_code: String(formData.get("hsn_code") ?? "").trim(),
      invoice_prefix: String(formData.get("invoice_prefix") ?? "WP").trim(),
      shipping_fee: Number(formData.get("shipping_fee") ?? 0),
      ship_from_address: String(formData.get("ship_from_address") ?? "").trim() || null,
      product_price: formData.get("product_price")
        ? Number(formData.get("product_price"))
        : null,
      discount_percent: Number(formData.get("discount_percent") ?? 0),
      subscribe_discount_percent: Number(formData.get("subscribe_discount_percent") ?? 10),
      facebook_url: String(formData.get("facebook_url") ?? "").trim() || null,
      instagram_url: String(formData.get("instagram_url") ?? "").trim() || null,
      youtube_url: String(formData.get("youtube_url") ?? "").trim() || null,
    })
    .eq("id", true);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings");
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-ink/60">
        These fields drive the invoice letterhead — no code change needed to fix a typo.
      </p>

      <form action={updateSettings} className="mt-6 max-w-xl space-y-6">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Business details</h2>
          <div className="mt-3 space-y-3">
            <Field label="Business name" name="business_name" defaultValue={settings.business_name} />
            <Field
              label="Registered address"
              name="registered_address"
              defaultValue={settings.registered_address ?? ""}
              textarea
            />
            <Field label="FSSAI licence number" name="fssai_license" defaultValue={settings.fssai_license ?? ""} />
            <Field label="Support phone" name="support_phone" defaultValue={settings.support_phone ?? ""} />
            <Field label="Support email" name="support_email" defaultValue={settings.support_email ?? ""} />
          </div>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">GST</h2>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="gst_registered"
              defaultChecked={settings.gst_registered}
            />
            Registered under GST
          </label>
          <p className="mt-1 text-xs text-ink/50">
            Off = Bill of Supply (no GSTIN shown, no tax lines). On = Tax Invoice with CGST/SGST
            or IGST. Confirm rate, HSN classification and invoice timing with a CA before
            switching this on for real orders.
          </p>
          <div className="mt-3 space-y-3">
            <Field label="GSTIN" name="gstin" defaultValue={settings.gstin ?? ""} />
            <Field
              label="GST rate (%)"
              name="gst_rate"
              type="number"
              step="0.01"
              defaultValue={String(settings.gst_rate)}
            />
            <Field label="HSN code" name="hsn_code" defaultValue={settings.hsn_code} />
          </div>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Invoicing &amp; shipping</h2>
          <div className="mt-3 space-y-3">
            <Field label="Invoice number prefix" name="invoice_prefix" defaultValue={settings.invoice_prefix} />
            <Field
              label="Shipping fee (₹)"
              name="shipping_fee"
              type="number"
              step="0.01"
              defaultValue={String(settings.shipping_fee)}
            />
            <Field
              label="Ship-from address (for shipping labels)"
              name="ship_from_address"
              defaultValue={settings.ship_from_address ?? ""}
              textarea
            />
          </div>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Pricing &amp; offers</h2>
          <p className="mt-1 text-xs text-ink/50">
            Leave price blank to use the code default (₹{PRODUCT.unitPrice}). Changes apply
            immediately across the site — no redeploy needed.
          </p>
          <div className="mt-3 space-y-3">
            <Field
              label="Product price override (₹)"
              name="product_price"
              type="number"
              step="0.01"
              defaultValue={settings.product_price != null ? String(settings.product_price) : ""}
            />
            <Field
              label="Sitewide offer (% off)"
              name="discount_percent"
              type="number"
              step="0.01"
              defaultValue={String(settings.discount_percent)}
            />
            <Field
              label="Subscribe & Save discount (%)"
              name="subscribe_discount_percent"
              type="number"
              step="0.01"
              defaultValue={String(settings.subscribe_discount_percent)}
            />
          </div>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Social links</h2>
          <p className="mt-1 text-xs text-ink/50">
            Leave blank to hide that icon in the footer.
          </p>
          <div className="mt-3 space-y-3">
            <Field label="Facebook URL" name="facebook_url" defaultValue={settings.facebook_url ?? ""} />
            <Field label="Instagram URL" name="instagram_url" defaultValue={settings.instagram_url ?? ""} />
            <Field label="YouTube URL" name="youtube_url" defaultValue={settings.youtube_url ?? ""} />
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-emerald px-6 py-2.5 text-sm font-semibold text-cream"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue: string;
  type?: string;
  step?: string;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-1">
        {textarea ? (
          <textarea name={name} defaultValue={defaultValue} className="input" rows={2} />
        ) : (
          <input
            name={name}
            type={type}
            step={step}
            defaultValue={defaultValue}
            className="input"
          />
        )}
      </div>
    </label>
  );
}
