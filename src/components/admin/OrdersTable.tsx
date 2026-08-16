"use client";

import { useState } from "react";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-blue-100 text-blue-700",
  PACKED: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-amber-100 text-amber-700",
  OUT_FOR_DELIVERY: "bg-amber-100 text-amber-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  RETURNED: "bg-red-100 text-red-700",
};

export type OrderRow = {
  order_number: string;
  placed_at: string;
  customer_name: string;
  city: string;
  grand_total: number;
  payment_status: string;
  status: string;
};

export function OrdersTable({ orders }: { orders: OrderRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  const allSelected = orders.length > 0 && selected.size === orders.length;

  function toggle(orderNumber: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(orderNumber)) next.delete(orderNumber);
      else next.add(orderNumber);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(orders.map((o) => o.order_number)));
  }

  async function downloadInvoices() {
    setDownloading(true);
    try {
      const res = await fetch("/api/admin/bulk-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumbers: Array.from(selected) }),
      });
      if (!res.ok) {
        alert("Couldn't generate invoices. Please try again.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  function printLabels() {
    const ids = Array.from(selected).join(",");
    window.open(`/admin/orders/labels-bulk?ids=${encodeURIComponent(ids)}`, "_blank");
  }

  return (
    <div>
      {selected.size > 0 && (
        <div className="sticky top-0 z-10 mb-3 flex items-center gap-3 rounded-xl border border-emerald/30 bg-emerald/5 px-4 py-2.5 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <button
            type="button"
            onClick={downloadInvoices}
            disabled={downloading}
            className="rounded-full bg-emerald px-4 py-1.5 text-cream disabled:opacity-50"
          >
            {downloading ? "Preparing…" : "Download invoices (ZIP)"}
          </button>
          <button
            type="button"
            onClick={printLabels}
            className="rounded-full border border-emerald px-4 py-1.5 text-emerald"
          >
            Print labels
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-ink/50 hover:text-ink"
          >
            Clear
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-ink/10 bg-ink/5 text-left">
            <tr>
              <th className="w-10 px-4 py-2">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
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
            {orders.map((order) => (
              <tr key={order.order_number} className="border-b border-ink/5 last:border-0">
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(order.order_number)}
                    onChange={() => toggle(order.order_number)}
                  />
                </td>
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
                <td className="px-4 py-2">{order.customer_name || "—"}</td>
                <td className="px-4 py-2">{order.city || "—"}</td>
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
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink/50">
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
