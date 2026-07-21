"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { messages, STORAGE_LOCALE_KEY } from "@/messages";

const LocaleContext = createContext(null);

function getNested(obj, path) {
  return path.split(".").reduce(
    (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
    obj
  );
}

function interpolate(str, vars) {
  if (!str || typeof str !== "string" || !vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`
  );
}

function applyDocumentLocale(locale) {
  if (typeof document === "undefined") return;
  const lang = locale === "ar" ? "ar" : "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;
  document.documentElement.dir = dir;
}

function persistLocale(locale) {
  try {
    localStorage.setItem(STORAGE_LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState("ar");
  const hydratedRef = useRef(false);

  useLayoutEffect(() => {
    if (!hydratedRef.current) {
      hydratedRef.current = true;
      let stored = locale;
      try {
        const raw = localStorage.getItem(STORAGE_LOCALE_KEY);
        if (raw === "en" || raw === "ar") stored = raw;
      } catch {
        /* ignore */
      }
      if (stored !== locale) {
        applyDocumentLocale(stored);
        persistLocale(stored);
        setLocaleState(stored);
        return;
      }
    }

    applyDocumentLocale(locale);
    persistLocale(locale);
  }, [locale]);

  const setLocale = useCallback(
    (next) => {
      if (next !== "ar" && next !== "en") return;
      if (next === locale) return;

      applyDocumentLocale(next);
      persistLocale(next);

      if (typeof window !== "undefined") {
        window.location.reload();
        return;
      }

      setLocaleState(next);
    },
    [locale]
  );

  const t = useCallback(
    (key, vars) => {
      const dict = messages[locale] || messages.ar;
      const val = getNested(dict, key);
      if (val == null) return key;
      if (typeof val === "string") return interpolate(val, vars);
      return key;
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
