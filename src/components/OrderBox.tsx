"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { PRODUCT } from "@/lib/product";

export function OrderBox() {
  const { quantity, setQuantity } = useCart();
  const router = useRouter();
  const effectiveQuantity = quantity > 0 ? quantity : 1;

  function goToCheckout() {
    if (quantity === 0) setQuantity(1);
    router.push("/checkout");
  }

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
        <span className="text-2xl font-bold text-emerald">₹{PRODUCT.unitPrice}</span>
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

      <dl className="mt-4 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink/60">Subtotal</dt>
          <dd>₹{effectiveQuantity * PRODUCT.unitPrice}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/60">Shipping</dt>
          <dd>FREE</dd>
        </div>
        <div className="flex justify-between border-t border-ink/10 pt-1 font-semibold">
          <dt>Total</dt>
          <dd>₹{effectiveQuantity * PRODUCT.unitPrice}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={goToCheckout}
        className="mt-5 w-full rounded-full bg-gold py-3 font-semibold text-emerald-deep"
      >
        ⚡ Order Now — Checkout
      </button>
      <p className="mt-2 text-center text-xs text-ink/50">
        Payment on confirmation — pay by UPI/card, we&apos;ll follow up. Online payment coming soon.
      </p>
    </div>
  );
}
