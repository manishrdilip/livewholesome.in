import "server-only";
import crypto from "crypto";

const API_VERSION = "2023-08-01";

function baseUrl() {
  return process.env.CASHFREE_ENVIRONMENT === "PRODUCTION"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
}

function headers() {
  const appId = process.env.CASHFREE_APP_ID;
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!appId || !secret) {
    throw new Error("CASHFREE_APP_ID / CASHFREE_SECRET_KEY are not configured");
  }
  return {
    "Content-Type": "application/json",
    "x-client-id": appId,
    "x-client-secret": secret,
    "x-api-version": API_VERSION,
  };
}

export type CreateSessionInput = {
  orderNumber: string;
  orderAmount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

/** Creates (or re-fetches, Cashfree is idempotent per order_id) a payment
 * session for an order that already exists in our DB. The order_number IS
 * the Cashfree order_id — no separate mapping column needed. */
export async function createPaymentSession(input: CreateSessionInput) {
  const res = await fetch(`${baseUrl()}/orders`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      order_id: input.orderNumber,
      order_amount: input.orderAmount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust_${input.orderNumber}`,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
      },
      order_meta: {
        return_url: `https://livewholesome.in/order/confirmed?ref=${input.orderNumber}`,
        notify_url: "https://livewholesome.in/api/payment/webhook",
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message ?? `Cashfree order creation failed (${res.status})`);
  }
  return data as { payment_session_id: string; order_id: string; order_status: string };
}

/** Source of truth when the webhook hasn't landed yet (e.g. customer is
 * redirected back before it fires) — fetch the order directly from Cashfree
 * rather than trusting anything the client claims. */
export async function getCashfreeOrderStatus(orderNumber: string) {
  const res = await fetch(`${baseUrl()}/orders/${encodeURIComponent(orderNumber)}`, {
    method: "GET",
    headers: headers(),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data as { order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED" };
}

/** Cashfree signs webhooks as base64(HMAC-SHA256(timestamp + rawBody, secret)),
 * using the x-webhook-timestamp and x-webhook-signature headers. The
 * signature must be verified against the RAW body string, not a re-serialized
 * JSON.parse of it — parsing first (even to re-stringify) can change
 * whitespace/key order and break the signature check. */
export function verifyWebhookSignature(rawBody: string, timestamp: string, signature: string) {
  const secret = process.env.CASHFREE_SECRET_KEY;
  if (!secret) throw new Error("CASHFREE_SECRET_KEY is not configured");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");

  // Constant-time comparison — a plain === leaks timing information about
  // how many leading bytes matched, which is exactly what HMAC comparison
  // is supposed to avoid.
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
