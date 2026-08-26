import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getRazorpayOrder, verifyRazorpaySignature } from "@/lib/payment/razorpay";

export async function POST(request: NextRequest) {
const ip =
request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
request.headers.get("x-real-ip") ??
"unknown";

const supabase = createServiceClient();
const { data: withinLimit, error: rateLimitError } = await supabase.rpc(
"check_rate_limit",
{ p_key: `razorpay-verify:${ip}`, p_max: 20, p_window_seconds: 60 * 60 }
);
if (rateLimitError) {
console.error("check_rate_limit failed", rateLimitError.message);
} else if (!withinLimit) {
return NextResponse.json(
{ success: false, error: "Too many requests. Please try again later." },
{ status: 429 }
);
}

let body: unknown;
try {
body = await request.json();
} catch {
return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
}

const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = body as {
razorpay_order_id?: unknown;
razorpay_payment_id?: unknown;
razorpay_signature?: unknown;
orderNumber?: unknown;
};

if (
typeof razorpay_order_id !== "string" ||
typeof razorpay_payment_id !== "string" ||
typeof razorpay_signature !== "string" ||
!razorpay_order_id ||
!razorpay_payment_id ||
!razorpay_signature
) {
return NextResponse.json({ success: false, error: "Missing payment fields" }, { status: 400 });
}

let valid: boolean;
try {
valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
} catch (err) {
console.error("Razorpay signature check failed to run", err);
return NextResponse.json(
{ success: false, error: "Server not configured for payments" },
{ status: 500 }
);
}

if (!valid) {
console.error(`Razorpay signature mismatch for order ${razorpay_order_id}`);
// Signature mismatch — do NOT treat this as a paid/verified payment.
return NextResponse.json({ success: false, error: "Payment verification failed" }, { status: 400 });
}

// Real checkout: the signature only proves this (order_id, payment_id)
// pair genuinely came from Razorpay, not which of our orders the caller
// says it's for — cross-check the receipt we set at creation time (see
// create-order/route.ts) before touching the DB.
if (typeof orderNumber === "string" && orderNumber) {
const { data: order } = await supabase
.from("orders")
.select("id, payment_status")
.eq("order_number", orderNumber)
.single();

if (!order) {
return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
}

let razorpayOrder;
try {
razorpayOrder = await getRazorpayOrder(razorpay_order_id);
} catch (err) {
console.error(`Could not re-fetch Razorpay order ${razorpay_order_id}`, err);
return NextResponse.json(
{ success: false, error: "Could not confirm payment with Razorpay" },
{ status: 502 }
);
}

if (razorpayOrder.receipt !== orderNumber) {
console.error(
`Razorpay order ${razorpay_order_id} receipt (${razorpayOrder.receipt}) doesn't match claimed order ${orderNumber}`
);
return NextResponse.json({ success: false, error: "Order mismatch" }, { status: 400 });
}

if (order.payment_status !== "PAID") {
await supabase
.from("orders")
.update({ payment_status: "PAID", payment_method: "RAZORPAY" })
.eq("id", order.id);

await supabase.from("order_events").insert({
order_id: order.id,
status: "PAYMENT_RECEIVED",
label: "Payment confirmed via Razorpay",
});
}
}

return NextResponse.json({
success: true,
paymentId: razorpay_payment_id,
orderId: razorpay_order_id,
});
}
