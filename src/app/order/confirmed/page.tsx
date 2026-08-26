import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getCashfreeOrderStatus } from "@/lib/payment/cashfree";
import { PaymentRetryButton } from "@/components/PaymentRetryButton";
import { RazorpayRetryButton } from "@/components/RazorpayRetryButton";
import { CheckCircleIcon, ClockIcon } from "@/components/Icon";

export default async function OrderConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) notFound();

  const supabase = createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, grand_total, payment_status, shipping_address_snapshot, customer_snapshot, placed_at"
    )
    .eq("order_number", ref)
    .single();

  if (!order) notFound();

  let paymentStatus = order.payment_status as string;

  // Razorpay is preferred whenever both happen to be configured — see the
  // same comment in checkout/page.tsx.
  const razorpayConfigured = Boolean(
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  );
  const cashfreeConfigured = Boolean(
    process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY
  );
  const gatewayConfigured = razorpayConfigured || cashfreeConfigured;

  // The customer can land here before Cashfree's async webhook fires (its
  // return_url redirect races it) — Cashfree itself is the authoritative
  // source, so double-check directly rather than showing a stale "unpaid"
  // the webhook was about to fix seconds later. Razorpay has no such race:
  // its Standard Checkout verifies (and updates payment_status) synchronously
  // before ever navigating here.
  if (paymentStatus === "UNPAID" && cashfreeConfigured) {
    try {
      const live = await getCashfreeOrderStatus(order.order_number);
      if (live?.order_status === "PAID") {
        await supabase
          .from("orders")
          .update({ payment_status: "PAID", payment_method: "CASHFREE" })
          .eq("id", order.id);
        paymentStatus = "PAID";
      }
    } catch (err) {
      console.error(`Live payment status check failed for ${order.order_number}`, err);
    }
  }

  const cashfreeMode = process.env.CASHFREE_ENVIRONMENT === "PRODUCTION" ? "production" : "sandbox";

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, quantity, unit_price, line_total")
    .eq("order_id", order.id);

  const address = order.shipping_address_snapshot as {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      {/* Without a payment gateway, every order is legitimately UNPAID by
          design (manual "we'll follow up" flow) — that's not a warning
          state, so only let payment_status change this copy once a
          gateway actually makes UNPAID mean something is outstanding. */}
      <div className="flex justify-center text-emerald">
        {!gatewayConfigured || paymentStatus === "PAID" ? (
          <CheckCircleIcon className="h-12 w-12" />
        ) : (
          <ClockIcon className="h-12 w-12" />
        )}
      </div>
      <h1 className="mt-4 font-serif text-3xl font-bold">
        {!gatewayConfigured || paymentStatus === "PAID" ? "Order confirmed" : "Order received"}
      </h1>
      <p className="mt-2 text-ink/70">
        Order <strong>{order.order_number}</strong>
      </p>

      {gatewayConfigured && paymentStatus !== "PAID" && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-left">
          <p className="font-semibold text-amber-800">Payment not completed yet</p>
          <p className="mt-1 text-sm text-amber-700">
            Your order is saved, but we haven&apos;t received payment. Complete it now to avoid
            delays in packing your order.
          </p>
          {razorpayConfigured ? (
            <RazorpayRetryButton
              orderNumber={order.order_number}
              keyId={process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!}
            />
          ) : (
            <PaymentRetryButton orderNumber={order.order_number} cashfreeMode={cashfreeMode} />
          )}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-6 text-left">
        <h2 className="font-semibold">Items</h2>
        <ul className="mt-2 divide-y divide-ink/10 text-sm">
          {items?.map((item, i) => (
            <li key={i} className="flex justify-between py-2">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>₹{item.line_total}</span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-ink/10 pt-2 font-semibold">
          <span>Total</span>
          <span>₹{order.grand_total}</span>
        </div>

        <h2 className="mt-6 font-semibold">Delivery address</h2>
        <p className="mt-1 text-sm text-ink/70">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}
          {address.landmark ? `, ${address.landmark}` : ""}
          <br />
          {address.city}, {address.state} — {address.pincode}
        </p>
      </div>

      <p className="mt-6 text-sm text-ink/60">
        Your invoice will be sent to your email and WhatsApp. We don&apos;t put paper invoices in
        the box — it saves trees and keeps your parcel light.
      </p>

      <Link href="/" className="mt-8 inline-block text-emerald hover:underline">
        ← Back to shop
      </Link>
    </div>
  );
}
