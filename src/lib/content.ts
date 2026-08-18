export type IngredientIconKey = "grain" | "legume" | "seed" | "nut" | "spice" | "sweetener" | "fruit";
export type IngredientFilterGroup = "sprouted" | "seeds" | "spices";

export type Ingredient = {
  icon: IngredientIconKey;
  name: string;
  tamilName: string;
  /** Badge shown on the card — the actual production step for this ingredient. */
  category: "Sprouted" | "Roasted" | "Raw" | "Powder" | "Spice";
  /** Bucket used by the ingredients-page filter. */
  filterGroup: IngredientFilterGroup;
  nutritionHighlight: string;
  // Why this ingredient is in the formula, and what it actually does in the
  // body — grounded, real nutrition facts, not marketing fluff.
  detail: string;
};

export const INGREDIENTS: Ingredient[] = [
  {
    icon: "grain",
    name: "Sprouted Foxtail Millet",
    tamilName: "தினை",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Iron-rich, low GI",
    detail:
      "Low glycemic index (~35) means steady energy, not sugar spikes. Sprouting triples bioavailable iron and cuts phytic acid 60%, so the iron in this grain actually reaches your blood.",
  },
  {
    icon: "legume",
    name: "Sprouted Green Gram",
    tamilName: "பச்சை பயறு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Protein + folate",
    detail:
      "The protein and folate backbone of the mix — folate builds new red blood cells, protein repairs muscle. Sprouting predigests the starches, so it sits light even on a sensitive stomach.",
  },
  {
    icon: "legume",
    name: "Roasted Gram",
    tamilName: "பொட்டுக்கடலை",
    category: "Roasted",
    filterGroup: "seeds",
    nutritionHighlight: "Protein, fibre",
    detail:
      "Slow-digesting protein and fibre that blunts blood sugar swings — roasted dry, with zero added oil, so you get the nutty crunch without the extra fat.",
  },
  {
    icon: "grain",
    name: "Sprouted Ragi",
    tamilName: "கேழ்வரகு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "344mg calcium/100g",
    detail:
      "344mg calcium per 100g — more than milk, gram for gram. Sprouting also unlocks tryptophan, the amino acid your body uses to make serotonin and, later, melatonin for sleep.",
  },
  {
    icon: "grain",
    name: "Sprouted Red Rice",
    tamilName: "சிவப்பு அரிசி",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Iron, antioxidants",
    detail:
      "Unpolished, so it keeps its bran layer — that's where the iron, zinc, and anthocyanin antioxidants live. Lower GI than white rice, for energy that lasts.",
  },
  {
    icon: "seed",
    name: "Amaranth Seeds",
    tamilName: "முளைக்கீரை விதை",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Complete protein",
    detail:
      "A rare complete plant protein — it has lysine, the amino acid most grains are missing. Naturally gluten-free, and rich in calcium, iron and magnesium.",
  },
  {
    icon: "seed",
    name: "Sesame",
    tamilName: "எள்",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Calcium, copper",
    detail:
      "Gram for gram, one of the richest plant sources of calcium and copper. Natural lignans (sesamin) support healthy cholesterol and give the mix its roasted depth.",
  },
  {
    icon: "legume",
    name: "Sprouted Masoor",
    tamilName: "மசூர் பயறு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Iron + folate",
    detail:
      "Fast-absorbing iron and folate in a lentil that's already been sprouted for you — easier on digestion, and it works alongside the Amla in this mix so that iron doesn't just sit there, it gets absorbed.",
  },
  {
    icon: "nut",
    name: "Almond",
    tamilName: "பாதாம்",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Vitamin E",
    detail:
      "Vitamin E for skin and eye health, magnesium for muscle and nerve function, and healthy fats that keep you fuller for longer — a small handful goes a long way.",
  },
  {
    icon: "legume",
    name: "Sprouted Chickpea",
    tamilName: "கொண்டைக்கடலை",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Fibre, manganese",
    detail:
      "Fibre and resistant starch that feed your gut bacteria, plus manganese and folate. Sprouting breaks down the raffinose sugars that usually cause bloating.",
  },
  {
    icon: "seed",
    name: "Pumpkin Seed",
    tamilName: "பூசணிக்காய் விதை",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Zinc-rich",
    detail:
      "One of the best plant sources of zinc — your body's go-to mineral for immunity and wound healing — plus magnesium and plant-based omega-3s.",
  },
  {
    icon: "grain",
    name: "Sprouted Bajra",
    tamilName: "கம்பு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "Magnesium, iron",
    detail:
      "A warming grain traditionally eaten in winter, rich in iron, magnesium and phosphorus. Naturally gluten-free and high in fibre for steady digestion.",
  },
  {
    icon: "seed",
    name: "Watermelon Seed",
    tamilName: "தர்பூசணி விதை",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "Magnesium, zinc",
    detail:
      "An overlooked source of magnesium, zinc and clean plant protein — usually thrown away, we roast and grind it in instead of wasting it.",
  },
  {
    icon: "sweetener",
    name: "Palmyra Palm Candy",
    tamilName: "பனை வெல்லம்",
    category: "Raw",
    filterGroup: "spices",
    nutritionHighlight: "Natural iron",
    detail:
      "An unrefined sweetener straight from palm sap — unlike white sugar, it keeps its natural iron and potassium, and releases into your bloodstream more slowly.",
  },
  {
    icon: "legume",
    name: "Sprouted Horse Gram",
    tamilName: "கொள்ளு",
    category: "Sprouted",
    filterGroup: "sprouted",
    nutritionHighlight: "High protein",
    detail:
      "One of the highest-protein legumes there is, used in Ayurveda for centuries to support iron levels and metabolism. Comes with polyphenol antioxidants most lentils don't have.",
  },
  {
    icon: "fruit",
    name: "Dried Coconut",
    tamilName: "தேங்காய்",
    category: "Raw",
    filterGroup: "seeds",
    nutritionHighlight: "MCTs, energy",
    detail:
      "Medium-chain fats your body can turn into quick energy almost immediately, plus fibre and manganese — it's what gives the mix its natural sweetness without any added sugar.",
  },
  {
    icon: "fruit",
    name: "Amla Powder",
    tamilName: "நெல்லிக்காய்",
    category: "Powder",
    filterGroup: "spices",
    nutritionHighlight: "Vitamin C",
    detail:
      "The absorption key of the whole formula. Amla is one of the richest natural sources of vitamin C, and vitamin C converts the plant iron in this mix — from the millets, lentils and grams — into the form your gut can actually absorb. Without it, most of that iron would simply pass through.",
  },
  {
    icon: "spice",
    name: "Cardamom",
    tamilName: "ஏலக்காய்",
    category: "Spice",
    filterGroup: "spices",
    nutritionHighlight: "Digestion aid",
    detail:
      "Its volatile oils have been used for centuries to calm digestion and reduce bloating — a natural way to add warmth and flavour without a spoon of sugar.",
  },
  {
    icon: "spice",
    name: "Fennel",
    tamilName: "சோம்பு",
    category: "Spice",
    filterGroup: "spices",
    nutritionHighlight: "Anti-bloating",
    detail:
      "Contains anethole, the compound behind its digestive, anti-bloating effect — the same reason it's chewed after meals across India.",
  },
  {
    icon: "spice",
    name: "Dry Ginger",
    tamilName: "சுக்கு",
    category: "Spice",
    filterGroup: "spices",
    nutritionHighlight: "Warming, digestion",
    detail:
      "Warms the body, eases bloating, and its gingerol compounds are what Ayurveda has relied on for generations for digestive support.",
  },
];

export const NUTRITION_STATS = [
  {
    value: "300%",
    label: "More Bioavailable Iron",
    labelTa: "அதிக உறிஞ்சக்கூடிய இரும்பு",
    sub: "Via sprouting",
    subTa: "முளைகட்டுவதன் மூலம்",
  },
  {
    value: "344mg",
    label: "Calcium per 100g",
    labelTa: "100g-க்கு கால்சியம்",
    sub: "From Ragi",
    subTa: "கேழ்வரகிலிருந்து",
  },
  {
    value: "60%",
    label: "Phytic Acid Reduced",
    labelTa: "ஃபைடிக் அமிலம் குறைப்பு",
    sub: "Via sprouting",
    subTa: "முளைகட்டுவதன் மூலம்",
  },
  {
    value: "6mo",
    label: "Shelf Life",
    labelTa: "சேமிப்பு காலம்",
    sub: "Oxygen absorber sealed",
    subTa: "ஆக்ஸிஜன் அப்சார்பர் சீல்",
  },
];
