"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { HumanFillFigure } from "@/components/HumanFillFigure";
import { T } from "@/components/T";

const FULLNESS_CAPTIONS: { max: number; en: string; ta: string }[] = [
  { max: 20, en: "Just started", ta: "தொடங்கியது" },
  { max: 40, en: "A little", ta: "கொஞ்சம்" },
  { max: 60, en: "Pretty good", ta: "நல்லது" },
  { max: 80, en: "Really good", ta: "மிகவும் நல்லது" },
  { max: 100, en: "Completely full!", ta: "முழுவதும் நிறைந்தது!" },
];

export function EarlyTesterForm() {
  const { lang } = useLanguage();
  const [fullness, setFullness] = useState(75);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [body, setBody] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const caption = FULLNESS_CAPTIONS.find((c) => fullness <= c.max) ?? FULLNESS_CAPTIONS[4];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("contact", contact);
    formData.set("fullness", String(fullness));
    formData.set("body", body);
    formData.set("companyWebsite", companyWebsite);
    if (files) {
      for (const file of Array.from(files)) formData.append("media", file);
    }

    try {
      const res = await fetch("/api/early-tester-review", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? (lang === "ta" ? "ஏதோ தவறு நடந்தது." : "Something went wrong."));
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError(lang === "ta" ? "இணைய இணைப்பு சிக்கல். மீண்டும் முயற்சிக்கவும்." : "Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-gold/30 bg-white p-8 text-center">
        <HumanFillFigure percent={fullness} className="mx-auto h-16 w-16 text-emerald" />
        <h2 className="mt-4 font-serif text-xl font-bold">
          <T en="Thank you!" ta="நன்றி!" />
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          <T
            en="Your review is already live on the site. We really appreciate you trying Wholesome Purna."
            ta="உங்கள் விமர்சனம் ஏற்கனவே தளத்தில் உள்ளது. Wholesome Purna-வை முயற்சித்ததற்கு மிக்க நன்றி."
          />
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gold/30 bg-white p-6">
      <div>
        <label className="mb-2 block text-sm font-medium">
          <T
            en="How complete did Wholesome Purna make you feel?"
            ta="Wholesome Purna உங்களை எவ்வளவு பூர்ணமாக உணர வைத்தது?"
          />
        </label>
        <div className="flex items-center gap-4 rounded-xl bg-emerald/5 p-4">
          <HumanFillFigure percent={fullness} className="h-16 w-16 shrink-0 text-emerald" />
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={fullness}
              onChange={(e) => setFullness(Number(e.target.value))}
              style={{ accentColor: "#a67c00" }}
              className="w-full"
              aria-label={lang === "ta" ? "பூர்ணம் அளவு" : "Fullness level"}
            />
            <div className="mt-1 flex items-baseline justify-between text-sm">
              <span className="font-semibold text-emerald">
                {lang === "ta" ? caption.ta : caption.en}
              </span>
              <span className="text-ink/50">{fullness}%</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          <T en="Your name" ta="உங்கள் பெயர்" />
        </label>
        <input
          type="text"
          required
          maxLength={200}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          placeholder={lang === "ta" ? "பெயர்" : "Full name"}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          <T en="Phone or email" ta="தொலைபேசி அல்லது மின்னஞ்சல்" />
        </label>
        <input
          type="text"
          required
          maxLength={200}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="input"
          placeholder={lang === "ta" ? "+91 98765 43210 அல்லது மின்னஞ்சல்" : "+91 98765 43210 or email"}
        />
        <p className="mt-1 text-xs text-ink/40">
          <T en="Just for us — never shown on the site." ta="எங்களுக்கு மட்டும் — தளத்தில் காட்டப்படாது." />
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          <T en="Tell us about it — Tamil or English, whatever's easier" ta="எங்களிடம் சொல்லுங்கள் — தமிழ் அல்லது ஆங்கிலம், எது எளிதோ அதில்" />
        </label>
        <textarea
          required
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="input"
          placeholder={lang === "ta" ? "உங்கள் அனுபவத்தை பகிரவும்..." : "Share your experience..."}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          <T en="Add a photo (optional)" ta="புகைப்படம் சேர்க்கவும் (விருப்பம்)" />
        </label>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="text-sm"
        />
      </div>

      {/* Honeypot — hidden from real users via CSS, bots often fill every field they find. */}
      <div className="hidden" aria-hidden="true">
        <label>
          Company website
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={companyWebsite}
            onChange={(e) => setCompanyWebsite(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-full bg-gold py-3 font-semibold text-emerald-deep disabled:opacity-50"
      >
        {submitting ? (
          <T en="Submitting..." ta="சமர்ப்பிக்கிறது..." />
        ) : (
          <T en="Submit Review" ta="விமர்சனத்தை சமர்ப்பிக்கவும்" />
        )}
      </button>
    </form>
  );
}
