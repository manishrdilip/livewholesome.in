import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { whatsappOrderSchema, whatsappReviewSchema } from "@/lib/validation";
import { createWhatsAppOrder, DailyLimitReachedError } from "@/lib/orders/createWhatsAppOrder";

// Called by the iZap WhatsApp AI assistant (via its own webhook/action
// feature, if configured there — this endpoint doesn't register itself
// with iZap) once it has fully collected an order or a review in chat.
// Creates a REAL order (same create_order() pipeline, pricing, daily cap,
// invoice, and a real Razorpay payment link) or queues a REAL review for
// moderation — never a value the AI invented on its own. Bearer-token
// authenticated since this can create paid orders; IZAP_WEBHOOK_SECRET
// must be set in both this app's env and whatever calls this endpoint.
export async function POST(request: NextRequest) {
  const secret = process.env.IZAP_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  // Single shared key, not per-IP — this endpoint has exactly one
  // authenticated caller, unlike the public rate-limited endpoints.
  const { data: withinLimit, error: rateLimitError } = await supabase.rpc("check_rate_limit", {
    p_key: "izap-webhook",
    p_max: 120,
    p_window_seconds: 60 * 60,
  });
  if (rateLimitError) {
    console.error("check_rate_limit failed", rateLimitError.message);
  } else if (!withinLimit) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, data } = (body ?? {}) as { type?: unknown; data?: unknown };

  if (type === "order") {
    const parsed = whatsappOrderSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid order data" },
        { status: 400 }
      );
    }
    try {
      const created = await createWhatsAppOrder(
        parsed.data,
        "Placed via WhatsApp chat — auto-created by the iZap AI assistant."
      );
      return NextResponse.json({
        orderNumber: created.orderNumber,
        grandTotal: created.grandTotal,
        paymentLink: created.paymentLink,
      });
    } catch (err) {
      if (err instanceof DailyLimitReachedError) {
        return NextResponse.json({ error: err.message }, { status: 409 });
      }
      console.error("izap webhook order creation failed", err);
      return NextResponse.json({ error: "Could not create order" }, { status: 500 });
    }
  }

  if (type === "review") {
    const parsed = whatsappReviewSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid review data" },
        { status: 400 }
      );
    }
    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        reviewer_name: parsed.data.reviewerName,
        rating: parsed.data.rating,
        body: parsed.data.body || null,
        reviewer_contact: parsed.data.reviewerContact || null,
        source: "whatsapp",
        status: "PENDING",
      })
      .select("id")
      .single();

    if (error) {
      console.error("izap webhook review insert failed", error.message);
      return NextResponse.json({ error: "Could not save review" }, { status: 500 });
    }

    return NextResponse.json({ reviewId: review.id, status: "PENDING" });
  }

  return NextResponse.json({ error: "type must be 'order' or 'review'" }, { status: 400 });
}
