"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { IngredientIcon } from "@/components/IngredientIcon";
import type { Ingredient } from "@/lib/content";

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald/5">
        <IngredientIcon icon={ingredient.icon} className="h-7 w-7 text-emerald" />
      </span>
      <div className="mt-2 font-medium leading-snug">{ingredient.name}</div>
      <div className="text-xs text-ink/70">{ingredient.tamilName}</div>
      {open && <p className="mt-3 text-sm text-ink/70">{ingredient.detail}</p>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 block text-xs font-semibold text-emerald"
      >
        {open
          ? lang === "ta"
            ? "குறைவாகக் காட்டு ▲"
            : "Show less ▲"
          : lang === "ta"
            ? "மேலும் படிக்க ▼"
            : "Read more ▼"}
      </button>
    </div>
  );
}
