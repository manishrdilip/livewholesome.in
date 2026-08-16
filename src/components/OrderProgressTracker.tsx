import { ORDER_STATUS_LABELS, PROGRESS_STEPS, progressIndex, type OrderStatus } from "@/lib/order-status";

export function OrderProgressTracker({ status }: { status: string }) {
  const reached = progressIndex(status);

  if (reached === null) {
    return (
      <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
        {ORDER_STATUS_LABELS[status as OrderStatus] ?? status}
      </span>
    );
  }

  return (
    <ol className="flex items-center">
      {PROGRESS_STEPS.map((step, i) => (
        <li key={step} className="flex items-center last:flex-none flex-1">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i <= reached ? "bg-emerald text-cream" : "bg-ink/10 text-ink/40"
              }`}
            >
              {i < reached ? "✓" : i + 1}
            </div>
            <span
              className={`text-center text-[11px] leading-tight ${
                i <= reached ? "font-medium text-ink" : "text-ink/40"
              }`}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </div>
          {i < PROGRESS_STEPS.length - 1 && (
            <div className={`mx-1 h-0.5 flex-1 ${i < reached ? "bg-emerald" : "bg-ink/10"}`} />
          )}
        </li>
      ))}
    </ol>
  );
}
