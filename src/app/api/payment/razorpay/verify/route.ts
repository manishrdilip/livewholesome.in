import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/payment/razorpay";

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

const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body as {
razorpay_order_id?: unknown;
razorpay_payment_id?: unknown;
razorpay_signature?: unknown;
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

// NOTE: decoupled from the `orders` table by design (see
// create-order/route.ts). A checkout flow wired into real orders should
// look the order up here by razorpay_order_id/receipt and update
// payment_status = 'PAID', payment_method = 'RAZORPAY', plus an
// order_events row — exactly like the Cashfree webhook does — instead of
// just returning success.
return NextResponse.json({
success: true,
paymentId: razorpay_payment_id,
orderId: razorpay_order_id,
});
}
