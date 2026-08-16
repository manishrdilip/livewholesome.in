import type { IngredientIconKey } from "@/lib/content";

// Simple line-art botanical icons, one per ingredient family — stand-ins for
// the emoji, drawn in the brand palette rather than photographed or generic.
const PATHS: Record<IngredientIconKey, string> = {
  // A grain spike: a central stem with alternating oval kernels.
  grain:
    "M24 40V10 M24 14l-7-4 M24 14l7-4 M24 20l-7-4 M24 20l7-4 M24 26l-7-4 M24 26l7-4 M24 32l-7-4 M24 32l7-4",
  // A legume pod with three seeds inside.
  legume:
    "M14 20c0-6 4-11 10-11s10 5 10 11-4 12-10 15c-6-3-10-9-10-15z M19 20a2 2 0 104 0 2 2 0 00-4 0z M22 26a2 2 0 104 0 2 2 0 00-4 0z M19 30a2 2 0 104 0 2 2 0 00-4 0z",
  // A single teardrop seed.
  seed: "M24 10c6 8 9 14 9 19a9 9 0 11-18 0c0-5 3-11 9-19z",
  // A rounded almond/nut shape.
  nut: "M24 11c7 0 11 6 11 13s-4 15-11 15-11-8-11-15 4-13 11-13z M18 20c1-3 3-5 6-5",
  // A curled spice pod (cardamom/ginger style).
  spice:
    "M14 30c0-10 6-18 16-18 3 0 5 2 5 4 0 3-3 4-6 4-7 0-11 5-11 11 0 4 3 7 7 7",
  // A droplet, for palm sugar / natural sweeteners.
  sweetener: "M24 8c6 9 10 15 10 20a10 10 0 11-20 0c0-5 4-11 10-20z",
  // A round fruit with a small leaf.
  fruit: "M24 15a11 11 0 100 22 11 11 0 000-22z M24 15c0-4 2-6 5-7",
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
      <path d={PATHS[icon]} />
    </svg>
  );
}
