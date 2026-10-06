/**
 * Surface Hub portfolio queries.
 * Products only via Product --applicableToSurface--> Surface (reverse).
 * Families / Brands / Orgs / Categories / Technologies are DERIVED — never stored.
 */

import type {
  Brand,
  Category,
  KnowledgeArticle,
  Organization,
  Product,
  ProductFamily,
  Surface,
  Technology,
} from "./types";
import {
  getEntityHref,
  getRelatedEntities,
  getSurfaceById,
} from "./repository";
import {
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
  getCanonicalProductBrand,
  getCanonicalProductFamily,
} from "@/lib/navigation/entityNavigation";
import { getCategoriesForProduct } from "./productHub";

export type SurfaceProductCard = {
  id: string;
  name: string;
  href: string;
  brandName?: string;
  brandHref?: string;
  familyName?: string;
  familyHref?: string;
  /** First canonical category for adaptive grouping assignment. */
  primaryCategoryId?: string;
  primaryCategoryName?: string;
};

export type SurfaceProductGroup = {
  /** Undefined = flat ungrouped list. */
  categoryId?: string;
  categoryName?: string;
  categoryHref?: string;
  products: SurfaceProductCard[];
};

export type SurfaceFamilyLink = {
  id: string;
  name: string;
  href: string;
};

export type SurfaceBrandLink = {
  id: string;
  name: string;
  href: string;
};

export type SurfaceOrgLink = {
  id: string;
  name: string;
  href: string;
  label: "Gyártó" | "Tulajdonos";
};

export type SurfaceCategoryLink = {
  id: string;
  name: string;
  href: string;
  productCount: number;
};

export type SurfaceTechLink = {
  id: string;
  name: string;
  href: string;
  productCount: number;
};

export type SurfaceKnowledgeLink = {
  id: string;
  name: string;
  href: string;
  note?: string;
};

export type SurfacePortfolio = {
  surface: Surface;
  products: SurfaceProductCard[];
  productGroups: SurfaceProductGroup[];
  families: SurfaceFamilyLink[];
  brands: SurfaceBrandLink[];
  organizations: SurfaceOrgLink[];
  categories: SurfaceCategoryLink[];
  technologies: SurfaceTechLink[];
  knowledge: SurfaceKnowledgeLink[];
};

function huSort(a: string, b: string): number {
  return a.localeCompare(b, "hu");
}

/**
 * Published Products with explicit applicableToSurface → this Surface.
 * ProductFamily→Surface edges are ignored for Product lists.
 */
export function getProductsForSurface(surfaceId: string): Product[] {
  return getRelatedEntities(surfaceId, {
    relationTypes: ["applicableToSurface"],
    direction: "incoming",
  })
    .filter(
      (r) =>
        r.entity.type === "product" && r.entity.status === "published",
    )
    .map((r) => r.entity as Product)
    .sort((a, b) => huSort(a.name, b.name));
}

function enrichProduct(p: Product): SurfaceProductCard {
  const brand = getCanonicalProductBrand(p.id);
  const family = getCanonicalProductFamily(p.id);
  const categories = getCategoriesForProduct(p.id);
  const primary = categories[0];

  return {
    id: p.id,
    name: p.name,
    href: getEntityHref(p),
    brandName: brand?.name,
    brandHref: brand ? getEntityHref(brand) : undefined,
    familyName: family?.name,
    familyHref: family ? getEntityHref(family) : undefined,
    primaryCategoryId: primary?.id,
    primaryCategoryName: primary?.name,
  };
}

/**
 * Adaptive Category → Products grouping for the primary Product section.
 * Each Product appears exactly once (first canonical Category wins).
 */
export function groupSurfaceProducts(
  products: SurfaceProductCard[],
): SurfaceProductGroup[] {
  if (!products.length) return [];

  const categoryIds = new Set(
    products.map((p) => p.primaryCategoryId).filter(Boolean) as string[],
  );

  const useGroups =
    products.length >= 4 && categoryIds.size >= 2;

  if (!useGroups) {
    return [{ products: [...products].sort((a, b) => huSort(a.name, b.name)) }];
  }

  // Stable category order: by first appearance in HU-sorted product list,
  // then group products under that category.
  const byCat = new Map<string, SurfaceProductCard[]>();
  const uncategorized: SurfaceProductCard[] = [];
  const catMeta = new Map<
    string,
    { name: string; href: string }
  >();

  for (const p of products) {
    if (!p.primaryCategoryId || !p.primaryCategoryName) {
      uncategorized.push(p);
      continue;
    }
    if (!catMeta.has(p.primaryCategoryId)) {
      const cats = getCategoriesForProduct(p.id);
      const match = cats.find((c) => c.id === p.primaryCategoryId);
      catMeta.set(p.primaryCategoryId, {
        name: p.primaryCategoryName,
        href: match?.href ?? "#",
      });
    }
    const list = byCat.get(p.primaryCategoryId) ?? [];
    list.push(p);
    byCat.set(p.primaryCategoryId, list);
  }

  const groups: SurfaceProductGroup[] = [...byCat.entries()]
    .map(([categoryId, list]) => {
      const meta = catMeta.get(categoryId)!;
      return {
        categoryId,
        categoryName: meta.name,
        categoryHref: meta.href === "#" ? undefined : meta.href,
        products: list.sort((a, b) => huSort(a.name, b.name)),
      };
    })
    .sort((a, b) => huSort(a.categoryName!, b.categoryName!));

  if (uncategorized.length) {
    groups.push({
      products: uncategorized.sort((a, b) => huSort(a.name, b.name)),
    });
  }

  return groups;
}

