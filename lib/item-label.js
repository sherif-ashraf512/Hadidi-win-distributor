/**
 * Mirrors the staff dashboard's inventoryItemLabel() fallback chain: the
 * item's own bilingual display_name first, then catalogable + color, then
 * "category #id" — trimmed down since this portal never needs the legacy
 * raw-material fallback (distributor warehouses only hold items already
 * classified in the new inventory domain).
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

  return `${item.category ?? ""} #${item.id}`.trim();
}
