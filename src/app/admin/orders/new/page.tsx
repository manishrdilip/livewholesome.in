import { redirect } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { getEffectivePricing, getEffectiveShippingFee } from "@/lib/pricing";
import { generateInvoice } from "@/lib/invoice/generate";
import { sendOrderConfirmedEmail } from "@/lib/email/send";
import { PRODUCT } from "@/lib/product";
import { INDIAN_STATES } from "@/lib/indian-states";
import { whatsappOrderSchema } from "@/lib/validation";

async function logWhatsAppOrder(formData: FormData) {
  "use server";

  const parsed = whatsappOrderSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    whatsappSameAsPhone: formData.get("whatsappSameAsPhone") === "on",
    whatsappNumber: formData.get("whatsappNumber") ?? "",
    email: formData.get("email"),
    pincode: formData.get("pincode"),
    line1: formData.get("line1"),
    line2: formData.get("line2") ?? "",
    landmark: formData.get("landmark") ?? "",
    city: formData.get("city"),
    state: formData.get("state"),
    customerNote: formData.get("customerNote") ?? "",
    quantity: formData.get("quantity"),
    isSubscription: formData.get("isSubscription") === "on",
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Please check the highlighted fields");
  }
  const data = parsed.data;

  const supabase = createServiceClient();
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);
  const unitPrice = data.isSubscription ? pricing.subscribePrice : pricing.offerPrice;
  const subtotal = Math.round(unitPrice * data.quantity * 100) / 100;
  const shippingFee = getEffectiveShippingFee(subtotal, settings.shipping_fee ?? 0);
  const grandTotal = Math.round((subtotal + shippingFee) * 100) / 100;

  const phone = data.phone;
  const whatsappNumber = data.whatsappSameAsPhone || !data.whatsappNumber ? phone : data.whatsappNumber;

  const { data: result, error } = await supabase.rpc("create_order", {
    p_customer: {
      name: data.name,
      email: data.email,
      phone,
      whatsapp_number: whatsappNumber,
      whatsapp_opt_in: true,
      email_opt_in: true,
    },
    p_address: {
      line1: data.line1,
      line2: data.line2 || null,
      landmark: data.landmark || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: "India",
    },
    p_items: [
      {
        sku: PRODUCT.sku,
        product_name: PRODUCT.name,
        hsn_code: PRODUCT.hsnCode,
        quantity: data.quantity,
        unit_price: unitPrice,
        tax_rate: 0,
        line_total: subtotal,
      },
    ],
    p_totals: {
      subtotal,
      discount: 0,
      shipping_fee: shippingFee,
      tax_total: 0,
      grand_total: grandTotal,
    },
    p_customer_note: data.isSubscription
      ? `[Monthly Subscribe & Save] ${data.customerNote || ""}`.trim()
      : data.customerNote || null,
  });

  if (error) {
    if (error.message.includes("DAILY_LIMIT_REACHED")) {
      throw new Error("Today's kitchen order cap has been reached — try again after midnight.");
    }
    throw new Error(error.message);
  }

  const orderNumber = (result as { order_number: string }).order_number;

  await supabase
    .from("orders")
    .update({ internal_note: "Placed via WhatsApp chat — logged manually by admin." })
    .eq("order_number", orderNumber);

  try {
    await generateInvoice(orderNumber, "PROFORMA");
  } catch (err) {
    console.error(`Proforma invoice generation failed for ${orderNumber}`, err);
  }
  try {
    await sendOrderConfirmedEmail(orderNumber);
  } catch (err) {
    console.error(`Order confirmation email failed for ${orderNumber}`, err);
  }

  redirect(`/admin/orders/${orderNumber}`);
}

export default function NewWhatsAppOrderPage() {
  return (
    <div>
      <Link href="/admin" className="text-sm text-emerald hover:underline">
        ← All orders
      </Link>
      <h1 className="mt-2 font-serif text-2xl font-bold">Log a WhatsApp order</h1>
      <p className="mt-1 max-w-xl text-sm text-ink/60">
        For a customer who ordered by chatting on WhatsApp instead of using the site checkout.
        This creates a real order in the same pipeline — pricing, daily cap, invoice, and
        confirmation email all work exactly like a normal order.
      </p>

      <form action={logWhatsAppOrder} className="mt-6 max-w-xl space-y-6">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Customer</h2>
          <div className="mt-3 space-y-3">
            <Field label="Full name" name="name" required />
            <Field label="Phone (with country code)" name="phone" defaultValue="+91 " required />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="whatsappSameAsPhone" defaultChecked />
              WhatsApp number is the same as phone
            </label>
            <Field label="WhatsApp number (if different)" name="whatsappNumber" />
            <Field label="Email" name="email" type="email" required />
          </div>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Shipping address</h2>
          <div className="mt-3 space-y-3">
            <Field label="House / street" name="line1" required />
            <Field label="Line 2 (optional)" name="line2" />
            <Field label="Landmark (optional)" name="landmark" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" name="city" required />
              <Field label="Pincode" name="pincode" required />
            </div>
            <label className="block text-sm">
              <span className="font-medium">State</span>
              <select name="state" className="input mt-1" required defaultValue="">
                <option value="" disabled>
                  Select state
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Order</h2>
          <div className="mt-3 space-y-3">
            <Field label="Quantity (500g units)" name="quantity" type="number" defaultValue="1" required />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isSubscription" />
              Monthly Subscribe &amp; Save
            </label>
            <Field
              label="Notes from the WhatsApp chat (optional)"
              name="customerNote"
              textarea
            />
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-emerald px-6 py-2.5 text-sm font-semibold text-cream"
        >
          Create order
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
  required,
  textarea,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">
        {label}
        {required && " *"}
      </span>
      <div className="mt-1">
        {textarea ? (
          <textarea name={name} defaultValue={defaultValue} className="input" rows={3} />
        ) : (
          <input
            name={name}
            type={type}
            defaultValue={defaultValue}
            required={required}
            className="input"
          />
        )}
      </div>
    </label>
  );
}
