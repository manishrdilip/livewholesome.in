import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { createServiceClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { registerInvoiceFonts } from "./fonts";
import { InvoiceDocument, type InvoiceData, type InvoiceLineItem } from "./InvoiceDocument";

// The business supplies from Tamil Nadu (see spec §1). Same state as the
// customer's shipping address -> CGST+SGST; different state -> IGST.
const HOME_STATE = "Tamil Nadu";

type OrderRow = {
  id: string;
  order_number: string;
  placed_at: string;
  discount: number;
  shipping_fee: number;
  grand_total: number;
  payment_status: "UNPAID" | "PAID" | "REFUNDED";
  customer_snapshot: { name: string; email: string; phone: string };
  shipping_address_snapshot: {
    line1: string;
    line2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
};

type OrderItemRow = {
  product_name: string;
  hsn_code: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export async function generateInvoice(
  orderNumber: string,
  invoiceType: "PROFORMA" | "TAX_INVOICE" | "BILL_OF_SUPPLY"
) {
  const supabase = createServiceClient();
  const settings = await getSettings();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, placed_at, discount, shipping_fee, grand_total, payment_status, customer_snapshot, shipping_address_snapshot"
    )
    .eq("order_number", orderNumber)
    .single<OrderRow>();
  if (orderError || !order) throw new Error(`Order ${orderNumber} not found`);

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("product_name, hsn_code, quantity, unit_price, line_total")
    .eq("order_id", order.id)
    .returns<OrderItemRow[]>();
  if (itemsError || !orderItems?.length) throw new Error(`No items for order ${orderNumber}`);

  const gstRegistered = settings.gst_registered;
  const rate = gstRegistered ? Number(settings.gst_rate) : 0;
  const sameState = order.shipping_address_snapshot.state === HOME_STATE;
  const taxSplit: InvoiceData["taxSplit"] = !gstRegistered
    ? "NONE"
    : sameState
      ? "CGST_SGST"
      : "IGST";

  const items: InvoiceLineItem[] = orderItems.map((item) => {
    const lineTotal = Number(item.line_total);
    const taxableValue = gstRegistered
      ? Math.round((lineTotal / (1 + rate / 100)) * 100) / 100
      : lineTotal;
    const taxAmount = Math.round((lineTotal - taxableValue) * 100) / 100;
    return {
      productName: item.product_name,
      hsnCode: item.hsn_code,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal,
      taxableValue,
      gstRate: rate,
      taxAmount,
    };
  });

  const taxableTotal = Math.round(items.reduce((s, i) => s + i.taxableValue, 0) * 100) / 100;
  const taxTotal = Math.round(items.reduce((s, i) => s + i.taxAmount, 0) * 100) / 100;
  const cgst = taxSplit === "CGST_SGST" ? Math.round((taxTotal / 2) * 100) / 100 : 0;
  const sgst = taxSplit === "CGST_SGST" ? taxTotal - cgst : 0;
  const igst = taxSplit === "IGST" ? taxTotal : 0;

  const { data: rpcResult, error: rpcError } = await supabase.rpc("create_invoice", {
    p_order_id: order.id,
    p_invoice_type: invoiceType,
    p_total: order.grand_total,
    p_prefix: settings.invoice_prefix,
  });
  if (rpcError) throw new Error(`create_invoice failed: ${rpcError.message}`);
  const { invoice_id: invoiceId, invoice_number: invoiceNumber } = rpcResult as {
    invoice_id: string;
    invoice_number: string;
  };

  const invoiceData: InvoiceData = {
    invoiceNumber,
    invoiceType,
    invoiceDate: new Date().toISOString(),
    orderNumber: order.order_number,
    orderDate: order.placed_at,
    paymentStatus: order.payment_status,
    customer: order.customer_snapshot,
    address: order.shipping_address_snapshot,
    items,
    discount: Number(order.discount),
    shippingFee: Number(order.shipping_fee),
    taxableTotal,
    cgst,
    sgst,
    igst,
    grandTotal: Number(order.grand_total),
    taxSplit,
    settings: {
      businessName: settings.business_name,
      registeredAddress: settings.registered_address,
      gstin: settings.gstin,
      fssaiLicense: settings.fssai_license,
      supportPhone: settings.support_phone,
      supportEmail: settings.support_email,
      gstRegistered,
    },
  };

  registerInvoiceFonts();
  const pdfBuffer = await renderToBuffer(<InvoiceDocument data={invoiceData} />);

  const storagePath = `${order.order_number}/${invoiceNumber.replace(/\//g, "-")}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("invoices")
    .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
  if (uploadError) throw new Error(`Invoice PDF upload failed: ${uploadError.message}`);

  const { error: pathError } = await supabase.rpc("set_invoice_storage_path", {
    p_invoice_id: invoiceId,
    p_storage_path: storagePath,
  });
  if (pathError) throw new Error(`Failed to record invoice storage path: ${pathError.message}`);

  return { invoiceId, invoiceNumber, storagePath };
}

export async function getInvoiceSignedUrl(storagePath: string, expiresInSeconds = 300) {
  const supabase = createServiceClient();
  const { data, error } = await supabase.storage
    .from("invoices")
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error || !data) throw new Error(`Could not sign invoice URL: ${error?.message}`);
  return data.signedUrl;
}
