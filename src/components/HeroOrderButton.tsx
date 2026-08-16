"use client";

import { useCart } from "@/components/CartProvider";

export function HeroOrderButton() {
  const { unitPrice, remainingUnits, launchCheckout } = useCart();
  const soldOutForToday = remainingUnits <= 0;

  return (
    <button
      type="button"
      onClick={launchCheckout}
      disabled={soldOutForToday}
      className="rounded-full bg-gold px-6 py-3 font-semibold text-emerald-deep disabled:cursor-not-allowed disabled:opacity-50"
    >
      {soldOutForToday ? "Sold out for today" : `Order Now — ₹${unitPrice}`}
    </button>
  );
}
