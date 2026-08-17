"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { readLang, writeLang, subscribeLang, getServerLangSnapshot, type Lang } from "@/lib/language-storage";

export type { Lang };

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribeLang, readLang, getServerLangSnapshot);

  return (
    <LanguageContext.Provider value={{ lang, setLang: writeLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
