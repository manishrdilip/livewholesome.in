"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { PRODUCT } from "@/lib/product";

export function Header() {
  const { quantity } = useCart();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setLoggedIn(!!session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-emerald-deep text-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span aria-hidden>✳️</span>
          LiveWholesome<span className="text-gold">.in</span>
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          <a href="#ingredients" className="hover:text-gold">
            Ingredients
          </a>
          <a href="#reviews" className="hover:text-gold">
            Reviews
          </a>
          <a href="#nutrition" className="hover:text-gold">
            Nutrition
          </a>
          <a href="#order" className="hover:text-gold">
            Order
          </a>
          <Link href={loggedIn ? "/account" : "/login"} className="hover:text-gold">
            {loggedIn ? "My Account" : "Log in"}
          </Link>
        </nav>
        <a
          href="#order"
          className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-emerald-deep"
        >
          {quantity > 0 ? `Cart (${quantity}) — ₹${quantity * PRODUCT.unitPrice}` : `Buy Now — ₹${PRODUCT.unitPrice}`}
        </a>
      </div>
    </header>
  );
}
