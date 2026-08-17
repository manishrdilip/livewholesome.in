export type Lang = "en" | "ta";

const STORAGE_KEY = "wp_lang";

export function readLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "ta" ? "ta" : "en";
}

export function getServerLangSnapshot(): Lang {
  return "en";
}

export function writeLang(lang: Lang) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, lang);
  notifyLangListeners();
}

const listeners = new Set<() => void>();

export function subscribeLang(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyLangListeners() {
  for (const listener of listeners) listener();
}
