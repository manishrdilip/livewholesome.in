"use client";

import { useLanguage } from "@/components/LanguageProvider";
import { HumanFillFigure } from "@/components/HumanFillFigure";
import type { DailyNeedNutrient } from "@/lib/content";

export function DailyNeedCard({ nutrient }: { nutrient: DailyNeedNutrient }) {
  const { lang } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-0.5 rounded-2xl border border-ink/10 p-4 text-center">
      <HumanFillFigure percent={nutrient.percent} className="h-14 w-14 text-emerald" />
      <div className="mt-1 font-serif text-lg font-bold text-emerald">{nutrient.percent}%</div>
      <div className="text-xs font-medium">{lang === "ta" ? nutrient.labelTa : nutrient.label}</div>
      <div className="text-[11px] text-ink/70">{nutrient.amount}</div>
    </div>
  );
}