export function getProductFamiliesForSurface(
  surfaceId: string,
): SurfaceFamilyLink[] {
  const map = new Map<string, ProductFamily>();
  for (const p of getProductsForSurface(surfaceId)) {
    const family = getCanonicalProductFamily(p.id);
    if (family) map.set(family.id, family);
  }
  return [...map.values()]
    .map((f) => ({
      id: f.id,
      name: f.name,
      href: getEntityHref(f),
    }))
    .sort((a, b) => huSort(a.name, b.name));
}

export function getBrandsForSurface(surfaceId: string): SurfaceBrandLink[] {
  const map = new Map<string, Brand>();
  for (const p of getProductsForSurface(surfaceId)) {
    const brand = getCanonicalProductBrand(p.id);
    if (brand) map.set(brand.id, brand);
  }
  return [...map.values()]
    .map((b) => ({
      id: b.id,
      name: b.name,
      href: getEntityHref(b),
    }))
    .sort((a, b) => huSort(a.name, b.name));
}

export function getOrganizationsForSurface(
  surfaceId: string,
): SurfaceOrgLink[] {
  const map = new Map<string, SurfaceOrgLink>();

  for (const p of getProductsForSurface(surfaceId)) {
    const brand = getCanonicalProductBrand(p.id);
    const family = getCanonicalProductFamily(p.id);

    let org: Organization | undefined;
    let label: "Gyártó" | "Tulajdonos" = "Tulajdonos";

    if (brand) {
      const owner = getCanonicalBrandOwner(brand.id);
      if (owner) {
        org = owner;
        label = "Tulajdonos";
      }
    } else if (family) {
      const mfr = getCanonicalFamilyManufacturer(family.id);
      if (mfr) {
        org = mfr;
        label = "Gyártó";
      }
    }

    if (!org) continue;
    // Prefer first-seen label; do not invent on conflict
    if (!map.has(org.id)) {
      map.set(org.id, {
        id: org.id,
        name: org.name,
        href: getEntityHref(org),
        label,
      });
    }
  }

  return [...map.values()].sort((a, b) => huSort(a.name, b.name));
}

export function getCategoriesForSurface(
  surfaceId: string,
): SurfaceCategoryLink[] {
  const map = new Map<string, { cat: Category; count: number }>();

  for (const p of getProductsForSurface(surfaceId)) {
    for (const link of getCategoriesForProduct(p.id)) {
      // Resolve full Category via related entities for type safety
      const related = getRelatedEntities(p.id, {
        relationTypes: ["belongsToCategory"],
        direction: "outgoing",
      }).find((r) => r.entity.id === link.id);
      if (!related || related.entity.type !== "category") continue;
      const cat = related.entity as Category;
      if (cat.id === "cat_all" || cat.status !== "published") continue;
      const prev = map.get(cat.id);
      map.set(cat.id, { cat, count: (prev?.count ?? 0) + 1 });
    }
  }

  return [...map.values()]
    .map(({ cat, count }) => ({
      id: cat.id,
      name: cat.name,
      href: getEntityHref(cat),
      productCount: count,
    }))
    .sort(
      (a, b) =>
        b.productCount - a.productCount || huSort(a.name, b.name),
    );
}

export function getTechnologiesForSurface(
  surfaceId: string,
): SurfaceTechLink[] {
  const map = new Map<string, { tech: Technology; count: number }>();

  for (const p of getProductsForSurface(surfaceId)) {
    for (const r of getRelatedEntities(p.id, {
      relationTypes: ["usesTechnology"],
      direction: "outgoing",
    })) {
      if (r.entity.type !== "technology" || r.entity.status !== "published") {
        continue;
      }
      const tech = r.entity as Technology;
      const prev = map.get(tech.id);
      map.set(tech.id, { tech, count: (prev?.count ?? 0) + 1 });
    }
  }

  return [...map.values()]
    .map(({ tech, count }) => ({
      id: tech.id,
      name: tech.name,
      href: getEntityHref(tech),
      productCount: count,
    }))
    .sort(
      (a, b) =>
        b.productCount - a.productCount || huSort(a.name, b.name),
    );
}

/** Direct Knowledge --documents--> Surface only. No Product-derived Knowledge. */
export function getKnowledgeForSurface(
  surfaceId: string,
): SurfaceKnowledgeLink[] {
  return getRelatedEntities(surfaceId, {
    relationTypes: ["documents"],
    direction: "incoming",
  })
    .filter(
      (r) =>
        r.entity.type === "knowledge" && r.entity.status === "published",
    )
    .map((r) => {
      const k = r.entity as KnowledgeArticle;
      return {
        id: k.id,
        name: k.name,
        href: getEntityHref(k),
        note: k.shortDescription?.trim() || undefined,
      };
    })
    .sort((a, b) => huSort(a.name, b.name));
}

export function getSurfacePortfolio(
  surfaceId: string,
): SurfacePortfolio | null {
  const surface = getSurfaceById(surfaceId);
  if (!surface || surface.status !== "published") return null;

  const raw = getProductsForSurface(surfaceId);
  const products = raw.map(enrichProduct);

  return {
    surface,
    products,
    productGroups: groupSurfaceProducts(products),
    families: getProductFamiliesForSurface(surfaceId),
    brands: getBrandsForSurface(surfaceId),
    organizations: getOrganizationsForSurface(surfaceId),
    categories: getCategoriesForSurface(surfaceId),
    technologies: getTechnologiesForSurface(surfaceId),
    knowledge: getKnowledgeForSurface(surfaceId),
  };
}
