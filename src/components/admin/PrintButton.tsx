"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden rounded-full bg-emerald px-5 py-2 text-sm font-semibold text-cream"
    >
      Print
    </button>
  );
}
