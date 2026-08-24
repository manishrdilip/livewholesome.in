import type { Metadata } from "next";
import Link from "next/link";
import { RazorpayTestHarness } from "@/components/RazorpayTestHarness";

export const metadata: Metadata = {
title: "Razorpay Test | Wholesome Purna",
robots: { index: false, follow: false },
};

/** Manual test page for the standalone Razorpay Standard Checkout
* integration — not linked in nav, not part of the storefront or the
* pre-order checkout flow. Safe to delete once the integration is wired
* into a real flow (or kept as a smoke test for gateway config changes). */
export default function RazorpayTestPage() {
return (
<div className="mx-auto max-w-lg px-6 py-16">
<Link href="/" className="text-sm text-emerald hover:underline">
← Back to shop
</Link>
<h1 className="mt-4 font-serif text-2xl font-bold">Razorpay checkout — test harness</h1>
<p className="mt-2 text-sm text-ink/60">
Not part of the storefront — a manual test page for the Razorpay Standard Checkout
integration. With the test-mode keys configured in{" "}
<code className="rounded bg-cream px-1">.env.local</code>, pay with any of Razorpay&apos;s{" "}
<a
href="https://razorpay.com/docs/payments/payments/test-mode/#test-cards"
className="underline"
target="_blank"
rel="noreferrer"
>
published test cards
</a>
.
</p>

<div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6">
<RazorpayTestHarness />
</div>
</div>
);
}
