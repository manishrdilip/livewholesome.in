"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useLanguage, type Lang } from "@/components/LanguageProvider";
import { LeafIcon } from "@/components/Icon";
import { FAQ_ITEMS } from "@/lib/faq";

type Message = { from: "bot" | "user"; text: string };
type Screen = "menu" | "faq" | "track" | "trackResult" | "subscription" | "human";

const STATUS_LABELS_TA: Record<string, string> = {
  CONFIRMED: "ஆர்டர் பெறப்பட்டது",
  COOKING: "சமைக்கப்படுகிறது",
  PACKED: "பேக் செய்யப்படுகிறது",
  SHIPPED: "அனுப்பப்பட்டது",
  OUT_FOR_DELIVERY: "டெலிவரிக்கு புறப்பட்டது",
  DELIVERED: "வழங்கப்பட்டது",
  CANCELLED: "ரத்து செய்யப்பட்டது",
  RETURNED: "திரும்பப்பெறப்பட்டது",
};

const TEXT = {
  en: {
    title: "Purna Assistant",
    welcome: "Vanakkam! Welcome to Wholesome Purna. What can I help you with?",
    menuLearn: "Learn about Purna",
    menuPrepare: "How to prepare",
    menuTrack: "Track my order",
    menuSubscription: "Subscription help",
    menuHealth: "Health question",
    menuHuman: "Talk to a human",
    userPrepare: "How do I prepare it?",
    recipe:
      "Mix 2 tablespoons of Purna with warm milk or water. Add jaggery, palm sugar, or honey to taste, and stir well. Prefer savoury? Skip the sweetener and add a pinch of salt instead.",
    userHealth: "Can I ask a health question?",
    health:
      "Purna is made from sprouted grains, which generally have a lower glycemic index and are easier to digest than their unsprouted form. That said, we're not medical professionals — please check with your doctor before adding it to your diet, especially if you're pregnant, managing diabetes, or feeding a young child. It contains almond and sesame.",
    userSubscription: "Subscription help",
    subscription:
      "Toggle Subscribe & Save at checkout for 5% off. We message you on WhatsApp a few days before each delivery to reconfirm — nothing is charged without that heads-up, and you can cancel any time by replying or contacting us.",
    userHuman: "Talk to a human",
    back: "← Back",
    backToMenu: "← Back to menu",
    trackAnother: "Track another order",
    orderNumberPlaceholder: "Order number, e.g. WP10123",
    phonePlaceholder: "Phone used at checkout, e.g. +91...",
    trackButton: "Track",
    trackLoading: "Looking up…",
    trackUserMsg: (n: string) => `Track order ${n}`,
    trackResult: (order: string, status: string, tracking: string) =>
      `Order ${order} is currently: ${status}.${tracking} If anything looks off, tap "Talk to a human" below.`,
    trackingSuffix: (num: string, carrier: string) => ` Tracking: ${num}${carrier ? ` via ${carrier}` : ""}.`,
    notFound: "I couldn't find that order.",
    genericError: "Something went wrong on our end — please try again in a moment.",
    whatsapp: "WhatsApp us",
    email: "Email us",
    openLabel: "Open support chat",
    closeLabel: "Close support chat",
  },
  ta: {
    title: "பூர்ணா உதவியாளர்",
    welcome: "வணக்கம்! Wholesome Purna-க்கு வரவேற்கிறோம். நான் உங்களுக்கு எப்படி உதவலாம்?",
    menuLearn: "பூர்ணா பற்றி அறிய",
    menuPrepare: "தயார் செய்வது எப்படி",
    menuTrack: "என் ஆர்டரை கண்காணிக்க",
    menuSubscription: "சந்தா உதவி",
    menuHealth: "சுகாதார கேள்வி",
    menuHuman: "ஒரு நபருடன் பேச",
    userPrepare: "இதை எப்படி தயார் செய்வது?",
    recipe:
      "ஒரு கப் வெதுவெதுப்பான பாலில் அல்லது தண்ணீரில் 2 மேஜைக்கரண்டி பூர்ணா கலக்கவும். சுவைக்கு வெல்லம் அல்லது தேன் சேர்த்து நன்கு கிளறவும். இனிப்பு வேண்டாமா? உப்பு சேர்த்து கஞ்சி போலவும் சாப்பிடலாம்.",
    userHealth: "ஒரு சுகாதார கேள்வி கேட்கலாமா?",
    health:
      "பூர்ணா முளைகட்டிய தானியங்களால் ஆனது, இதனால் பொதுவாக குறைந்த கிளைசெமிக் இன்டெக்ஸ் மற்றும் எளிதில் ஜீரணமாகும். எனினும் நாங்கள் மருத்துவ நிபுணர்கள் இல்லை — கர்ப்பம், நீரிழிவு அல்லது சிறு குழந்தைக்கு கொடுக்கும் முன் மருத்துவரிடம் ஆலோசனை பெறவும். இதில் பாதாம் மற்றும் எள் உள்ளது.",
    userSubscription: "சந்தா உதவி",
    subscription:
      "செக்அவுட்டில் Subscribe & Save-ஐ ஆன் செய்தால் 5% தள்ளுபடி. ஒவ்வொரு டெலிவரிக்கும் முன் WhatsApp-இல் உறுதிப்படுத்த செய்தி அனுப்புவோம் — முன்னறிவிப்பு இல்லாமல் கட்டணம் வசூலிக்கப்படாது, எப்போது வேண்டுமானாலும் ரத்து செய்யலாம்.",
    userHuman: "ஒரு நபருடன் பேச",
    back: "← பின்செல்",
    backToMenu: "← முகப்புக்கு திரும்ப",
    trackAnother: "வேறு ஆர்டரை கண்காணிக்க",
    orderNumberPlaceholder: "ஆர்டர் எண், எ.கா. WP10123",
    phonePlaceholder: "செக்அவுட்டில் பயன்படுத்திய ஃபோன் எண்",
    trackButton: "கண்காணி",
    trackLoading: "தேடுகிறது…",
    trackUserMsg: (n: string) => `ஆர்டர் ${n}-ஐ கண்காணி`,
    trackResult: (order: string, status: string, tracking: string) =>
      `ஆர்டர் ${order} தற்போது: ${status}.${tracking} ஏதேனும் சரியில்லை என்றால், கீழே "ஒரு நபருடன் பேச"-ஐ தட்டவும்.`,
    trackingSuffix: (num: string, carrier: string) => ` டிராக்கிங்: ${num}${carrier ? ` (${carrier})` : ""}.`,
    notFound: "அந்த ஆர்டரை கண்டுபிடிக்க முடியவில்லை.",
    genericError: "எங்கள் பக்கத்தில் ஏதோ தவறு நடந்தது — சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
    whatsapp: "WhatsApp-இல் பேச",
    email: "மின்னஞ்சல் அனுப்ப",
    openLabel: "உதவி அரட்டையை திற",
    closeLabel: "உதவி அரட்டையை மூடு",
  },
} as const;

