export type Ingredient = {
  emoji: string;
  name: string;
  // Why this ingredient is in the formula, and what it actually does in the
  // body — grounded, real nutrition facts, not marketing fluff.
  detail: string;
};

export const INGREDIENTS: Ingredient[] = [
  {
    emoji: "🌾",
    name: "Sprouted Foxtail Millet",
    detail:
      "Low glycemic index (~35) means steady energy, not sugar spikes. Sprouting triples bioavailable iron and cuts phytic acid 60%, so the iron in this grain actually reaches your blood.",
  },
  {
    emoji: "🫘",
    name: "Sprouted Green Gram",
    detail:
      "The protein and folate backbone of the mix — folate builds new red blood cells, protein repairs muscle. Sprouting predigests the starches, so it sits light even on a sensitive stomach.",
  },
  {
    emoji: "🫛",
    name: "Roasted Gram",
    detail:
      "Slow-digesting protein and fibre that blunts blood sugar swings — roasted dry, with zero added oil, so you get the nutty crunch without the extra fat.",
  },
  {
    emoji: "🟤",
    name: "Sprouted Ragi",
    detail:
      "344mg calcium per 100g — more than milk, gram for gram. Sprouting also unlocks tryptophan, the amino acid your body uses to make serotonin and, later, melatonin for sleep.",
  },
  {
    emoji: "🍚",
    name: "Sprouted Red Rice",
    detail:
      "Unpolished, so it keeps its bran layer — that's where the iron, zinc, and anthocyanin antioxidants live. Lower GI than white rice, for energy that lasts.",
  },
  {
    emoji: "🌱",
    name: "Amaranth Seeds",
    detail:
      "A rare complete plant protein — it has lysine, the amino acid most grains are missing. Naturally gluten-free, and rich in calcium, iron and magnesium.",
  },
  {
    emoji: "⚫",
    name: "Sesame",
    detail:
      "Gram for gram, one of the richest plant sources of calcium and copper. Natural lignans (sesamin) support healthy cholesterol and give the mix its roasted depth.",
  },
  {
    emoji: "🟠",
    name: "Sprouted Masoor",
    detail:
      "Fast-absorbing iron and folate in a lentil that's already been sprouted for you — easier on digestion, and it works alongside the Amla in this mix so that iron doesn't just sit there, it gets absorbed.",
  },
  {
    emoji: "🌰",
    name: "Almond",
    detail:
      "Vitamin E for skin and eye health, magnesium for muscle and nerve function, and healthy fats that keep you fuller for longer — a small handful goes a long way.",
  },
  {
    emoji: "🧆",
    name: "Sprouted Chickpea",
    detail:
      "Fibre and resistant starch that feed your gut bacteria, plus manganese and folate. Sprouting breaks down the raffinose sugars that usually cause bloating.",
  },
  {
    emoji: "🎃",
    name: "Pumpkin Seed",
    detail:
      "One of the best plant sources of zinc — your body's go-to mineral for immunity and wound healing — plus magnesium and plant-based omega-3s.",
  },
  {
    emoji: "🟡",
    name: "Sprouted Bajra",
    detail:
      "A warming grain traditionally eaten in winter, rich in iron, magnesium and phosphorus. Naturally gluten-free and high in fibre for steady digestion.",
  },
  {
    emoji: "🍉",
    name: "Watermelon Seed",
    detail:
      "An overlooked source of magnesium, zinc and clean plant protein — usually thrown away, we roast and grind it in instead of wasting it.",
  },
  {
    emoji: "🌴",
    name: "Palmyra Palm Candy",
    detail:
      "An unrefined sweetener straight from palm sap — unlike white sugar, it keeps its natural iron and potassium, and releases into your bloodstream more slowly.",
  },
  {
    emoji: "🐎",
    name: "Sprouted Horse Gram",
    detail:
      "One of the highest-protein legumes there is, used in Ayurveda for centuries to support iron levels and metabolism. Comes with polyphenol antioxidants most lentils don't have.",
  },
  {
    emoji: "🥥",
    name: "Dried Coconut",
    detail:
      "Medium-chain fats your body can turn into quick energy almost immediately, plus fibre and manganese — it's what gives the mix its natural sweetness without any added sugar.",
  },
  {
    emoji: "🍏",
    name: "Amla Powder",
    detail:
      "The absorption key of the whole formula. Amla is one of the richest natural sources of vitamin C, and vitamin C converts the plant iron in this mix — from the millets, lentils and grams — into the form your gut can actually absorb. Without it, most of that iron would simply pass through.",
  },
  {
    emoji: "🟢",
    name: "Cardamom",
    detail:
      "Its volatile oils have been used for centuries to calm digestion and reduce bloating — a natural way to add warmth and flavour without a spoon of sugar.",
  },
  {
    emoji: "🌿",
    name: "Fennel",
    detail:
      "Contains anethole, the compound behind its digestive, anti-bloating effect — the same reason it's chewed after meals across India.",
  },
  {
    emoji: "🫚",
    name: "Dry Ginger",
    detail:
      "Warms the body, eases bloating, and its gingerol compounds are what Ayurveda has relied on for digestive support for generations.",
  },
];

export const NUTRITION_STATS = [
  { emoji: "📈", value: "300%", label: "More Bioavailable Iron", sub: "Via sprouting" },
  { emoji: "🦴", value: "344mg", label: "Calcium per 100g", sub: "From Ragi" },
  { emoji: "⚡", value: "60%", label: "Phytic Acid Reduced", sub: "Via sprouting" },
  { emoji: "🛡️", value: "6mo", label: "Shelf Life", sub: "Oxygen absorber sealed" },
];
