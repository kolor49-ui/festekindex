/**
 * Generic brand portfolio queries — derived from relations only.
 * Reuses family/product helpers from organizationPortfolio (no query duplication).
 */

import type {
  Brand,
  Category,
  Organization,
  Product,
  ProductFamily,
  Source,
  Surface,
  Technology,
} from "./types";
import {
  getBrandById,
  getEntityHref,
  getRelatedEntities,
  getSourcesByIds,
} from "./repository";
import {
  getDirectProductsForBrand,
  getProductsForProductFamily,
  type PortfolioCategoryLink,
  type PortfolioTechLink,
} from "./organizationPortfolio";

export type BrandOrgLink = {
  organization: Organization;
  href: string;
  /** Human roles derived from relation types (never raw relation names in UI). */
  roles: ("owner" | "manufacturer" | "distributor" | "representation" | "service")[];
};

export type BrandPortfolioProduct = {
  id: string;
  name: string;
  href: string;
  slug: string;
  /** Primary category name if present — never invented. */
  categoryName?: string;
  categoryHref?: string;
  surfaces: PortfolioTechLink[];
};

export type BrandFamilyBlock = {
  id: string;
  name: string;
  href: string;
  description?: string;
  productCount: number;
  products: BrandPortfolioProduct[];
};

export type BrandPortfolio = {
  brand: Brand;
  organizations: BrandOrgLink[];
  families: BrandFamilyBlock[];
  /** Brand --hasProduct--> products not already under a family block. */
  directProducts: BrandPortfolioProduct[];
  allProducts: BrandPortfolioProduct[];
  categories: PortfolioCategoryLink[];
  technologies: PortfolioTechLink[];
  surfaces: PortfolioTechLink[];
  sources: Source[];
  lastVerifiedAt?: string;
};

function isStructuralCopy(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.includes("a FESTÉKINDEX adatbázisában")) return true;
  if (t.includes("Festék Bázis v0.")) return true;
  if (t.includes("ProductFamily entitás")) return true;
  return false;
}

function usableShortDescription(text: string | undefined): string | undefined {
  const t = text?.trim() ?? "";
  if (!t || isStructuralCopy(t)) return undefined;
  return t;
}

function enrichProduct(p: Product): BrandPortfolioProduct {
  const categories = getRelatedEntities(p.id, {
    relationTypes: ["belongsToCategory"],
    direction: "outgoing",
  }).filter(
    (r) =>
      r.entity.type === "category" &&
      r.entity.status === "published" &&
      r.entity.id !== "cat_all",
  );

  const primary = categories[0]?.entity as Category | undefined;
  const surfaces = getRelatedEntities(p.id, {
    relationTypes: ["applicableToSurface"],
    direction: "outgoing",
  })
    .filter(
      (r) => r.entity.type === "surface" && r.entity.status === "published",
    )
    .map((r) => {
      const s = r.entity as Surface;
      return { id: s.id, name: s.name, href: getEntityHref(s) };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "hu"));

  return {
    id: p.id,
    name: p.name,
    href: getEntityHref(p),
    slug: p.slug,
    categoryName: primary?.name,
    categoryHref: primary ? getEntityHref(primary) : undefined,
    surfaces,
  };
}

function familyDescription(family: ProductFamily): string | undefined {
  return usableShortDescription(family.shortDescription);
}

/** Organizations linked to a brand (incoming company relations). */
export function getOrganizationsForBrand(brandId: string): BrandOrgLink[] {
  const related = getRelatedEntities(brandId, {
    relationTypes: [
      "owns",
      "manufactures",
      "distributes",
      "officialDistributor",
      "represents",
      "services",
    ],
    direction: "incoming",
  }).filter(
    (r) =>
      r.entity.type === "organization" && r.entity.status === "published",
  );

  const byId = new Map<string, BrandOrgLink>();
  for (const r of related) {
    const org = r.entity as Organization;
    const existing = byId.get(org.id) ?? {
      organization: org,
      href: getEntityHref(org),
      roles: [],
    };
    const role =
      r.relation.relationType === "owns"
        ? ("owner" as const)
        : r.relation.relationType === "manufactures"
          ? ("manufacturer" as const)
          : r.relation.relationType === "distributes" ||
              r.relation.relationType === "officialDistributor"
            ? ("distributor" as const)
            : r.relation.relationType === "represents"
              ? ("representation" as const)
              : ("service" as const);
    if (!existing.roles.includes(role)) existing.roles.push(role);
    byId.set(org.id, existing);
  }
  return [...byId.values()];
}

/** Published ProductFamilies under Brand --hasProductFamily-->. */
export function getProductFamiliesForBrand(brandId: string): ProductFamily[] {
  return getRelatedEntities(brandId, {
    relationTypes: ["hasProductFamily"],
    direction: "outgoing",
  })
    .filter(
      (r) =>
        r.entity.type === "productFamily" &&
        r.entity.status === "published",
    )
    .map((r) => r.entity as ProductFamily);
}

/**
 * Full brand portfolio for Brand Hub pages.
 * Products appear once: under family if family-linked, else in directProducts.
 */
