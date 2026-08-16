"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { LogoMark } from "@/components/LogoMark";

const NAV_LINKS = [
  { href: "#ingredients", label: "Ingredients" },
  { href: "#reviews", label: "Reviews" },
  { href: "#nutrition", label: "Nutrition" },
  { href: "#order", label: "Order" },
];

export function Header() {
  const { quantity, unitPrice, launchCheckout } = useCart();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setLoggedIn(false);
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-emerald-deep text-cream">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-8 py-5">
        <Link href="/" className="flex items-center gap-4">
          <LogoMark size={60} />
          <span className="font-serif text-4xl font-black tracking-tight">
            <span className="italic text-gold">W</span>holesome
          </span>
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-gold">
              {link.label}
            </a>
          ))}
          <Link href={loggedIn ? "/account" : "/login"} className="hover:text-gold">
            {loggedIn ? "My Account" : "Log in"}
          </Link>
          {loggedIn && (
            <button type="button" onClick={handleSignOut} className="hover:text-gold">
              Sign out
            </button>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={launchCheckout}
            className="rounded-full bg-gold px-4 py-2 text-xs font-semibold text-emerald-deep sm:px-5 sm:text-sm"
          >
            {quantity > 0 ? `Cart (${quantity}) — ₹${quantity * unitPrice}` : `Buy Now — ₹${unitPrice}`}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream/30 md:hidden"
          >
            <span aria-hidden className="relative block h-3 w-4">
              <span
                className={`absolute left-0 top-0 h-0.5 w-4 bg-cream transition-transform ${menuOpen ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-1.5 h-0.5 w-4 bg-cream transition-opacity ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`absolute left-0 top-3 h-0.5 w-4 bg-cream transition-transform ${menuOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-cream/10 bg-emerald-deep px-6 py-3 text-sm md:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2.5 hover:bg-cream/10 hover:text-gold"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={loggedIn ? "/account" : "/login"}
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 hover:bg-cream/10 hover:text-gold"
          >
            {loggedIn ? "My Account" : "Log in"}
          </Link>
          {loggedIn && (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg px-2 py-2.5 text-left hover:bg-cream/10 hover:text-gold"
            >
              Sign out
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
