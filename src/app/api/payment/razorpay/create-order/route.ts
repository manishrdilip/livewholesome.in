import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/payment/razorpay";

// Razorpay's own minimum order amount.
const MIN_AMOUNT_PAISE = 100;

export async function POST(request: NextRequest) {
const ip =
request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
request.headers.get("x-real-ip") ??
"unknown";

const supabase = createServiceClient();

// Same DB-backed rate limiter every other public payment/order endpoint
// uses (see check_rate_limit() in 0008_rate_limits.sql) — an in-memory
// counter wouldn't see concurrent invocations across Vercel's serverless
// instances.
const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
"check_rate_limit",
{ p_key: `razorpay-order:${ip}`, p_max: 10, p_window_seconds: 60 * 60 }
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

const { amount, receipt, notes } = body as {
amount?: unknown;
receipt?: unknown;
notes?: unknown;
};

// This endpoint is intentionally decoupled from the `orders` table (see
// the NOTE in lib/payment/razorpay.ts), so there's no server-side order
// row to compute the amount from — the caller supplies it directly. A
// checkout flow wired into real orders should instead look the amount up
// server-side and drop this validation in favour of trusting the DB row.
if (typeof amount !== "number" || !Number.isInteger(amount) || amount < MIN_AMOUNT_PAISE) {
return NextResponse.json(
{ error: `amount must be an integer number of paise, at least ${MIN_AMOUNT_PAISE}` },
{ status: 400 }
);
}

try {
const order = await createRazorpayOrder({
amount,
receipt: typeof receipt === "string" ? receipt : undefined,
notes: notes && typeof notes === "object" ? (notes as Record<string, string>) : undefined,
});
return NextResponse.json({
orderId: order.id,
amount: order.amount,
currency: order.currency,
});
} catch (err) {
console.error("Razorpay order creation failed", err);
const status = err instanceof Error && "status" in err ? (err as { status?: number }).status : undefined;
if (status === 401) {
return NextResponse.json({ error: "Payment gateway authentication failed" }, { status: 401 });
}
const message = err instanceof Error ? err.message : "Payment setup failed";
return NextResponse.json({ error: message }, { status: 500 });
}
}
