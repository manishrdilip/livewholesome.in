import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { PolicyPage, PolicySection } from "@/components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | LiveWholesome.in",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const settings = await getSettings();

  return (
    <PolicyPage title="Privacy Policy" updated="16 August 2026">
      <PolicySection title="What we collect">
        <p>
          When you place an order or create an account, we collect your name, phone number,
          email, and delivery address — just what&apos;s needed to fulfil and invoice your order.
        </p>
      </PolicySection>

      <PolicySection title="How we use it">
        <p>
          To process orders, send invoices, and keep you updated on delivery via WhatsApp and
          email. We never sell your information to anyone.
        </p>
      </PolicySection>

      <PolicySection title="Where it's stored">
        <p>
          Your data is stored securely with our database and email providers, protected behind
          access controls. Your cart is stored locally in your browser, not on our servers, until
          you check out.
        </p>
      </PolicySection>

      <PolicySection title="Your rights">
        <p>
          You can ask us to show you what we have on file, correct it, or delete your account at
          any time — just contact us.
        </p>
      </PolicySection>

      <PolicySection title="Contact us">
        <p>
          {settings.support_email && <>Email: {settings.support_email.toLowerCase()}<br /></>}
          {settings.support_phone && <>Phone: {settings.support_phone}</>}
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
