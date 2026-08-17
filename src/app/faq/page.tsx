import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq";
import { FaqAccordion } from "@/components/FaqAccordion";
import { T } from "@/components/T";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "FAQ + Support | Wholesome Purna",
  description: "Answers to common questions about Wholesome Purna — preparation, ingredients, shipping, and subscriptions.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const settings = await getSettings();
  const waNumber = settings.support_phone?.replace(/\D/g, "");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← <T en="Back to shop" ta="கடைக்கு திரும்ப" />
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold">
        <T en="Support" ta="ஆதரவு" />
      </p>
      <h1 className="mt-2 font-serif text-4xl font-bold">
        <T en="FAQ" ta="கேள்விகள்" />
      </h1>
      <p className="mt-3 text-ink/70">
        <T
          en="Can't find your answer here? Use the chat icon in the corner, or reach us directly."
          ta="உங்கள் பதில் இங்கு இல்லையா? மூலையில் உள்ள அரட்டை ஐகானைப் பயன்படுத்தவும், அல்லது நேரடியாக தொடர்பு கொள்ளவும்."
        />
      </p>

      <FaqAccordion items={FAQ_ITEMS} />

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        {waNumber && (
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-emerald px-5 py-2.5 font-semibold text-cream"
          >
            <T en="Chat on WhatsApp" ta="WhatsApp-இல் பேச" />
          </a>
        )}
        {settings.support_email && (
          <a
            href={`mailto:${settings.support_email.toLowerCase()}`}
            className="rounded-full border border-emerald px-5 py-2.5 font-semibold text-emerald"
          >
            <T en="Email us" ta="மின்னஞ்சல் அனுப்ப" />
          </a>
        )}
      </div>
    </div>
  );
}
