import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/payment/cashfree";

export async function POST(request: NextRequest) {
  // Signature is computed over the exact raw bytes Cashfree sent — reading
  // via request.text() first (not request.json()) preserves that.
  const rawBody = await request.text();
  const timestamp = request.headers.get("x-webhook-timestamp");
  const signature = request.headers.get("x-webhook-signature");

  if (!timestamp || !signature) {
    return NextResponse.json({ error: "Missing webhook headers" }, { status: 400 });
  }

  let validSignature: boolean;
  try {
    validSignature = verifyWebhookSignature(rawBody, timestamp, signature);
  } catch (err) {
    console.error("Cashfree webhook signature check failed to run", err);
    return NextResponse.json({ error: "Server not configured for webhooks" }, { status: 500 });
  }

  if (!validSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: {
    type?: string;
    data?: { order?: { order_id?: string }; payment?: { payment_status?: string } };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderNumber = event.data?.order?.order_id;
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
    console.error(`Cashfree webhook for unknown order ${orderNumber}`);
    return NextResponse.json({ received: true });
  }

  if (event.type === "PAYMENT_SUCCESS_WEBHOOK" && order.payment_status !== "PAID") {
    await supabase
      .from("orders")
      .update({ payment_status: "PAID", payment_method: "CASHFREE" })
      .eq("id", order.id);

    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "PAYMENT_RECEIVED",
      label: "Payment confirmed via Cashfree",
    });
  } else if (event.type === "PAYMENT_FAILED_WEBHOOK") {
    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "PAYMENT_FAILED",
      label: "Payment attempt failed via Cashfree",
    });
  } else if (event.type === "PAYMENT_USER_DROPPED_WEBHOOK") {
    await supabase.from("order_events").insert({
      order_id: order.id,
      status: "PAYMENT_DROPPED",
      label: "Customer left the Cashfree checkout before completing payment",
    });
  }

  return NextResponse.json({ received: true });
}
