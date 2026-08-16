declare global {
  interface Window {
    Cashfree?: (opts: { mode: "sandbox" | "production" }) => {
      checkout: (opts: { paymentSessionId: string; redirectTarget?: "_self" | "_blank" | "_modal" }) => void;
    };
  }
}

const SDK_URL = "https://sdk.cashfree.com/js/v3/cashfree.js";

/** Loads the Cashfree Web SDK once and caches the in-flight promise, so
 * multiple checkout attempts in one page session don't inject the script
 * more than once. */
let sdkPromise: Promise<void> | null = null;

export function loadCashfreeSdk(): Promise<void> {
  if (window.Cashfree) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load Cashfree SDK"));
    };
    document.head.appendChild(script);
  });

  return sdkPromise;
}
