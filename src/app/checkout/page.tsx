"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { PRODUCT } from "@/lib/product";
import { INDIAN_STATES } from "@/lib/indian-states";
import { lookupPincode } from "@/lib/pincode";
import { getCurrentPosition, reverseGeocode } from "@/lib/geolocation";

type FormState = {
  name: string;
  phone: string;
  whatsappSameAsPhone: boolean;
  whatsappNumber: string;
  email: string;
  pincode: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  customerNote: string;
  consent: boolean;
  companyWebsite: string; // honeypot
};

const initialState: FormState = {
  name: "",
  phone: "",
  whatsappSameAsPhone: true,
  whatsappNumber: "",
  email: "",
  pincode: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  customerNote: "",
  consent: false,
  companyWebsite: "",
};

export default function CheckoutPage() {
  const { quantity } = useCart();
  const router = useRouter();
  const effectiveQuantity = quantity > 0 ? quantity : 1;

  const [form, setForm] = useState<FormState>(initialState);
  const [pincodeStatus, setPincodeStatus] = useState<
    "idle" | "checking" | "found" | "not_found"
  >("idle");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "found" | "error"
  >("idle");
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function lookupAndFillPincode(pin: string) {
    if (!/^\d{6}$/.test(pin)) return;
    setPincodeStatus("checking");
    const result = await lookupPincode(pin).catch(() => null);
    if (result) {
      update("city", result.city);
      update("state", result.state);
      setPincodeStatus("found");
    } else {
      setPincodeStatus("not_found");
    }
  }

  async function handleUseLocation() {
    setLocationStatus("locating");
    setLocationError("");
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });

      const geocoded = await reverseGeocode(latitude, longitude).catch(() => null);
      if (geocoded?.pincode) {
        update("pincode", geocoded.pincode);
        const pinResult = await lookupPincode(geocoded.pincode).catch(() => null);
        if (pinResult) {
          update("city", pinResult.city);
          update("state", pinResult.state);
        }
      }
      if (geocoded?.line1Guess && !form.line1) {
        update("line1", geocoded.line1Guess);
      }
      setLocationStatus("found");
    } catch (err) {
      setLocationStatus("error");
      setLocationError(
        err instanceof GeolocationPositionError
          ? "Location permission denied. You can still fill the address in manually."
          : "Couldn't get your location. You can still fill the address in manually."
      );
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          whatsappNumber: form.whatsappSameAsPhone ? "" : form.whatsappNumber,
          quantity: effectiveQuantity,
          ...(location ?? {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setServerError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      router.push(`/order/confirmed?ref=${data.orderNumber}`);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/" className="text-sm text-emerald hover:underline">
        ← Back to shop
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-bold">Checkout</h1>

      <div className="mt-4 rounded-xl bg-cream p-4 text-sm">
        {PRODUCT.name} × {effectiveQuantity} — ₹{effectiveQuantity * PRODUCT.unitPrice}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Honeypot — hidden from real users */}
        <div className="hidden" aria-hidden="true">
          <label>
            Company website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.companyWebsite}
              onChange={(e) => update("companyWebsite", e.target.value)}
            />
          </label>
        </div>

        <fieldset className="space-y-4">
          <legend className="font-semibold">Contact</legend>

          <Field label="Full name" error={errors.name}>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Mobile number" error={errors.phone}>
            <div className="flex items-center gap-2">
              <span className="text-ink/60">+91</span>
              <input
                required
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))}
                className="input"
              />
            </div>
          </Field>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.whatsappSameAsPhone}
              onChange={(e) => update("whatsappSameAsPhone", e.target.checked)}
            />
            Is this also your WhatsApp number?
          </label>

          {!form.whatsappSameAsPhone && (
            <Field label="WhatsApp number" error={errors.whatsappNumber}>
              <div className="flex items-center gap-2">
                <span className="text-ink/60">+91</span>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={form.whatsappNumber}
                  onChange={(e) => update("whatsappNumber", e.target.value.replace(/\D/g, ""))}
                  className="input"
                />
              </div>
            </Field>
          )}

          <Field label="Email" error={errors.email}>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input"
            />
            <p className="mt-1 text-xs text-ink/50">This is where your invoice will be sent.</p>
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="font-semibold">Shipping address</legend>

          <div>
            <button
              type="button"
              onClick={handleUseLocation}
              disabled={locationStatus === "locating"}
              className="rounded-full border border-emerald px-4 py-1.5 text-sm text-emerald hover:bg-emerald hover:text-cream disabled:opacity-50"
            >
              {locationStatus === "locating" ? "Locating…" : "📍 Use my current location"}
            </button>
            {locationStatus === "found" && (
              <p className="mt-1 text-xs text-emerald">
                Location captured — please check the fields below and edit anything that&apos;s off.
              </p>
            )}
            {locationStatus === "error" && (
              <p className="mt-1 text-xs text-amber-700">{locationError}</p>
            )}
          </div>

          <Field label="Pincode" error={errors.pincode}>
            <input
              required
              inputMode="numeric"
              maxLength={6}
              value={form.pincode}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "");
                update("pincode", next);
                if (next.length === 6) lookupAndFillPincode(next);
                else setPincodeStatus("idle");
              }}
              onBlur={() => lookupAndFillPincode(form.pincode)}
              className="input"
            />
            {pincodeStatus === "checking" && (
              <p className="mt-1 text-xs text-ink/50">Checking pincode…</p>
            )}
            {pincodeStatus === "not_found" && (
              <p className="mt-1 text-xs text-amber-700">
                We couldn&apos;t verify this pincode — please check it
              </p>
            )}
          </Field>

          <Field label="Flat / House no., Building, Street" error={errors.line1}>
            <input
              required
              value={form.line1}
              onChange={(e) => update("line1", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Area / Locality (optional)">
            <input
              value={form.line2}
              onChange={(e) => update("line2", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Landmark (optional)">
            <input
              value={form.landmark}
              onChange={(e) => update("landmark", e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="City" error={errors.city}>
              <input
                required
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="State" error={errors.state}>
              <select
                required
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className="input"
              >
                <option value="" disabled>
                  Select state
                </option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </fieldset>

        <Field label="Order notes (optional)">
          <textarea
            value={form.customerNote}
            onChange={(e) => update("customerNote", e.target.value)}
            className="input"
            rows={3}
          />
        </Field>

        <div className="rounded-xl border border-ink/10 bg-cream p-4 text-sm">
          <strong>Payment:</strong> We&apos;ll contact you to complete payment after confirming
          your order. Online payment is coming soon.
        </div>

        <label className="flex items-start gap-2 text-xs text-ink/70">
          <input
            required
            type="checkbox"
            checked={form.consent}
            onChange={(e) => update("consent", e.target.checked)}
            className="mt-0.5"
          />
          By placing this order you agree to receive your invoice and delivery updates on
          WhatsApp and email.
        </label>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-gold py-3 font-semibold text-emerald-deep disabled:opacity-50"
        >
          {submitting ? "Placing order…" : "Place Order"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </label>
  );
}
