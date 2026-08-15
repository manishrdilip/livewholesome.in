export type IngredientTag = "ANCHOR" | "WATCH" | "SECURE";

export type Ingredient = {
  emoji: string;
  name: string;
  tag: IngredientTag;
  // Detail copy migrated from the original site where captured; the rest
  // still need a copy pass from the original livewholesome.in "Read more"
  // panels (accordion content, not reliably scriptable to bulk-extract).
  detail?: string;
};

export const INGREDIENTS: Ingredient[] = [
  {
    emoji: "🌾",
    name: "Sprouted Foxtail Millet",
    tag: "ANCHOR",
    detail:
      "Low GI base (35) + fiber. Sprouting increases bioavailable iron by 300% and reduces phytic acid by 60%.",
  },
  {
    emoji: "🫘",
    name: "Sprouted Green Gram",
    tag: "ANCHOR",
    detail: "Highest protein + folate in the formula. Easy digestion. The backbone of our protein profile.",
  },
  {
    emoji: "🟡",
    name: "Roasted Gram",
    tag: "ANCHOR",
    detail: "Protein + roasted flavor base + fiber. Provides the signature nutty taste without added oil.",
  },
  { emoji: "🌿", name: "Sprouted Ragi", tag: "ANCHOR", detail: "344mg calcium per 100g — the calcium anchor of the formula." },
  { emoji: "🍚", name: "Sprouted Red Rice", tag: "WATCH" },
  { emoji: "🪷", name: "Roasted Makhana", tag: "ANCHOR" },
  { emoji: "⚫", name: "Sesame", tag: "ANCHOR" },
  { emoji: "🔴", name: "Sprouted Masoor", tag: "SECURE" },
  { emoji: "🌰", name: "Almond", tag: "ANCHOR" },
  { emoji: "🟤", name: "Sprouted Chickpea", tag: "SECURE" },
  { emoji: "🎃", name: "Pumpkin Seed", tag: "SECURE" },
  { emoji: "🌾", name: "Sprouted Bajra", tag: "SECURE" },
  { emoji: "🍉", name: "Watermelon Seed", tag: "WATCH" },
  { emoji: "🍯", name: "Palmyra Palm Candy", tag: "SECURE" },
  { emoji: "🐎", name: "Sprouted Horse Gram", tag: "WATCH" },
  { emoji: "🥥", name: "Dried Coconut", tag: "WATCH" },
  { emoji: "🟢", name: "Amla Powder", tag: "ANCHOR" },
  { emoji: "💚", name: "Cardamom", tag: "ANCHOR" },
  { emoji: "🌼", name: "Fennel", tag: "SECURE" },
  {
    emoji: "🟠",
    name: "Dry Ginger",
    tag: "SECURE",
    detail: "Warmth + digestion + anti-bloating. Traditional Ayurvedic digestive support.",
  },
];

export const SOP_STEPS = [
  {
    n: "01",
    title: "Source & Inspect",
    body: "Every grain inspected for mold, stones, pests. Reject anything sour or damaged.",
  },
  {
    n: "02",
    title: "Clean & Sort",
    body: "Wash 2-3 times in RO water. Remove broken grains. Never use hard or hot water.",
  },
  {
    n: "03",
    title: "Soak (Wet Zone)",
    body: "Soak separately in 3-4x cold RO water for 6-24 hours. Green gram: 8h. Horse gram: 10h.",
  },
  {
    n: "04",
    title: "Sanitize Rinse",
    body: "Diluted food-grade hydrogen peroxide or vinegar rinse, then 2x RO water. Bacteria control.",
  },
  {
    n: "05",
    title: "Germinate (Wet Zone)",
    body: "Muslin cloth at 25-30°C in shade. Rinse 2-3x daily. Stop at 1-3mm sprouts.",
  },
  {
    n: "06",
    title: "Sun Dry",
    body: "1cm thick on cotton cloth. 8am-4pm only. 1.5-2 days. Snap test, bite test, salt test.",
  },
  {
    n: "07",
    title: "Roast (Kill Step)",
    body: "Heavy kadai. Low-to-medium flame. 1-2kg batches. Constant stirring. Critical food safety step.",
  },
  {
    n: "08",
    title: "Cool & Rest",
    body: "Spread wide, cool to room temp. Never grind hot — steam ruins shelf life.",
  },
  {
    n: "09",
    title: "Grind & Blend",
    body: "Medium grind (60 mesh). Nuts blended WITH grains (1:2 ratio). Amla & palm candy added last.",
  },
  {
    n: "10",
    title: "Pack with Oxygen Absorber",
    body: "Light-proof metallised pouch. Oxygen absorber inside. Airtight seal. Batch + best-before printed.",
  },
];

export const NUTRITION_STATS = [
  { emoji: "📈", value: "300%", label: "More Bioavailable Iron", sub: "Via sprouting" },
  { emoji: "🦴", value: "344mg", label: "Calcium per 100g", sub: "From Ragi" },
  { emoji: "⚡", value: "60%", label: "Phytic Acid Reduced", sub: "Via sprouting" },
  { emoji: "🛡️", value: "6mo", label: "Shelf Life", sub: "Oxygen absorber sealed" },
];
