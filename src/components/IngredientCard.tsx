"use client";

import { useState } from "react";
import type { Ingredient } from "@/lib/content";

export function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="text-2xl">{ingredient.emoji}</div>
      <div className="mt-2 font-medium leading-snug">{ingredient.name}</div>
      {open && <p className="mt-3 text-sm text-ink/70">{ingredient.detail}</p>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 block text-xs font-semibold text-emerald"
      >
        {open ? "Show less ▲" : "Read more ▼"}
      </button>
    </div>
  );
}
