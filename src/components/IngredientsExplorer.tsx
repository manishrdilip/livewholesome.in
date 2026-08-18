"use client";

import { useEffect, useRef, useState } from "react";
import type { Ingredient, IngredientFilterGroup } from "@/lib/content";
import { IngredientIcon } from "@/components/IngredientIcon";
import { useLanguage } from "@/components/LanguageProvider";

const FILTERS: { id: IngredientFilterGroup | "all"; label: string; labelTa: string }[] = [
  { id: "all", label: "All", labelTa: "அனைத்தும்" },
  { id: "sprouted", label: "Sprouted", labelTa: "முளைகட்டியவை" },
  { id: "seeds", label: "Seeds & Nuts", labelTa: "விதைகள் & கொட்டைகள்" },
  { id: "spices", label: "Spices & Others", labelTa: "மசாலா & மற்றவை" },
];

const CATEGORY_TA: Record<Ingredient["category"], string> = {
  Sprouted: "முளைகட்டியது",
  Roasted: "வறுக்கப்பட்டது",
  Raw: "பச்சை",
  Powder: "பொடி",
  Spice: "மசாலா",
};

export function IngredientsExplorer({ ingredients }: { ingredients: Ingredient[] }) {
  const [filter, setFilter] = useState<IngredientFilterGroup | "all">("all");
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const { lang } = useLanguage();

  const filtered =
    filter === "all" ? ingredients : ingredients.filter((i) => i.filterGroup === filter);

  return (
    <div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === f.id
                ? "border-emerald bg-emerald text-cream"
                : "border-ink/15 text-ink/70 hover:border-emerald/50"
            }`}
          >
            {lang === "ta" ? f.labelTa : f.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {filtered.map((ing, i) => (
          <RevealCard key={ing.name} delay={i % 8}>
            <button
              type="button"
              onClick={() => setSelected(ing)}
              className="group flex h-full w-full flex-col items-start rounded-2xl border border-ink/10 bg-white p-4 text-left transition-shadow hover:shadow-md"
            >
              <div className="flex w-full items-start justify-between gap-2">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-emerald/5 transition-colors group-hover:bg-emerald/10">
                  <IngredientIcon
                    icon={ing.icon}
                    className="h-9 w-9 text-emerald transition-transform group-hover:scale-110"
                  />
                </span>
                <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  {lang === "ta" ? CATEGORY_TA[ing.category] : ing.category}
                </span>
              </div>
              <div className="mt-3 font-medium leading-snug">{ing.name}</div>
              <div className="text-sm text-ink/50">{ing.tamilName}</div>
              <div className="mt-2 text-xs font-medium text-emerald">{ing.nutritionHighlight}</div>
            </button>
          </RevealCard>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald/5">
                <IngredientIcon icon={selected.icon} className="h-11 w-11 text-emerald" />
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="text-ink/40 hover:text-ink"
              >
                ✕
              </button>
            </div>
            <h3 className="mt-3 font-serif text-xl font-bold">{selected.name}</h3>
            <p className="text-ink/50">{selected.tamilName}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-gold/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-gold">
                {lang === "ta" ? CATEGORY_TA[selected.category] : selected.category}
              </span>
              <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-semibold text-emerald">
                {selected.nutritionHighlight}
              </span>
            </div>
            <p className="mt-4 text-sm text-ink/70">{selected.detail}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function RevealCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${visible ? "is-visible" : ""}`}
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      {children}
    </div>
  );
}
