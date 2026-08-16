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

export type StorefrontConfig = {
  basePrice: number;
  offerPrice: number;
  discountPercent: number;
  subscribePrice: number;
  subscribeDiscountPercent: number;
  shippingFee: number;
  supportPhone: string | null;
  supportEmail: string | null;
  fssaiLicense: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  paymentGatewayEnabled: boolean;
  cashfreeMode: "sandbox" | "production";
};

const DEFAULT_CONFIG: StorefrontConfig = {
  basePrice: PRODUCT.unitPrice,
  offerPrice: PRODUCT.unitPrice,
  discountPercent: 0,
  subscribePrice: PRODUCT.unitPrice,
  subscribeDiscountPercent: 10,
  shippingFee: 0,
  supportPhone: null,
  supportEmail: null,
  fssaiLicense: null,
  facebookUrl: null,
  instagramUrl: null,
  youtubeUrl: null,
  paymentGatewayEnabled: false,
  cashfreeMode: "sandbox",
};

type CartContextValue = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  /** Admin-editable price/offer/social config — falls back to code defaults
   * (unitPrice, no offer) until the fetch resolves. */
  config: StorefrontConfig;
  /** Effective per-unit price for the current cart (accounts for the
   * Subscribe & Save toggle). */
  unitPrice: number;
  subtotal: number;
  isSubscription: boolean;
  setIsSubscription: (value: boolean) => void;
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

export function CartProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const quantity = useSyncExternalStore(
    subscribeCart,
    getQuantitySnapshot,
    getServerQuantitySnapshot
  );
  const [config, setConfig] = useState<StorefrontConfig>(DEFAULT_CONFIG);
  const [isSubscription, setIsSubscription] = useState(false);

  useEffect(() => {
    fetch("/api/storefront-config")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setConfig(data))
      .catch(() => {});
  }, []);

  function setQuantity(next: number) {
    const clamped = Math.max(0, Math.min(20, Math.round(next)));
    const items: CartItem[] = clamped > 0 ? [{ sku: PRODUCT.sku, quantity: clamped }] : [];
    writeCart(items);
  }

  function launchCheckout() {
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
