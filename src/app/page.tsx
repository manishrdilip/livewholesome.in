import Link from "next/link";
import { Footer } from "@/components/Footer";
import { FitQuiz } from "@/components/FitQuiz";
import { HeroOrderButton } from "@/components/HeroOrderButton";
import { DailyNeedCard } from "@/components/DailyNeedCard";
import { IngredientCard } from "@/components/IngredientCard";
import { LogoMark } from "@/components/LogoMark";
import { NutritionStatVisual } from "@/components/NutritionStatVisual";
import { OrderBox } from "@/components/OrderBox";
import { T } from "@/components/T";
import { ReviewsSection } from "@/components/ReviewsSection";
import { DAILY_NEED_ESTIMATE, INGREDIENTS, NUTRITION_STATS } from "@/lib/content";
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
        image: "https://livewholesome.in/opengraph-image",
        brand: { "@type": "Brand", name: settings.business_name },
        offers: {
          "@type": "Offer",
          url: "https://livewholesome.in/#order",
          priceCurrency: "INR",
          price: pricing.offerPrice,
          availability: "https://schema.org/InStock",
          hasMerchantReturnPolicy: {
            "@type": "MerchantReturnPolicy",
            returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
            applicableCountry: "IN",
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: { "@type": "MonetaryAmount", value: 0, currency: "INR" },
            shippingDestination: { "@type": "DefinedRegion", addressCountry: "IN" },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
              transitTime: { "@type": "QuantitativeValue", minValue: 3, maxValue: 7, unitCode: "DAY" },
            },
          },
        },
      },
      {
        "@type": "Organization",
        name: settings.business_name,
        url: "https://livewholesome.in",
        logo: "https://livewholesome.in/icon1.png",
        ...(settings.support_email && { email: settings.support_email.toLowerCase() }),
        ...(settings.support_phone && { telephone: settings.support_phone }),
        ...(settings.registered_address && {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.registered_address,
            addressCountry: "IN",
          },
        }),
        ...([settings.instagram_url, settings.facebook_url, settings.youtube_url].filter(Boolean)
          .length > 0 && {
          sameAs: [settings.instagram_url, settings.facebook_url, settings.youtube_url].filter(
            Boolean
          ),
        }),
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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-ink"
      >
        Skip to main content
      </a>

      <main id="main-content">
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-deep to-emerald text-cream">
        <LogoMark
          size={900}
          className="pointer-events-none absolute -right-64 -top-64 opacity-[0.06] md:-right-40 md:-top-40"
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center">
          <div className="hero-enter">
            <h1 className="font-serif text-6xl font-bold tracking-tight">
              Wholesome
              <span className="block font-normal italic text-gold">Purna</span>
            </h1>
            <p className="mt-4 italic tracking-wide text-cream/80">பூர்ணா — Complete. Whole. Full.</p>
            <p className="mt-6 max-w-md text-cream/90">
              <T
                en="A sprouted multigrain health mix crafted from 20 ancient ingredients. Soaked, germinated, sun-dried, roasted, and stone-ground — exactly as nature intended. No machines. No preservatives. Just wholesome."
                ta="20 பழம்பெரும் பொருட்களால் தயாரிக்கப்படும் முளைகட்டிய பல தானிய ஹெல்த் மிக்ஸ். ஊற வைத்து, முளைகட்டி, வெயிலில் உலர்த்தி, வறுத்து, கல்லில் அரைக்கப்படுகிறது — இயற்கை நினைத்தது போலவே. இயந்திரங்கள் இல்லை. பதப்படுத்தும் பொருட்கள் இல்லை. வெறும் Wholesome."
              />
            </p>

            <dl className="mt-8 grid grid-cols-4 gap-4 text-center">
              {[
                ["20", "Ingredients", "பொருட்கள்"],
                ["8", "Sprouted", "முளைகட்டியவை"],
                ["0%", "Preservatives", "பதப்படுத்திகள்"],
                ["100%", "Natural", "இயற்கையானது"],
              ].map(([value, label, labelTa]) => (
                <div key={label}>
                  <dt className="font-serif text-2xl font-bold text-gold">{value}</dt>
                  <dd className="text-xs text-cream/70">
                    <T en={label} ta={labelTa} />
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <HeroOrderButton />
              <Link
                href="/ingredients"
                className="rounded-full border border-cream/40 px-6 py-3 font-semibold"
              >
                <T en="Explore Ingredients" ta="பொருட்களை பார்க்க" />
              </Link>
            </div>
            <FitQuiz />
          </div>

          <div id="order" className="scroll-mt-24">
            <OrderBox />
          </div>
        </div>
      </section>

      <section id="ingredients" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald">
          <T en="The Formula" ta="சூத்திரம்" />
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          <T en="20 Ingredients. Zero Fillers." ta="20 பொருட்கள். வேறு எதுவும் இல்லை." />
        </h2>
        <p className="mt-3 max-w-2xl text-ink/70">
          <T
            en="Every gram earns its place. Sprouted, roasted or stone-ground for a reason."
            ta="ஒவ்வொரு கிராமும் காரணத்துடன் சேர்க்கப்பட்டுள்ளது. முளைகட்டி, வறுத்து அல்லது கல்லில் அரைக்கப்பட்டவை."
          />
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {INGREDIENTS.slice(0, 6).map((ing) => (
            <IngredientCard key={ing.name} ingredient={ing} />
          ))}
        </div>
        <Link
          href="/ingredients"
          className="mt-6 inline-block font-semibold text-emerald hover:underline"
        >
          <T en="Explore All 20 Ingredients →" ta="அனைத்து 20 பொருட்களையும் பார்க்க →" />
        </Link>
        <p className="mt-6 text-sm text-ink/70">
          <strong className="font-semibold text-ink/80">
            <T en="Allergen note:" ta="ஒவ்வாமை குறிப்பு:" />
          </strong>{" "}
          <T
            en="Contains almond and sesame. Made in a facility that also handles other tree nuts."
            ta="பாதாம் மற்றும் எள் உள்ளது. மற்ற மரக்கொட்டைகளையும் கையாளும் தொழிற்சாலையில் தயாரிக்கப்படுகிறது."
          />
        </p>
      </section>

      <ReviewsSection />

      <section id="nutrition" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald">
          <T en="Nutrition" ta="ஊட்டச்சத்து" />
        </p>
        <h2 className="mt-2 font-serif text-3xl font-bold">
          <T en="Powered by Sprouting Science" ta="முளைகட்டும் அறிவியலால் இயக்கப்படுகிறது" />
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {NUTRITION_STATS.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-ink/10 p-5 text-center">
              <NutritionStatVisual visual={stat.visual} />
              <div className="mt-3 font-serif text-2xl font-bold text-emerald">{stat.value}</div>
              <div className="text-sm font-medium">
                <T en={stat.label} ta={stat.labelTa} />
              </div>
              <div className="text-xs text-ink/70">
                <T en={stat.sub} ta={stat.subTa} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald">
            <T en="One Cup at Breakfast (30g + Milk)" ta="காலையில் ஒரு கப் (30g + பால்)" />
          </p>
          <h3 className="mt-1 font-serif text-xl font-bold">
            <T en="What One Cup Gives You" ta="ஒரு கப் தரும் ஊட்டச்சத்து" />
          </h3>
          <p className="mt-1 text-sm text-ink/70">
            <T
              en="Wholesome Purna mixed with milk — % of this meal's fair share of your day, not the whole day's food."
              ta="பாலுடன் கலந்த Wholesome Purna — இந்த வேளைக்கான தினசரி தேவையின் நியாயமான பங்கு, நாள் முழுவதும் உண்ணும் உணவு அல்ல."
            />
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 sm:grid-cols-5">
            {DAILY_NEED_ESTIMATE.map((n) => (
              <DailyNeedCard key={n.key} nutrient={n} />
            ))}
          </div>
          <p className="mt-4 text-xs text-ink/70">
            <T
              en="Estimated from standard food-composition data for 30g of the mix (equal parts of all 20 ingredients) prepared with 200ml milk, shown against one meal's share of daily need (daily value ÷ 3 meals) — lab-verified values coming soon."
              ta="30g கலவை (அனைத்து 20 பொருட்களின் சம பங்கு) 200ml பாலுடன் தயாரிக்கப்பட்டதற்கான நிலையான உணவு தரவில் இருந்து மதிப்பிடப்பட்டது, ஒரு வேளைக்கான தினசரி தேவையின் பங்கிற்கு எதிராக (தினசரி மதிப்பு ÷ 3 வேளைகள்) — ஆய்வக சரிபார்க்கப்பட்ட மதிப்புகள் விரைவில்."
            />
          </p>
        </div>
      </section>

      <section className="bg-emerald-deep py-16 text-cream">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="font-serif text-2xl font-bold">
            <T en="Start Your Wholesome Journey" ta="உங்கள் Wholesome பயணத்தைத் தொடங்குங்கள்" />
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-cream/80">
            <T
              en={`Handcrafted in small batches in Vellore, Tamil Nadu. Sealed with an oxygen absorber for a 6-month shelf life${settings.fssai_license ? `, FSSAI licensed (${settings.fssai_license})` : ""}. Lab reports available on request —`}
              ta={`வேலூர், தமிழ்நாட்டில் சிறு தொகுதிகளாக கையால் தயாரிக்கப்படுகிறது. ஆக்ஸிஜன் அப்சார்பருடன் சீல் செய்யப்பட்டு 6 மாத சேமிப்பு காலம்${settings.fssai_license ? ` (FSSAI உரிமம்: ${settings.fssai_license})` : ""}. கோரிக்கையின் பேரில் லேப் அறிக்கைகள் கிடைக்கும் —`}
            />{" "}
            {settings.support_email ? (
              <a href={`mailto:${settings.support_email.toLowerCase()}`} className="underline">
                {settings.support_email.toLowerCase()}
              </a>
            ) : (
              <T en="contact us" ta="எங்களை தொடர்பு கொள்ளவும்" />
            )}
            .
          </p>
          <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-cream/90">
            {[
              ["500g — approx. 16 servings", "500g — சுமார் 16 பரிமாறல்கள்"],
              ["Oxygen absorber sealed", "ஆக்ஸிஜன் அப்சார்பர் சீல்"],
              ["Free shipping over ₹798", "₹798க்கு மேல் இலவச டெலிவரி"],
              ["Batch-tracked", "பேட்ச் கண்காணிக்கப்படுகிறது"],
              ["6-month shelf life", "6 மாத சேமிப்பு காலம்"],
            ].map(([item, itemTa]) => (
              <li key={item}>
                ✓ <T en={item} ta={itemTa} />
              </li>
            ))}
          </ul>
        </div>
      </section>
      </main>

      <Footer settings={settings} />
    </>
  );
}
