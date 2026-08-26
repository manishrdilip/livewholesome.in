"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpaySdk, type RazorpaySuccessResponse } from "@/lib/payment/loadRazorpaySdk";

export function RazorpayRetryButton({
  orderNumber,
  keyId,
}: {
  orderNumber: string;
  keyId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't start payment");

      await loadRazorpaySdk();

      const rzp = new window.Razorpay!({
        key: keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "Wholesome Purna",
        description: `Order ${orderNumber}`,
        theme: { color: "#2d5a2d" }, // --emerald
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            const verifyRes = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ...response, orderNumber }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error ?? "Payment verification failed");
            }
            router.refresh();
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
    <div className="mt-2">
      <button
        type="button"
        onClick={retry}
        disabled={loading}
        className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink disabled:opacity-50"
      >
        {loading ? "Processing…" : "Complete payment"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
