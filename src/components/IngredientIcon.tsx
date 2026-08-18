import type { IngredientIconKey } from "@/lib/content";

// Minimal single-tone line icons, one per ingredient family. Deliberately
// plain — no fills, no accent colour, no ornamentation — so the set reads
// as a professional icon system rather than illustration.
const PATHS: Record<IngredientIconKey, string> = {
  // Grain spike: stem with alternating kernels.
  grain: "M12 20V5 M12 7.5l-3-1.8 M12 7.5l3-1.8 M12 11l-3-1.8 M12 11l3-1.8 M12 14.5l-3-1.8 M12 14.5l3-1.8",
  // Legume pod with a seam line.
  legume: "M7 9.5c0-3.2 2.2-6 5-6s5 2.8 5 6-2.2 6.5-5 8c-2.8-1.5-5-4.8-5-8z M8 7.2c2 .6 6 .6 8 0",
  // Teardrop seed with a centre vein.
  seed: "M12 4.5c3.2 4.2 4.7 7.2 4.7 9.7a4.7 4.7 0 11-9.4 0c0-2.5 1.5-5.5 4.7-9.7z M12 7.5v9",
  // Almond outline.
  nut: "M12 5.2c3.6 0 5.7 3.1 5.7 6.8s-2.1 7.2-5.7 7.2-5.7-3.5-5.7-7.2S8.4 5.2 12 5.2z",
  // Curled root/pod (ginger, cardamom, fennel).
  spice: "M6.5 15.5c0-5.5 3.2-9.7 8.5-9.7 1.5 0 2.7 1 2.7 2.1 0 1.6-1.6 2.1-3.2 2.1-3.7 0-6 2.6-6 5.8 0 2.1 1.6 3.8 3.7 3.8",
  // Rounded jaggery nugget.
  sweetener: "M7.5 11c0-3 2.2-5.2 4.5-5.2S16.5 8 16.5 11s-2 6.2-4.5 6.2S7.5 14 7.5 11z",
  // Round fruit with a small stem.
  fruit: "M12 8a5.5 5.5 0 100 11 5.5 5.5 0 000-11z M12 8c0-1.7.9-2.7 2.2-3.1",
};

export function IngredientIcon({ icon, className }: { icon: IngredientIconKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={PATHS[icon]} />
    </svg>
  );
}
