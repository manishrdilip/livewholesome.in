import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { getEffectivePricing, getEffectiveShippingFee } from "@/lib/pricing";
import { generateInvoice } from "@/lib/invoice/generate";
import { sendOrderConfirmedEmail } from "@/lib/email/send";
import { createRazorpayPaymentLink } from "@/lib/payment/razorpay";
import { PRODUCT } from "@/lib/product";
import type { WhatsAppOrderInput } from "@/lib/validation";

export class DailyLimitReachedError extends Error {
  constructor() {
    super("Today's kitchen order cap has been reached — try again after midnight.");
  }
}

export type CreateWhatsAppOrderResult = {
  orderNumber: string;
  grandTotal: number;
  paymentLink: string | null;
};

/** Shared order-creation path for an order that originated in a WhatsApp
 * chat rather than the site's own checkout — used by both the admin's
 * "Log a WhatsApp order" form and the iZap webhook (see
 * src/app/api/webhooks/izap/route.ts). Creates a real order via the same
 * create_order() RPC the live checkout uses (same pricing, daily cap,
 * invoice, confirmation email), then best-effort generates a real Razorpay
 * payment link so there's something concrete to hand the customer back —
 * never a fabricated order number or link. `internalNote` distinguishes who
 * logged it (admin vs. the iZap webhook) in the order's audit trail. */
export async function createWhatsAppOrder(
  data: WhatsAppOrderInput,
  internalNote: string
): Promise<CreateWhatsAppOrderResult> {
  const supabase = createServiceClient();
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);
  const unitPrice = data.isSubscription ? pricing.subscribePrice : pricing.offerPrice;
  const subtotal = Math.round(unitPrice * data.quantity * 100) / 100;
  const shippingFee = getEffectiveShippingFee(subtotal, settings.shipping_fee ?? 0);
  const grandTotal = Math.round((subtotal + shippingFee) * 100) / 100;

  const phone = data.phone;
  const whatsappNumber =
    data.whatsappSameAsPhone || !data.whatsappNumber ? phone : data.whatsappNumber;

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
      throw new DailyLimitReachedError();
    }
    throw new Error(error.message);
  }

  const { order_id: orderId, order_number: orderNumber } = result as {
    order_id: string;
    order_number: string;
  };

  await supabase.from("orders").update({ internal_note: internalNote }).eq("id", orderId);

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

  let paymentLink: string | null = null;
  try {
    const link = await createRazorpayPaymentLink({
      amount: Math.round(grandTotal * 100),
      orderNumber,
      customerName: data.name,
      customerPhone: whatsappNumber,
      customerEmail: data.email,
    });
    paymentLink = link.short_url;
    await supabase.from("order_events").insert({
      order_id: orderId,
      status: "PAYMENT_LINK_CREATED",
      label: "Razorpay payment link generated",
      note: paymentLink,
    });
  } catch (err) {
    console.error(`Payment link creation failed for ${orderNumber}`, err);
  }

  return { orderNumber, grandTotal, paymentLink };
}
