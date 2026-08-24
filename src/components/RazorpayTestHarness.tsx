"use client";

import { useState } from "react";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";

const TEST_AMOUNT_RUPEES = 10;

/** Manual test harness for the Razorpay integration — not part of the
* storefront. See src/app/razorpay-test/page.tsx. */
export function RazorpayTestHarness() {
const [result, setResult] = useState<string | null>(null);

return (
<div>
<p className="text-sm text-ink/70">Amount: ₹{TEST_AMOUNT_RUPEES}</p>
<div className="mt-4">
<RazorpayCheckoutButton
amountRupees={TEST_AMOUNT_RUPEES}
label={`Pay ₹${TEST_AMOUNT_RUPEES} (test)`}
receipt={`test_${Date.now()}`}
onSuccess={(paymentId, orderId) =>
setResult(`Payment verified — payment_id=${paymentId}, order_id=${orderId}`)
}
/>
</div>
{result && <p className="mt-4 text-sm text-emerald">{result}</p>}
</div>
);
}
