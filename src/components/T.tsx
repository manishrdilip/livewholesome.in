"use client";

import { useLanguage } from "@/components/LanguageProvider";

/** Drop-in bilingual text leaf — usable inside server components since this
 * itself is the only client boundary needed. */
export function T({ en, ta }: { en: string; ta: string }) {
  const { lang } = useLanguage();
  return <>{lang === "ta" ? ta : en}</>;
}
