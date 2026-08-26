"use client";

import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";

export function HeroOrderButton() {
  const { unitPrice, remainingUnits, launchCheckout } = useCart();
  const { lang } = useLanguage();
  const soldOutForToday = remainingUnits <= 0;

  return (
    <button
      type="button"
      onClick={launchCheckout}
      disabled={soldOutForToday}
      className="rounded-full bg-gold px-6 py-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
    >
      {soldOutForToday
        ? lang === "ta"
          ? "இன்று தீர்ந்துவிட்டது"
          : "Sold out for today"
        : `${lang === "ta" ? "இப்போது ஆர்டர் செய்" : "Order Now"} — ₹${unitPrice}`}
    </button>
  );
}
