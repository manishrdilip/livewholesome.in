"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { useLanguage } from "@/components/LanguageProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { LogoMark } from "@/components/LogoMark";

const NAV_LINKS = [
  { href: "/", label: "Home", labelTa: "முகப்பு" },
  { href: "/ingredients", label: "Ingredients", labelTa: "பொருட்கள்" },
  { href: "/about", label: "Our Story", labelTa: "எங்கள் கதை" },
  { href: "/#reviews", label: "Reviews", labelTa: "விமர்சனங்கள்" },
  { href: "/#nutrition", label: "Nutrition", labelTa: "ஊட்டச்சத்து" },
  { href: "/#order", label: "Order", labelTa: "ஆர்டர்" },
  { href: "/faq", label: "FAQ", labelTa: "கேள்விகள்" },
];

export function Header() {
  const { quantity, unitPrice, remainingUnits, launchCheckout } = useCart();
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
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

  // Admin has its own header/nav (src/app/admin/layout.tsx) — this
  // storefront header would just duplicate/clash with it.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="sticky top-0 z-40 bg-emerald-deep text-cream">
      <div className="flex items-center justify-between gap-2 py-4 pr-4 pl-1 sm:gap-3 sm:py-5 sm:pr-8 sm:pl-2">
        <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-4 md:shrink-0">
          <LogoMark size={60} className="h-8 w-8 shrink-0 sm:h-[60px] sm:w-[60px]" />
          <span className="truncate whitespace-nowrap font-serif text-xl font-black tracking-tight sm:text-3xl md:overflow-visible md:text-clip md:text-4xl">
            <span className="italic text-gold">W</span>holesome
          </span>
        </Link>
        <nav className="no-scrollbar hidden min-w-0 flex-1 items-center gap-6 overflow-x-auto text-sm whitespace-nowrap md:ml-[144px] md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="shrink-0 hover:text-gold">
              {lang === "ta" ? link.labelTa : link.label}
            </a>
          ))}
          <Link href={loggedIn ? "/account" : "/login"} className="shrink-0 hover:text-gold">
            {loggedIn ? (lang === "ta" ? "என் கணக்கு" : "My Account") : lang === "ta" ? "உள்நுழைய" : "Log in"}
          </Link>
          {loggedIn && (
            <button type="button" onClick={handleSignOut} className="shrink-0 hover:text-gold">
              {lang === "ta" ? "வெளியேறு" : "Sign out"}
            </button>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden shrink-0 overflow-hidden rounded-full border border-cream/30 text-[10px] font-semibold sm:flex">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 py-1 ${lang === "en" ? "bg-gold text-emerald-deep" : "text-cream/70"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ta")}
              className={`px-2 py-1 ${lang === "ta" ? "bg-gold text-emerald-deep" : "text-cream/70"}`}
            >
              தமிழ்
            </button>
          </div>
          <button
            type="button"
            onClick={launchCheckout}
            disabled={quantity === 0 && remainingUnits <= 0}
            className="shrink-0 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-emerald-deep disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
          >
            {quantity > 0
              ? `${lang === "ta" ? "கார்ட்" : "Cart"} (${quantity}) — ₹${quantity * unitPrice}`
              : remainingUnits <= 0
                ? lang === "ta"
                  ? "முன்பதிவுகள் நிறுத்தப்பட்டுள்ளன"
                  : "Pre-orders paused"
                : `${lang === "ta" ? "முன்பதிவு செய்" : "Pre-order"} — ₹${unitPrice}`}
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
          <div className="mb-1 flex w-fit shrink-0 overflow-hidden rounded-full border border-cream/30 text-xs font-semibold sm:hidden">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 ${lang === "en" ? "bg-gold text-emerald-deep" : "text-cream/70"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ta")}
              className={`px-3 py-1.5 ${lang === "ta" ? "bg-gold text-emerald-deep" : "text-cream/70"}`}
            >
              தமிழ்
            </button>
          </div>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2.5 hover:bg-cream/10 hover:text-gold"
            >
              {lang === "ta" ? link.labelTa : link.label}
            </a>
          ))}
          <Link
            href={loggedIn ? "/account" : "/login"}
            onClick={() => setMenuOpen(false)}
            className="rounded-lg px-2 py-2.5 hover:bg-cream/10 hover:text-gold"
          >
            {loggedIn ? (lang === "ta" ? "என் கணக்கு" : "My Account") : lang === "ta" ? "உள்நுழைய" : "Log in"}
          </Link>
          {loggedIn && (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg px-2 py-2.5 text-left hover:bg-cream/10 hover:text-gold"
            >
              {lang === "ta" ? "வெளியேறு" : "Sign out"}
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
