"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { PRODUCT } from "@/lib/product";
import { readCart, writeCart, subscribeCart, type CartItem } from "@/lib/cart";
import type { StorefrontConfig } from "@/lib/storefront-config";

export type { StorefrontConfig };

type CartContextValue = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  /** Admin-editable price/offer/social config, seeded server-side on first
   * render and kept fresh by a background client refetch. */
  config: StorefrontConfig;
  /** Effective per-unit price for the current cart (accounts for the
   * Subscribe & Save toggle). */
  unitPrice: number;
  subtotal: number;
  isSubscription: boolean;
  setIsSubscription: (value: boolean) => void;
  /** Units still available today against the kitchen's daily cap — 0 means
   * ordering is closed until midnight (India time). */
  remainingUnits: number;
  /** Ensures at least 1 unit is in the cart, then navigates to checkout.
   * Shared by the header cart button and the product order box so both
   * behave identically. */
  launchCheckout: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function getQuantitySnapshot(): number {
  return readCart().find((i) => i.sku === PRODUCT.sku)?.quantity ?? 0;
}

function getServerQuantitySnapshot(): number {
  return 0;
}

export function CartProvider({
  initialConfig,
  children,
}: {
  initialConfig: StorefrontConfig;
  children: ReactNode;
}) {
  const router = useRouter();
  const quantity = useSyncExternalStore(
    subscribeCart,
    getQuantitySnapshot,
    getServerQuantitySnapshot
  );
  const [config, setConfig] = useState<StorefrontConfig>(initialConfig);
  const [isSubscription, setIsSubscription] = useState(false);

  useEffect(() => {
    fetch("/api/storefront-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setConfig(data))
      .catch(() => {});
  }, []);

  const remainingUnits = Math.max(0, config.dailyOrderLimitUnits - config.unitsOrderedToday);

  function setQuantity(next: number) {
    const clamped = Math.max(0, Math.min(20, remainingUnits, Math.round(next)));
    const items: CartItem[] = clamped > 0 ? [{ sku: PRODUCT.sku, quantity: clamped }] : [];
    writeCart(items);
  }

  function launchCheckout() {
    if (remainingUnits <= 0) return;
    if (getQuantitySnapshot() === 0) setQuantity(1);
    router.push("/checkout");
  }

  const unitPrice = isSubscription ? config.subscribePrice : config.offerPrice;
  const subtotal = quantity * unitPrice;

  return (
    <CartContext.Provider
      value={{
        quantity,
        setQuantity,
        config,
        unitPrice,
        subtotal,
        isSubscription,
        setIsSubscription,
        remainingUnits,
        launchCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
