import type { IngredientIconKey } from "@/lib/content";

// One distinct minimal line icon per ingredient — no two share a silhouette.
// Single tone (emerald via currentColor), thin stroke, no fills, no
// ornamentation, so the set reads as a plain professional icon system.
const PATHS: Record<IngredientIconKey, string> = {
  // Dense bristly spike: narrow capsule with small side ticks.
  "foxtail-millet":
    "M12 4.5c-1.6 0-2.7 1.1-2.7 2.6v9.8c0 1.5 1.1 2.6 2.7 2.6s2.7-1.1 2.7-2.6V7.1c0-1.5-1.1-2.6-2.7-2.6z M9.3 8h-1 M9.3 11h-1 M9.3 14h-1 M14.7 8h1 M14.7 11h1 M14.7 14h1",
  // Small pod with two seeds.
  "green-gram":
    "M8.5 10c0-2.7 1.8-4.8 3.5-4.8s3.5 2.1 3.5 4.8-1.8 5.3-3.5 6.3c-1.7-1-3.5-3.6-3.5-6.3z M11 9a1 1 0 102 0 1 1 0 00-2 0z M11 12.5a1 1 0 102 0 1 1 0 00-2 0z",
  // Single round seed with a crease.
  "roasted-gram": "M12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11z M9.2 10c1 1.2 4.6 1.2 5.6 0",
  // Radiating "finger" clusters (finger millet).
  ragi: "M12 20v-8 M12 12l-4.5-6.3 M12 12l-2-7 M12 12v-7.5 M12 12l2-7 M12 12l4.5-6.3",
  // Arched drooping panicle with hanging grains.
  "red-rice":
    "M7.5 6c4.5 1.8 7.5 6.3 7.5 11.5 M9.6 9.3a1 1 0 102 0 1 1 0 00-2 0z M11 12.7a1 1 0 102 0 1 1 0 00-2 0z M12.3 16a1 1 0 102 0 1 1 0 00-2 0z",
  // Fluffy plume stalk.
  amaranth:
    "M12 4.5v15 M9.8 7.5c1.4.6 3 .6 4.4 0 M9.4 10.5c1.7.7 3.5.7 5.2 0 M9.4 13.5c1.7.7 3.5.7 5.2 0 M9.8 16.5c1.4.6 3 .6 4.4 0",
  // Tiny flat oval.
  sesame: "M7 12a5 2.8 0 1010 0 5 2.8 0 00-10 0z",
  // Wide flat lens/disc.
  masoor: "M6.5 12c0-1.8 2.5-3.2 5.5-3.2s5.5 1.4 5.5 3.2-2.5 3.2-5.5 3.2-5.5-1.4-5.5-3.2z",
  // Classic almond outline.
  almond:
    "M12 5.5c3.6 0 5.8 3.2 5.8 6.9s-2.2 6.6-5.8 6.6-5.8-3-5.8-6.6S8.4 5.5 12 5.5z M8.5 11c.8-1.8 2-3 4-3.3",
  // Round seed with a small beak.
  chickpea: "M12 8.8a5 5 0 100 10 5 5 0 000-10z M11.3 8.9c-.4-1.5.2-2.5 1.2-3",
  // Wide pointed teardrop with a tip mark.
  "pumpkin-seed":
    "M12 5c3.6 3.1 5.2 6.5 5.2 9.3a5.2 5.2 0 11-10.4 0c0-2.8 1.6-6.2 5.2-9.3z M12 5v2.4",
  // Fat short capsule with ring lines.
  bajra:
    "M12 7c-1.8 0-3 1.2-3 2.7v5.6c0 1.5 1.2 2.7 3 2.7s3-1.2 3-2.7V9.7c0-1.5-1.2-2.7-3-2.7z M9.3 11h5.4 M9.3 14h5.4",
  // Narrow elongated pointed teardrop.
  "watermelon-seed": "M12 4.5c2.4 4.1 3.4 7.5 3.4 10a3.4 3.4 0 11-6.8 0c0-2.5 1-5.9 3.4-10z",
  // Two stacked jaggery discs.
  "palm-candy": "M8.5 8.3a3.5 2 0 107 0 3.5 2 0 00-7 0z M8.5 14.3a3.5 2 0 107 0 3.5 2 0 00-7 0z",
  // Wide flat pod with two seeds.
  "horse-gram":
    "M6.5 12c0-2.2 2.9-4 6-4s6 1.8 6 4-2.9 4.3-6 4.3-6-2.1-6-4.3z M9.6 11.3a1 1 0 102 0 1 1 0 00-2 0z M12.7 11.3a1 1 0 102 0 1 1 0 00-2 0z",
  // Dome (half coconut) with an inner layer line.
  coconut: "M5.5 16a6.5 6.5 0 0113 0z M8.2 16c0-1.9 1.7-3.4 3.8-3.4s3.8 1.5 3.8 3.4",
  // Round fruit with lobe lines.
  amla: "M12 6a6.3 6.3 0 100 12.6A6.3 6.3 0 0012 6z M9.8 7.4v11.2 M14.2 7.4v11.2",
  // Elongated ridged pod.
  cardamom: "M8.3 16c0-5 1.7-9 3.7-9s3.7 4 3.7 9-1.7 4.5-3.7 4.5-3.7-.5-3.7-4.5z M12 8.5v11.5",
  // Small converging seed cluster.
  fennel: "M12 19c0-3 .3-5.7 1-8 M12 19c-.5-3-1-5.7-1-8 M9.5 9.8c.8.5 1.7.8 2.5.8s1.7-.3 2.5-.8",
  // Knobby irregular root — overlapping circles.
  "dry-ginger":
    "M8 14a2.8 2.8 0 105.6 0 2.8 2.8 0 00-5.6 0z M12.7 10.8a2.8 2.8 0 105.6 0 2.8 2.8 0 00-5.6 0z M10 17.3a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z",
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
