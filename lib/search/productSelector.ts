/**
 * Search v1 — progressive Brand → Family/Product catalog helpers.
 * Only branches that resolve to ≥1 published Product.
 * 7016™ appears as brandless ProductFamily root (never as Brand).
 */

import {
  getEntityHref,
  listBrands,
  listProductFamilies,
} from "@/lib/data/repository";
import {
  getBrandForProductFamily,
  getDirectProductsForBrand,
  getProductsForProductFamily,
} from "@/lib/data/organizationPortfolio";
import { getProductFamiliesForBrand } from "@/lib/data/brandPortfolio";
import { getCanonicalProductFamily } from "@/lib/navigation/entityNavigation";
import {
  PROGRESSIVE_TYPE_LABEL_HU,
  type ProgressiveItem,
} from "./types";

function hu(a: string, b: string): number {
  return a.localeCompare(b, "hu");
}

function brandHasPublishedProducts(brandId: string): boolean {
  const families = getProductFamiliesForBrand(brandId);
  for (const f of families) {
    if (getProductsForProductFamily(f.id).length > 0) return true;
  }
  return getDirectProductsForBrand(brandId).length > 0;
}

function familyHasPublishedProducts(familyId: string): boolean {
  return getProductsForProductFamily(familyId).length > 0;
}

/**
 * Deterministic leaf label after Brand/Family selection.
 * Returns undefined when unsafe/ambiguous → caller uses full name.
 */
export function deriveProductLeafLabel(
  productName: string,
  prefixes: Array<string | undefined>,
): string | undefined {
  let leaf = productName.trim();
  for (const pref of prefixes) {
    if (!pref?.trim()) continue;
    const re = new RegExp(
      `^${pref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`,
      "i",
    );
    if (re.test(leaf)) {
      leaf = leaf.replace(re, "").trim();
    }
  }
  if (!leaf || leaf === productName.trim()) return undefined;
  // Too aggressive / empty residue
  if (leaf.length < 2) return undefined;
  return leaf;
}

/** Roots that can reach ≥1 published Product: Brands + brandless Families. */
export function getProductSearchRoots(): ProgressiveItem[] {
  const roots: ProgressiveItem[] = [];

  for (const brand of listBrands()) {
    if (brand.status !== "published") continue;
    if (brand.id === "brand_7016") continue;
    if (!brandHasPublishedProducts(brand.id)) continue;
    roots.push({
      id: brand.id,
      type: "brand",
      name: brand.name,
      displayName: brand.name,
      href: getEntityHref(brand),
      typeLabelHu: PROGRESSIVE_TYPE_LABEL_HU.brand,
    });
  }

  for (const family of listProductFamilies()) {
    if (family.status !== "published") continue;
    const brand = getBrandForProductFamily(family.id);
    if (brand?.status === "published") continue; // brand-owned families are not roots
    if (!familyHasPublishedProducts(family.id)) continue;
    roots.push({
      id: family.id,
      type: "productFamily",
      name: family.name,
      displayName: family.name,
      href: getEntityHref(family),
      typeLabelHu: PROGRESSIVE_TYPE_LABEL_HU.productFamily,
    });
  }

  return roots.sort((a, b) => hu(a.displayName, b.displayName));
}

/**
 * Children after selecting a Brand or brandless ProductFamily root.
 * Brand → Families (with products) + direct/family-less Products.
 * Family → its Products.
 */
export function getProductSearchChildren(
  parentId: string,
  parentType: "brand" | "productFamily",
): ProgressiveItem[] {
  if (parentType === "productFamily") {
    return getProductsForProductFamily(parentId)
      .map((p) => {
        const family = getCanonicalProductFamily(p.id);
        const leaf = deriveProductLeafLabel(p.name, [family?.name]);
        return {
          id: p.id,
          type: "product" as const,
          name: p.name,
          displayName: p.name,
          href: getEntityHref(p),
          typeLabelHu: PROGRESSIVE_TYPE_LABEL_HU.product,
          leafLabel: leaf,
        };
      })
      .sort((a, b) => hu(a.displayName, b.displayName));
  }

  // Brand
  const items: ProgressiveItem[] = [];
  const families = getProductFamiliesForBrand(parentId).filter((f) =>
    familyHasPublishedProducts(f.id),
  );
  for (const f of families) {
    items.push({
      id: f.id,
      type: "productFamily",
      name: f.name,
      displayName: f.name,
      href: getEntityHref(f),
      typeLabelHu: PROGRESSIVE_TYPE_LABEL_HU.productFamily,
    });
  }

  const familyProductIds = new Set(
    families.flatMap((f) =>
      getProductsForProductFamily(f.id).map((p) => p.id),
    ),
  );

  // Direct Brand→Product plus family-less: products under brand not in a brand family
  // Use canonical family check: products whose canonical family is null OR not under this brand's families
  const brand = listBrands().find((b) => b.id === parentId);
  const direct = getDirectProductsForBrand(parentId).filter(
    (p) => !familyProductIds.has(p.id),
  );

  // Also include products that resolve to this brand via family? No — those appear under family.
  // Family-less products are Brand --hasProduct--> only.
  // But VALMOR family-less are Brand hasProduct — getDirectProductsForBrand covers them.
  // Products only under family are NOT in getDirectProductsForBrand typically.

  // Spec: after Brand, show Families + direct/family-less Products.
  // Family-less = no ProductFamily (canonical). Some may only be linked Brand→Product.
  for (const p of direct) {
    const leaf = deriveProductLeafLabel(p.name, [brand?.name]);
    items.push({
      id: p.id,
      type: "product",
      name: p.name,
      displayName: p.name,
      href: getEntityHref(p),
      typeLabelHu: PROGRESSIVE_TYPE_LABEL_HU.product,
      leafLabel: leaf,
    });
  }

  // Safety: also surface published products with this brand and no family
  // that might only be reachable via family path incorrectly — covered by direct.

  return items.sort((a, b) => {
    // Families before Products, then HU name
    if (a.type !== b.type) {
      if (a.type === "productFamily") return -1;
      if (b.type === "productFamily") return 1;
    }
    return hu(a.displayName, b.displayName);
  });
}

/** Products under a ProductFamily (after Brand → Family step). */
export function getProductSearchFamilyProducts(
  familyId: string,
): ProgressiveItem[] {
  return getProductSearchChildren(familyId, "productFamily");
}
