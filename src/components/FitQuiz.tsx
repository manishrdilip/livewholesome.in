"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

type AgeGroup = "under18" | "18to50" | "50plus";
type Condition = "pregnant" | "diabetes" | "allergy" | "none";
type Goal = "energy" | "digestion" | "iron" | "bone" | "wellness";
type Step = 0 | 1 | 2 | 3;
type ResultKind = "allergy" | "caution" | Goal;

const TEXT = {
  en: {
    trigger: "Not sure it's right for you? Take our 30-second quiz →",
    title: "Is Wholesome Purna Right for You?",
    close: "Close",
    back: "← Back",
    stepLabel: (n: number) => `Step ${n} of 3`,
    q1: "What's your age group?",
    ageOptions: { under18: "Under 18", "18to50": "18–50", "50plus": "50+" } as Record<AgeGroup, string>,
    q2: "Do any of these apply to you?",
    condOptions: {
      pregnant: "Pregnant or breastfeeding",
      diabetes: "Diabetes or blood sugar management",
      allergy: "Nut or sesame allergy",
      none: "None of these",
    } as Record<Condition, string>,
    next: "Next →",
    q3: "What are you hoping for?",
    goalOptions: {
      energy: "More energy",
      digestion: "Better digestion",
      iron: "Iron & anemia support",
      bone: "Bone health",
      wellness: "General wellness",
    } as Record<Goal, string>,
    resultTitle: {
      allergy: "This one's not for you",
      caution: "Check with your doctor first",
      energy: "Great fit for more energy",
      digestion: "Great fit for digestion",
      iron: "Great fit for iron & anemia support",
      bone: "Great fit for bone health",
      wellness: "Great fit for general wellness",
    } as Record<ResultKind, string>,
    resultBody: {
      allergy:
        "Wholesome Purna contains almond and sesame, and is made in a facility that also handles other tree nuts. With a nut or sesame allergy, we wouldn't recommend it.",
      caution:
        "We're not medical professionals, so we'd suggest checking with your doctor before adding Wholesome Purna to your diet — especially given what you told us. It's worth mentioning that it contains almond and sesame too.",
      energy:
        "Sprouted foxtail millet gives Purna a low glycemic index (~35) — steady energy instead of a sugar spike and crash.",
      digestion:
        "Fennel's natural anethole compound is the same reason it's chewed after meals across India — it's in Purna for exactly that anti-bloating effect, alongside sprouted lentils that are easier on a sensitive stomach.",
      iron:
        "Sprouting gives Purna's grains 300% more bioavailable iron than their raw form — and Amla's natural vitamin C helps your body actually absorb it.",
      bone: "Ragi alone brings 344mg of calcium per 100g — more than milk, gram for gram.",
      wellness:
        "20 real ingredients, 0% preservatives — and sprouting cuts phytic acid by 60%, so your body absorbs more of what's actually in the mix.",
    } as Record<ResultKind, string>,
    allergenFootnote: "Contains almond and sesame. Made in a facility that also handles other tree nuts.",
    seeIngredients: "See the full ingredient list",
    orderNow: "Order Now",
    retake: "Retake quiz",
  },
  ta: {
    trigger: "இது உங்களுக்கு பொருந்துமா என்று தெரியவில்லையா? 30 வினாடி வினாடி-வினா →",
    title: "Wholesome Purna உங்களுக்கு பொருந்துமா?",
    close: "மூடு",
    back: "← பின்செல்",
    stepLabel: (n: number) => `படி ${n} / 3`,
    q1: "உங்கள் வயது பிரிவு என்ன?",
    ageOptions: { under18: "18 வயதுக்கு கீழ்", "18to50": "18–50", "50plus": "50+" } as Record<AgeGroup, string>,
    q2: "இவற்றில் ஏதேனும் உங்களுக்கு பொருந்துமா?",
    condOptions: {
      pregnant: "கர்ப்பமாக உள்ளேன் / பாலூட்டுகிறேன்",
      diabetes: "நீரிழிவு / இரத்த சர்க்கரை கட்டுப்பாடு",
      allergy: "நட்ஸ் அல்லது எள் ஒவ்வாமை",
      none: "இவை எதுவும் இல்லை",
    } as Record<Condition, string>,
    next: "அடுத்து →",
    q3: "நீங்கள் எதை எதிர்பார்க்கிறீர்கள்?",
    goalOptions: {
      energy: "அதிக ஆற்றல்",
      digestion: "சிறந்த செரிமானம்",
      iron: "இரும்பு & இரத்த சோகை உதவி",
      bone: "எலும்பு ஆரோக்கியம்",
      wellness: "பொது நல்வாழ்வு",
    } as Record<Goal, string>,
    resultTitle: {
      allergy: "இது உங்களுக்கு பொருந்தாது",
      caution: "முதலில் மருத்துவரிடம் ஆலோசிக்கவும்",
      energy: "அதிக ஆற்றலுக்கு சிறந்த பொருத்தம்",
      digestion: "செரிமானத்திற்கு சிறந்த பொருத்தம்",
      iron: "இரும்பு & இரத்த சோகை உதவிக்கு சிறந்த பொருத்தம்",
      bone: "எலும்பு ஆரோக்கியத்திற்கு சிறந்த பொருத்தம்",
      wellness: "பொது நல்வாழ்விற்கு சிறந்த பொருத்தம்",
    } as Record<ResultKind, string>,
    resultBody: {
      allergy:
        "Wholesome Purna-வில் பாதாம் மற்றும் எள் உள்ளது, மேலும் இது மற்ற மரக்கொட்டைகளையும் கையாளும் தொழிற்சாலையில் தயாரிக்கப்படுகிறது. நட்ஸ் அல்லது எள் ஒவ்வாமை இருந்தால், இதை பரிந்துரைக்க மாட்டோம்.",
      caution:
        "நாங்கள் மருத்துவ நிபுணர்கள் இல்லை, எனவே Wholesome Purna-வை உணவில் சேர்க்கும் முன் மருத்துவரிடம் ஆலோசிக்குமாறு பரிந்துரைக்கிறோம் — குறிப்பாக நீங்கள் தெரிவித்ததை கருத்தில் கொண்டு. இதில் பாதாம் மற்றும் எள் உள்ளது என்பதையும் அவர்களிடம் குறிப்பிடவும்.",
      energy:
        "முளைகட்டிய தினை Purna-வுக்கு குறைந்த கிளைசெமிக் இன்டெக்ஸ் (~35) தருகிறது — சர்க்கரை ஏற்றம்-இறக்கம் இல்லாமல் நிலையான ஆற்றல்.",
      digestion:
        "சோம்பில் உள்ள இயற்கை அனெதோல் இந்தியா முழுவதும் உணவுக்குப் பின் மெல்லப்படுவதற்கான காரணம் — அதே வயிற்று உப்புச்சத்து-குறைப்பு விளைவுக்காக Purna-வில் உள்ளது, முளைகட்டிய பருப்புகளுடன் சேர்ந்து இது உணர்திறன் வாய்ந்த வயிற்றுக்கும் எளிதானது.",
      iron:
        "முளைகட்டுவது Purna-வின் தானியங்களுக்கு பச்சையை விட 300% அதிக உறிஞ்சக்கூடிய இரும்பை தருகிறது — நெல்லிக்காயின் இயற்கை வைட்டமின் சி அதை உடல் உண்மையில் உறிஞ்ச உதவுகிறது.",
      bone: "கேழ்வரகு மட்டும் 100g-க்கு 344mg கால்சியம் தருகிறது — பாலை விட அதிகம், கிராமுக்கு கிராம்.",
      wellness:
        "20 உண்மையான பொருட்கள், 0% பதப்படுத்திகள் — மேலும் முளைகட்டுவது ஃபைடிக் அமிலத்தை 60% குறைக்கிறது, எனவே கலவையில் உள்ளதை உடல் அதிகமாக உறிஞ்சுகிறது.",
    } as Record<ResultKind, string>,
    allergenFootnote: "பாதாம் மற்றும் எள் உள்ளது. மற்ற மரக்கொட்டைகளையும் கையாளும் தொழிற்சாலையில் தயாரிக்கப்படுகிறது.",
    seeIngredients: "முழு பொருட்கள் பட்டியலை பார்க்க",
    orderNow: "இப்போது ஆர்டர் செய்",
    retake: "மீண்டும் முயற்சி செய்",
  },
};

