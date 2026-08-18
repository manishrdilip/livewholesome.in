import type { IngredientIconKey } from "@/lib/content";

// One distinct, more-detailed line icon per ingredient — drawn to actually
// resemble the real seed/pod/spike shape, not just an abstract placeholder.
// Single tone (emerald via currentColor), thin stroke, no fills.
const PATHS: Record<IngredientIconKey, string> = {
  // Bristly millet spike: narrow capsule with dense fine bristle ticks.
  "foxtail-millet":
    "M12 4.2c-1.5 0-2.5 1.1-2.5 2.5v10.6c0 1.4 1 2.5 2.5 2.5s2.5-1.1 2.5-2.5V6.7c0-1.4-1-2.5-2.5-2.5z M8.8 7h-1.3 M8.8 9h-1.5 M8.8 11h-1.5 M8.8 13h-1.5 M8.8 15h-1.3 M15.2 7h1.3 M15.2 9h1.5 M15.2 11h1.5 M15.2 13h1.5 M15.2 15h1.3",
  // Mung pod, slightly split, three round beans inside.
  "green-gram":
    "M8 10.2c0-2.8 1.8-5 4-5s4 2.2 4 5-1.8 5.5-4 6.5c-2.2-1-4-3.7-4-6.5z M9.6 9.3a1.1 1.1 0 102.2 0 1.1 1.1 0 00-2.2 0z M9.6 12.8a1.1 1.1 0 102.2 0 1.1 1.1 0 00-2.2 0z M13.2 11a1.1 1.1 0 102.2 0 1.1 1.1 0 00-2.2 0z",
  // Single roasted chana with a top cleft and a crease.
  "roasted-gram":
    "M12 6.8c-3 0-5.3 2.5-5.3 5.5s2.3 5.7 5.3 5.7 5.3-2.7 5.3-5.7-2.3-5.5-5.3-5.5z M9.3 8.3c.7-.8 1.7-1.3 2.7-1.3s2 .5 2.7 1.3 M9 11.8c1 1.2 4.6 1.2 6 0",
  // Finger millet: curved fingers radiating from the stalk, like a hand.
  ragi: "M12 20v-7.5 M12 12.5q-2-3-4.8-6.3 M12 12.5q-1-3.8-1.3-7.7 M12 12.5v-8 M12 12.5q1-3.8 1.3-7.7 M12 12.5q2-3 4.8-6.3",
  // Drooping rice panicle with grains along the arch.
  "red-rice":
    "M7.3 5.8c5 2 8.2 6.8 8.2 12.4 M9.2 8.8a.9.9 0 101.8 0 .9.9 0 00-1.8 0z M10.3 11.8a.9.9 0 101.8 0 .9.9 0 00-1.8 0z M11.2 14.6a.9.9 0 101.8 0 .9.9 0 00-1.8 0z M11.9 17.3a.9.9 0 101.8 0 .9.9 0 00-1.8 0z",
  // Dense tasseled plume, tapered top and bottom.
  amaranth:
    "M12 4.2v15.6 M9.5 6.8c1.7.7 3.3.7 5 0 M9 9.3c2 .8 3.9.8 6 0 M8.8 11.8c2.2.9 4.2.9 6.4 0 M9 14.3c2 .8 3.9.8 6 0 M9.5 16.8c1.7.7 3.3.7 5 0",
  // Tiny flat seed.
  sesame: "M8.2 12c0-1.3 1.5-2.3 3.8-2.3s3.8 1 3.8 2.3-1.5 2.3-3.8 2.3-3.8-1-3.8-2.3z",
  // Lens/vesica shape — how a lentil looks side-on.
  masoor: "M6 12c1.6-3.4 4-5.3 6-5.3s4.4 1.9 6 5.3c-1.6 3.4-4 5.3-6 5.3s-4.4-1.9-6-5.3z",
  // Classic almond outline.
  almond:
    "M12 5.5c3.6 0 5.8 3.2 5.8 6.9s-2.2 6.6-5.8 6.6-5.8-3-5.8-6.6S8.4 5.5 12 5.5z M8.5 11c.8-1.8 2-3 4-3.3",
  // Round bean with its characteristic small beaked nose.
  chickpea: "M12 9a4.8 4.8 0 100 9.6A4.8 4.8 0 0012 9z M11 9.2c-.5-1.6.1-2.7 1.3-3.3",
  // Flat wide pepita, pointed tip.
  "pumpkin-seed":
    "M12 5c3.6 3.1 5.2 6.5 5.2 9.3a5.2 5.2 0 11-10.4 0c0-2.8 1.6-6.2 5.2-9.3z M12 5v2.4",
  // Thick pearl-millet spike with grain rings.
  bajra:
    "M12 7c-1.8 0-3 1.2-3 2.7v5.6c0 1.5 1.2 2.7 3 2.7s3-1.2 3-2.7V9.7c0-1.5-1.2-2.7-3-2.7z M9.3 10h5.4 M9.3 12.5h5.4 M9.3 15h5.4",
  // Narrow pointed teardrop.
  "watermelon-seed": "M12 4.5c2.4 4.1 3.4 7.5 3.4 10a3.4 3.4 0 11-6.8 0c0-2.5 1-5.9 3.4-10z",
  // Rounded jaggery lump with swirl texture lines.
  "palm-candy":
    "M7.5 12.5c0-3 2-5.5 4.5-5.5s4.5 2.5 4.5 5.5-2 5.7-4.5 5.7-4.5-2.7-4.5-5.7z M9 10.5c1.5 1 4.5 1 6 0 M8.7 14c1.8.8 4.7.8 6.5 0",
  // Elongated flat pod, two seeds.
  "horse-gram":
    "M6.3 12c0-2.4 3-4.3 6-4.3s6 1.9 6 4.3-2.7 4.3-6 4.3-6-1.9-6-4.3z M9.3 11.3a1 1 0 102 0 1 1 0 00-2 0z M12.7 11.3a1 1 0 102 0 1 1 0 00-2 0z",
  // Coconut half-shell with layered husk and flesh.
  coconut:
    "M5.3 16.2a6.7 6.7 0 0113.4 0z M7.8 16.2c0-1.9 1.9-3.5 4.2-3.5s4.2 1.6 4.2 3.5 M9 16.2c0-1.3 1.3-2.4 3-2.4s3 1.1 3 2.4",
  // Ridged gooseberry with its six lobes hinted by three lines.
  amla: "M12 6a6.3 6.3 0 100 12.6A6.3 6.3 0 0012 6z M9 7.6v10.8 M12 6.3v12.4 M15 7.6v10.8",
  // Ridged triangular cardamom pod.
  cardamom:
    "M8.3 16c0-5 1.7-9 3.7-9s3.7 4 3.7 9-1.7 4.5-3.7 4.5-3.7-.5-3.7-4.5z M10 8.3c.6 3.5.6 7.9 0 11.4 M14 8.3c-.6 3.5-.6 7.9 0 11.4",
  // Two curved fennel seeds side by side.
  fennel:
    "M9.3 17c-1.5-3-1.5-7 0-10.5c2 3.5 2 7.5 0 10.5z M14.7 17c-1.5-3-1.5-7 0-10.5c2 3.5 2 7.5 0 10.5z",
  // Gnarled, knobby dried-ginger root.
  "dry-ginger":
    "M6.8 14.3a2.6 2.6 0 105.2 0 2.6 2.6 0 00-5.2 0z M11 10.5a3 3 0 106 0 3 3 0 00-6 0z M14.8 15.8a2.3 2.3 0 104.6 0 2.3 2.3 0 00-4.6 0z M9.5 17.5a2 2 0 104 0 2 2 0 00-4 0z",
};

export function IngredientIcon({ icon, className }: { icon: IngredientIconKey; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      fillOpacity="0.08"
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
