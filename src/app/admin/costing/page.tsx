import { revalidatePath } from "next/cache";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { EditPopup } from "@/components/admin/EditPopup";
import { PRODUCT } from "@/lib/product";
import {
  COST_CATEGORIES,
  costItemPerPouch,
  getCostItems,
  getCostSummary,
  getRawMaterials,
  priceToPerKg,
  rawMaterialCostPerPouch,
  suggestedPriceForMargin,
  type CostCategory,
  type CostItem,
  type RawMaterial,
} from "@/lib/costing";

const TABS = [
  { value: "raw-material", label: "Raw Material" },
  ...COST_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
  { value: "summary", label: "Summary" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function isCostCategory(value: string): value is CostCategory {
  return COST_CATEGORIES.some((c) => c.value === value);
}

function inr(n: number): string {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

async function upsertRawMaterial(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const row = {
    name,
    default_weight_value: Number(formData.get("default_weight_value") ?? 1),
    default_weight_unit: String(formData.get("default_weight_unit") ?? "kg"),
    price: Number(formData.get("price") ?? 0),
    usage_per_packet_grams: Number(formData.get("usage_per_packet_grams") ?? 0),
    notes: String(formData.get("notes") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
  };

  const supabase = createServiceClient();
  if (id) {
    await supabase.from("raw_materials").update(row).eq("id", id);
  } else {
    const { data: existing } = await supabase
      .from("raw_materials")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();
    await supabase
      .from("raw_materials")
      .insert({ ...row, sort_order: (existing?.sort_order ?? -1) + 1 });
  }
  revalidatePath("/admin/costing");
}

async function deleteRawMaterial(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = createServiceClient();
  await supabase.from("raw_materials").delete().eq("id", id);
  revalidatePath("/admin/costing");
}

async function upsertCostItem(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name || !isCostCategory(category)) return;

  const row = {
    category,
    name,
    amount: Number(formData.get("amount") ?? 0),
    tax_percent: Number(formData.get("tax_percent") ?? 0),
    allocation_quantity: Number(formData.get("allocation_quantity") ?? 1) || 1,
    notes: String(formData.get("notes") ?? "").trim() || null,
    is_active: formData.get("is_active") === "on",
  };

  const supabase = createServiceClient();
  if (id) {
    await supabase.from("cost_items").update(row).eq("id", id);
  } else {
    const { data: existing } = await supabase
      .from("cost_items")
      .select("sort_order")
      .eq("category", category)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();
    await supabase
      .from("cost_items")
      .insert({ ...row, sort_order: (existing?.sort_order ?? -1) + 1 });
  }
  revalidatePath("/admin/costing");
}

async function deleteCostItem(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (typeof id !== "string") return;
  const supabase = createServiceClient();
  await supabase.from("cost_items").delete().eq("id", id);
  revalidatePath("/admin/costing");
}

function TabNav({ active }: { active: TabValue }) {
  return (
    <nav className="mt-4 flex flex-wrap gap-2 border-b border-ink/10 pb-4 text-sm">
      {TABS.map((tab) => (
        <Link
          key={tab.value}
          href={`/admin/costing?tab=${tab.value}`}
          className={`rounded-full px-3 py-1.5 font-medium ${
            tab.value === active
              ? "bg-emerald text-cream"
              : "bg-ink/5 text-ink/70 hover:bg-ink/10"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <span className="rounded-full bg-emerald/10 px-2 py-0.5 text-xs font-medium text-emerald">
      Active
    </span>
  ) : (
    <span className="rounded-full bg-ink/5 px-2 py-0.5 text-xs text-ink/40">Inactive</span>
  );
}

function DeleteRawMaterialForm({ id }: { id: string }) {
  return (
    <form action={deleteRawMaterial}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmitButton
        confirmText="Delete this raw material permanently?"
        className="text-xs text-ink/40 hover:text-red-600"
      >
        Delete
      </ConfirmSubmitButton>
    </form>
  );
}

function DeleteCostItemForm({ id }: { id: string }) {
  return (
    <form action={deleteCostItem}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmitButton
        confirmText="Delete this cost item permanently?"
        className="text-xs text-ink/40 hover:text-red-600"
      >
        Delete
      </ConfirmSubmitButton>
    </form>
  );
}

function RawMaterialTableRow({ index, material }: { index: number; material: RawMaterial }) {
  const perKg = priceToPerKg(material);
  const perPouch = rawMaterialCostPerPouch(material);
  return (
    <tr className="border-b border-ink/5 last:border-0">
      <td className="px-3 py-2 text-ink/40">{index}</td>
      <td className="px-3 py-2 font-medium">{material.name}</td>
      <td className="px-3 py-2 whitespace-nowrap text-ink/70">
        {material.default_weight_value}
        {material.default_weight_unit}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-ink/70">
        {inr(material.price)} <span className="text-xs text-ink/40">({inr(perKg)}/kg)</span>
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-ink/70">{material.usage_per_packet_grams}g</td>
      <td className="px-3 py-2 font-semibold whitespace-nowrap">{inr(perPouch)}</td>
      <td className="px-3 py-2">
        <StatusBadge active={material.is_active} />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <EditPopup triggerLabel="Edit" triggerClassName="text-xs font-medium text-emerald hover:underline">
            <form action={upsertRawMaterial} className="space-y-3 text-sm">
              <input type="hidden" name="id" value={material.id} />
              <h3 className="font-semibold">{material.name}</h3>
              <label className="block">
                <span className="font-medium">Name</span>
                <input name="name" defaultValue={material.name} required className="input mt-1" />
              </label>
              <div className="flex gap-3">
                <label className="block flex-1">
                  <span className="font-medium">Price (₹)</span>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={material.price}
                    className="input mt-1"
                  />
                </label>
                <label className="block">
                  <span className="font-medium">Weight</span>
                  <div className="mt-1 flex gap-1">
                    <input
                      name="default_weight_value"
                      type="number"
                      step="0.01"
                      defaultValue={material.default_weight_value}
                      className="input w-16"
                    />
                    <select
                      name="default_weight_unit"
                      defaultValue={material.default_weight_unit}
                      className="input w-20"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </label>
              </div>
              <label className="block">
                <span className="font-medium">Usage per packet (g)</span>
                <input
                  name="usage_per_packet_grams"
                  type="number"
                  step="0.01"
                  defaultValue={material.usage_per_packet_grams}
                  className="input mt-1"
                />
                <span className="mt-1 block text-xs text-ink/40">
                  Starting estimate — confirm against your real recipe.
                </span>
              </label>
              <label className="flex items-center gap-2 text-xs text-ink/60">
                <input type="checkbox" name="is_active" defaultChecked={material.is_active} />
                Active
              </label>
              <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-cream">
                Save
              </button>
            </form>
          </EditPopup>
          <DeleteRawMaterialForm id={material.id} />
        </div>
      </td>
    </tr>
  );
}

function CostItemTableRow({ index, item }: { index: number; item: CostItem }) {
  const perPouch = costItemPerPouch(item);
  return (
    <tr className="border-b border-ink/5 last:border-0">
      <td className="px-3 py-2 text-ink/40">{index}</td>
      <td className="px-3 py-2 font-medium">{item.name}</td>
      <td className="px-3 py-2 whitespace-nowrap text-ink/70">{inr(item.amount)}</td>
      <td className="px-3 py-2 whitespace-nowrap text-ink/70">{item.tax_percent}%</td>
      <td className="px-3 py-2 whitespace-nowrap text-ink/70">{item.allocation_quantity}</td>
      <td className="px-3 py-2 font-semibold whitespace-nowrap">{inr(perPouch)}</td>
      <td className="px-3 py-2">
        <StatusBadge active={item.is_active} />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <EditPopup triggerLabel="Edit" triggerClassName="text-xs font-medium text-emerald hover:underline">
            <form action={upsertCostItem} className="space-y-3 text-sm">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="category" value={item.category} />
              <h3 className="font-semibold">{item.name}</h3>
              <label className="block">
                <span className="font-medium">Name</span>
                <input name="name" defaultValue={item.name} required className="input mt-1" />
              </label>
              <div className="flex gap-3">
                <label className="block flex-1">
                  <span className="font-medium">Amount (₹)</span>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    defaultValue={item.amount}
                    className="input mt-1"
                  />
                </label>
                <label className="block flex-1">
                  <span className="font-medium">Tax %</span>
                  <input
                    name="tax_percent"
                    type="number"
                    step="0.01"
                    defaultValue={item.tax_percent}
                    className="input mt-1"
                  />
                </label>
              </div>
              <label className="block">
                <span className="font-medium">Allocation (pouches)</span>
                <input
                  name="allocation_quantity"
                  type="number"
                  step="1"
                  defaultValue={item.allocation_quantity}
                  className="input mt-1"
                />
              </label>
              {item.notes && <p className="text-xs text-ink/50">{item.notes}</p>}
              <label className="flex items-center gap-2 text-xs text-ink/60">
                <input type="checkbox" name="is_active" defaultChecked={item.is_active} />
                Active
              </label>
              <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-cream">
                Save
              </button>
            </form>
          </EditPopup>
          <DeleteCostItemForm id={item.id} />
        </div>
      </td>
    </tr>
  );
}

async function RawMaterialTab() {
  const materials = await getRawMaterials();
  const total = materials
    .filter((m) => m.is_active)
    .reduce((sum, m) => sum + rawMaterialCostPerPouch(m), 0);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-ink/50">
        Set each ingredient&apos;s price for a given weight, and how many grams of it go into one
        packet ({PRODUCT.weightGrams}g) — the recipe. Cost per pouch is computed automatically.
      </p>
      <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-ink/5 text-left text-xs font-medium text-ink/50">
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Weight</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Usage / packet</th>
              <th className="px-3 py-2">₹ / pouch</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {materials.map((m, i) => (
              <RawMaterialTableRow key={m.id} index={i + 1} material={m} />
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-ink/10 font-semibold">
              <td colSpan={5} className="px-3 py-2 text-right">
                Raw material total
              </td>
              <td className="px-3 py-2">{inr(total)}</td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
      <EditPopup
        triggerLabel="+ Add raw material"
        triggerClassName="rounded-full bg-emerald px-4 py-1.5 text-sm text-cream"
      >
        <form action={upsertRawMaterial} className="space-y-3 text-sm">
          <input type="hidden" name="is_active" value="on" />
          <h3 className="font-semibold">Add raw material</h3>
          <label className="block">
            <span className="font-medium">Name</span>
            <input name="name" required className="input mt-1" />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="font-medium">Price (₹)</span>
              <input name="price" type="number" step="0.01" defaultValue={0} className="input mt-1" />
            </label>
            <label className="block">
              <span className="font-medium">Weight</span>
              <div className="mt-1 flex gap-1">
                <input
                  name="default_weight_value"
                  type="number"
                  step="0.01"
                  defaultValue={1}
                  className="input w-16"
                />
                <select name="default_weight_unit" defaultValue="kg" className="input w-20">
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>
            </label>
          </div>
          <label className="block">
            <span className="font-medium">Usage per packet (g)</span>
            <input
              name="usage_per_packet_grams"
              type="number"
              step="0.01"
              defaultValue={0}
              className="input mt-1"
            />
          </label>
          <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-cream">
            Add
          </button>
        </form>
      </EditPopup>
    </div>
  );
}

async function CostCategoryTab({ category }: { category: CostCategory }) {
  const meta = COST_CATEGORIES.find((c) => c.value === category)!;
  const items = await getCostItems(category);
  const total = items
    .filter((i) => i.is_active)
    .reduce((sum, i) => sum + costItemPerPouch(i), 0);

  return (
    <div className="mt-6 space-y-4">
      <p className="text-xs text-ink/50">{meta.help}</p>
      {items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ink/5 text-left text-xs font-medium text-ink/50">
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Tax %</th>
                <th className="px-3 py-2">Allocation</th>
                <th className="px-3 py-2">₹ / pouch</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <CostItemTableRow key={item.id} index={i + 1} item={item} />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-ink/10 font-semibold">
                <td colSpan={5} className="px-3 py-2 text-right">
                  {meta.label} total
                </td>
                <td className="px-3 py-2">{inr(total)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p className="text-sm text-ink/50">No {meta.label.toLowerCase()} costs yet.</p>
      )}
      <EditPopup
        triggerLabel={`+ Add ${meta.label.toLowerCase()} cost`}
        triggerClassName="rounded-full bg-emerald px-4 py-1.5 text-sm text-cream"
      >
        <form action={upsertCostItem} className="space-y-3 text-sm">
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="is_active" value="on" />
          <h3 className="font-semibold">Add {meta.label.toLowerCase()} cost</h3>
          <label className="block">
            <span className="font-medium">Name</span>
            <input name="name" required className="input mt-1" />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="font-medium">Amount (₹)</span>
              <input name="amount" type="number" step="0.01" defaultValue={0} className="input mt-1" />
            </label>
            <label className="block flex-1">
              <span className="font-medium">Tax %</span>
              <input
                name="tax_percent"
                type="number"
                step="0.01"
                defaultValue={0}
                className="input mt-1"
              />
            </label>
          </div>
          <label className="block">
            <span className="font-medium">Allocation (pouches)</span>
            <input
              name="allocation_quantity"
              type="number"
              step="1"
              defaultValue={1}
              className="input mt-1"
            />
          </label>
          <button type="submit" className="rounded-full bg-emerald px-4 py-1.5 text-cream">
            Add
          </button>
        </form>
      </EditPopup>
    </div>
  );
}

async function SummaryTab() {
  const summary = await getCostSummary();
  const isProfit = summary.profitPerPouch >= 0;
  const marginTargets = [30, 40, 50];

  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-ink/10 bg-white p-4">
          <p className="text-xs text-ink/50">Raw Material</p>
          <p className="mt-1 font-semibold">{inr(summary.rawMaterialTotal)}</p>
        </div>
        {COST_CATEGORIES.map((c) => (
          <div key={c.value} className="rounded-xl border border-ink/10 bg-white p-4">
            <p className="text-xs text-ink/50">{c.label}</p>
            <p className="mt-1 font-semibold">{inr(summary.categoryTotals[c.value])}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Per pouch (1 × {PRODUCT.weightGrams}g)</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink/60">Total cost</dt>
            <dd className="font-semibold">{inr(summary.totalCostPerPouch)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">
              Selling price (
              <Link href="/admin/settings" className="underline">
                edit
              </Link>
              )
            </dt>
            <dd className="font-semibold">{inr(summary.sellingPrice)}</dd>
          </div>
          <div className="flex justify-between border-t border-ink/10 pt-2">
            <dt className="text-ink/60">{isProfit ? "Profit" : "Loss"}</dt>
            <dd className={`font-semibold ${isProfit ? "text-emerald" : "text-red-600"}`}>
              {inr(Math.abs(summary.profitPerPouch))}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink/60">Margin</dt>
            <dd className={`font-semibold ${isProfit ? "text-emerald" : "text-red-600"}`}>
              {summary.marginPercent.toFixed(1)}%
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-xl border border-ink/10 bg-white p-5">
        <h2 className="font-semibold">Suggested price by target margin</h2>
        <p className="mt-1 text-xs text-ink/50">
          Based on your current total cost of {inr(summary.totalCostPerPouch)}/pouch.
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
          {marginTargets.map((m) => (
            <div key={m} className="rounded-lg bg-cream p-3 text-center">
              <dt className="text-xs text-ink/50">{m}% margin</dt>
              <dd className="mt-1 font-semibold">
                {inr(suggestedPriceForMargin(summary.totalCostPerPouch, m))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export default async function AdminCostingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const active: TabValue = TABS.some((t) => t.value === tab) ? (tab as TabValue) : "raw-material";

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold">Product Costing</h1>
      <p className="mt-1 text-sm text-ink/60">
        Track raw material, machine, and overhead costs to see cost, profit, and loss per pouch.
      </p>
      <TabNav active={active} />
      {active === "raw-material" && <RawMaterialTab />}
      {active === "summary" && <SummaryTab />}
      {isCostCategory(active) && <CostCategoryTab category={active} />}
    </div>
  );
}
