import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { PRODUCT } from "@/lib/product";

export type RawMaterial = {
  id: string;
  name: string;
  default_weight_value: number;
  default_weight_unit: "kg" | "g";
  price: number;
  /** Grams of this ingredient used in one finished packet (PRODUCT.weightGrams). */
  usage_per_packet_grams: number;
  notes: string | null;
  sort_order: number;
  is_active: boolean;
};

export type CostCategory =
  | "machine"
  | "packing"
  | "ads"
  | "website"
  | "courier"
  | "labour"
  | "testing";

export type CostItem = {
  id: string;
  category: CostCategory;
  name: string;
  amount: number;
  tax_percent: number;
  allocation_quantity: number;
  notes: string | null;
  sort_order: number;
  is_active: boolean;
};

export const COST_CATEGORIES: { value: CostCategory; label: string; help: string }[] = [
  {
    value: "machine",
    label: "Machine",
    help: "e.g. a dryer costing ₹60,000 — allocate over its expected lifetime output in pouches.",
  },
  {
    value: "packing",
    label: "Packing",
    help: "Pouch, label, box cost — use an allocation of 1 if the amount is already per pouch.",
  },
  {
    value: "ads",
    label: "Ads",
    help: "Monthly ad spend — allocate over the pouches sold that month.",
  },
  {
    value: "website",
    label: "Website",
    help: "Hosting, domain, tools — allocate over the pouches sold that month.",
  },
  {
    value: "courier",
    label: "Courier Charges",
    help: "Add couriers side by side for comparison, but keep only the one you actually ship with marked Active — otherwise the total will count shipping more than once.",
  },
  {
    value: "labour",
    label: "Labour",
    help: "Monthly salary — allocate over the pouches produced that month.",
  },
  {
    value: "testing",
    label: "Testing",
    help: "Lab/QC cost per batch — allocate over that batch's pouches.",
  },
];

/** ₹ per kg for a raw material, from its price and default weight. */
export function priceToPerKg(
  m: Pick<RawMaterial, "price" | "default_weight_value" | "default_weight_unit">,
): number {
  const kg = m.default_weight_unit === "g" ? m.default_weight_value / 1000 : m.default_weight_value;
  return kg > 0 ? m.price / kg : 0;
}

/** Cost contributed by one raw material per finished pouch. */
export function rawMaterialCostPerPouch(m: RawMaterial): number {
  return priceToPerKg(m) * (m.usage_per_packet_grams / 1000);
}

/** Cost contributed by one cost_items row per finished pouch. */
export function costItemPerPouch(
  c: Pick<CostItem, "amount" | "tax_percent" | "allocation_quantity">,
): number {
  if (!c.allocation_quantity) return 0;
  return (c.amount * (1 + c.tax_percent / 100)) / c.allocation_quantity;
}

/** Selling price needed to hit a target margin %, given the total cost/pouch. */
export function suggestedPriceForMargin(totalCostPerPouch: number, marginPercent: number): number {
  const marginFraction = marginPercent / 100;
  if (marginFraction >= 1) return Infinity;
  return totalCostPerPouch / (1 - marginFraction);
}

export async function getRawMaterials(): Promise<RawMaterial[]> {
  const supabase = createServiceClient();
  const { data } = await supabase.from("raw_materials").select("*").order("sort_order");
  return data ?? [];
}

export async function getCostItems(category?: CostCategory): Promise<CostItem[]> {
  const supabase = createServiceClient();
  let query = supabase.from("cost_items").select("*").order("sort_order");
  if (category) query = query.eq("category", category);
  const { data } = await query;
  return data ?? [];
}

export type CostSummary = {
  rawMaterialTotal: number;
  categoryTotals: Record<CostCategory, number>;
  totalCostPerPouch: number;
  sellingPrice: number;
  profitPerPouch: number;
  marginPercent: number;
};

export async function getCostSummary(): Promise<CostSummary> {
  const [rawMaterials, costItems, settings] = await Promise.all([
    getRawMaterials(),
    getCostItems(),
    getSettings(),
  ]);

  const rawMaterialTotal = rawMaterials
    .filter((m) => m.is_active)
    .reduce((sum, m) => sum + rawMaterialCostPerPouch(m), 0);

  const categoryTotals = COST_CATEGORIES.reduce(
    (acc, { value }) => {
      acc[value] = costItems
        .filter((c) => c.category === value && c.is_active)
        .reduce((sum, c) => sum + costItemPerPouch(c), 0);
      return acc;
    },
    {} as Record<CostCategory, number>,
  );

  const totalCostPerPouch =
    rawMaterialTotal + Object.values(categoryTotals).reduce((sum, v) => sum + v, 0);
  const sellingPrice = settings.product_price ?? PRODUCT.unitPrice;
  const profitPerPouch = sellingPrice - totalCostPerPouch;
  const marginPercent = sellingPrice > 0 ? (profitPerPouch / sellingPrice) * 100 : 0;

  return {
    rawMaterialTotal,
    categoryTotals,
    totalCostPerPouch,
    sellingPrice,
    profitPerPouch,
    marginPercent,
  };
}
