import type { Metadata } from "next";
import Link from "next/link";
import { OrderBox } from "@/components/OrderBox";
import { T } from "@/components/T";
import { PRODUCT } from "@/lib/product";

// A focused, link-friendly order page — meant for places that need one clean
// URL (e.g. the WhatsApp Business profile "website" field, social bio links)
// rather than the full marketing homepage.
export const metadata: Metadata = {
  title: "Order Wholesome Purna | LiveWholesome.in",
  description: PRODUCT.description,
  alternates: { canonical: "/order" },
};

export default function OrderPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← <T en="Back to shop" ta="கடைக்கு திரும்ப" />
      </Link>

      <h1 className="mt-4 text-center font-serif text-3xl font-bold">
        <T en="Order Wholesome Purna" ta="Wholesome Purna ஆர்டர் செய்ய" />
      </h1>
      <p className="mt-2 text-center text-ink/70">
        <T
          en="Sprouted multigrain health mix, delivered to your door."
          ta="முளைகட்டிய பல தானிய ஹெல்த் மிக்ஸ், உங்கள் வீட்டிற்கே."
        />
      </p>

      <div className="mt-8">
        <OrderBox />
      </div>
    </div>
  );
}