function getResultKind(conditions: Set<Condition>, ageGroup: AgeGroup | null, goal: Goal | null): ResultKind {
  if (conditions.has("allergy")) return "allergy";
  if (conditions.has("pregnant") || conditions.has("diabetes") || ageGroup === "under18") return "caution";
  return goal ?? "wellness";
}

export function FitQuiz() {
  const { lang } = useLanguage();
  const t = TEXT[lang];
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(0);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [conditions, setConditions] = useState<Set<Condition>>(new Set());
  const [goal, setGoal] = useState<Goal | null>(null);

  function reset() {
    setStep(0);
    setAgeGroup(null);
    setConditions(new Set());
    setGoal(null);
  }

  function close() {
    setOpen(false);
    reset();
  }

  function toggleCondition(c: Condition) {
    setConditions((prev) => {
      if (c === "none") return new Set(["none"]);
      const next = new Set(prev);
      next.delete("none");
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });
  }

  const resultKind = step === 3 ? getResultKind(conditions, ageGroup, goal) : null;
  const isBlocked = resultKind === "allergy" || resultKind === "caution";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 block text-sm font-medium text-cream/80 underline decoration-cream/40 underline-offset-4 hover:text-cream"
      >
        {t.trigger}
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t.title}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
            onClick={close}
          >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-ink shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif text-xl font-bold">{t.title}</h2>
              <button
                type="button"
                onClick={close}
                aria-label={t.close}
                className="shrink-0 text-ink/40 hover:text-ink"
              >
                ✕
              </button>
            </div>

            {step < 3 && (
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-ink/50">
                {t.stepLabel(step + 1)}
              </p>
            )}

            {step === 0 && (
              <div className="mt-5 space-y-2">
                <p className="text-sm font-semibold">{t.q1}</p>
                {(Object.keys(t.ageOptions) as AgeGroup[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setAgeGroup(key);
                      setStep(1);
                    }}
                    className="block w-full rounded-xl border border-ink/15 px-4 py-3 text-left text-sm font-medium text-ink/80 transition-colors hover:border-emerald/40 hover:bg-emerald/5"
                  >
                    {t.ageOptions[key]}
                  </button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="mt-5 space-y-2">
                <p className="text-sm font-semibold">{t.q2}</p>
                {(Object.keys(t.condOptions) as Condition[]).map((key) => {
                  const selected = conditions.has(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleCondition(key)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                        selected
                          ? "border-emerald bg-emerald/10 text-emerald"
                          : "border-ink/15 text-ink/80 hover:border-emerald/40"
                      }`}
                    >
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                          selected ? "border-emerald bg-emerald text-cream" : "border-ink/30"
                        }`}
                      >
                        {selected && "✓"}
                      </span>
                      {t.condOptions[key]}
                    </button>
                  );
                })}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-sm text-ink/60 hover:text-ink"
                  >
                    {t.back}
                  </button>
                  <button
                    type="button"
                    disabled={conditions.size === 0}
                    onClick={() => setStep(2)}
                    className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-5 space-y-2">
                <p className="text-sm font-semibold">{t.q3}</p>
                {(Object.keys(t.goalOptions) as Goal[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setGoal(key);
                      setStep(3);
                    }}
                    className="block w-full rounded-xl border border-ink/15 px-4 py-3 text-left text-sm font-medium text-ink/80 transition-colors hover:border-emerald/40 hover:bg-emerald/5"
                  >
                    {t.goalOptions[key]}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="pt-2 text-sm text-ink/60 hover:text-ink"
                >
                  {t.back}
                </button>
              </div>
            )}

            {step === 3 && resultKind && (
              <div className="mt-5">
                <h3 className="font-serif text-lg font-bold text-emerald">{t.resultTitle[resultKind]}</h3>
                <p className="mt-2 text-sm text-ink/80">{t.resultBody[resultKind]}</p>

                {!isBlocked && (
                  <p className="mt-4 text-xs text-ink/50">{t.allergenFootnote}</p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4">
                  {isBlocked ? (
                    <Link
                      href="/ingredients"
                      onClick={close}
                      className="text-sm font-medium text-emerald hover:underline"
                    >
                      {t.seeIngredients}
                    </Link>
                  ) : (
                    <Link
                      href="/#order"
                      onClick={close}
                      className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-ink"
                    >
                      {t.orderNow}
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={reset}
                    className="text-sm font-medium text-ink/60 hover:text-ink"
                  >
                    {t.retake}
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
