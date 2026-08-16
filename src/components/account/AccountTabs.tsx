"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  { id: "addresses", label: "Addresses" },
  { id: "orders", label: "Orders" },
  { id: "reviews", label: "Reviews" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AccountTabs({
  addresses,
  orders,
  reviews,
}: {
  addresses: ReactNode;
  orders: ReactNode;
  reviews: ReactNode;
}) {
  const [active, setActive] = useState<TabId>("addresses");
  const panels: Record<TabId, ReactNode> = { addresses, orders, reviews };

  return (
    <div className="mt-8">
      <div role="tablist" className="flex gap-1 border-b border-ink/10">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={`-mb-px rounded-t-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              active === tab.id
                ? "border-b-2 border-emerald text-emerald"
                : "text-ink/50 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{panels[active]}</div>
    </div>
  );
}
