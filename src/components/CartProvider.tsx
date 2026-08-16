"use client";

import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { PRODUCT } from "@/lib/product";
import { readCart, writeCart, subscribeCart, type CartItem } from "@/lib/cart";
import { ChariotOverlay } from "@/components/ChariotOverlay";

type CartContextValue = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  subtotal: number;
  /** Ensures at least 1 unit is in the cart, plays the royal chariot
   * transition, then navigates to checkout. Shared by the header cart
   * button and the product order box so the journey is identical either
   * way. */
  launchCheckout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getQuantitySnapshot(): number {
  return readCart().find((i) => i.sku === PRODUCT.sku)?.quantity ?? 0;
}

function getServerQuantitySnapshot(): number {
  return 0;
}

const CHARIOT_RIDE_MS = 1500;

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const quantity = useSyncExternalStore(
    subscribeCart,
    getQuantitySnapshot,
    getServerQuantitySnapshot
  );
  const [transitioning, setTransitioning] = useState(false);

  function setQuantity(next: number) {
    const clamped = Math.max(0, Math.min(20, Math.round(next)));
    const items: CartItem[] = clamped > 0 ? [{ sku: PRODUCT.sku, quantity: clamped }] : [];
    writeCart(items);
  }

  function launchCheckout() {
    if (transitioning) return;
    if (getQuantitySnapshot() === 0) setQuantity(1);
    setTransitioning(true);
    window.setTimeout(() => {
      router.push("/checkout");
      window.setTimeout(() => setTransitioning(false), 250);
    }, CHARIOT_RIDE_MS);
  }

  const subtotal = quantity * PRODUCT.unitPrice;

  return (
    <CartContext.Provider value={{ quantity, setQuantity, subtotal, launchCheckout }}>
      {children}
      {transitioning && <ChariotOverlay />}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
