import { NextResponse } from "next/server";
import JSZip from "jszip";
import {
  COST_CATEGORIES,
  costItemPerPouch,
  getCostItems,
  getCostSummary,
  getRawMaterials,
  priceToPerKg,
  rawMaterialCostPerPouch,
  suggestedPriceForMargin,
} from "@/lib/costing";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: (string | number)[][]): string {
  // Leading BOM so Excel (which otherwise guesses the system codepage)
  // renders the ₹ symbol correctly instead of mangling it.
  return "﻿" + rows.map((row) => row.map(csvField).join(",")).join("\r\n");
}

// Auth is enforced by proxy.ts (matcher includes /api/admin/:path*) — this
// route only runs for a verified admin session.
export async function GET() {
  const [rawMaterials, costItems, summary] = await Promise.all([
    getRawMaterials(),
    getCostItems(),
    getCostSummary(),
  ]);

  const rawMaterialsCsv = toCsv([
    ["#", "Name", "Weight", "Price (₹)", "₹/kg", "Usage/packet (g)", "₹/pouch", "Status", "Updated"],
    ...rawMaterials.map((m, i) => [
      i + 1,
      m.name,
      `${m.default_weight_value}${m.default_weight_unit}`,
      m.price,
      round2(priceToPerKg(m)),
      m.usage_per_packet_grams,
      round2(rawMaterialCostPerPouch(m)),
      m.is_active ? "Active" : "Inactive",
      new Date(m.updated_at).toLocaleDateString("en-IN"),
    ]),
  ]);

  const overheadCostsCsv = toCsv([
    ["#", "Category", "Name", "Amount (₹)", "Tax %", "Allocation (pouches)", "₹/pouch", "Status", "Updated"],
    ...costItems.map((c, i) => [
      i + 1,
      COST_CATEGORIES.find((cc) => cc.value === c.category)?.label ?? c.category,
      c.name,
      c.amount,
      c.tax_percent,
      c.allocation_quantity,
      round2(costItemPerPouch(c)),
      c.is_active ? "Active" : "Inactive",
      new Date(c.updated_at).toLocaleDateString("en-IN"),
    ]),
  ]);

  const summaryCsv = toCsv([
    ["Category", "₹ / pouch"],
    ["Raw Material", round2(summary.rawMaterialTotal)],
    ...COST_CATEGORIES.map((c) => [c.label, round2(summary.categoryTotals[c.value])]),
    [],
    ["Total cost / pouch", round2(summary.totalCostPerPouch)],
    ["Selling price / pouch", summary.sellingPrice],
    [
      summary.profitPerPouch >= 0 ? "Profit / pouch" : "Loss / pouch",
      round2(Math.abs(summary.profitPerPouch)),
    ],
    ["Margin %", `${summary.marginPercent.toFixed(1)}%`],
    [],
    ["Suggested price @ 30% margin", round2(suggestedPriceForMargin(summary.totalCostPerPouch, 30))],
    ["Suggested price @ 40% margin", round2(suggestedPriceForMargin(summary.totalCostPerPouch, 40))],
    ["Suggested price @ 50% margin", round2(suggestedPriceForMargin(summary.totalCostPerPouch, 50))],
    [],
    ["Exported", new Date().toLocaleString("en-IN")],
  ]);

  const zip = new JSZip();
  zip.file("raw-materials.csv", rawMaterialsCsv);
  zip.file("overhead-costs.csv", overheadCostsCsv);
  zip.file("summary.csv", summaryCsv);
  const zipBuffer = await zip.generateAsync({ type: "blob" });

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="wholesome-costing-${new Date().toISOString().slice(0, 10)}.zip"`,
    },
  });
}
