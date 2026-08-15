import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getResendClient } from "./resend";
import { logNotification } from "@/lib/notifications";
import { orderConfirmedEmail, type EmailContent } from "./templates";

type SendResult = { status: "SENT" | "FAILED"; error?: string };

async function dispatch(params: {
  orderId: string;
  recipient: string;
  templateKey: string;
  content: EmailContent;
  attachment?: { filename: string; content: Buffer };
}): Promise<SendResult> {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM;

  if (!resend || !from) {
    const error = "RESEND_API_KEY or EMAIL_FROM is not configured";
    await logNotification({
      orderId: params.orderId,
      channel: "EMAIL",
      templateKey: params.templateKey,
      recipient: params.recipient,
      status: "FAILED",
      errorMessage: error,
    });
    return { status: "FAILED", error };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.recipient,
      subject: params.content.subject,
      html: params.content.html,
      text: params.content.text,
      attachments: params.attachment
        ? [{ filename: params.attachment.filename, content: params.attachment.content }]
        : undefined,
    });
    if (error) throw new Error(error.message);

    await logNotification({
      orderId: params.orderId,
      channel: "EMAIL",
      templateKey: params.templateKey,
      recipient: params.recipient,
      status: "SENT",
      providerMessageId: data?.id ?? null,
    });
    return { status: "SENT" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error sending email";
    await logNotification({
      orderId: params.orderId,
      channel: "EMAIL",
      templateKey: params.templateKey,
      recipient: params.recipient,
      status: "FAILED",
      errorMessage: message,
    });
    return { status: "FAILED", error: message };
  }
}

export async function sendOrderConfirmedEmail(orderNumber: string): Promise<SendResult> {
  const supabase = createServiceClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_number, grand_total, customer_snapshot, shipping_address_snapshot")
    .eq("order_number", orderNumber)
    .single();
  if (orderError || !order) throw new Error(`Order ${orderNumber} not found`);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, quantity, line_total")
    .eq("order_id", order.id);
  if (itemsError || !items?.length) throw new Error(`No items for order ${orderNumber}`);

  const { data: invoice } = await supabase
    .from("invoices")
    .select("invoice_number, storage_path")
    .eq("order_id", order.id)
    .order("issued_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let attachment: { filename: string; content: Buffer } | undefined;
  if (invoice?.storage_path) {
    const { data: file, error: downloadError } = await supabase.storage
      .from("invoices")
      .download(invoice.storage_path);
    if (downloadError) {
      console.error(`Could not download invoice for ${orderNumber}`, downloadError.message);
    } else {
      const arrayBuffer = await file.arrayBuffer();
      attachment = {
        filename: `${invoice.invoice_number.replace(/\//g, "-")}.pdf`,
        content: Buffer.from(arrayBuffer),
      };
    }
  }

  const customer = order.customer_snapshot as { name: string; email: string };
  const address = order.shipping_address_snapshot as {
    line1: string;
    line2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
  };

  const content = orderConfirmedEmail({
    customerName: customer.name,
    orderNumber: order.order_number,
    grandTotal: Number(order.grand_total),
    items: items.map((item) => ({
      productName: item.product_name,
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
    })),
    address,
  });

  return dispatch({
    orderId: order.id,
    recipient: customer.email,
    templateKey: "order_confirmed",
    content,
    attachment,
  });
}
