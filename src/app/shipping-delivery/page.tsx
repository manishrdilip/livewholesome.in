import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping and Delivery | LiveWholesome.in",
  alternates: { canonical: "/shipping-delivery" },
};

export default async function ShippingDeliveryPage() {
  const settings = await getSettings();

  return (
    <PolicyPage title="Shipping and Delivery" updated="16 August 2026">
      <PolicySection title="Where we ship">
        <p>
          We ship across India from Vellore, Tamil Nadu. Delivery typically takes 3–7 business
          days depending on your location — usually faster within Tamil Nadu, a little longer
          further out.
        </p>
      </PolicySection>

      <PolicySection title="Shipping fee">
        <p>
          {settings.shipping_fee > 0
            ? `A flat shipping fee of ₹${settings.shipping_fee} applies per order.`
            : "Shipping is currently free on every order."}
        </p>
      </PolicySection>

      <PolicySection title="Tracking your order">
        <p>
          We&apos;ll message you on WhatsApp and email when your order is confirmed, packed, and
          shipped. Every shipment is batch-tracked, and you can always ask us for a status update
          with your order number.
        </p>
      </PolicySection>

      <PolicySection title="Delays">
        <p>
          Occasionally deliveries run late due to weather, courier disruptions, or festival
          season — we&apos;ll keep you posted if that happens to your order.
        </p>
      </PolicySection>

      <PolicySection title="Contact us">
        <p>
          {settings.support_email && <>Email: {settings.support_email.toLowerCase()}<br /></>}
          {settings.support_phone && <>Phone/WhatsApp: {settings.support_phone}</>}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
