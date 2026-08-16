"use client";

import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { FAQ_ITEMS } from "@/lib/faq";

type Message = { from: "bot" | "user"; text: string };
type Screen = "menu" | "faq" | "track" | "trackResult" | "subscription" | "human";

const RECIPE_ANSWER =
  "Mix 2 tablespoons of Purna with warm milk or water. Add jaggery, palm sugar, or honey to taste, and stir well. Prefer savoury? Skip the sweetener and add a pinch of salt instead.";

const HEALTH_ANSWER =
  "Purna is made from sprouted grains, which generally have a lower glycemic index and are easier to digest than their unsprouted form. That said, we're not medical professionals — please check with your doctor before adding it to your diet, especially if you're pregnant, managing diabetes, or feeding a young child. It contains almond and sesame.";

const INITIAL_MESSAGE: Message = {
  from: "bot",
  text: "Vanakkam! Welcome to Wholesome Purna. What can I help you with?",
};

export function SupportWidget() {
  const pathname = usePathname();
  const { config } = useCart();
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [trackError, setTrackError] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  function say(from: Message["from"], text: string) {
    setMessages((m) => [...m, { from, text }]);
  }

  function goMenu() {
    setScreen("menu");
    setTrackError("");
  }

  function askFaq(question: string, answer: string) {
    say("user", question);
    say("bot", answer);
  }

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    setTrackError("");
    setTrackLoading(true);
    say("user", `Track order ${orderNumber}`);
    try {
      const res = await fetch("/api/support/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        say("bot", data.error ?? "I couldn't find that order.");
      } else {
        const tracking = data.trackingNumber
          ? ` Tracking: ${data.trackingNumber}${data.carrier ? ` via ${data.carrier}` : ""}.`
          : "";
        say(
          "bot",
          `Order ${data.orderNumber} is currently: ${data.statusLabel}.${tracking} If anything looks off, tap "Talk to a human" below.`
        );
      }
      setScreen("trackResult");
    } catch {
      say("bot", "Something went wrong on our end — please try again in a moment.");
      setScreen("trackResult");
    } finally {
      setTrackLoading(false);
    }
  }

  const waNumber = config.supportPhone?.replace(/\D/g, "");
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent("Hi! I have a question about Wholesome Purna.")}`
    : null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between bg-emerald-deep px-4 py-3 text-cream">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/20 text-lg">
                🌱
              </span>
              <span className="font-serif font-semibold">Purna Assistant</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="text-cream/70 hover:text-cream">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.from === "bot"
                    ? "bg-cream text-ink"
                    : "ml-auto bg-emerald text-cream"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="border-t border-ink/10 p-3">
            {screen === "menu" && (
              <div className="flex flex-wrap gap-2">
                <QuickButton onClick={() => { say("user", "Learn about Purna"); setScreen("faq"); }}>
                  Learn about Purna
                </QuickButton>
                <QuickButton onClick={() => { say("user", "How do I prepare it?"); say("bot", RECIPE_ANSWER); }}>
                  How to prepare
                </QuickButton>
                <QuickButton onClick={() => { say("user", "Track my order"); setScreen("track"); }}>
                  Track my order
                </QuickButton>
                <QuickButton onClick={() => { say("user", "Subscription help"); say("bot", "Toggle Subscribe & Save at checkout for 5% off. We message you on WhatsApp a few days before each delivery to reconfirm — nothing is charged without that heads-up, and you can cancel any time by replying or contacting us."); setScreen("subscription"); }}>
                  Subscription help
                </QuickButton>
                <QuickButton onClick={() => { say("user", "Can I ask a health question?"); say("bot", HEALTH_ANSWER); }}>
                  Health question
                </QuickButton>
                <QuickButton onClick={() => { say("user", "Talk to a human"); setScreen("human"); }}>
                  Talk to a human
                </QuickButton>
              </div>
            )}

            {screen === "faq" && (
              <div className="flex flex-wrap gap-2">
                {FAQ_ITEMS.map((item) => (
                  <QuickButton key={item.question} onClick={() => askFaq(item.question, item.answer)}>
                    {item.question}
                  </QuickButton>
                ))}
                <QuickButton onClick={goMenu}>← Back</QuickButton>
              </div>
            )}

            {screen === "track" && (
              <form onSubmit={handleTrack} className="space-y-2">
                <input
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Order number, e.g. WP10123"
                  className="input text-sm"
                />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone used at checkout, e.g. +91..."
                  className="input text-sm"
                />
                {trackError && <p className="text-xs text-red-600">{trackError}</p>}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={trackLoading}
                    className="rounded-full bg-emerald px-4 py-1.5 text-sm text-cream disabled:opacity-50"
                  >
                    {trackLoading ? "Looking up…" : "Track"}
                  </button>
                  <QuickButton onClick={goMenu}>← Back</QuickButton>
                </div>
              </form>
            )}

            {(screen === "trackResult" || screen === "subscription") && (
              <div className="flex flex-wrap gap-2">
                {screen === "trackResult" && (
                  <QuickButton onClick={() => setScreen("track")}>Track another order</QuickButton>
                )}
                <QuickButton onClick={() => { say("user", "Talk to a human"); setScreen("human"); }}>
                  Talk to a human
                </QuickButton>
                <QuickButton onClick={goMenu}>← Back to menu</QuickButton>
              </div>
            )}

            {screen === "human" && (
              <div className="flex flex-wrap gap-2">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full bg-emerald px-4 py-1.5 text-sm font-semibold text-cream"
                  >
                    WhatsApp us
                  </a>
                )}
                {config.supportEmail && (
                  <a
                    href={`mailto:${config.supportEmail}`}
                    className="rounded-full border border-emerald px-4 py-1.5 text-sm font-semibold text-emerald"
                  >
                    Email us
                  </a>
                )}
                <QuickButton onClick={goMenu}>← Back to menu</QuickButton>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold text-2xl text-emerald-deep shadow-lg"
      >
        {open ? "✕" : "🌱"}
      </button>
    </div>
  );
}

function QuickButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-emerald/30 px-3 py-1.5 text-xs font-medium text-emerald hover:bg-emerald/5"
    >
      {children}
    </button>
  );
}
