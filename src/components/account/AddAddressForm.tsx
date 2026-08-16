"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { INDIAN_STATES } from "@/lib/indian-states";
import { lookupPincode } from "@/lib/pincode";
import { getCurrentPosition, reverseGeocode } from "@/lib/geolocation";

type FormState = {
  label: string;
  pincode: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
};

const initialState: FormState = {
  label: "",
  pincode: "",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
};

export function AddAddressForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "locating" | "found" | "error"
  >("idle");
  const [locationError, setLocationError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handlePincodeBlur() {
    const pin = form.pincode.trim();
    if (!/^\d{6}$/.test(pin)) return;
    const result = await lookupPincode(pin).catch(() => null);
    if (result) {
      update("city", result.city);
      update("state", result.state);
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
    } catch {
      setLocationStatus("error");
      setLocationError("Couldn't get your location. You can still fill the address in manually.");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, ...(location ?? {}) }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErrorMessage(data.error ?? "Could not save this address");
      setSubmitting(false);
      return;
    }

    setForm(initialState);
    setLocation(null);
    setLocationStatus("idle");
    setSubmitting(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2 border-t border-ink/10 pt-4">
      <button
        type="button"
        onClick={handleUseLocation}
        disabled={locationStatus === "locating"}
        className="rounded-full border border-emerald px-4 py-1.5 text-sm text-emerald hover:bg-emerald hover:text-cream disabled:opacity-50"
      >
        {locationStatus === "locating" ? "Locating…" : "📍 Use my current location"}
      </button>
      {locationStatus === "found" && (
        <p className="text-xs text-emerald">Location captured — check the fields below.</p>
      )}
      {locationStatus === "error" && <p className="text-xs text-amber-700">{locationError}</p>}

      <input
        name="label"
        placeholder="Label (e.g. Home) — optional"
        value={form.label}
        onChange={(e) => update("label", e.target.value)}
        className="input"
      />
      <input
        name="pincode"
        required
        placeholder="Pincode"
        value={form.pincode}
        onChange={(e) => update("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
        onBlur={handlePincodeBlur}
        className="input"
        maxLength={6}
      />
      <input
        name="line1"
        required
        placeholder="Flat / House no., Building, Street"
        value={form.line1}
        onChange={(e) => update("line1", e.target.value)}
        className="input"
      />
      <input
        name="line2"
        placeholder="Area / Locality (optional)"
        value={form.line2}
        onChange={(e) => update("line2", e.target.value)}
        className="input"
      />
      <input
        name="landmark"
        placeholder="Landmark (optional)"
        value={form.landmark}
        onChange={(e) => update("landmark", e.target.value)}
        className="input"
      />
      <div className="flex gap-2">
        <input
          name="city"
          required
          placeholder="City"
          value={form.city}
          onChange={(e) => update("city", e.target.value)}
          className="input"
        />
        <select
          name="state"
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
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-emerald px-4 py-1.5 text-sm text-cream disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Add address"}
      </button>
      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}
    </form>
  );
}
