/**
 * v0.2 master uses longer category IDs; repo nav categories keep short canonical IDs.
 * Map at import — do not duplicate slug hubs.
 */
export const CATEGORY_ID_FROM_IMPORT: Record<string, string> = {
  cat_dekor_falfestek: "cat_dekor",
  cat_homlokzat_hoszigeteles: "cat_homlokzat",
  cat_faipari_bevonatok: "cat_faipar",
  cat_ipari_korroziovedelem: "cat_ipari",
  cat_padlo_mugyanta: "cat_padlo",
  cat_felulet_elokeszites: "cat_csiszolas",
  cat_specialis_bevonat: "cat_tuzvedo",
  // New editorial leaf — kept as-is
  cat_higito_segedanyag: "cat_higito_segedanyag",
};

export function mapCategoryId(importId: string): string {
  return CATEGORY_ID_FROM_IMPORT[importId] ?? importId;
}
