import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createPaymentSession } from "@/lib/payment/cashfree";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const supabase = createServiceClient();

  // Order numbers are sequential and guessable — without a limit here this
  // endpoint could be hammered to enumerate valid orders or spin up
  // Cashfree sessions for orders that aren't the caller's.
  const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
    "check_rate_limit",
    { p_key: `payment-session:${ip}`, p_max: 10, p_window_seconds: 60 * 60 }
  );
  if (rateLimitError) {
    console.error("check_rate_limit failed", rateLimitError.message);
  } else if (!withinLimit) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const orderNumber = (body as { orderNumber?: unknown }).orderNumber;
  if (typeof orderNumber !== "string" || !orderNumber) {
    return NextResponse.json({ error: "orderNumber is required" }, { status: 400 });
  }
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, grand_total, payment_status, customer_snapshot")
    .eq("order_number", orderNumber)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.payment_status === "PAID") {
    return NextResponse.json({ error: "This order is already paid" }, { status: 409 });
  }

  const customer = order.customer_snapshot as { name: string; email: string; phone: string };

  try {
    const session = await createPaymentSession({
      orderNumber: order.order_number,
      // Amount always comes from our own DB row, computed server-side at
      // order-creation time — never from anything the client sends here.
      orderAmount: order.grand_total,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
    });
    return NextResponse.json({ paymentSessionId: session.payment_session_id });
  } catch (err) {
    console.error(`Cashfree session creation failed for ${orderNumber}`, err);
    const message = err instanceof Error ? err.message : "Payment setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
