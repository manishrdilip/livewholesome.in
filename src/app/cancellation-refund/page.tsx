import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Cancellation and Refund Policy | LiveWholesome.in",
  alternates: { canonical: "/cancellation-refund" },
};

export default async function CancellationRefundPage() {
  const settings = await getSettings();

  return (
    <PolicyPage title="Cancellation and Refund Policy" updated="16 August 2026">
      <PolicySection title="Cancelling an order">
        <p>
          You can cancel an order free of charge any time before it ships — just message or call
          us with your order number. Once an order has shipped, it can no longer be cancelled
          since it&apos;s already on its way to you.
        </p>
      </PolicySection>

      <PolicySection title="Returns">
        <p>
          As a food product, we can&apos;t accept returns of opened packs for hygiene and safety
          reasons. If your pack arrives damaged, tampered with, or you received the wrong item,
          contact us within 48 hours of delivery with photos — we&apos;ll replace it or refund you
          in full, no questions asked.
        </p>
      </PolicySection>

      <PolicySection title="Refunds">
        <p>
          Approved refunds (for a cancelled unshipped order, or a damaged/incorrect delivery) are
          processed to your original payment method, or by bank transfer if you paid on
          confirmation, within 5–7 business days of approval.
        </p>
      </PolicySection>

      <PolicySection title="Cancelling a monthly subscription">
        <p>
          Subscribe &amp; Save orders are reconfirmed with you each month before we ship or bill
          the next batch — just let us know you&apos;d like to pause or stop, and no further
          orders will go out.
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