export function SupportWidget() {
  const pathname = usePathname();
  const { config } = useCart();
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [screen, setScreen] = useState<Screen>("menu");
  const [messages, setMessages] = useState<Message[]>([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [trackLoading, setTrackLoading] = useState(false);

  if (pathname?.startsWith("/admin")) return null;

  const t = TEXT[lang];
  const allMessages: Message[] = [{ from: "bot", text: t.welcome }, ...messages];

  function say(from: Message["from"], text: string) {
    setMessages((m) => [...m, { from, text }]);
  }

  function goMenu() {
    setScreen("menu");
  }

  function askFaq(question: string, answer: string) {
    say("user", question);
    say("bot", answer);
  }

  function switchLang(next: Lang) {
    setLang(next);
    setMessages([]);
    setScreen("menu");
  }

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    setTrackLoading(true);
    say("user", t.trackUserMsg(orderNumber));
    try {
      const res = await fetch("/api/support/track-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        say("bot", t.notFound);
      } else {
        const statusLabel = lang === "ta" ? (STATUS_LABELS_TA[data.status] ?? data.statusLabel) : data.statusLabel;
        const tracking = data.trackingNumber ? t.trackingSuffix(data.trackingNumber, data.carrier ?? "") : "";
        say("bot", t.trackResult(data.orderNumber, statusLabel, tracking));
      }
      setScreen("trackResult");
    } catch {
      say("bot", t.genericError);
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
    <div className="fixed inset-x-4 bottom-4 z-50 flex flex-col items-end sm:inset-x-auto sm:right-4">
      {open && (
        <div className="mb-3 flex max-h-[75vh] w-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xl sm:w-96">
          <div className="flex shrink-0 items-center justify-between bg-emerald-deep px-4 py-3 text-cream">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/20">
                <LeafIcon className="h-4 w-4 text-gold" />
              </span>
              <span className="font-serif font-semibold">{t.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-full border border-cream/30 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => switchLang("en")}
                  className={`px-2 py-1 ${lang === "en" ? "bg-gold text-ink" : "text-cream/70"}`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => switchLang("ta")}
                  className={`px-2 py-1 ${lang === "ta" ? "bg-gold text-ink" : "text-cream/70"}`}
                >
                  தமிழ்
                </button>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="text-cream/70 hover:text-cream"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {allMessages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.from === "bot" ? "bg-cream text-ink" : "ml-auto bg-emerald text-cream"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="max-h-56 shrink-0 overflow-y-auto border-t border-ink/10 p-3">
            {screen === "menu" && (
              <div className="flex flex-wrap gap-2">
                <QuickButton onClick={() => { say("user", t.menuLearn); setScreen("faq"); }}>
                  {t.menuLearn}
                </QuickButton>
                <QuickButton onClick={() => { say("user", t.userPrepare); say("bot", t.recipe); }}>
                  {t.menuPrepare}
                </QuickButton>
                <QuickButton onClick={() => { say("user", t.menuTrack); setScreen("track"); }}>
                  {t.menuTrack}
                </QuickButton>
                <QuickButton
                  onClick={() => { say("user", t.userSubscription); say("bot", t.subscription); setScreen("subscription"); }}
                >
                  {t.menuSubscription}
                </QuickButton>
                <QuickButton onClick={() => { say("user", t.userHealth); say("bot", t.health); }}>
                  {t.menuHealth}
                </QuickButton>
                <QuickButton onClick={() => { say("user", t.userHuman); setScreen("human"); }}>
                  {t.menuHuman}
                </QuickButton>
              </div>
            )}

            {screen === "faq" && (
              <div className="space-y-1">
                {FAQ_ITEMS.map((item) => (
                  <button
                    key={item.question}
                    type="button"
                    onClick={() => askFaq(lang === "en" ? item.question : item.questionTa, lang === "en" ? item.answer : item.answerTa)}
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium text-emerald hover:bg-emerald/5"
                  >
                    {lang === "en" ? item.question : item.questionTa}
                  </button>
                ))}
                <QuickButton onClick={goMenu}>{t.back}</QuickButton>
              </div>
            )}

            {screen === "track" && (
              <form onSubmit={handleTrack} className="space-y-2">
                <input
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t.orderNumberPlaceholder}
                  className="input text-sm"
                />
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.phonePlaceholder}
                  className="input text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={trackLoading}
                    className="rounded-full bg-emerald px-4 py-1.5 text-sm text-cream disabled:opacity-50"
                  >
                    {trackLoading ? t.trackLoading : t.trackButton}
                  </button>
                  <QuickButton onClick={goMenu}>{t.back}</QuickButton>
                </div>
              </form>
            )}

            {(screen === "trackResult" || screen === "subscription") && (
              <div className="flex flex-wrap gap-2">
                {screen === "trackResult" && (
                  <QuickButton onClick={() => setScreen("track")}>{t.trackAnother}</QuickButton>
                )}
                <QuickButton onClick={() => { say("user", t.userHuman); setScreen("human"); }}>
                  {t.menuHuman}
                </QuickButton>
                <QuickButton onClick={goMenu}>{t.backToMenu}</QuickButton>
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
                    {t.whatsapp}
                  </a>
                )}
                {config.supportEmail && (
                  <a
                    href={`mailto:${config.supportEmail}`}
                    className="rounded-full border border-emerald px-4 py-1.5 text-sm font-semibold text-emerald"
                  >
                    {t.email}
                  </a>
                )}
                <QuickButton onClick={goMenu}>{t.backToMenu}</QuickButton>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t.closeLabel : t.openLabel}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold text-xl text-ink shadow-lg"
      >
        {open ? "✕" : <LeafIcon className="h-6 w-6" />}
      </button>
    </div>
  );
}

function QuickButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
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
