import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Terms and Conditions | LiveWholesome.in" };

export default async function TermsPage() {
  const settings = await getSettings();

  return (
    <PolicyPage title="Terms and Conditions" updated="16 August 2026">
      <PolicySection title="1. About us">
        <p>
          LiveWholesome.in is operated by {settings.business_name}, FSSAI licence{" "}
          {settings.fssai_license ?? "—"}. By placing an order on this site, you agree to the
          terms below.
        </p>
      </PolicySection>

      <PolicySection title="2. Orders and payment">
        <p>
          Placing an order is a request to buy — it&apos;s confirmed once we get in touch to
          verify details and collect payment. Prices are in Indian Rupees and may change without
          notice; the price shown at the time you place your order is the one that applies to
          that order.
        </p>
      </PolicySection>

      <PolicySection title="3. Subscriptions">
        <p>
          The monthly Subscribe &amp; Save option is a recurring reminder, not an automatic
          charge — we&apos;ll reach out each month to reconfirm before shipping and billing the
          next batch. You can pause or cancel anytime by contacting us.
        </p>
      </PolicySection>

      <PolicySection title="4. Shipping and cancellations">
        <p>
          See our{" "}
          <a href="/shipping-delivery" className="text-emerald hover:underline">
            Shipping &amp; Delivery
          </a>{" "}
          and{" "}
          <a href="/cancellation-refund" className="text-emerald hover:underline">
            Cancellation &amp; Refund
          </a>{" "}
          policies for details.
        </p>
      </PolicySection>

      <PolicySection title="5. Health disclaimer">
        <p>
          WHOLESOME Purna is a food product, not a medicine. It is not intended to diagnose,
          treat, cure, or prevent any disease. If you are pregnant, nursing, managing a health
          condition, or have known food allergies, please check the ingredient list and consult
          your doctor before use.
        </p>
      </PolicySection>

      <PolicySection title="6. Limitation of liability">
        <p>
          We take reasonable care in sourcing, processing, and packaging every batch. To the
          extent permitted by law, our liability for any claim relating to an order is limited to
          the value of that order.
        </p>
      </PolicySection>

      <PolicySection title="7. Governing law">
        <p>These terms are governed by the laws of India, with courts in Tamil Nadu having jurisdiction.</p>
      </PolicySection>

      <PolicySection title="8. Contact">
        <p>
          {settings.support_email && <>Email: {settings.support_email.toLowerCase()}<br /></>}
          {settings.support_phone && <>Phone: {settings.support_phone}</>}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
