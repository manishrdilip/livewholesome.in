import { Footer } from "@/components/Footer";
import { HeroOrderButton } from "@/components/HeroOrderButton";
import { IngredientCard } from "@/components/IngredientCard";
import { OrderBox } from "@/components/OrderBox";
import { ReviewsSection } from "@/components/ReviewsSection";
import { INGREDIENTS, NUTRITION_STATS } from "@/lib/content";
import { PRODUCT } from "@/lib/product";
import { getEffectivePricing } from "@/lib/pricing";
import { getSettings } from "@/lib/settings";

// Reviews change via admin moderation, not a redeploy — revalidate periodically
// rather than baking the homepage's review list in at build time forever.
export const revalidate = 60;

export default async function HomePage() {
  const settings = await getSettings();
  const pricing = getEffectivePricing(settings);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: PRODUCT.name,
        description: PRODUCT.description,
        sku: PRODUCT.sku,
        brand: { "@type": "Brand", name: settings.business_name },
        offers: {
          "@type": "Offer",
          url: "https://livewholesome.in/#order",
          priceCurrency: "INR",
          price: pricing.offerPrice,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "Organization",
        name: settings.business_name,
        url: "https://livewholesome.in",
        logo: "https://livewholesome.in/icon.svg",
        ...(settings.support_email && { email: settings.support_email.toLowerCase() }),
        ...(settings.support_phone && { telephone: settings.support_phone }),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON.stringify doesn't escape "<", so a value containing
        // "</script>" could break out of this tag — replace it defensively
        // even though today's values (business_name etc.) are admin-only.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-emerald-deep"
      >
        Skip to main content
      </a>

      <main id="main-content">
      <section className="bg-gradient-to-b from-emerald-deep to-emerald text-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="font-serif text-5xl font-bold">Wholesome</h1>
            <p className="font-serif text-5xl italic text-gold">Purna</p>
            <p className="mt-3 italic text-cream/80">பூர்ணா — Complete. Whole. Full.</p>
            <p className="mt-6 max-w-md text-cream/90">
              A sprouted multigrain health mix crafted from 20 ancient ingredients. Soaked,
              germinated, sun-dried, roasted, and stone-ground — exactly as nature intended. No
              machines. No preservatives. Just wholesome.
            </p>

            <dl className="mt-8 grid grid-cols-4 gap-4 text-center">
              {[
                ["20", "Ingredients"],
                ["8", "Sprouted"],
                ["0%", "Preservatives"],
                ["100%", "Natural"],
              ].map(([value, label]) => (
                <div key={label}>
                  <dt className="font-serif text-2xl font-bold text-gold">{value}</dt>
                  <dd className="text-xs text-cream/70">{label}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <HeroOrderButton />
              <a
                href="#ingredients"
                className="rounded-full border border-cream/40 px-6 py-3 font-semibold"
              >
                Explore Ingredients
              </a>
            </div>
          </div>

          <div id="order" className="scroll-mt-24">
            <OrderBox />
          </div>
        </div>
      </section>

      <section id="ingredients" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">The Formula</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">20 Ingredients. Zero Fillers.</h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          Every gram earns its place. Sprouted, roasted or stone-ground for a reason — tap any
          card to see why.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {INGREDIENTS.map((ing) => (
            <IngredientCard key={ing.name} ingredient={ing} />
          ))}
        </div>
        <p className="mt-6 text-sm text-ink/60">
          <strong className="font-semibold text-ink/80">Allergen note:</strong> Contains almond
          and sesame. Made in a facility that also handles other tree nuts.
        </p>
      </section>

      <ReviewsSection />

      <section id="nutrition" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold">Nutrition</p>
        <h2 className="mt-2 font-serif text-3xl font-bold">Powered by Sprouting Science</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {NUTRITION_STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-ink/10 p-5 text-center">
              <div className="text-2xl">{stat.emoji}</div>
              <div className="mt-1 font-serif text-2xl font-bold text-emerald">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-xs text-ink/50">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-emerald-deep py-16 text-cream">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-serif text-2xl font-bold">Start Your Wholesome Journey</h2>
          <p className="mx-auto mt-3 max-w-2xl text-cream/80">
            Handcrafted in small batches in Vellore, Tamil Nadu. Sealed with an oxygen absorber
            for a 6-month shelf life
            {settings.fssai_license ? `, FSSAI licensed (${settings.fssai_license})` : ""}. Lab
            reports available on request —{" "}
            {settings.support_email ? (
              <a href={`mailto:${settings.support_email.toLowerCase()}`} className="underline">
                {settings.support_email.toLowerCase()}
              </a>
            ) : (
              "contact us"
            )}
            .
          </p>
          <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-cream/90">
            {[
              "500g — approx. 25 servings",
              "Oxygen absorber sealed",
              "Free shipping across India",
              "Batch-tracked",
              "6-month shelf life",
            ].map((item) => (
              <li key={item}>✓ {item}</li>
            ))}
          </ul>
        </div>
      </section>
      </main>

      <Footer settings={settings} />
    </>
  );
}
