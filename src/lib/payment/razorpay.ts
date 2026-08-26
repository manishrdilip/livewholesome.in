import "server-only";
import crypto from "crypto";

const BASE_URL = "https://api.razorpay.com/v1";

function authHeader() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured");
  }
  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

export type CreateOrderInput = {
  /** Amount in paise (smallest currency unit) — Razorpay's own minimum is 100. */
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export type CreateOrderResult = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

class RazorpayApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Creates a Razorpay Order — required before opening Standard Checkout.
 * Uses a plain fetch + Basic Auth against the REST API rather than the
 * `razorpay` npm SDK, mirroring how createPaymentSession() in cashfree.ts
 * talks to Cashfree directly — one fewer dependency, same amount of code.
 *
 * NOTE: this is called from a decoupled/demo endpoint (see the route
 * handler in api/payment/razorpay/create-order) that trusts the caller for
 * `amount`. A checkout flow wired into real orders must instead compute
 * `amount` server-side from the order/cart row in the DB — exactly like
 * createPaymentSession() does with `order.grand_total`, and never from
 * anything the client sends. */
export async function createRazorpayOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: input.currency ?? "INR",
      receipt: input.receipt,
      notes: input.notes,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const message =
      (data?.error?.description as string | undefined) ??
      `Razorpay order creation failed (${res.status})`;
    throw new RazorpayApiError(message, res.status);
  }
  return data as CreateOrderResult;
}

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
};

/** Fetches a Razorpay order back by id — used to cross-check that a
 * client-claimed orderNumber actually matches the receipt we set at
 * creation time, before trusting a verified payment as belonging to it.
 * The HMAC signature alone only proves a given (order_id, payment_id) pair
 * is genuinely from Razorpay, not which of our orders the caller says it's
 * for. */
export async function getRazorpayOrder(orderId: string): Promise<RazorpayOrder> {
  const res = await fetch(`${BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    headers: { Authorization: authHeader() },
  });
  const data = await res.json();
  if (!res.ok) {
    const message =
      (data?.error?.description as string | undefined) ?? `Could not fetch Razorpay order (${res.status})`;
    throw new RazorpayApiError(message, res.status);
  }
  return data as RazorpayOrder;
}

/** Razorpay signs each successful Standard Checkout payment as
 * hex(HMAC-SHA256(order_id + "|" + payment_id, key_secret)) and hands it
 * back to the client as razorpay_signature — re-verify it server-side
 * before treating the payment as real, never trust the client's own claim
 * that a payment succeeded. Constant-time comparison for the same reason
 * verifyWebhookSignature() in cashfree.ts uses one. */
export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not configured");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
