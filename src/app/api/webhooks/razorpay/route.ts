import { NextResponse, type NextRequest, after } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyRazorpayWebhookSignature } from "@/lib/payment/razorpay";
import { generateInvoice } from "@/lib/invoice/generate";

// Server-to-server confirmation for Razorpay Payment Links specifically
// (see src/lib/orders/createWhatsAppOrder.ts) — a Payment Link payment
// never round-trips through our checkout page, so razorpay/verify's
// client-driven flow never fires for it. This is the only way a WhatsApp
// order's payment_status ever flips to PAID. Mirrors the Cashfree webhook
// (src/app/api/payment/webhook/route.ts) and razorpay/verify's DB update.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
  }

  let validSignature: boolean;
  try {
    validSignature = verifyRazorpayWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("Razorpay webhook signature check failed to run", err);
    return NextResponse.json({ error: "Server not configured for webhooks" }, { status: 500 });
  }
  if (!validSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    event?: string;
    payload?: {
      payment_link?: { entity?: { notes?: { orderNumber?: string } } };
      payment?: { entity?: { notes?: { orderNumber?: string } } };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderNumber =
    event.payload?.payment_link?.entity?.notes?.orderNumber ??
    event.payload?.payment?.entity?.notes?.orderNumber;

  if (!orderNumber) {
    return NextResponse.json({ received: true });
  }

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, payment_status")
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    console.error(`Razorpay webhook for unknown order ${orderNumber}`);
    return NextResponse.json({ received: true });
  }

  if (
    (event.event === "payment_link.paid" || event.event === "payment.captured") &&
    order.payment_status !== "PAID"
  ) {
    await supabase
      .from("orders")
      .update({ payment_status: "PAID", payment_method: "RAZORPAY" })
      .eq("id", order.id);

    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "PAYMENT_RECEIVED",
      label: "Payment confirmed via Razorpay payment link",
    });

    after(async () => {
      try {
        await generateInvoice(orderNumber, "PROFORMA");
      } catch (err) {
        console.error(`Post-payment invoice regeneration failed for ${orderNumber}`, err);
      }
    });
  } else if (event.event === "payment_link.cancelled" || event.event === "payment.failed") {
    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "PAYMENT_FAILED",
      label: `Razorpay payment ${event.event === "payment.failed" ? "failed" : "link cancelled"}`,
    });
  }

  return NextResponse.json({ received: true });
}
