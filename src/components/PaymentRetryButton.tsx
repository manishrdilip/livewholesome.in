"use client";

import { useState } from "react";
import { loadCashfreeSdk } from "@/lib/payment/loadCashfreeSdk";

export function PaymentRetryButton({
  orderNumber,
  cashfreeMode,
}: {
  orderNumber: string;
  cashfreeMode: "sandbox" | "production";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't start payment");

      await loadCashfreeSdk();
      const cashfree = window.Cashfree!({ mode: cashfreeMode });
      cashfree.checkout({ paymentSessionId: data.paymentSessionId, redirectTarget: "_self" });
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
        {loading ? "Redirecting…" : "Complete payment"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
