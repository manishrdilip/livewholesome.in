import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInvoice, getInvoiceSignedUrl } from "@/lib/invoice/generate";
import { sendOrderConfirmedEmail } from "@/lib/email/send";
import { createRazorpayPaymentLink } from "@/lib/payment/razorpay";
import { OrderProgressTracker } from "@/components/OrderProgressTracker";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = createServiceClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .single();

  if (!order) notFound();

  const [{ data: items }, { data: events }, { data: invoice }, { data: notifications }, { data: shipment }] =
    await Promise.all([
      supabase.from("order_items").select("*").eq("order_id", order.id),
      supabase.from("order_events").select("*").eq("order_id", order.id).order("created_at"),
      supabase
        .from("invoices")
        .select("*")
        .eq("order_id", order.id)
        .order("issued_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("notifications")
        .select("*")
        .eq("order_id", order.id)
        .order("sent_at", { ascending: false, nullsFirst: true }),
      supabase.from("shipments").select("*").eq("order_id", order.id).maybeSingle(),
    ]);

  const invoiceUrl = invoice?.storage_path
    ? await getInvoiceSignedUrl(invoice.storage_path)
    : null;

  async function regenerateInvoice() {
    "use server";
    await generateInvoice(orderNumber, invoice?.invoice_type ?? "PROFORMA");
    revalidatePath(`/admin/orders/${orderNumber}`);
  }

  async function resendEmail() {
    "use server";
    await sendOrderConfirmedEmail(orderNumber);
    revalidatePath(`/admin/orders/${orderNumber}`);
  }

  async function generatePaymentLink() {
    "use server";
    const service = createServiceClient();
    const { data: current } = await service
      .from("orders")
      .select("id, grand_total, customer_snapshot")
      .eq("order_number", orderNumber)
      .single();
    if (!current) return;

    const customer = current.customer_snapshot as {
      name: string;
      email: string;
      phone: string;
      whatsapp_number?: string;
    };

    const link = await createRazorpayPaymentLink({
      amount: Math.round(current.grand_total * 100),
      orderNumber,
      customerName: customer.name,
      customerPhone: customer.whatsapp_number ?? customer.phone,
      customerEmail: customer.email,
    });

    await service.from("order_events").insert({
      order_id: current.id,
      status: "PAYMENT_LINK_CREATED",
      label: "Razorpay payment link generated",
      note: link.short_url,
    });

    revalidatePath(`/admin/orders/${orderNumber}`);
  }

  async function updateStatus(formData: FormData) {
    "use server";
    const newStatus = formData.get("status");
    if (typeof newStatus !== "string" || !ORDER_STATUSES.includes(newStatus as OrderStatus)) return;

    const service = createServiceClient();
    const { data: current } = await service
      .from("orders")
      .select("id, status")
      .eq("order_number", orderNumber)
      .single();
    if (!current || current.status === newStatus) return;

    await service
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", current.id);

    await service.from("order_events").insert({
      order_id: current.id,
      status: newStatus,
      label: ORDER_STATUS_LABELS[newStatus as OrderStatus],
    });

    // First time hitting SHIPPED/DELIVERED, record the timestamp on the
    // shipment row (created if it doesn't exist yet).
    if (newStatus === "SHIPPED" || newStatus === "DELIVERED") {
      const { data: existingShipment } = await service
        .from("shipments")
        .select("dispatched_at, delivered_at")
        .eq("order_id", current.id)
        .maybeSingle();

      const patch: Record<string, string> = {};
      if (newStatus === "SHIPPED" && !existingShipment?.dispatched_at) {
        patch.dispatched_at = new Date().toISOString();
      }
      if (newStatus === "DELIVERED" && !existingShipment?.delivered_at) {
        patch.delivered_at = new Date().toISOString();
      }
      if (Object.keys(patch).length) {
        await service
          .from("shipments")
          .upsert({ order_id: current.id, ...patch }, { onConflict: "order_id" });
      }
    }

    revalidatePath(`/admin/orders/${orderNumber}`);
    revalidatePath("/admin");
  }

  async function updateShipment(formData: FormData) {
    "use server";
    const carrier = formData.get("carrier");
    const awbNumber = formData.get("awb_number");
    const trackingUrl = formData.get("tracking_url");
    const expectedDeliveryDate = formData.get("expected_delivery_date");

    const service = createServiceClient();
    const { data: current } = await service
      .from("orders")
      .select("id")
      .eq("order_number", orderNumber)
      .single();
    if (!current) return;

    const trimmedAwb = typeof awbNumber === "string" ? awbNumber.trim() : "";
    const { error } = await service.from("shipments").upsert(
      {
        order_id: current.id,
        carrier: typeof carrier === "string" && carrier.trim() ? carrier.trim() : null,
        awb_number: trimmedAwb || null,
        tracking_url:
          typeof trackingUrl === "string" && trackingUrl.trim() ? trackingUrl.trim() : null,
        expected_delivery_date:
          typeof expectedDeliveryDate === "string" && expectedDeliveryDate
            ? expectedDeliveryDate
            : null,
      },
      { onConflict: "order_id" }
    );
    if (error) return;

    await service.from("order_events").insert({
      order_id: current.id,
      status: "TRACKING_UPDATED",
      label: trimmedAwb ? `Tracking number added: ${trimmedAwb}` : "Shipping details updated",
    });

    revalidatePath(`/admin/orders/${orderNumber}`);
  }

  const latestPaymentLink = [...(events ?? [])]
    .reverse()
    .find((e) => e.status === "PAYMENT_LINK_CREATED")?.note;

  const customer = order.customer_snapshot as {
    name: string;
    email: string;
    phone: string;
    whatsapp_number?: string;
  };
  const address = order.shipping_address_snapshot as {
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
  };

  return (
    <div>
      <Link href="/admin" className="text-sm text-emerald hover:underline">
        ← All orders
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">{order.order_number}</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/orders/${order.order_number}/label`}
            className="rounded-full border border-emerald px-3 py-1 text-xs font-semibold text-emerald hover:bg-emerald hover:text-cream"
          >
            Print shipping label
          </Link>
          <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold">
            {order.status}
          </span>
        </div>
      </div>
      <p className="text-sm text-ink/50">
        Placed {new Date(order.placed_at).toLocaleString("en-IN")}
      </p>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Order status</h2>
        <div className="mt-4">
          <OrderProgressTracker status={order.status} />
        </div>
        <form action={updateStatus} className="mt-4 flex items-center gap-3 text-sm">
          <select name="status" defaultValue={order.status} className="input w-auto">
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-emerald px-4 py-1.5 text-cream"
          >
            Update status
          </button>
        </form>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Customer</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div>
              <dt className="inline text-ink/50">Name: </dt>
              <dd className="inline">{customer.name}</dd>
            </div>
            <div>
              <dt className="inline text-ink/50">Email: </dt>
              <dd className="inline">{customer.email}</dd>
            </div>
            <div>
              <dt className="inline text-ink/50">Phone: </dt>
              <dd className="inline">
                <a href={`tel:${customer.phone}`} className="text-emerald hover:underline">
                  {customer.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="inline text-ink/50">WhatsApp: </dt>
              <dd className="inline">
                <a
                  href={`https://wa.me/${(customer.whatsapp_number ?? customer.phone).replace(/\D/g, "")}`}
                  target="_blank"
                  className="text-emerald hover:underline"
                >
                  {customer.whatsapp_number ?? customer.phone}
                </a>
              </dd>
            </div>
          </dl>

          <h2 className="mt-4 font-semibold">Shipping address</h2>
          <p className="mt-1 text-sm text-ink/70">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ""}
            {address.landmark ? `, ${address.landmark}` : ""}
            <br />
            {address.city}, {address.state} — {address.pincode}
            <br />
            {address.country}
          </p>
          {address.latitude != null && address.longitude != null && (
            <a
              href={`https://www.google.com/maps?q=${address.latitude},${address.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-block text-xs text-emerald hover:underline"
            >
              📍 View pinned location
            </a>
          )}
        </section>

        <section className="rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Items</h2>
          <ul className="mt-2 divide-y divide-ink/10 text-sm">
            {items?.map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  {item.product_name} × {item.quantity}
                </span>
                <span>₹{item.line_total}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-2 space-y-1 border-t border-ink/10 pt-2 text-sm">
            <Row label="Subtotal" value={order.subtotal} />
            <Row label="Discount" value={-order.discount} />
            <Row label="Shipping" value={order.shipping_fee} />
            <Row label="Tax" value={order.tax_total} />
            <Row label="Grand total" value={order.grand_total} bold />
          </dl>
          <p className="mt-3 text-sm">
            Payment: <strong>{order.payment_status}</strong> ({order.payment_method})
          </p>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Invoice</h2>
        {invoice ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p>
                <span className="font-medium">{invoice.invoice_number}</span>{" "}
                <span className="text-ink/50">({invoice.invoice_type})</span>
              </p>
              <p className="text-ink/50">
                Issued {new Date(invoice.issued_at).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="flex gap-3">
              {invoiceUrl && (
                <a
                  href={invoiceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-emerald px-4 py-1.5 text-emerald hover:bg-emerald hover:text-cream"
                >
                  View / Download PDF
                </a>
              )}
              <form action={regenerateInvoice}>
                <button
                  type="submit"
                  className="rounded-full border border-ink/20 px-4 py-1.5 text-ink/70 hover:border-ink/40"
                >
                  Regenerate
                </button>
              </form>
              <form action={resendEmail}>
                <button
                  type="submit"
                  className="rounded-full border border-emerald px-4 py-1.5 text-emerald hover:bg-emerald hover:text-cream"
                >
                  Resend by email
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between text-sm">
            <p className="text-ink/50">No invoice generated yet.</p>
            <form action={regenerateInvoice}>
              <button
                type="submit"
                className="rounded-full bg-emerald px-4 py-1.5 text-cream"
              >
                Generate proforma invoice
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Payment link</h2>
        {latestPaymentLink ? (
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-sm">
            <a
              href={latestPaymentLink}
              target="_blank"
              rel="noreferrer"
              className="break-all text-emerald hover:underline"
            >
              {latestPaymentLink}
            </a>
            <div className="flex shrink-0 gap-3">
              <a
                href={`https://wa.me/${(customer.whatsapp_number ?? customer.phone).replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hi ${customer.name}, here's your payment link for order ${order.order_number} (₹${order.grand_total}): ${latestPaymentLink}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-emerald px-4 py-1.5 text-cream"
              >
                Open on WhatsApp
              </a>
              <form action={generatePaymentLink}>
                <button
                  type="submit"
                  className="rounded-full border border-ink/20 px-4 py-1.5 text-ink/70 hover:border-ink/40"
                >
                  Regenerate
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between text-sm">
            <p className="text-ink/50">No payment link generated yet.</p>
            <form action={generatePaymentLink}>
              <button
                type="submit"
                className="rounded-full bg-emerald px-4 py-1.5 text-cream"
              >
                Generate payment link
              </button>
            </form>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Shipping &amp; tracking</h2>
        {shipment?.awb_number && (
          <p className="mt-1 text-sm text-ink/50">
            Currently: <span className="font-medium text-ink">{shipment.awb_number}</span>
            {shipment.carrier ? ` via ${shipment.carrier}` : ""}
            {shipment.dispatched_at &&
              ` — dispatched ${new Date(shipment.dispatched_at).toLocaleDateString("en-IN")}`}
            {shipment.delivered_at &&
              ` — delivered ${new Date(shipment.delivered_at).toLocaleDateString("en-IN")}`}
          </p>
        )}
        <form action={updateShipment} className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <label className="text-ink/60">Carrier</label>
            <input
              name="carrier"
              defaultValue={shipment?.carrier ?? ""}
              placeholder="e.g. Delhivery, India Post"
              className="input"
            />
          </div>
          <div>
            <label className="text-ink/60">Tracking / AWB number</label>
            <input
              name="awb_number"
              defaultValue={shipment?.awb_number ?? ""}
              placeholder="e.g. 1234567890"
              className="input"
            />
          </div>
          <div>
            <label className="text-ink/60">Tracking URL (optional)</label>
            <input
              name="tracking_url"
              type="url"
              defaultValue={shipment?.tracking_url ?? ""}
              placeholder="https://…"
              className="input"
            />
          </div>
          <div>
            <label className="text-ink/60">Expected delivery date (optional)</label>
            <input
              name="expected_delivery_date"
              type="date"
              defaultValue={shipment?.expected_delivery_date ?? ""}
              className="input"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-cream">
              Save tracking details
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Event timeline</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {events?.map((event) => (
            <li key={event.id} className="flex justify-between border-b border-ink/5 pb-2">
              <span>
                <strong>{event.status}</strong> — {event.label}
              </span>
              <span className="text-ink/50">
                {new Date(event.created_at).toLocaleString("en-IN")}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Notification log</h2>
        {notifications?.length ? (
          <ul className="mt-2 space-y-2 text-sm">
            {notifications.map((n) => (
              <li key={n.id} className="flex justify-between border-b border-ink/5 pb-2">
                <span>
                  <strong>{n.channel}</strong> — {n.template_key} → {n.recipient}
                  {n.status === "FAILED" && n.error_message && (
                    <span className="ml-2 text-red-600">({n.error_message})</span>
                  )}
                </span>
                <span
                  className={
                    n.status === "SENT"
                      ? "text-emerald"
                      : n.status === "FAILED"
                        ? "text-red-600"
                        : "text-ink/50"
                  }
                >
                  {n.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-ink/50">No notifications sent yet.</p>
        )}
      </section>

      {order.internal_note && (
        <section className="mt-6 rounded-xl border border-ink/10 bg-white p-5">
          <h2 className="font-semibold">Internal note</h2>
          <p className="mt-1 text-sm text-ink/70">{order.internal_note}</p>
        </section>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}>
      <span className="text-ink/50">{label}</span>
      <span>₹{value}</span>
    </div>
  );
}
