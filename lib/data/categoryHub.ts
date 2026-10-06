/**
 * Category Hub portfolio queries.
 * DIRECT: Product/Family/Brand/Org/Technology/Knowledge/Surface → belongsToCategory → Category.
 * DERIVED: from Category Products only (Family/Brand/Org/Technology/Surface).
 * Keep layers separate — never flatten into one semantic bucket.
 */

import type {
  Brand,
  Category,
  KnowledgeArticle,
  Organization,
  Product,
  ProductFamily,
  Source,
  Surface,
  Technology,
} from "./types";
import {
  getCategoryById,
  getEntityHref,
  getRelatedEntities,
  getSourcesByIds,
} from "./repository";
import {
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
  getCanonicalProductBrand,
  getCanonicalProductFamily,
} from "@/lib/navigation/entityNavigation";
import {
  getSurfacesForProduct,
  getTechnologiesForProduct,
} from "./productHub";

export type CatOrigin = "direct" | "derived" | "both";

export type CatLink = {
  id: string;
  name: string;
  href: string;
};

export type CatCountedLink = CatLink & {
  productCount: number;
};

export type CatOriginLink = CatLink & {
  /** Internal only — never render. */
  origin: CatOrigin;
  productCount?: number;
};

export type CatOrgLink = CatLink & {
  /** Public Hungarian role label — never raw relation type. */
  label: string;
  origin: CatOrigin;
  productCount?: number;
};

export type CatTechLink = CatLink & {
  origin: CatOrigin;
  productCount?: number;
};

export type CatKnowledgeLink = CatLink & {
  note?: string;
};

export type CatProductCard = {
  id: string;
  name: string;
  href: string;
  brandName?: string;
  brandHref?: string;
  familyName?: string;
  familyHref?: string;
  familyId?: string;
};

export type CatProductGroup = {
  familyId?: string;
  familyName?: string;
  familyHref?: string;
  products: CatProductCard[];
};

export type CategoryPortfolio = {
  category: Category;
  products: CatProductCard[];
  productGroups: CatProductGroup[];

  directFamilies: CatOriginLink[];
  directBrands: CatOriginLink[];
  directOrganizations: CatOrgLink[];
  directTechnologies: CatTechLink[];
  knowledge: CatKnowledgeLink[];
  /** Direct Category.sourceIds only — never Product→Category edge sources. */
  sources: Source[];

  derivedFamilies: CatOriginLink[];
  derivedBrands: CatOriginLink[];
  derivedOrganizations: CatOrgLink[];
  derivedTechnologies: CatTechLink[];
  surfaces: CatCountedLink[];

  /** Presentation-ready Families (origin preserved). */
  displayedFamilies: CatOriginLink[];
  /**
   * Presentation Brands split when direct-only and product-derived
   * sets materially differ. Otherwise a single list.
   */
  brandPresentation: {
    mode: "unified" | "split";
    /** Product-derived Brands (may include both when unified). */
    productBrands: CatOriginLink[];
    /** Direct-only Brands not among product Brands (split mode). */
    additionalBrands: CatOriginLink[];
    /** Unified display list when mode === "unified". */
    unified: CatOriginLink[];
  };
  orgPresentation: {
    mode: "unified" | "split";
    productOrgs: CatOrgLink[];
    additionalOrgs: CatOrgLink[];
    unified: CatOrgLink[];
  };
  /** Deduped Technologies (direct + derived). */
  displayedTechnologies: CatTechLink[];
};

function hu(a: string, b: string): number {
  return a.localeCompare(b, "hu");
}

function orgPublicLabel(org: Organization): string {
  const roles = org.roles ?? [];
  if (roles.includes("distributor")) return "Forgalmazó";
  if (roles.includes("representation")) return "Képviselet";
  if (roles.includes("service")) return "Szerviz";
  if (roles.includes("manufacturer")) return "Gyártó";
  return "Szakmai partner";
}

/** Published Products with Product --belongsToCategory--> Category. */
export function getProductsForCategory(categoryId: string): Product[] {
  return getRelatedEntities(categoryId, {
    relationTypes: ["belongsToCategory"],
    direction: "incoming",
  })
    .filter(
      (r) => r.entity.type === "product" && r.entity.status === "published",
    )
    .map((r) => r.entity as Product)
    .sort((a, b) => hu(a.name, b.name));
}

function enrichProduct(p: Product): CatProductCard {
  const brand = getCanonicalProductBrand(p.id);
  const family = getCanonicalProductFamily(p.id);
  return {
    id: p.id,
    name: p.name,
    href: getEntityHref(p),
    brandName: brand?.name,
    brandHref: brand ? getEntityHref(brand) : undefined,
    familyName: family?.name,
    familyHref: family ? getEntityHref(family) : undefined,
    familyId: family?.id,
  };
}

