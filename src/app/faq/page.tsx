import type { Metadata } from "next";
import Link from "next/link";
import { FAQ_ITEMS } from "@/lib/faq";
import { FaqAccordion } from "@/components/FaqAccordion";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "FAQ + Support | Wholesome Purna",
  description: "Answers to common questions about Wholesome Purna — preparation, ingredients, shipping, and subscriptions.",
};

export default async function FaqPage() {
  const settings = await getSettings();
  const waNumber = settings.support_phone?.replace(/\D/g, "");

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← Back to shop
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold">Support</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">FAQ</h1>
      <p className="mt-3 text-ink/70">
        Can&apos;t find your answer here? Use the chat icon in the corner, or reach us directly.
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
            Chat on WhatsApp
          </a>
        )}
        {settings.support_email && (
          <a
            href={`mailto:${settings.support_email.toLowerCase()}`}
            className="rounded-full border border-emerald px-5 py-2.5 font-semibold text-emerald"
          >
            Email us
          </a>
        )}
      </div>
    </div>
  );
}
