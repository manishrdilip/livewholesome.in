"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { PRODUCT } from "@/lib/product";
import { readCart, writeCart, subscribeCart, type CartItem } from "@/lib/cart";

type CartContextValue = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function getQuantitySnapshot(): number {
  return readCart().find((i) => i.sku === PRODUCT.sku)?.quantity ?? 0;
}

function getServerQuantitySnapshot(): number {
  return 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const quantity = useSyncExternalStore(
    subscribeCart,
    getQuantitySnapshot,
    getServerQuantitySnapshot
  );

  function setQuantity(next: number) {
    const clamped = Math.max(0, Math.min(20, Math.round(next)));
    const items: CartItem[] = clamped > 0 ? [{ sku: PRODUCT.sku, quantity: clamped }] : [];
    writeCart(items);
  }

  const subtotal = quantity * PRODUCT.unitPrice;

  return (
    <CartContext.Provider value={{ quantity, setQuantity, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
