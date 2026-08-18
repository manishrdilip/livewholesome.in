import type { Metadata } from "next";
import Link from "next/link";
import { T } from "@/components/T";
import { EarlyTesterForm } from "@/components/EarlyTesterForm";

export const metadata: Metadata = {
  title: "Early Tester Review | Wholesome Purna",
  description: "Tried a free sample of Wholesome Purna? Tell us about it.",
  robots: { index: false, follow: false },
};

export default function EarlyTesterPage() {
  return (
    <div className="mx-auto max-w-lg px-6 py-16">
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← <T en="Back to shop" ta="கடைக்கு திரும்ப" />
      </Link>

      <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-gold">
        <T en="Early Tester" ta="ஆரம்ப சோதனையாளர்" />
      </p>
      <h1 className="mt-2 font-serif text-3xl font-bold">
        <T en="You tried it early — tell us how it went" ta="நீங்கள் முன்னதாக முயற்சித்தீர்கள் — எப்படி இருந்தது சொல்லுங்கள்" />
      </h1>
      <p className="mt-3 text-ink/70">
        <T
          en="Thank you for trying a free sample of Wholesome Purna. Your honest review goes straight onto our site — no waiting."
          ta="Wholesome Purna-வின் இலவச மாதிரியை முயற்சித்ததற்கு நன்றி. உங்கள் நேர்மையான விமர்சனம் நேரடியாக எங்கள் தளத்தில் வரும் — காத்திருப்பு இல்லை."
        />
      </p>

      <div className="mt-8">
        <EarlyTesterForm />
      </div>
    </div>
  );
}
