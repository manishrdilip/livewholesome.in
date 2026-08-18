export type IngredientIconKey =
  | "foxtail-millet"
  | "green-gram"
  | "roasted-gram"
  | "ragi"
  | "red-rice"
  | "amaranth"
  | "sesame"
  | "masoor"
  | "almond"
  | "chickpea"
  | "pumpkin-seed"
  | "bajra"
  | "watermelon-seed"
  | "palm-candy"
  | "horse-gram"
  | "coconut"
  | "amla"
  | "cardamom"
  | "fennel"
  | "dry-ginger";
export type IngredientFilterGroup = "sprouted" | "seeds" | "spices";

export type Ingredient = {
  icon: IngredientIconKey;
  name: string;
  tamilName: string;
  /** Badge shown on the card — the actual production step for this ingredient. */
  category: "Sprouted" | "Roasted" | "Raw" | "Traditional" | "Spice";
  /** Bucket used by the ingredients-page filter. */
  filterGroup: IngredientFilterGroup;
  nutritionHighlight: string;
  // Why this ingredient is in the formula, and what it actually does in the
  // body — grounded, real nutrition facts, not marketing fluff.
  detail: string;
};

export const INGREDIENTS: Ingredient[] = [
  {
    icon: "foxtail-millet",
    name: "Sprouted Foxtail Millet",
    tamilName: "தினை",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Iron-rich, low GI",
    detail:
      "Low glycemic index (~35) means steady energy, not sugar spikes. Sprouting triples bioavailable iron and cuts phytic acid 60%, so the iron in this grain actually reaches your blood.",
  },
  {
    icon: "green-gram",
    name: "Sprouted Green Gram",
    tamilName: "பச்சை பயறு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Protein + folate",
    detail:
      "The protein and folate backbone of the mix — folate builds new red blood cells, protein repairs muscle. Sprouting predigests the starches, so it sits light even on a sensitive stomach.",
  },
  {
    icon: "roasted-gram",
    name: "Roasted Gram",
    tamilName: "பொட்டுக்கடலை",
    category: "Roasted",
    filterGroup: "seeds",
    nutritionHighlight: "Protein, fibre",
    detail:
      "Slow-digesting protein and fibre that blunts blood sugar swings — roasted dry, with zero added oil, so you get the nutty crunch without the extra fat.",
  },
  {
    icon: "ragi",
    name: "Sprouted Ragi",
    tamilName: "கேழ்வரகு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "344mg calcium/100g",
    detail:
      "344mg calcium per 100g — more than milk, gram for gram. Sprouting also unlocks tryptophan, the amino acid your body uses to make serotonin and, later, melatonin for sleep.",
  },
  {
    icon: "red-rice",
    name: "Sprouted Red Rice",
    tamilName: "சிவப்பு அரிசி",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Iron, antioxidants",
    detail:
      "Unpolished, so it keeps its bran layer — that's where the iron, zinc, and anthocyanin antioxidants live. Lower GI than white rice, for energy that lasts.",
  },
  {
    icon: "amaranth",
    name: "Amaranth Seeds",
    tamilName: "முளைக்கீரை விதை",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Complete protein",
    detail:
      "A rare complete plant protein — it has lysine, the amino acid most grains are missing. Naturally gluten-free, and rich in calcium, iron and magnesium.",
  },
  {
    icon: "sesame",
    name: "Sesame",
    tamilName: "எள்",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Calcium, copper",
    detail:
      "Gram for gram, one of the richest plant sources of calcium and copper. Natural lignans (sesamin) support healthy cholesterol and give the mix its roasted depth.",
  },
  {
    icon: "masoor",
    name: "Sprouted Masoor",
    tamilName: "மசூர் பயறு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Iron + folate",
    detail:
      "Fast-absorbing iron and folate in a lentil that's already been sprouted for you — easier on digestion, and it works alongside the Amla in this mix so that iron doesn't just sit there, it gets absorbed.",
  },
  {
    icon: "almond",
    name: "Almond",
    tamilName: "பாதாம்",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Vitamin E",
    detail:
      "Vitamin E for skin and eye health, magnesium for muscle and nerve function, and healthy fats that keep you fuller for longer — a small handful goes a long way.",
  },
  {
    icon: "chickpea",
    name: "Sprouted Chickpea",
    tamilName: "கொண்டைக்கடலை",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Fibre, manganese",
    detail:
      "Fibre and resistant starch that feed your gut bacteria, plus manganese and folate. Sprouting breaks down the raffinose sugars that usually cause bloating.",
  },
  {
    icon: "pumpkin-seed",
    name: "Pumpkin Seed",
    tamilName: "பூசணிக்காய் விதை",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Zinc-rich",
    detail:
      "One of the best plant sources of zinc — your body's go-to mineral for immunity and wound healing — plus magnesium and plant-based omega-3s.",
  },
  {
    icon: "bajra",
    name: "Sprouted Bajra",
    tamilName: "கம்பு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Magnesium, iron",
    detail:
      "A warming grain traditionally eaten in winter, rich in iron, magnesium and phosphorus. Naturally gluten-free and high in fibre for steady digestion.",
  },
  {
    icon: "watermelon-seed",
    name: "Watermelon Seed",
    tamilName: "தர்பூசணி விதை",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Magnesium, zinc",
    detail:
      "An overlooked source of magnesium, zinc and clean plant protein — usually thrown away, we roast and grind it in instead of wasting it.",
  },
  {
    icon: "palm-candy",
    name: "Palmyra Palm Candy",
    tamilName: "பனை வெல்லம்",
    category: "Raw",
    filterGroup: "spices",
    nutritionHighlight: "Natural iron",
    detail:
      "An unrefined sweetener straight from palm sap — unlike white sugar, it keeps its natural iron and potassium, and releases into your bloodstream more slowly.",
  },
  {
    icon: "horse-gram",
    name: "Sprouted Horse Gram",
    tamilName: "கொள்ளு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "High protein",
    detail:
      "One of the highest-protein legumes there is, used in Ayurveda for centuries to support iron levels and metabolism. Comes with polyphenol antioxidants most lentils don't have.",
  },
  {
    icon: "coconut",
    name: "Dried Coconut",
    tamilName: "தேங்காய்",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "MCTs, energy",
    detail:
      "Medium-chain fats your body can turn into quick energy almost immediately, plus fibre and manganese — it's what gives the mix its natural sweetness without any added sugar.",
  },
  {
    icon: "amla",
    name: "Amla",
    tamilName: "நெல்லிக்காய்",
    category: "Traditional",
    filterGroup: "spices",
    nutritionHighlight: "Vitamin C",
    detail:
      "The absorption key of the whole formula. Amla is one of the richest natural sources of vitamin C, and vitamin C converts the plant iron in this mix — from the millets, lentils and grams — into the form your gut can actually absorb. Without it, most of that iron would simply pass through.",
  },
  {
    icon: "cardamom",
    name: "Cardamom",
    tamilName: "ஏலக்காய்",
    category: "Spice",
    filterGroup: "spices",
    nutritionHighlight: "Digestion aid",
    detail:
      "Its volatile oils have been used for centuries to calm digestion and reduce bloating — a natural way to add warmth and flavour without a spoon of sugar.",
  },
  {
    icon: "fennel",
    name: "Fennel",
    tamilName: "சோம்பு",
    category: "Spice",
    filterGroup: "spices",
    nutritionHighlight: "Anti-bloating",
    detail:
      "Contains anethole, the compound behind its digestive, anti-bloating effect — the same reason it's chewed after meals across India.",
  },
  {
    icon: "dry-ginger",
    name: "Dry Ginger",
    tamilName: "சுக்கு",
    category: "Spice",
    filterGroup: "spices",
    nutritionHighlight: "Warming, digestion",
    detail:
      "Warms the body, eases bloating, and its gingerol compounds are what Ayurveda has relied on for generations for digestive support.",
  },
];

