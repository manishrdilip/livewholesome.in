import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";
import { generateQrDataUrl } from "@/lib/qr";
import { mapsLinkFor } from "@/lib/geolocation";
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

  const customer = order.customer_snapshot as { name: string; phone: string };
  const address = order.shipping_address_snapshot as {
    line1: string;
    line2?: string | null;
    landmark?: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
  };

  const addressLine = [address.line1, address.line2, address.landmark].filter(Boolean).join(", ");
  const fullAddressText = `${addressLine}, ${address.city}, ${address.state} ${address.pincode}`;

  const mapsLink =
    address.latitude != null && address.longitude != null
      ? mapsLinkFor(address.latitude, address.longitude)
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddressText)}`;

  const qrDataUrl = await generateQrDataUrl(mapsLink);

  return (
    <div className="mx-auto max-w-md px-6 py-8">
      <div className="print:hidden mb-4 flex items-center justify-between">
        <h1 className="font-serif text-xl font-bold">Shipping label — {order.order_number}</h1>
        <PrintButton />
      </div>

      <div className="rounded-2xl border-2 border-ink p-6 print:border-black">
        <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">From</div>
        <div className="mt-1 text-sm">
          <div className="font-medium">{settings.business_name}</div>
          <div className="whitespace-pre-line text-ink/70">
            {settings.ship_from_address || "Set a ship-from address in Admin → Settings"}
          </div>
        </div>

        <div className="my-5 border-t-2 border-dashed border-ink/20" />

        <div className="text-xs font-semibold uppercase tracking-widest text-ink/50">To</div>
        <div className="mt-1 text-lg font-bold">{customer.name}</div>
        <div className="text-base text-ink/80">
          {addressLine}
          <br />
          {address.city}, {address.state} — {address.pincode}
          <br />
          {address.country}
        </div>
        <div className="mt-1 text-sm text-ink/60">{customer.phone}</div>

        <div className="mt-5 flex items-center justify-between border-t border-ink/10 pt-4">
          <div className="text-sm">
            <div className="text-ink/50">Order</div>
            <div className="font-semibold">{order.order_number}</div>
          </div>
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Scan for exact delivery location" width={100} height={100} />
            <div className="mt-1 text-[10px] text-ink/50">Scan for exact location</div>
          </div>
        </div>
      </div>
    </div>
  );
}