export function getBrandPortfolio(brandId: string): BrandPortfolio | null {
  const brand = getBrandById(brandId);
  if (!brand || brand.status !== "published") return null;

  const organizations = getOrganizationsForBrand(brandId);
  const familyEntities = getProductFamiliesForBrand(brandId);

  const families: BrandFamilyBlock[] = familyEntities.map((family) => {
    const products = getProductsForProductFamily(family.id).map(enrichProduct);
    return {
      id: family.id,
      name: family.name,
      href: getEntityHref(family),
      description: familyDescription(family),
      productCount: products.length,
      products,
    };
  });

  const familyProductIds = new Set(
    families.flatMap((f) => f.products.map((p) => p.id)),
  );

  const directProducts = getDirectProductsForBrand(brandId)
    .filter((p) => !familyProductIds.has(p.id))
    .map(enrichProduct)
    .sort((a, b) => a.name.localeCompare(b.name, "hu"));

  const productMap = new Map<string, BrandPortfolioProduct>();
  for (const f of families) {
    for (const p of f.products) productMap.set(p.id, p);
  }
  for (const p of directProducts) productMap.set(p.id, p);

  const allProducts = [...productMap.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "hu"),
  );

  const categoryMap = new Map<string, { cat: Category; count: number }>();
  const techMap = new Map<string, Technology>();
  const surfaceMap = new Map<string, Surface>();
  const sourceIdSet = new Set<string>();
  const verifiedDates: string[] = [];

  if (brand.verifiedAt) verifiedDates.push(brand.verifiedAt);
  for (const id of brand.sourceIds) sourceIdSet.add(id);

  for (const org of organizations) {
    for (const id of org.organization.sourceIds) sourceIdSet.add(id);
    if (org.organization.verifiedAt) {
      verifiedDates.push(org.organization.verifiedAt);
    }
  }

  for (const family of familyEntities) {
    for (const id of family.sourceIds) sourceIdSet.add(id);
    if (family.verifiedAt) verifiedDates.push(family.verifiedAt);
  }

  // Collect raw products once for aggregation
  const rawProducts: Product[] = [];
  for (const family of familyEntities) {
    rawProducts.push(...getProductsForProductFamily(family.id));
  }
  for (const p of getDirectProductsForBrand(brandId)) {
    if (!familyProductIds.has(p.id)) rawProducts.push(p);
  }

  const seenRaw = new Set<string>();
  for (const product of rawProducts) {
    if (seenRaw.has(product.id)) continue;
    seenRaw.add(product.id);

    for (const id of product.sourceIds) sourceIdSet.add(id);
    if (product.verifiedAt) verifiedDates.push(product.verifiedAt);

    for (const r of getRelatedEntities(product.id, {
      relationTypes: ["belongsToCategory"],
      direction: "outgoing",
    })) {
      if (r.entity.type !== "category" || r.entity.status !== "published") {
        continue;
      }
      const cat = r.entity as Category;
      if (cat.id === "cat_all") continue;
      const prev = categoryMap.get(cat.id);
      categoryMap.set(cat.id, {
        cat,
        count: (prev?.count ?? 0) + 1,
      });
      for (const id of cat.sourceIds) sourceIdSet.add(id);
    }

    for (const r of getRelatedEntities(product.id, {
      relationTypes: ["usesTechnology"],
      direction: "outgoing",
    })) {
      if (r.entity.type === "technology" && r.entity.status === "published") {
        techMap.set(r.entity.id, r.entity as Technology);
      }
    }

    for (const r of getRelatedEntities(product.id, {
      relationTypes: ["applicableToSurface"],
      direction: "outgoing",
    })) {
      if (r.entity.type === "surface" && r.entity.status === "published") {
        surfaceMap.set(r.entity.id, r.entity as Surface);
      }
    }
  }

  const categories: PortfolioCategoryLink[] = [...categoryMap.values()]
    .sort(
      (a, b) =>
        b.count - a.count || a.cat.name.localeCompare(b.cat.name, "hu"),
    )
    .map(({ cat, count }) => ({
      id: cat.id,
      name: cat.name,
      href: getEntityHref(cat),
      productCount: count,
    }));

  const technologies: PortfolioTechLink[] = [...techMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "hu"))
    .map((t) => ({
      id: t.id,
      name: t.name,
      href: getEntityHref(t),
    }));

  const surfaces: PortfolioTechLink[] = [...surfaceMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "hu"))
    .map((s) => ({
      id: s.id,
      name: s.name,
      href: getEntityHref(s),
    }));

  const sources = getSourcesByIds([...sourceIdSet]);
  const lastVerifiedAt =
    verifiedDates.sort().at(-1) ??
    sources.map((s) => s.accessedAt).filter(Boolean).sort().at(-1);

  return {
    brand,
    organizations,
    families,
    directProducts,
    allProducts,
    categories,
    technologies,
    surfaces,
    sources,
    lastVerifiedAt,
  };
}

/** Whether this brand should use the rich Brand Hub template. */
export function brandHasHub(brandId: string): boolean {
  const portfolio = getBrandPortfolio(brandId);
  if (!portfolio) return false;
  return (
    portfolio.organizations.length > 0 ||
    portfolio.families.length > 0 ||
    portfolio.allProducts.length > 0
  );
}
