import { createServiceClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { buildShippingLabelData } from "@/lib/shipping-label";
import { ShippingLabelCard } from "@/components/admin/ShippingLabelCard";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function BulkShippingLabelsPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const orderNumbers = (ids ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  const supabase = createServiceClient();
  const settings = await getSettings();

  const { data: orders } = await supabase
    .from("orders")
    .select("order_number, customer_snapshot, shipping_address_snapshot")
    .in("order_number", orderNumbers);

  // Preserve the order the admin selected them in, not whatever order the DB returns.
  const ordered = orderNumbers
    .map((num) => orders?.find((o) => o.order_number === num))
    .filter((o): o is NonNullable<typeof o> => !!o);

  const labels = await Promise.all(ordered.map((order) => buildShippingLabelData(order, settings)));

  return (
    <div className="mx-auto max-w-md px-6 py-8 print:max-w-none print:p-0">
      <div className="print:hidden mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold">
          Shipping labels — {labels.length} order{labels.length === 1 ? "" : "s"}
        </h1>
        <PrintButton />
      </div>

      {!labels.length && <p className="text-sm text-ink/50">No matching orders.</p>}

      {labels.map((label, i) => (
        <div key={label.orderNumber} className={i < labels.length - 1 ? "break-after-page pb-8" : ""}>
          <ShippingLabelCard data={label} />
        </div>
      ))}
    </div>
  );
}
