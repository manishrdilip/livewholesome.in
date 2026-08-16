import "server-only";
import { generateQrDataUrl } from "@/lib/qr";
import { mapsLinkFor } from "@/lib/geolocation";
import type { Settings } from "@/lib/settings";
import type { ShippingLabelData } from "@/components/admin/ShippingLabelCard";

type OrderForLabel = {
  order_number: string;
  customer_snapshot: unknown;
  shipping_address_snapshot: unknown;
};

export async function buildShippingLabelData(
  order: OrderForLabel,
  settings: Pick<Settings, "business_name" | "ship_from_address">
): Promise<ShippingLabelData> {
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

  return {
    orderNumber: order.order_number,
    businessName: settings.business_name,
    shipFromAddress: settings.ship_from_address,
    customerName: customer.name,
    customerPhone: customer.phone,
    addressLine,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    country: address.country,
    qrDataUrl,
  };
}
