export type ReverseGeocodeResult = {
  pincode: string | null;
  line1Guess: string;
};

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation isn't supported in this browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

// OpenStreetMap Nominatim — free, no API key, fine at this volume. Only used
// to suggest a pincode/street line; the postal pincode API remains the
// source of truth for city/state so values keep matching the state dropdown.
export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("Could not look up this location");
  const data = await res.json();
  const addr = data?.address ?? {};
  const line1Guess = [addr.house_number, addr.road ?? addr.pedestrian, addr.suburb ?? addr.neighbourhood]
    .filter(Boolean)
    .join(", ");
  return { pincode: addr.postcode ?? null, line1Guess };
}

export function mapsLinkFor(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export type AddressSuggestion = {
  label: string;
  line1Guess: string;
  pincode: string | null;
};

// Forward search on the same free Nominatim service as reverseGeocode above —
// lets customers type an address and pick a match instead of only relying on
// GPS. Restricted to India since that's the only country we ship to today.
export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=5&q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } }
  );
  if (!res.ok) throw new Error("Could not search for this address");
  const results = await res.json();
  return (results as Array<{ display_name: string; address?: Record<string, string> }>).map((r) => {
    const addr = r.address ?? {};
    const line1Guess = [addr.house_number, addr.road ?? addr.pedestrian, addr.suburb ?? addr.neighbourhood]
      .filter(Boolean)
      .join(", ");
    return { label: r.display_name, line1Guess: line1Guess || r.display_name, pincode: addr.postcode ?? null };
  });
}
