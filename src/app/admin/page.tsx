import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { OrdersTable, type OrderRow } from "@/components/admin/OrdersTable";
import { RevenueChart } from "@/components/admin/RevenueChart";

const CLOSED_STATUSES = ["DELIVERED", "CANCELLED", "RETURNED"];

const CHART_DAYS = 30;

export default async function AdminOrdersPage() {
  const supabase = createServiceClient();
  const { data: orders } = await supabase
    .from("orders")
    .select(
      "order_number, placed_at, customer_snapshot, shipping_address_snapshot, grand_total, payment_status, status"
    )
    .order("placed_at", { ascending: false })
    .limit(200);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(startOfDay.getFullYear(), startOfDay.getMonth(), 1);

  const todaysOrders = (orders ?? []).filter((o) => new Date(o.placed_at) >= startOfDay).length;
  const unshippedCount = (orders ?? []).filter((o) =>
    ["CONFIRMED", "COOKING", "PACKED"].includes(o.status)
  ).length;
  const todaysOpenOrderNumbers = (orders ?? [])
    .filter((o) => new Date(o.placed_at) >= startOfDay && !CLOSED_STATUSES.includes(o.status))
    .map((o) => o.order_number);
  const unpaidTotal = (orders ?? [])
    .filter((o) => o.payment_status === "UNPAID")
    .reduce((sum, o) => sum + Number(o.grand_total), 0);
  const monthRevenue = (orders ?? [])
    .filter((o) => new Date(o.placed_at) >= startOfMonth)
    .reduce((sum, o) => sum + Number(o.grand_total), 0);

  const chartData = Array.from({ length: CHART_DAYS }, (_, i) => {
    const day = new Date(startOfDay);
    day.setDate(day.getDate() - (CHART_DAYS - 1 - i));
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const revenue = (orders ?? [])
      .filter((o) => {
        const placed = new Date(o.placed_at);
        return placed >= day && placed < nextDay;
      })
      .reduce((sum, o) => sum + Number(o.grand_total), 0);
    return {
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue,
    };
  });

  const tableRows: OrderRow[] = (orders ?? []).map((order) => ({
    order_number: order.order_number,
    placed_at: order.placed_at,
    customer_name: (order.customer_snapshot as { name?: string })?.name ?? "",
    city: (order.shipping_address_snapshot as { city?: string })?.city ?? "",
    grand_total: Number(order.grand_total),
    payment_status: order.payment_status,
    status: order.status,
  }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders/new"
            className="rounded-full border border-emerald px-4 py-1.5 text-sm font-semibold text-emerald hover:bg-emerald hover:text-cream"
          >
            + Log WhatsApp order
          </Link>
          {todaysOpenOrderNumbers.length > 0 ? (
            <Link
              href={`/admin/orders/labels-bulk?ids=${encodeURIComponent(todaysOpenOrderNumbers.join(","))}`}
              target="_blank"
              className="rounded-full bg-emerald px-4 py-1.5 text-sm text-cream"
            >
              Print today&apos;s shipping labels ({todaysOpenOrderNumbers.length})
            </Link>
          ) : (
            <span className="text-sm text-ink/40">No open orders today</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Today's orders" value={todaysOrders} />
        <Stat label="Unshipped" value={unshippedCount} />
        <Stat label="Unpaid total" value={`₹${unpaidTotal.toFixed(2)}`} />
        <Stat label="This month's revenue" value={`₹${monthRevenue.toFixed(2)}`} />
      </div>

      <div className="mt-6">
        <RevenueChart data={chartData} />
      </div>

      <div className="mt-6">
        <OrdersTable orders={tableRows} />
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
