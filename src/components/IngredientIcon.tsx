import type { IngredientIconKey } from "@/lib/content";

type IconPath = { d: string; fill?: boolean; accent?: boolean };

// Botanical line-art icons, one per ingredient family — brand palette only
// (emerald stroke + a gold accent, both already official brand colours).
// Each icon layers a couple of paths for a bit of hand-drawn detail instead
// of a single flat outline.
const ICONS: Record<IngredientIconKey, IconPath[]> = {
  // Grain spike: stem, alternating kernels, gold tips, a small base leaf.
  grain: [
    { d: "M24 40V12" },
    { d: "M24 15l-6-3.5 M24 15l6-3.5" },
    { d: "M24 20.5l-6-3.5 M24 20.5l6-3.5" },
    { d: "M24 26l-6-3.5 M24 26l6-3.5" },
    { d: "M24 31.5l-6-3.5 M24 31.5l6-3.5" },
    { d: "M18 11.5a3 3 0 013 3 M30 11.5a3 3 0 00-3 3", accent: true },
    { d: "M24 40c-3 2-7 2-9-1", accent: true },
  ],
  // Legume pod: curved shell with a seam and three gold seeds inside.
  legume: [
    { d: "M14 19c0-6.5 4.5-12 10-12s10 5.5 10 12-4.5 13-10 16c-5.5-3-10-9.5-10-16z" },
    { d: "M15 14c4 1 14 1 18 0", accent: false },
    { d: "M20 19a1.8 1.8 0 103.6 0 1.8 1.8 0 00-3.6 0z", fill: true, accent: true },
    { d: "M22.5 25.2a1.8 1.8 0 103.6 0 1.8 1.8 0 00-3.6 0z", fill: true, accent: true },
    { d: "M20.5 30.5a1.8 1.8 0 103.6 0 1.8 1.8 0 00-3.6 0z", fill: true, accent: true },
  ],
  // Teardrop seed with a vein and a small gold highlight.
  seed: [
    { d: "M24 9c6.5 8.5 9.5 14.5 9.5 19.5a9.5 9.5 0 11-19 0c0-5 3-11 9.5-19.5z" },
    { d: "M24 15v20" },
    { d: "M29 15.5a2 2 0 11-3.6-1.2", fill: true, accent: true },
  ],
  // Almond outline with a shell seam.
  nut: [
    { d: "M24 10.5c7.2 0 11.5 6.3 11.5 13.7S31.2 39.5 24 39.5 12.5 31 12.5 24.2 16.8 10.5 24 10.5z" },
    { d: "M16 21c1.5-3.5 4-6 8-6.5" },
    { d: "M31 20.5a2 2 0 11-3.7-1.4", fill: true, accent: true },
  ],
  // Curled spice pod/root with texture ridges.
  spice: [
    { d: "M13 31c0-11 6.5-19.5 17-19.5 3 0 5.5 2 5.5 4.3 0 3.2-3.2 4.3-6.5 4.3-7.5 0-12 5.3-12 11.7 0 4.3 3.2 7.7 7.5 7.7" },
    { d: "M18 24c2-1 5-1 7 0.5 M17 29c2-1 5-1 7 1" },
    { d: "M30 13.3a2 2 0 11-3.9 1", fill: true, accent: true },
  ],
  // Palm jaggery nugget: a rounded lump with facet lines, not a liquid drop.
  sweetener: [
    { d: "M15 22c0-6 4.5-10.5 9-10.5s9 4.5 9 10.5-4 12.5-9 12.5-9-6.5-9-12.5z" },
    { d: "M17.5 18.5c3 1.5 10 1.5 13 0 M16.5 25c3.5 1.7 11.5 1.7 15 0" },
    { d: "M28.5 15.8a1.8 1.8 0 11-3.4-1.1", fill: true, accent: true },
  ],
  // Round fruit (coconut/amla) with a stem and texture lines.
  fruit: [
    { d: "M24 16a10.5 10.5 0 100 21 10.5 10.5 0 000-21z" },
    { d: "M24 16c0-3.5 1.8-5.5 4.5-6.3" },
    { d: "M17.5 26.5c3 2 10 2 13 0 M18 22c3 1.7 9 1.7 12 0" },
    { d: "M29.5 22.3a2 2 0 11-3.8-1.2", fill: true, accent: true },
  ],
};

export function IngredientIcon({ icon, className }: { icon: IngredientIconKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[icon].map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill ? "var(--gold)" : "none"}
          stroke={p.fill ? "none" : p.accent ? "var(--gold)" : "currentColor"}
        />
      ))}
    </svg>
  );
}