/**
 * Group by ProductFamily when Products >= 4 and >= 2 Families with support.
 * Otherwise flat. Family-less under "Egyéb termékek" only when grouping active.
 */
export function groupCategoryProducts(
  products: CatProductCard[],
): CatProductGroup[] {
  if (!products.length) return [];

  const familyIds = new Set(
    products.map((p) => p.familyId).filter(Boolean) as string[],
  );
  const useGroups = products.length >= 4 && familyIds.size >= 2;

  if (!useGroups) {
    return [{ products: [...products].sort((a, b) => hu(a.name, b.name)) }];
  }

  const byFam = new Map<string, CatProductCard[]>();
  const familyLess: CatProductCard[] = [];
  const famMeta = new Map<string, { name: string; href?: string }>();

  for (const p of products) {
    if (!p.familyId || !p.familyName) {
      familyLess.push(p);
      continue;
    }
    if (!famMeta.has(p.familyId)) {
      famMeta.set(p.familyId, {
        name: p.familyName,
        href: p.familyHref,
      });
    }
    const list = byFam.get(p.familyId) ?? [];
    list.push(p);
    byFam.set(p.familyId, list);
  }

  const groups: CatProductGroup[] = [...byFam.entries()]
    .map(([familyId, list]) => {
      const meta = famMeta.get(familyId)!;
      return {
        familyId,
        familyName: meta.name,
        familyHref: meta.href,
        products: list.sort((a, b) => hu(a.name, b.name)),
      };
    })
    .sort((a, b) => hu(a.familyName!, b.familyName!));

  if (familyLess.length) {
    groups.push({
      familyName: "Egyéb termékek",
      products: familyLess.sort((a, b) => hu(a.name, b.name)),
    });
  }

  return groups;
}

function mergeOriginLink(
  map: Map<string, CatOriginLink>,
  link: CatOriginLink,
) {
  const prev = map.get(link.id);
  if (!prev) {
    map.set(link.id, link);
    return;
  }
  const origin: CatOrigin =
    prev.origin === link.origin ? prev.origin : "both";
  map.set(link.id, {
    ...prev,
    ...link,
    origin,
    productCount:
      Math.max(prev.productCount ?? 0, link.productCount ?? 0) || undefined,
  });
}

function mergeTechLink(map: Map<string, CatTechLink>, link: CatTechLink) {
  const prev = map.get(link.id);
  if (!prev) {
    map.set(link.id, link);
    return;
  }
  const origin: CatOrigin =
    prev.origin === link.origin ? prev.origin : "both";
  map.set(link.id, {
    ...prev,
    ...link,
    origin,
    productCount:
      Math.max(prev.productCount ?? 0, link.productCount ?? 0) || undefined,
  });
}

function mergeOrgLink(map: Map<string, CatOrgLink>, link: CatOrgLink) {
  const prev = map.get(link.id);
  if (!prev) {
    map.set(link.id, link);
    return;
  }
  const origin: CatOrigin =
    prev.origin === link.origin ? prev.origin : "both";
  // Prefer direct org role label when present
  const label =
    prev.origin === "direct" || link.origin !== "direct"
      ? prev.label
      : link.label;
  map.set(link.id, {
    id: link.id,
    name: link.name,
    href: link.href,
    label,
    origin,
    productCount:
      Math.max(prev.productCount ?? 0, link.productCount ?? 0) || undefined,
  });
}

