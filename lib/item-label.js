/**
 * Mirrors the staff dashboard's inventoryItemLabel() fallback chain exactly:
 * the item's own bilingual display_name first, then catalogable + color,
 * then the bridged legacy raw_material's name (most current items still
 * fall back to this — very few have been linked to a real catalog entry
 * yet), and finally "category #id".
 */
export function itemLabel(item) {
  if (!item || typeof item !== "object") return "—";

  if (typeof item.display_name === "string" && item.display_name.trim().length) {
    return item.display_name;
  }

  const catalogableName = item.catalogable?.display_name;
  const colorName = item.color?.display_name;
  const parts = [catalogableName, colorName].filter((v) => typeof v === "string" && v.trim().length);
  if (parts.length) return parts.join(" — ");

  const legacy = item.legacy_raw_material;
  const legacyName = legacy?.display_name || legacy?.name_en || legacy?.name_ar || legacy?.name;
  if (typeof legacyName === "string" && legacyName.trim().length) return legacyName;

  return `${item.category ?? ""} #${item.id}`.trim();
}
