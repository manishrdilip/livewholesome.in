import { renderEmailShell, escapeHtml } from "./layout";

export type EmailContent = { subject: string; html: string; text: string };

type OrderItem = { productName: string; quantity: number; lineTotal: number };
type Address = {
  line1: string;
  line2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
};

function formatAddress(address: Address): string {
  return [address.line1, address.line2, address.landmark].filter(Boolean).join(", ") +
    `, ${address.city}, ${address.state} — ${address.pincode}`;
}

function itemsListHtml(items: OrderItem[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">
    ${items
      .map(
        (item) => `<tr>
          <td style="padding:6px 0;border-bottom:1px solid rgba(22,33,28,0.08);">${escapeHtml(item.productName)} × ${item.quantity}</td>
          <td style="padding:6px 0;border-bottom:1px solid rgba(22,33,28,0.08);text-align:right;">₹${item.lineTotal.toFixed(2)}</td>
        </tr>`
      )
      .join("")}
  </table>`;
}

export function orderConfirmedEmail(params: {
  customerName: string;
  orderNumber: string;
  grandTotal: number;
  items: OrderItem[];
  address: Address;
}): EmailContent {
  const { customerName, orderNumber, grandTotal, items, address } = params;
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Hi ${escapeHtml(customerName)}, thank you for your order!</p>
    <p style="margin:0 0 4px;font-size:14px;"><strong>Order:</strong> ${escapeHtml(orderNumber)}</p>
    ${itemsListHtml(items)}
    <p style="margin:0 0 12px;font-size:14px;"><strong>Total: ₹${grandTotal.toFixed(2)}</strong></p>
    <p style="margin:0 0 4px;font-size:14px;"><strong>Delivering to:</strong></p>
    <p style="margin:0 0 16px;font-size:14px;color:rgba(22,33,28,0.75);">${escapeHtml(formatAddress(address))}</p>
    <p style="margin:0 0 12px;font-size:14px;">Your invoice is attached to this email. We send invoices digitally only — no paper copy goes in the box.</p>
    <p style="margin:0;font-size:14px;">We'll email you again the moment it ships.</p>
  `;
  return {
    subject: `Order ${orderNumber} confirmed — WHOLESOME`,
    html: renderEmailShell({
      preheader: `Your order ${orderNumber} is confirmed. Invoice attached.`,
      heading: "Order confirmed",
      bodyHtml,
    }),
    text: `Hi ${customerName}, thank you for your order!

Order: ${orderNumber}
Total: Rs. ${grandTotal.toFixed(2)}
Delivering to: ${formatAddress(address)}

Your invoice is attached. We send invoices digitally only - no paper copy goes in the box.
We'll email you again the moment it ships.

- Team WHOLESOME`,
  };
}

export function orderShippedEmail(params: {
  customerName: string;
  orderNumber: string;
  carrier: string;
  awbNumber: string;
  trackingUrl: string;
  expectedDeliveryDate: string | null;
}): EmailContent {
  const { customerName, orderNumber, carrier, awbNumber, trackingUrl, expectedDeliveryDate } =
    params;
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Good news ${escapeHtml(customerName)} — your order ${escapeHtml(orderNumber)} has shipped.</p>
    <p style="margin:0 0 4px;font-size:14px;"><strong>Courier:</strong> ${escapeHtml(carrier)}</p>
    <p style="margin:0 0 4px;font-size:14px;"><strong>Tracking number:</strong> ${escapeHtml(awbNumber)}</p>
    ${expectedDeliveryDate ? `<p style="margin:0 0 16px;font-size:14px;"><strong>Expected delivery:</strong> ${escapeHtml(expectedDeliveryDate)}</p>` : ""}
    <p style="margin:16px 0 0;">
      <a href="${trackingUrl}" style="display:inline-block;background:#0c4a34;color:#f7f3e8;padding:10px 20px;border-radius:999px;text-decoration:none;font-size:14px;">Track your order</a>
    </p>
  `;
  return {
    subject: `Your PURNA is on the way — ${orderNumber}`,
    html: renderEmailShell({
      preheader: `Order ${orderNumber} shipped via ${carrier}.`,
      heading: "Your order has shipped",
      bodyHtml,
    }),
    text: `Good news ${customerName} - your order ${orderNumber} has shipped.

Courier: ${carrier}
Tracking number: ${awbNumber}
${expectedDeliveryDate ? `Expected delivery: ${expectedDeliveryDate}\n` : ""}
Track it here: ${trackingUrl}`,
  };
}

export function orderDeliveredEmail(params: {
  customerName: string;
  orderNumber: string;
}): EmailContent {
  const { customerName, orderNumber } = params;
  const bodyHtml = `
    <p style="margin:0 0 12px;font-size:14px;">Hi ${escapeHtml(customerName)}, your order ${escapeHtml(orderNumber)} has been delivered. We hope you love PURNA.</p>
    <p style="margin:0 0 12px;font-size:14px;">Store it in a cool, dry place and use the scoop — 30 g per serving.</p>
    <p style="margin:0;font-size:14px;">If anything isn't right, just reply to this email.</p>
  `;
  return {
    subject: "Delivered — enjoy your PURNA",
    html: renderEmailShell({
      preheader: `Order ${orderNumber} has been delivered.`,
      heading: "Delivered!",
      bodyHtml,
    }),
    text: `Hi ${customerName}, your order ${orderNumber} has been delivered. We hope you love PURNA.

Store it in a cool, dry place and use the scoop - 30 g per serving.
If anything isn't right, just reply to this email.`,
  };
}