export type NutritionStatVisual =
  | {
      type: "compare";
      beforeFrac: number;
      afterFrac: number;
      beforeLabel: string;
      beforeLabelTa: string;
      afterLabel: string;
      afterLabelTa: string;
    }
  | { type: "count"; count: number };

export type NutritionStat = {
  value: string;
  label: string;
  labelTa: string;
  sub: string;
  subTa: string;
  visual: NutritionStatVisual;
};

export const NUTRITION_STATS: NutritionStat[] = [
  {
    value: "300%",
    label: "More Bioavailable Iron",
    labelTa: "அதிக உறிஞ்சக்கூடிய இரும்பு",
    sub: "Via sprouting",
    subTa: "முளைகட்டுவதன் மூலம்",
    visual: {
      type: "compare",
      beforeFrac: 0.25,
      afterFrac: 1,
      beforeLabel: "Raw",
      beforeLabelTa: "பச்சை",
      afterLabel: "Sprouted",
      afterLabelTa: "முளைகட்டியது",
    },
  },
  {
    value: "344mg",
    label: "Calcium per 100g",
    labelTa: "100g-க்கு கால்சியம்",
    sub: "From Ragi",
    subTa: "கேழ்வரகிலிருந்து",
    visual: {
      type: "compare",
      beforeFrac: 0.35,
      afterFrac: 1,
      beforeLabel: "Milk",
      beforeLabelTa: "பால்",
      afterLabel: "Ragi",
      afterLabelTa: "கேழ்வரகு",
    },
  },
  {
    value: "60%",
    label: "Phytic Acid Reduced",
    labelTa: "ஃபைடிக் அமிலம் குறைப்பு",
    sub: "Via sprouting",
    subTa: "முளைகட்டுவதன் மூலம்",
    visual: {
      type: "compare",
      beforeFrac: 1,
      afterFrac: 0.4,
      beforeLabel: "Before",
      beforeLabelTa: "முன்",
      afterLabel: "After",
      afterLabelTa: "பின்",
    },
  },
  {
    value: "6mo",
    label: "Shelf Life",
    labelTa: "சேமிப்பு காலம்",
    sub: "Oxygen absorber sealed",
    subTa: "ஆக்ஸிஜன் அப்சார்பர் சீல்",
    visual: { type: "count", count: 6 },
  },
];

