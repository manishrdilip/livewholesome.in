"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "@/components/T";

/** Promotes the early-tester review form (src/app/early-tester/page.tsx) to
 * every storefront page so customers can leave a review, not just people
 * who were directly given a sample link. */
export function EarlyTesterRibbon() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname === "/early-tester") return null;

  return (
    <div className="bg-gold px-4 py-2 text-center text-xs font-semibold text-ink sm:text-sm">
      <Link href="/early-tester" className="hover:underline">
        <T
          en="Tried Wholesome Purna? Share your review — takes 2 minutes →"
          ta="Wholesome Purna முயற்சித்தீர்களா? உங்கள் விமர்சனத்தை பகிரவும் — 2 நிமிடங்கள் →"
        />
      </Link>
    </div>
  );
}
