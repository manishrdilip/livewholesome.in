import { NextResponse, type NextRequest, after } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/server";
import { PRODUCT } from "@/lib/product";
import { getSettings } from "@/lib/settings";
import { getEffectivePricing, getEffectiveShippingFee } from "@/lib/pricing";
import { generateInvoice } from "@/lib/invoice/generate";
import { sendOrderConfirmedEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const supabase = createServiceClient();

  // DB-backed so the limit is atomic and shared across serverless
  // instances — an in-memory Map resets per cold start and doesn't see
  // concurrent invocations on other instances, so it can't actually cap
  // a burst.
  const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
    "check_rate_limit",
    { p_key: `orders:${ip}`, p_max: 20, p_window_seconds: 60 * 60 }
  );
  if (rateLimitError) {
    console.error("check_rate_limit failed", rateLimitError.message);
  } else if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many orders from this connection. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      { error: "Please check the highlighted fields", fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Honeypot: real users never fill this hidden field in.
  if (data.companyWebsite) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  // Prices are always recomputed server-side — never trust the client.
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);
  const quantity = data.quantity;
  const unitPrice = data.isSubscription ? pricing.subscribePrice : pricing.offerPrice;
  const subtotal = Math.round(unitPrice * quantity * 100) / 100;
  const discount = 0;
  const shippingFee = getEffectiveShippingFee(subtotal, settings.shipping_fee ?? 0);
  const taxTotal = 0;
  const grandTotal = Math.round((subtotal - discount + shippingFee + taxTotal) * 100) / 100;

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
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
    },
    p_items: [
      {
        sku: PRODUCT.sku,
        product_name: PRODUCT.name,
        hsn_code: PRODUCT.hsnCode,
        quantity,
        unit_price: unitPrice,
        tax_rate: 0,
        line_total: subtotal,
      },
    ],
    p_totals: {
      subtotal,
      discount,
      shipping_fee: shippingFee,
      tax_total: taxTotal,
      grand_total: grandTotal,
    },
    p_customer_note: data.isSubscription
      ? `[Monthly Subscribe & Save] ${data.customerNote || ""}`.trim()
      : data.customerNote || null,
  });

  if (error) {
    if (error.message.includes("DAILY_LIMIT_REACHED")) {
      return NextResponse.json(
        { error: "Day order limit reached. Please come back after 12:00 AM." },
        { status: 409 }
      );
    }
    console.error("create_order failed", error.message);
    return NextResponse.json(
      { error: "Could not place your order. Please try again." },
      { status: 500 }
    );
  }

  const orderNumber = (result as { order_number: string }).order_number;

  // Proforma invoice generation shouldn't block the customer's confirmation —
  // an unpaid abandoned order still deserves a receipt, but a PDF/storage
  // hiccup here must not fail an otherwise-successful order. after() keeps
  // the serverless function alive past the response until this settles.
  after(async () => {
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
  });

  return NextResponse.json({ orderNumber }, { status: 201 });
}
