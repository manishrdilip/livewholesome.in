"use client";

import { useCart } from "@/components/CartProvider";

export function HeroOrderButton() {
  const { unitPrice, launchCheckout } = useCart();

  return (
    <button
      type="button"
      onClick={launchCheckout}
      className="rounded-full bg-gold px-6 py-3 font-semibold text-emerald-deep"
    >
      Order Now — ₹{unitPrice}
    </button>
  );
}
