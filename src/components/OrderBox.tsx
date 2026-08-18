"use client";

import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { LockIcon, TruckIcon, MessageIcon } from "@/components/Icon";
import { PRODUCT } from "@/lib/product";

const TRUST_BADGES = [
  { Icon: LockIcon, en: "Secure checkout", ta: "பாதுகாப்பான செக்அவுட்" },
  { Icon: TruckIcon, en: "Free shipping, India-wide", ta: "இந்தியா முழுவதும் இலவச டெலிவரி" },
  { Icon: MessageIcon, en: "WhatsApp order updates", ta: "WhatsApp ஆர்டர் புதுப்பிப்புகள்" },
];

export function OrderBox() {
  const {
    quantity,
    setQuantity,
    config,
    unitPrice,
    isSubscription,
    setIsSubscription,
    remainingUnits,
    launchCheckout,
  } = useCart();
  const { lang } = useLanguage();
  const effectiveQuantity = quantity > 0 ? quantity : 1;
  const hasOffer = config.offerPrice < config.basePrice;
  const soldOutForToday = remainingUnits <= 0;

  return (
    <div className="rounded-3xl border border-gold/30 bg-white p-6 text-ink shadow-lg">
      <div>
        <div className="font-serif text-lg font-semibold">{PRODUCT.name}</div>
        <div className="text-sm text-ink/60">500g</div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-emerald">₹{unitPrice}</span>
        {(hasOffer || isSubscription) && (
          <span className="text-sm text-ink/40 line-through">₹{config.basePrice}</span>
        )}
      </div>

      {soldOutForToday ? (
        <div className="mt-4 rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-700">
          {lang === "ta"
            ? "இன்றைய ஆர்டர் வரம்பு எட்டப்பட்டது. இரவு 12:00 மணிக்கு பிறகு வரவும்."
            : "Day order limit reached. Please come back after 12:00 AM."}
        </div>
      ) : (
        <>
          {remainingUnits < 5 && (
            <p className="mt-4 text-xs font-medium text-red-600">
              {lang === "ta"
                ? `இன்றைய பேட்சில் ${remainingUnits} மட்டுமே மீதம்`
                : `Only ${remainingUnits} left in today's batch`}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium">{lang === "ta" ? "அளவு" : "Quantity"}</span>
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
                disabled={effectiveQuantity >= remainingUnits}
                className="h-7 w-7 rounded-full text-lg leading-none hover:bg-ink/5 disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>
        </>
      )}

      {!soldOutForToday && (
        <>
          <label className="mt-4 flex items-start gap-2 rounded-xl bg-emerald/5 p-3 text-sm">
            <input
              type="checkbox"
              checked={isSubscription}
              onChange={(e) => setIsSubscription(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <span className="font-semibold text-emerald">
                {lang === "ta"
                  ? `மாதம்தோறும் சந்தா செய்து ${config.subscribeDiscountPercent}% சேமிக்கவும்`
                  : `Subscribe monthly & save ${config.subscribeDiscountPercent}%`}
              </span>
              <br />
              <span className="text-ink/60">
                {lang === "ta"
                  ? "ஒவ்வொரு மாதமும் உறுதிப்படுத்த செய்தி அனுப்புவோம் — எப்போது வேண்டுமானாலும் ரத்து செய்யலாம்."
                  : "We'll message you every month to reconfirm — cancel anytime."}
              </span>
            </span>
          </label>

          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">{lang === "ta" ? "கூட்டுத்தொகை" : "Subtotal"}</dt>
              <dd>₹{effectiveQuantity * unitPrice}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">{lang === "ta" ? "டெலிவரி" : "Shipping"}</dt>
              <dd>
                {config.shippingFee > 0 ? `₹${config.shippingFee}` : lang === "ta" ? "இலவசம்" : "FREE"}
              </dd>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-1 font-semibold">
              <dt>{lang === "ta" ? "மொத்தம்" : "Total"}</dt>
              <dd>₹{effectiveQuantity * unitPrice + config.shippingFee}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={launchCheckout}
            className="mt-5 w-full rounded-full bg-gold py-3 font-semibold text-emerald-deep"
          >
            {lang === "ta" ? "இப்போது ஆர்டர் செய் — செக்அவுட்" : "Order Now — Checkout"}
          </button>
          <p className="mt-2 text-center text-xs text-ink/50">
            {config.paymentGatewayEnabled
              ? lang === "ta"
                ? "Cashfree வழியாக பாதுகாப்பான செக்அவுட் — UPI, கார்டு & நெட்பேங்கிங்."
                : "Secure checkout via Cashfree — UPI, card & netbanking accepted."
              : lang === "ta"
                ? "உறுதிப்படுத்தலின் பேரில் கட்டணம் — UPI/கார்டு மூலம் செலுத்தலாம், நாங்கள் தொடர்பு கொள்வோம். ஆன்லைன் கட்டணம் விரைவில்."
                : "Payment on confirmation — pay by UPI/card, we'll follow up. Online payment coming soon."}
          </p>
        </>
      )}

      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5 border-t border-ink/10 pt-3 text-xs text-ink/50">
        {TRUST_BADGES.map((badge) => (
          <li key={badge.en} className="flex items-center gap-1.5">
            <badge.Icon className="h-3.5 w-3.5" />
            {lang === "ta" ? badge.ta : badge.en}
          </li>
        ))}
      </ul>
    </div>
  );
}