export function getCategoryPortfolio(
  categoryId: string,
): CategoryPortfolio | null {
  if (categoryId === "cat_all") return null;

  const category = getCategoryById(categoryId);
  if (!category || category.status !== "published") return null;

  const incoming = getRelatedEntities(categoryId, {
    relationTypes: ["belongsToCategory"],
    direction: "incoming",
  }).filter((r) => r.entity.status === "published");

  const rawProducts = incoming
    .filter((r) => r.entity.type === "product")
    .map((r) => r.entity as Product)
    .sort((a, b) => hu(a.name, b.name));

  const products = rawProducts.map(enrichProduct);

  const directFamilies: CatOriginLink[] = incoming
    .filter((r) => r.entity.type === "productFamily")
    .map((r) => {
      const f = r.entity as ProductFamily;
      return {
        id: f.id,
        name: f.name,
        href: getEntityHref(f),
        origin: "direct" as const,
      };
    })
    .sort((a, b) => hu(a.name, b.name));

  const directBrands: CatOriginLink[] = incoming
    .filter((r) => r.entity.type === "brand")
    .map((r) => {
      const b = r.entity as Brand;
      return {
        id: b.id,
        name: b.name,
        href: getEntityHref(b),
        origin: "direct" as const,
      };
    })
    .sort((a, b) => hu(a.name, b.name));

  const directOrganizations: CatOrgLink[] = incoming
    .filter((r) => r.entity.type === "organization")
    .map((r) => {
      const o = r.entity as Organization;
      return {
        id: o.id,
        name: o.name,
        href: getEntityHref(o),
        label: orgPublicLabel(o),
        origin: "direct" as const,
      };
    })
    .sort((a, b) => hu(a.name, b.name));

  const directTechnologies: CatTechLink[] = incoming
    .filter((r) => r.entity.type === "technology")
    .map((r) => {
      const t = r.entity as Technology;
      return {
        id: t.id,
        name: t.name,
        href: getEntityHref(t),
        origin: "direct" as const,
      };
    })
    .sort((a, b) => hu(a.name, b.name));

  // Knowledge: belongsToCategory OR documents → Category
  const knowledgeMap = new Map<string, CatKnowledgeLink>();
  for (const r of incoming.filter((x) => x.entity.type === "knowledge")) {
    const k = r.entity as KnowledgeArticle;
    knowledgeMap.set(k.id, {
      id: k.id,
      name: k.name,
      href: getEntityHref(k),
      note: k.shortDescription?.trim() || undefined,
    });
  }
  for (const r of getRelatedEntities(categoryId, {
    relationTypes: ["documents"],
    direction: "incoming",
  })) {
    if (r.entity.type !== "knowledge" || r.entity.status !== "published") {
      continue;
    }
    const k = r.entity as KnowledgeArticle;
    if (!knowledgeMap.has(k.id)) {
      knowledgeMap.set(k.id, {
        id: k.id,
        name: k.name,
        href: getEntityHref(k),
        note: k.shortDescription?.trim() || undefined,
      });
    }
  }
  const knowledge = [...knowledgeMap.values()].sort((a, b) =>
    hu(a.name, b.name),
  );

  const sources = getSourcesByIds(category.sourceIds ?? []);

  // Derived from Products only — pairwise Tech/Surface
  const famCounts = new Map<string, { family: ProductFamily; count: number }>();
  const brandCounts = new Map<string, { brand: Brand; count: number }>();
  const orgCounts = new Map<
    string,
    { org: Organization; label: string; count: number }
  >();
  const techCounts = new Map<string, { tech: Technology; count: number }>();
  const surfCounts = new Map<string, { surface: Surface; count: number }>();

  for (const p of rawProducts) {
    const family = getCanonicalProductFamily(p.id);
    if (family) {
      const prev = famCounts.get(family.id);
      famCounts.set(family.id, {
        family,
        count: (prev?.count ?? 0) + 1,
      });
    }

    const brand = getCanonicalProductBrand(p.id);
    if (brand) {
      const prev = brandCounts.get(brand.id);
      brandCounts.set(brand.id, {
        brand,
        count: (prev?.count ?? 0) + 1,
      });
      const owner = getCanonicalBrandOwner(brand.id);
      if (owner) {
        const prevO = orgCounts.get(owner.id);
        orgCounts.set(owner.id, {
          org: owner,
          label: "Tulajdonos",
          count: (prevO?.count ?? 0) + 1,
        });
      }
    } else if (family) {
      const mfr = getCanonicalFamilyManufacturer(family.id);
      if (mfr) {
        const prevO = orgCounts.get(mfr.id);
        orgCounts.set(mfr.id, {
          org: mfr,
          label: "Gyártó",
          count: (prevO?.count ?? 0) + 1,
        });
      }
    }

    for (const t of getTechnologiesForProduct(p.id)) {
      const related = getRelatedEntities(p.id, {
        relationTypes: ["usesTechnology"],
        direction: "outgoing",
      }).find((r) => r.entity.id === t.id);
      if (!related || related.entity.type !== "technology") continue;
      const tech = related.entity as Technology;
      const prev = techCounts.get(tech.id);
      techCounts.set(tech.id, { tech, count: (prev?.count ?? 0) + 1 });
    }

    for (const s of getSurfacesForProduct(p.id)) {
      const related = getRelatedEntities(p.id, {
        relationTypes: ["applicableToSurface"],
        direction: "outgoing",
      }).find((r) => r.entity.id === s.id);
      if (!related || related.entity.type !== "surface") continue;
      const surface = related.entity as Surface;
      const prev = surfCounts.get(surface.id);
      surfCounts.set(surface.id, {
        surface,
        count: (prev?.count ?? 0) + 1,
      });
    }
  }

  const derivedFamilies: CatOriginLink[] = [...famCounts.values()]
    .map(({ family, count }) => ({
      id: family.id,
      name: family.name,
      href: getEntityHref(family),
      origin: "derived" as const,
      productCount: count,
    }))
    .sort((a, b) => hu(a.name, b.name));

  const derivedBrands: CatOriginLink[] = [...brandCounts.values()]
    .map(({ brand, count }) => ({
      id: brand.id,
      name: brand.name,
      href: getEntityHref(brand),
      origin: "derived" as const,
      productCount: count,
    }))
    .sort((a, b) => hu(a.name, b.name));

  const derivedOrganizations: CatOrgLink[] = [...orgCounts.values()]
    .map(({ org, label, count }) => ({
      id: org.id,
      name: org.name,
      href: getEntityHref(org),
      label,
      origin: "derived" as const,
      productCount: count,
    }))
    .sort((a, b) => hu(a.name, b.name));

  const derivedTechnologies: CatTechLink[] = [...techCounts.values()]
    .map(({ tech, count }) => ({
      id: tech.id,
      name: tech.name,
      href: getEntityHref(tech),
      origin: "derived" as const,
      productCount: count,
    }))
    .sort((a, b) => hu(a.name, b.name));

  const surfaces: CatCountedLink[] = [...surfCounts.values()]
    .map(({ surface, count }) => ({
      id: surface.id,
      name: surface.name,
      href: getEntityHref(surface),
      productCount: count,
    }))
    .sort((a, b) => b.productCount - a.productCount || hu(a.name, b.name));

  // Displayed Families
  const famDisplay = new Map<string, CatOriginLink>();
  for (const f of derivedFamilies) mergeOriginLink(famDisplay, f);
  for (const f of directFamilies) mergeOriginLink(famDisplay, f);
  const displayedFamilies = [...famDisplay.values()].sort((a, b) =>
    hu(a.name, b.name),
  );

  // Brand presentation: split when direct-only brands exist alongside product brands
  const derivedBrandIds = new Set(derivedBrands.map((b) => b.id));
  const additionalBrands = directBrands.filter(
    (b) => !derivedBrandIds.has(b.id),
  );
  const brandMode: "unified" | "split" =
    derivedBrands.length > 0 && additionalBrands.length > 0
      ? "split"
      : "unified";

  const brandUnifiedMap = new Map<string, CatOriginLink>();
  for (const b of derivedBrands) mergeOriginLink(brandUnifiedMap, b);
  for (const b of directBrands) mergeOriginLink(brandUnifiedMap, b);
  const brandUnified = [...brandUnifiedMap.values()].sort((a, b) =>
    hu(a.name, b.name),
  );

  const brandPresentation: CategoryPortfolio["brandPresentation"] = {
    mode: brandMode,
    productBrands: [...derivedBrands].sort((a, b) => hu(a.name, b.name)),
    additionalBrands: [...additionalBrands].sort((a, b) => hu(a.name, b.name)),
    unified: brandUnified,
  };

  // Org presentation: same split logic
  const derivedOrgIds = new Set(derivedOrganizations.map((o) => o.id));
  const additionalOrgs = directOrganizations.filter(
    (o) => !derivedOrgIds.has(o.id),
  );
  const orgMode: "unified" | "split" =
    derivedOrganizations.length > 0 && additionalOrgs.length > 0
      ? "split"
      : "unified";

  const orgUnifiedMap = new Map<string, CatOrgLink>();
  for (const o of derivedOrganizations) mergeOrgLink(orgUnifiedMap, o);
  for (const o of directOrganizations) mergeOrgLink(orgUnifiedMap, o);
  const orgUnified = [...orgUnifiedMap.values()].sort((a, b) =>
    hu(a.name, b.name),
  );

  const orgPresentation: CategoryPortfolio["orgPresentation"] = {
    mode: orgMode,
    productOrgs: [...derivedOrganizations].sort((a, b) => hu(a.name, b.name)),
    additionalOrgs: [...additionalOrgs].sort((a, b) => hu(a.name, b.name)),
    unified: orgUnified,
  };

  // Technologies: merge direct + derived
  const techDisplay = new Map<string, CatTechLink>();
  for (const t of derivedTechnologies) mergeTechLink(techDisplay, t);
  for (const t of directTechnologies) mergeTechLink(techDisplay, t);
  const displayedTechnologies = [...techDisplay.values()].sort((a, b) =>
    hu(a.name, b.name),
  );

  return {
    category,
    products,
    productGroups: groupCategoryProducts(products),
    directFamilies,
    directBrands,
    directOrganizations,
    directTechnologies,
    knowledge,
    sources,
    derivedFamilies,
    derivedBrands,
    derivedOrganizations,
    derivedTechnologies,
    surfaces,
    displayedFamilies,
    brandPresentation,
    orgPresentation,
    displayedTechnologies,
  };
}
