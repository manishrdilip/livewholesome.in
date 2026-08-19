import type { Metadata } from "next";
import Link from "next/link";
import { INGREDIENTS } from "@/lib/content";
import { IngredientsExplorer } from "@/components/IngredientsExplorer";
import { T } from "@/components/T";

export const metadata: Metadata = {
  title: "20 Ingredients. Zero Fillers. | Wholesome Purna",
  description:
    "Every ingredient in Wholesome Purna, explained — what it is, why it's sprouted, roasted or stone-ground, and what it actually does in the body.",
  alternates: { canonical: "/ingredients" },
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
        ← <T en="Back to shop" ta="கடைக்கு திரும்ப" />
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold">
        <T en="The Formula" ta="சூத்திரம்" />
      </p>
      <h1 className="mt-2 font-serif text-4xl font-bold">
        <T en="20 Ingredients. Zero Fillers." ta="20 பொருட்கள். வேறு எதுவும் இல்லை." />
      </h1>
      <p className="mt-3 max-w-2xl text-ink/70">
        <T
          en="Every gram earns its place. Sprouted, roasted or stone-ground for a reason — tap any card to see why."
          ta="ஒவ்வொரு கிராமும் காரணத்துடன் சேர்க்கப்பட்டுள்ளது. முளைகட்டி, வறுத்து அல்லது கல்லில் அரைக்கப்பட்டவை — காரணம் அறிய எந்த கார்டையும் தட்டவும்."
        />
      </p>

      <div className="mt-8">
        <IngredientsExplorer ingredients={INGREDIENTS} />
      </div>

      <p className="mt-8 text-sm text-ink/60">
        <strong className="font-semibold text-ink/80">
          <T en="Allergen note:" ta="ஒவ்வாமை குறிப்பு:" />
        </strong>{" "}
        <T
          en="Contains almond and sesame. Made in a facility that also handles other tree nuts."
          ta="பாதாம் மற்றும் எள் உள்ளது. மற்ற மரக்கொட்டைகளையும் கையாளும் தொழிற்சாலையில் தயாரிக்கப்படுகிறது."
        />
      </p>

      <div className="mt-12 rounded-2xl bg-emerald-deep px-6 py-10 text-center text-cream">
        <h2 className="font-serif text-2xl font-bold">
          <T en="Experience All 20 — Order Purna" ta="அனைத்து 20-ஐயும் அனுபவிக்க — Purna ஆர்டர் செய்ய" />
        </h2>
        <Link
          href="/#order"
          className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-emerald-deep"
        >
          <T en="Pre-order Now" ta="முன்பதிவு செய்ய" />
        </Link>
      </div>
    </div>
  );
}
