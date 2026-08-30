// Lightweight, regex-based content flags for a review's free-text body —
// run on any review that comes from outside the site's own moderated
// customer-review form (currently: WhatsApp-relayed reviews, whether typed
// in by admin or auto-collected via the iZap webhook). Never auto-rejects
// anything — every review still needs admin approval regardless (see
// src/app/admin/reviews/page.tsx) — this just surfaces *why* to look
// closer before approving, since these come from raw chat text nobody
// reviewed for typos, let alone PII.

const PHONE_PATTERN = /(?:\+?\d[\s.-]?){10,13}/;
const EMAIL_PATTERN = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const PAYMENT_PATTERN =
  /\b(upi\s*id|account\s*number|ifsc|card\s*number|cvv|otp|aadh?aar|pan\s*card|credit\s*card|debit\s*card|password)\b/i;

// Deliberately short and generic — this is a "look closer" flag, not a
// content filter; a longer list would just create false confidence.
const PROFANITY_WORDS = ["fuck", "shit", "bastard", "bitch", "asshole", "chutiya", "madarchod", "bhenchod"];

export function detectReviewFlags(text: string | null | undefined): string[] {
  if (!text) return [];
  const flags: string[] = [];

  if (PHONE_PATTERN.test(text)) flags.push("possible phone number");
  if (EMAIL_PATTERN.test(text)) flags.push("possible email address");
  if (PAYMENT_PATTERN.test(text)) flags.push("possible payment/account details");
  if (PROFANITY_WORDS.some((w) => text.toLowerCase().includes(w))) flags.push("possible profanity");

  return flags;
}

/** Formats detected flags into the moderated_note prefix admins see on the
 * review card, before they've made any moderation decision of their own. */
export function formatFlagNote(flags: string[]): string | null {
  if (!flags.length) return null;
  return `⚠ Auto-flagged for review: ${flags.join(", ")}.`;
}
