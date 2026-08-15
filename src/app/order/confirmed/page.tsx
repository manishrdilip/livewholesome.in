import Link from "next/link";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

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
    .select("id, order_number, grand_total, shipping_address_snapshot, customer_snapshot, placed_at")
    .eq("order_number", ref)
    .single();

  if (!order) notFound();

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
      <div className="text-5xl">✅</div>
      <h1 className="mt-4 font-serif text-3xl font-bold">Order confirmed</h1>
      <p className="mt-2 text-ink/70">
        Order <strong>{order.order_number}</strong>
      </p>

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
