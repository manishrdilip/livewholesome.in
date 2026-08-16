import type { Metadata } from "next";
import Link from "next/link";
import { INGREDIENTS } from "@/lib/content";
import { IngredientsExplorer } from "@/components/IngredientsExplorer";

export const metadata: Metadata = {
  title: "20 Ingredients. Zero Fillers. | Wholesome Purna",
  description:
    "Every ingredient in Wholesome Purna, explained — what it is, why it's sprouted, roasted or stone-ground, and what it actually does in the body.",
};

export default function IngredientsPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://livewholesome.in/" },
      { "@type": "ListItem", position: 2, name: "Ingredients" },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← Back to shop
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold">The Formula</p>
      <h1 className="mt-2 font-serif text-4xl font-bold">20 Ingredients. Zero Fillers.</h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        Every gram earns its place. Sprouted, roasted or stone-ground for a reason — tap any card
        to see why.
      </p>

      <div className="mt-8">
        <IngredientsExplorer ingredients={INGREDIENTS} />
      </div>

      <p className="mt-8 text-sm text-ink/60">
        <strong className="font-semibold text-ink/80">Allergen note:</strong> Contains almond and
        sesame. Made in a facility that also handles other tree nuts.
      </p>

      <div className="mt-12 rounded-2xl bg-emerald-deep px-6 py-10 text-center text-cream">
        <h2 className="font-serif text-2xl font-bold">Experience All 20 — Order Purna</h2>
        <Link
          href="/#order"
          className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-emerald-deep"
        >
          Order Now
        </Link>
      </div>
    </div>
  );
}
