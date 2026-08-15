import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { generateInvoice, getInvoiceSignedUrl } from "@/lib/invoice/generate";
import { sendOrderConfirmedEmail } from "@/lib/email/send";

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

  const [{ data: items }, { data: events }, { data: invoice }, { data: notifications }] =
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
  };

  return (
    <div>
      <Link href="/admin" className="text-sm text-emerald hover:underline">
        ← All orders
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold">{order.order_number}</h1>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold">
          {order.status}
        </span>
      </div>
      <p className="text-sm text-ink/50">
        Placed {new Date(order.placed_at).toLocaleString("en-IN")}
      </p>

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
                  href={`https://wa.me/${(customer.whatsapp_number ?? customer.phone).replace("+", "")}`}
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
