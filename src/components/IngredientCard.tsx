"use client";

import { useState } from "react";
import type { Ingredient } from "@/lib/content";

const TAG_STYLES: Record<Ingredient["tag"], string> = {
  ANCHOR: "bg-emerald/10 text-emerald",
  WATCH: "bg-gold/10 text-gold",
  SECURE: "bg-ink/10 text-ink",
};

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="text-2xl">{ingredient.emoji}</div>
      <div className="mt-2 font-medium leading-snug">{ingredient.name}</div>
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${TAG_STYLES[ingredient.tag]}`}
      >
        {ingredient.tag}
      </span>
      {ingredient.detail && (
        <>
          {open && <p className="mt-3 text-sm text-ink/70">{ingredient.detail}</p>}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-2 block text-xs font-semibold text-emerald"
          >
            {open ? "Show less ▲" : "Read more ▼"}
          </button>
        </>
      )}
    </div>
  );
}
