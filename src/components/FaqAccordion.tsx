"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import type { FaqItem } from "@/lib/faq";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { lang } = useLanguage();

  return (
    <div className="mt-8 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium"
            >
              {lang === "ta" ? item.questionTa : item.question}
              <span className={`shrink-0 text-emerald transition-transform ${open ? "rotate-180" : ""}`}>
                ▾
              </span>
            </button>
            {open && (
              <p className="px-5 pb-4 text-sm text-ink/70">
                {lang === "ta" ? item.answerTa : item.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
