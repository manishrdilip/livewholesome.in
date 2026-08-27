/** Builds a wa.me click-to-chat link, or null if no number is configured. */
export function buildWhatsAppLink(phone: string | null | undefined, message?: string): string | null {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;
  return message ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : `https://wa.me/${digits}`;
}
