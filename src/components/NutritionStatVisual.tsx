"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { NutritionStatVisual as Visual } from "@/lib/content";

// A glance-only picture for each nutrition stat, so the point lands before
// anyone reads a number: two bars side by side (short/muted = before,
// tall/green = after), or a row of dots you can just count.
export function NutritionStatVisual({ visual }: { visual: Visual }) {
  const { lang } = useLanguage();

  if (visual.type === "count") {
    return (
      <div className="flex h-14 items-center justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: visual.count }, (_, i) => (
          <span key={i} className="h-2.5 w-2.5 rounded-full bg-gold" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center gap-4" aria-hidden="true">
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-10 w-3 items-end rounded-full bg-ink/10">
          <div
            className="w-full rounded-full bg-ink/25"
            style={{ height: `${visual.beforeFrac * 100}%` }}
          />
        </div>
        <span className="text-[10px] text-ink/50">
          {lang === "ta" ? visual.beforeLabelTa : visual.beforeLabel}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex h-10 w-3 items-end rounded-full bg-emerald/10">
          <div
            className="w-full rounded-full bg-emerald"
            style={{ height: `${visual.afterFrac * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-emerald">
          {lang === "ta" ? visual.afterLabelTa : visual.afterLabel}
        </span>
      </div>
    </div>
  );
}
