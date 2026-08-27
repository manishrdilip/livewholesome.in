import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { buildShippingLabelData } from "@/lib/shipping-label";
import { ShippingLabelCard } from "@/components/admin/ShippingLabelCard";
import { PrintButton } from "@/components/admin/PrintButton";

export default async function ShippingLabelPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const supabase = createServiceClient();
  const settings = await getSettings();

  const { data: order } = await supabase
    .from("orders")
    .select("order_number, customer_snapshot, shipping_address_snapshot")
    .eq("order_number", orderNumber)
    .single();
  if (!order) notFound();

  const label = await buildShippingLabelData(order, settings);

  return (
    <div className="mx-auto max-w-md px-6 py-8 print:max-w-none print:p-0">
      <div className="print:hidden mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold">Shipping label — {order.order_number}</h1>
        <PrintButton />
      </div>

      <ShippingLabelCard data={label} />
    </div>
  );
}
