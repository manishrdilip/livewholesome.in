import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-amber-100 text-amber-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-red-100 text-red-700",
};

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "order_number, placed_at, customer_snapshot, shipping_address_snapshot, grand_total, payment_status, status"
    )
    .order("placed_at", { ascending: false })
    .limit(100);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const todaysOrders = (orders ?? []).filter((o) => new Date(o.placed_at) >= startOfDay).length;
  const unshippedCount = (orders ?? []).filter((o) =>
    ["CONFIRMED", "PACKED"].includes(o.status)
  ).length;
  const unpaidTotal = (orders ?? [])
    .filter((o) => o.payment_status === "UNPAID")
    .reduce((sum, o) => sum + Number(o.grand_total), 0);
  const monthRevenue = (orders ?? [])
    .filter((o) => new Date(o.placed_at) >= startOfMonth)
    .reduce((sum, o) => sum + Number(o.grand_total), 0);

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Orders</h1>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Today's orders" value={todaysOrders} />
        <Stat label="Unshipped" value={unshippedCount} />
        <Stat label="Unpaid total" value={`₹${unpaidTotal.toFixed(2)}`} />
        <Stat label="This month's revenue" value={`₹${monthRevenue.toFixed(2)}`} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 bg-ink/5 text-left">
            <tr>
              <th className="px-4 py-2">Order #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => {
              const customer = order.customer_snapshot as { name?: string };
              const address = order.shipping_address_snapshot as { city?: string };
              return (
                <tr key={order.order_number} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/orders/${order.order_number}`}
                      className="font-medium text-emerald hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-ink/60">
                    {new Date(order.placed_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-2">{customer?.name ?? "—"}</td>
                  <td className="px-4 py-2">{address?.city ?? "—"}</td>
                  <td className="px-4 py-2">₹{order.grand_total}</td>
                  <td className="px-4 py-2">{order.payment_status}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[order.status] ?? ""}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-ink/50">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white p-4">
      <div className="text-xs text-ink/50">{label}</div>
      <div className="mt-1 font-serif text-xl font-bold text-emerald">{value}</div>
    </div>
  );
}
