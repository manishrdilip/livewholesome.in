import { NextResponse, type NextRequest } from "next/server";
import { trackOrderSchema } from "@/lib/validation";
import { createServiceClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const supabase = createServiceClient();

  // Same DB-backed limiter as /api/orders — this is a public, unauthenticated
  // lookup, so it needs its own guard against order-number enumeration.
  const { data: withinLimit } = await supabase.rpc("check_rate_limit", {
    p_key: `track-order:${ip}`,
    p_max: 20,
    p_window_seconds: 60 * 60,
  });
  if (withinLimit === false) {
    return NextResponse.json(
      { error: "Too many lookups. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = trackOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid order number and phone" }, { status: 400 });
  }

  const orderNumber = parsed.data.orderNumber.trim().toUpperCase();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, placed_at, customer_snapshot")
    .eq("order_number", orderNumber)
    .maybeSingle();

  // Same "not found" response whether the order doesn't exist or the phone
  // doesn't match — a mismatch here must never confirm an order number is
  // real, or this becomes an order-number enumeration oracle.
  const notFound = () =>
    NextResponse.json(
      { error: "We couldn't find an order with that number and phone." },
      { status: 404 }
    );

  if (!order) return notFound();

  const customer = order.customer_snapshot as { phone?: string };
  if (customer.phone !== parsed.data.phone) return notFound();

  const { data: shipment } = await supabase
    .from("shipments")
    .select("carrier, awb_number, tracking_url")
    .eq("order_id", order.id)
    .maybeSingle();

  return NextResponse.json({
    orderNumber: order.order_number,
    status: order.status,
    statusLabel: ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status,
    placedAt: order.placed_at,
    carrier: shipment?.carrier ?? null,
    trackingNumber: shipment?.awb_number ?? null,
    trackingUrl: shipment?.tracking_url ?? null,
  });
}
