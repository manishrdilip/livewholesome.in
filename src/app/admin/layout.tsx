import Link from "next/link";
import type { ReactNode } from "react";
import { createServerAuthClient } from "@/lib/supabase/server-auth";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // /admin/login, or middleware is about to redirect — render bare.
    return <div className="min-h-screen bg-cream">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="print:hidden border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="font-serif font-semibold">
            WHOLESOME Admin
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/admin" className="hover:text-emerald">
              Orders
            </Link>
            <Link href="/admin/reviews" className="hover:text-emerald">
              Reviews
            </Link>
            <Link href="/admin/settings" className="hover:text-emerald">
              Settings
            </Link>
            <span className="text-ink/50">{user.email}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