export type DailyNeedNutrient = {
  key: string;
  label: string;
  labelTa: string;
  amount: string;
  percent: number;
};

// Estimated from standard published food-composition data (USDA / Indian
// Food Composition Tables): 30g of the mix (equal-parts blend of all 20
// ingredients, 1.5g each — the real recipe ratio isn't in this codebase)
// prepared as a cup with 200ml whole milk, the way it's actually drunk at
// breakfast. Shown against ONE MEAL's fair share of the day (daily RDA ÷ 3
// meals), not the full day's total — daily values are standard adult
// Indian RDA references (ICMR-NIN): protein 60g, fiber 30g, iron 19mg,
// calcium 1000mg, zinc 12mg, magnesium 340mg, vitamin C 65mg, folate
// 200µg, vitamin E 10mg. Replace with the real lab report once available —
// these are estimates, not certified values.
export const DAILY_NEED_ESTIMATE: DailyNeedNutrient[] = [
  { key: "protein", label: "Protein", labelTa: "புரதம்", amount: "11.4g", percent: 57 },
  { key: "fiber", label: "Fiber", labelTa: "நார்ச்சத்து", amount: "3.8g", percent: 38 },
  { key: "iron", label: "Iron", labelTa: "இரும்பு", amount: "2.4mg", percent: 38 },
  { key: "calcium", label: "Calcium", labelTa: "கால்சியம்", amount: "316mg", percent: 95 },
  { key: "zinc", label: "Zinc", labelTa: "துத்தநாகம்", amount: "1.9mg", percent: 48 },
  { key: "magnesium", label: "Magnesium", labelTa: "மெக்னீசியம்", amount: "89mg", percent: 79 },
  { key: "vitaminC", label: "Vitamin C", labelTa: "வைட்டமின் சி", amount: "10mg", percent: 46 },
  { key: "folate", label: "Folate", labelTa: "ஃபோலேட்", amount: "39µg", percent: 59 },
  { key: "vitaminE", label: "Vitamin E", labelTa: "வைட்டமின் ஈ", amount: "0.7mg", percent: 21 },
];
