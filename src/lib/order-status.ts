export const ORDER_STATUSES = [
  "CONFIRMED",
  "COOKING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "RETURNED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CONFIRMED: "Order received",
  COOKING: "Cooking",
  PACKED: "Packing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

// The happy-path stages shown as a progress tracker to admin & customers.
export const PROGRESS_STEPS: OrderStatus[] = [
  "CONFIRMED",
  "COOKING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
];

// Index reached in PROGRESS_STEPS for a given status, or null when the order
// is off the happy path (cancelled/returned) and a tracker doesn't apply.
// OUT_FOR_DELIVERY has no dedicated step — it counts as "Shipped" reached.
export function progressIndex(status: string): number | null {
  if (status === "CANCELLED" || status === "RETURNED") return null;
  if (status === "OUT_FOR_DELIVERY") return PROGRESS_STEPS.indexOf("SHIPPED");
  const i = PROGRESS_STEPS.indexOf(status as OrderStatus);
  return i === -1 ? null : i;
}
