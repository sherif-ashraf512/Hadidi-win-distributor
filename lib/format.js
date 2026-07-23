/** Quantities always render in Western digits (0-9), regardless of UI language. */
export function formatQty(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3, minimumFractionDigits: 0 }).format(n);
}

/** Dates keep Arabic month/weekday names in ar locale, but digits stay Latin. */
export function formatDateTime(iso, locale) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(loc, { dateStyle: "short", timeStyle: "short", numberingSystem: "latn" }).format(d);
}

/** Money amounts always render in Western digits, 2 decimal places, EGP. */
export function formatAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
}

export function warehouseLabel(w, locale) {
  if (!w) return "—";
  return locale === "ar" ? w.name_ar || w.name_en : w.name_en || w.name_ar;
}
