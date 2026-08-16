// Phone numbers are stored/matched in a single canonical form so the same
// customer typing their number differently across orders (spaces, dashes,
// parens) still dedupes to one row in `customers`. Requires an explicit
// country code (leading "+") since orders now ship internationally and a
// bare 10-digit number is no longer assumed to be Indian.
export const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

export function normalizePhone(raw: string): string {
  return raw.trim().replace(/[\s\-()]/g, "");
}

export function isValidPhone(raw: string): boolean {
  return PHONE_REGEX.test(normalizePhone(raw));
}
