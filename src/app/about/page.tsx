import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/T";

export const metadata: Metadata = {
  title: "Our Story | Wholesome Purna",
  description:
    "How a mother's kitchen in Vellore, started in 2004 to feed her own children, grew into Wholesome Purna.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← <T en="Back to shop" ta="கடைக்கு திரும்ப" />
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold">
        <T en="Our Story" ta="எங்கள் கதை" />
      </p>
      <h1 className="mt-2 font-serif text-4xl font-bold">
        <T en="A Mother's Kitchen" ta="ஒரு அம்மாவின் சமையலறை" />
      </h1>
      <p className="mt-3 text-ink/70">பூர்ணா — Complete. Whole. Full.</p>

      <div className="mt-8 space-y-6 text-ink/80">
        <p>
          <T
            en="Wholesome Purna didn't start as a business. It started in 2004, in a kitchen in Vellore, with a mother soaking and sprouting grains to feed her own children — the same twenty ingredients, soaked, germinated, sun-dried, roasted, and stone-ground by hand, long before it had a name or a label."
            ta="Wholesome Purna ஒரு வணிகமாக தொடங்கவில்லை. இது 2004-ல், வேலூரில் உள்ள ஒரு சமையலறையில், தன் சொந்த குழந்தைகளுக்கு உணவளிக்க தானியங்களை ஊற வைத்து முளைகட்டிய ஒரு அம்மாவிடமிருந்து தொடங்கியது — அதே இருபது பொருட்கள், ஊற வைத்து, முளைகட்டி, வெயிலில் உலர்த்தி, வறுத்து, கையால் கல்லில் அரைக்கப்பட்டவை — ஒரு பெயரோ லேபிளோ கிடைப்பதற்கு முன்பே."
          />
        </p>
        <p>
          <T
            en="Neighbours noticed. What she made for her own family, she began making for a few more — then a few more after that. For years, Purna stayed exactly that size: a small kitchen, serving the local community in Vellore, one batch at a time."
            ta="அக்கம்பக்கத்தினர் கவனித்தனர். தன் குடும்பத்திற்காக செய்ததை, சிலருக்காக செய்யத் தொடங்கினார் — பின்பு இன்னும் சிலருக்காக. பல ஆண்டுகளாக, Purna அதே அளவில் இருந்தது: ஒரு சிறிய சமையலறை, வேலூரின் உள்ளூர் சமூகத்திற்கு சேவை செய்தது, ஒரு பேட்ச் ஒரு நேரத்தில்."
          />
        </p>
        <p>
          <T
            en="Today, her son is helping take that same recipe further — building the systems, the website, the order tracking, so more people outside Vellore can get what used to be available only to neighbours and family. The kitchen hasn't changed. The process hasn't changed. We're just now able to ship it to your door."
            ta="இன்று, அவரது மகன் அதே செய்முறையை மேலும் முன்னெடுத்துச் செல்ல உதவுகிறார் — கணினி அமைப்புகள், இணையதளம், ஆர்டர் கண்காணிப்பு ஆகியவற்றை உருவாக்கி, வேலூருக்கு வெளியே உள்ளவர்களும் முன்பு அக்கம்பக்கத்தினருக்கும் குடும்பத்தினருக்கும் மட்டுமே கிடைத்ததை பெற முடியும். சமையலறை மாறவில்லை. செயல்முறை மாறவில்லை. இப்போது அதை உங்கள் வீட்டு வாசலுக்கு அனுப்ப முடிகிறது."
          />
        </p>
        <p>
          <T
            en="We're honest about where we are: we're still small, and we deliberately cap how much we make each day rather than cut corners to meet demand we can't yet handle well. As we grow, that daily capacity will grow too — carefully, batch by batch, the same way it has since 2004."
            ta="நாங்கள் எங்கள் நிலையைப் பற்றி நேர்மையாக இருக்கிறோம்: நாங்கள் இன்னும் சிறியவர்கள், எங்களால் இன்னும் சரியாக கையாள முடியாத தேவையை பூர்த்தி செய்ய தரத்தில் சமரசம் செய்யாமல், ஒவ்வொரு நாளும் நாங்கள் தயாரிப்பதை வேண்டுமென்றே வரம்பிடுகிறோம். நாங்கள் வளரும்போது, அந்த தினசரி திறனும் வளரும் — கவனமாக, பேட்ச் பேட்சாக, 2004 முதல் இருந்தது போலவே."
          />
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-emerald-deep px-6 py-10 text-center text-cream">
        <h2 className="font-serif text-2xl font-bold">
          <T en="Taste What Started It All" ta="இதைத் தொடங்கிய சுவையை ருசிக்கவும்" />
        </h2>
        <Link
          href="/#order"
          className="mt-4 inline-block rounded-full bg-gold px-6 py-3 font-semibold text-emerald-deep"
        >
          <T en="Order Now" ta="இப்போது ஆர்டர் செய்ய" />
        </Link>
      </div>
    </div>
  );
}
