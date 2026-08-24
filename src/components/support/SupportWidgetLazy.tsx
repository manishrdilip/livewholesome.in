"use client";

import dynamic from "next/dynamic";

// Fixed-position floating widget with no effect on the rest of the page's
// layout (no CLS risk) and not needed for the initial paint — loading it
// client-only keeps its JS out of the bundle every page must parse before
// the hero content can paint. `ssr: false` requires a Client Component
// boundary, hence this thin wrapper around the real widget.
const SupportWidget = dynamic(
  () => import("@/components/support/SupportWidget").then((m) => m.SupportWidget),
  { ssr: false }
);

export function SupportWidgetLazy() {
  return <SupportWidget />;
}
