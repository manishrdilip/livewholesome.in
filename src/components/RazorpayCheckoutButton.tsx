"use client";

import { useEffect, useState } from "react";
import { loadRazorpaySdk, type RazorpaySuccessResponse } from "@/lib/payment/loadRazorpaySdk";

export type RazorpayCheckoutButtonProps = {
/** Rupees, not paise — converted to paise before calling create-order. */
amountRupees: number;
label?: string;
receipt?: string;
prefill?: { name?: string; email?: string; contact?: string };
onSuccess?: (paymentId: string, orderId: string) => void;
className?: string;
};

/** Reusable Razorpay Standard Checkout button: creates an order, opens the
* modal, and verifies the signature on success. Mirrors the loading/error
* state and styling of PaymentRetryButton.tsx (the Cashfree equivalent) so
* it drops into the same places with the same look. */
export function RazorpayCheckoutButton({
amountRupees,
label = "Pay now",
receipt,
prefill,
onSuccess,
className,
}: RazorpayCheckoutButtonProps) {
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Preload checkout.js as soon as this button is on screen, so clicking Pay
// doesn't also have to wait on the script download.
useEffect(() => {
loadRazorpaySdk().catch(() => {});
}, []);

async function pay() {
setLoading(true);
setError(null);
try {
const [res] = await Promise.all([
fetch("/api/payment/razorpay/create-order", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ amount: Math.round(amountRupees * 100), receipt }),
}),
loadRazorpaySdk(),
]);
const data = await res.json();
if (!res.ok) throw new Error(data.error ?? "Couldn't start payment");

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
if (!keyId) throw new Error("Razorpay is not configured (missing NEXT_PUBLIC_RAZORPAY_KEY_ID)");

const rzp = new window.Razorpay!({
key: keyId,
amount: data.amount,
currency: data.currency,
order_id: data.orderId,
name: "Wholesome Purna",
description: label,
prefill,
theme: { color: "#2d5a2d" }, // --emerald
modal: {
// User closed the modal without paying — not an error, just stop
// the spinner.
ondismiss: () => setLoading(false),
},
handler: async (response: RazorpaySuccessResponse) => {
try {
const verifyRes = await fetch("/api/payment/razorpay/verify", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(response),
});
const verifyData = await verifyRes.json();
if (!verifyRes.ok || !verifyData.success) {
throw new Error(verifyData.error ?? "Payment verification failed");
}
onSuccess?.(response.razorpay_payment_id, response.razorpay_order_id);
} catch (err) {
setError(err instanceof Error ? err.message : "Payment verification failed");
} finally {
setLoading(false);
}
},
});

rzp.on("payment.failed", (resp) => {
setError(resp.error?.description ?? "Payment failed. Please try again.");
setLoading(false);
});

rzp.open();
} catch (err) {
setError(err instanceof Error ? err.message : "Couldn't start payment. Please try again.");
setLoading(false);
}
}

return (
<div>
<button
type="button"
onClick={pay}
disabled={loading}
className={
className ??
"rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink disabled:opacity-50"
}
>
{loading ? "Processing…" : label}
</button>
{error && (
<p role="alert" className="mt-2 text-xs text-red-600">
{error}
</p>
)}
</div>
);
}
