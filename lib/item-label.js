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

function categoryLabel(item, t) {
  const key = `stockPage.categories.${item?.category}`;
  const out = t ? t(key) : key;
  return out !== key ? out : item?.category ?? "—";
}

/** id + name | category | catalogable | color — for item-picker dropdown options, mirrors the staff dashboard's inventoryItemFullLabel(). */
export function itemFullLabel(item, t) {
  if (!item || typeof item !== "object") return "—";

  const parts = [];
  if (typeof item.display_name === "string" && item.display_name.trim().length) parts.push(item.display_name);

  const category = categoryLabel(item, t);
  if (category && category !== "—") parts.push(category);

  const catalogableName = item.catalogable?.display_name;
  if (typeof catalogableName === "string" && catalogableName.trim().length) parts.push(catalogableName);

  const colorName = item.color?.display_name;
  if (typeof colorName === "string" && colorName.trim().length) parts.push(colorName);

  if (parts.length === 0) {
    const legacy = item.legacy_raw_material;
    const legacyName = legacy?.display_name || legacy?.name_en || legacy?.name_ar || legacy?.name;
    if (typeof legacyName === "string" && legacyName.trim().length) parts.push(legacyName);
  }

  if (parts.length === 0) return `#${item.id}`;

  return `#${item.id} — ${[...new Set(parts)].join(" | ")}`;
}

/** Same data as itemLabel(), split into separate fields — for tables with dedicated Category/Catalogable/Color columns, mirrors the staff dashboard's inventoryItemLabelParts(). */
export function itemLabelParts(item, t) {
  if (!item || typeof item !== "object") {
    return { name: "—", category: "—", catalogable: "—", color: "—" };
  }

  const catalogable = item.catalogable?.display_name || item.catalogable?.name_ar || item.catalogable?.name_en || item.catalogable?.name;
  const color = item.color?.display_name || item.color?.name_ar || item.color?.name_en || item.color?.name;

  return {
    name: itemLabel(item),
    category: categoryLabel(item, t),
    catalogable: catalogable || "—",
    color: color || "—",
  };
}
