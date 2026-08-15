import { NextResponse, type NextRequest, after } from "next/server";
import { checkoutSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";
import { PRODUCT } from "@/lib/product";
import { generateInvoice } from "@/lib/invoice/generate";
import { sendOrderConfirmedEmail } from "@/lib/email/send";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(`orders:${ip}`, 5, 60 * 60 * 1000)) {
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
  const quantity = data.quantity;
  const unitPrice = PRODUCT.unitPrice;
  const subtotal = Math.round(unitPrice * quantity * 100) / 100;
  const discount = 0;
  const shippingFee = 0;
  const taxTotal = 0;
  const grandTotal = Math.round((subtotal - discount + shippingFee + taxTotal) * 100) / 100;

  const phone = `+91${data.phone}`;
  const whatsappNumber = data.whatsappSameAsPhone
    ? phone
    : data.whatsappNumber
      ? `+91${data.whatsappNumber}`
      : phone;

  const supabase = createServiceClient();

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
    p_customer_note: data.customerNote || null,
  });

  if (error) {
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
