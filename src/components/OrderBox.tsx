"use client";

import { useCart } from "@/components/CartProvider";
import { PRODUCT } from "@/lib/product";

const TRUST_BADGES = ["🔒 Secure checkout", "🚚 Free shipping, India-wide", "📱 WhatsApp order updates"];

export function OrderBox() {
  const { quantity, setQuantity, config, unitPrice, isSubscription, setIsSubscription, launchCheckout } =
    useCart();
  const effectiveQuantity = quantity > 0 ? quantity : 1;
  const hasOffer = config.offerPrice < config.basePrice;

  return (
    <div className="rounded-3xl border border-gold/30 bg-white p-6 text-ink shadow-lg">
      <div className="flex items-center gap-3">
        <div className="text-3xl">🥣</div>
        <div>
          <div className="font-serif text-lg font-semibold">{PRODUCT.name}</div>
          <div className="text-sm text-ink/60">500g | Formula v1.1</div>
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-emerald">₹{unitPrice}</span>
        {(hasOffer || isSubscription) && (
          <span className="text-sm text-ink/40 line-through">₹{config.basePrice}</span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium">Quantity</span>
        <div className="flex items-center gap-3 rounded-full border border-ink/20 px-2 py-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity(effectiveQuantity - 1)}
            className="h-7 w-7 rounded-full text-lg leading-none hover:bg-ink/5"
          >
            −
          </button>
          <span className="w-6 text-center">{effectiveQuantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity(effectiveQuantity + 1)}
            className="h-7 w-7 rounded-full text-lg leading-none hover:bg-ink/5"
          >
            +
          </button>
        </div>
      </div>

      <label className="mt-4 flex items-start gap-2 rounded-xl bg-emerald/5 p-3 text-sm">
        <input
          type="checkbox"
          checked={isSubscription}
          onChange={(e) => setIsSubscription(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          <span className="font-semibold text-emerald">
            Subscribe monthly &amp; save {config.subscribeDiscountPercent}%
          </span>
          <br />
          <span className="text-ink/60">
            We&apos;ll message you every month to reconfirm — cancel anytime.
          </span>
        </span>
      </label>

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink/60">Subtotal</dt>
          <dd>₹{effectiveQuantity * unitPrice}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/60">Shipping</dt>
          <dd>{config.shippingFee > 0 ? `₹${config.shippingFee}` : "FREE"}</dd>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-1 font-semibold">
          <dt>Total</dt>
          <dd>₹{effectiveQuantity * unitPrice + config.shippingFee}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={launchCheckout}
        className="mt-5 w-full rounded-full bg-gold py-3 font-semibold text-emerald-deep"
      >
        ⚡ Order Now — Checkout
      </button>
      <p className="mt-2 text-center text-xs text-ink/50">
        {config.paymentGatewayEnabled
          ? "Secure checkout via Cashfree — UPI, card & netbanking accepted."
          : "Payment on confirmation — pay by UPI/card, we'll follow up. Online payment coming soon."}
      </p>

      <ul className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-ink/10 pt-3 text-xs text-ink/50">
        {TRUST_BADGES.map((badge) => (
          <li key={badge}>{badge}</li>
        ))}
      </ul>
    </div>
  );
}
