/**
 * Technology Hub portfolio queries.
 * DIRECT: Product/Family/Brand/Org → usesTechnology → Technology; Knowledge documents.
 * DERIVED: from Products only (Family/Brand/Org/Category/Surface).
 * Keep layers separate — never flatten into one bucket.
 */

import type {
  Brand,
  Category,
  KnowledgeArticle,
  Organization,
  OrganizationRole,
  Product,
  ProductFamily,
  Source,
  Surface,
  Technology,
} from "./types";
import {
  getEntityHref,
  getRelatedEntities,
  getSourcesByIds,
  getTechnologyById,
} from "./repository";
import {
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
  getCanonicalProductBrand,
  getCanonicalProductFamily,
} from "@/lib/navigation/entityNavigation";
import { getCategoriesForProduct, getSurfacesForProduct } from "./productHub";

export type TechProductCard = {
  id: string;
  name: string;
  href: string;
  brandName?: string;
  brandHref?: string;
  familyName?: string;
  familyHref?: string;
  primaryCategoryId?: string;
  primaryCategoryName?: string;
};

export type TechProductGroup = {
  categoryId?: string;
  categoryName?: string;
  categoryHref?: string;
  products: TechProductCard[];
};

export type TechLink = {
  id: string;
  name: string;
  href: string;
};

export type TechCountedLink = TechLink & {
  productCount: number;
};

export type TechOrgLink = TechLink & {
  /** Public Hungarian role label — never raw relation type. */
  label: string;
};

export type TechKnowledgeLink = TechLink & {
  note?: string;
};

export type TechOrigin = "direct" | "derived" | "both";

export type TechFamilyLink = TechLink & {
  /** Internal only — never render. */
  origin: TechOrigin;
  productCount?: number;
};

export type TechBrandLink = TechLink & {
  origin: TechOrigin;
  productCount?: number;
};

export type TechnologyPortfolio = {
  technology: Technology;
  products: TechProductCard[];
  productGroups: TechProductGroup[];

  directFamilies: TechFamilyLink[];
  directBrands: TechBrandLink[];
  directOrganizations: TechOrgLink[];
  knowledge: TechKnowledgeLink[];
  /** Direct Technology.sourceIds only — never Product→Tech edge sources. */
  sources: Source[];

  derivedFamilies: TechFamilyLink[];
  derivedBrands: TechBrandLink[];
  derivedOrganizations: TechOrgLink[];
  categories: TechCountedLink[];
  surfaces: TechCountedLink[];

  /** Presentation-ready deduped Families (direct wins). */
  displayedFamilies: TechFamilyLink[];
  /** Presentation-ready deduped Brands (direct wins). */
  displayedBrands: TechBrandLink[];
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

/** Published Products with Product --usesTechnology--> Technology. */
export function getProductsForTechnology(technologyId: string): Product[] {
  return getRelatedEntities(technologyId, {
    relationTypes: ["usesTechnology"],
    direction: "incoming",
  })
    .filter(
      (r) => r.entity.type === "product" && r.entity.status === "published",
    )
    .map((r) => r.entity as Product)
    .sort((a, b) => hu(a.name, b.name));
}

function enrichProduct(p: Product): TechProductCard {
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

export function groupTechnologyProducts(
  products: TechProductCard[],
): TechProductGroup[] {
  if (!products.length) return [];

  const categoryIds = new Set(
    products
      .map((p) => p.primaryCategoryId)
      .filter(Boolean) as string[],
  );
  const useGroups = products.length >= 4 && categoryIds.size >= 2;

  if (!useGroups) {
    return [{ products: [...products].sort((a, b) => hu(a.name, b.name)) }];
  }

  const byCat = new Map<string, TechProductCard[]>();
  const uncategorized: TechProductCard[] = [];
  const catMeta = new Map<string, { name: string; href?: string }>();

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
        href: match?.href,
      });
    }
    const list = byCat.get(p.primaryCategoryId) ?? [];
    list.push(p);
    byCat.set(p.primaryCategoryId, list);
  }

  const groups: TechProductGroup[] = [...byCat.entries()]
    .map(([categoryId, list]) => {
      const meta = catMeta.get(categoryId)!;
      return {
        categoryId,
        categoryName: meta.name,
        categoryHref: meta.href,
        products: list.sort((a, b) => hu(a.name, b.name)),
      };
    })
    .sort((a, b) => hu(a.categoryName!, b.categoryName!));

  if (uncategorized.length) {
    groups.push({
      products: uncategorized.sort((a, b) => hu(a.name, b.name)),
    });
  }

  return groups;
}

function mergeOrigin(
  map: Map<string, TechFamilyLink | TechBrandLink>,
  id: string,
  link: TechFamilyLink | TechBrandLink,
) {
  const prev = map.get(id);
  if (!prev) {
    map.set(id, link);
    return;
  }
  const origin: TechOrigin =
    prev.origin === link.origin
      ? prev.origin
      : prev.origin === "both" || link.origin === "both"
        ? "both"
        : "both";
  map.set(id, {
    ...prev,
    ...link,
    origin,
    // Prefer direct presentation fields; keep higher productCount if any
    productCount: Math.max(prev.productCount ?? 0, link.productCount ?? 0) || undefined,
  });
}

export function getTechnologyPortfolio(
  technologyId: string,
): TechnologyPortfolio | null {
  const technology = getTechnologyById(technologyId);
  if (!technology || technology.status !== "published") return null;

  const incoming = getRelatedEntities(technologyId, {
    relationTypes: ["usesTechnology"],
    direction: "incoming",
  }).filter((r) => r.entity.status === "published");

  const rawProducts = incoming
    .filter((r) => r.entity.type === "product")
    .map((r) => r.entity as Product)
    .sort((a, b) => hu(a.name, b.name));

  const products = rawProducts.map(enrichProduct);

  const directFamilies: TechFamilyLink[] = incoming
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

  const directBrands: TechBrandLink[] = incoming
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

  const directOrganizations: TechOrgLink[] = incoming
    .filter((r) => r.entity.type === "organization")
    .map((r) => {
      const o = r.entity as Organization;
      return {
        id: o.id,
        name: o.name,
        href: getEntityHref(o),
        label: orgPublicLabel(o),
      };
    })
    .sort((a, b) => hu(a.name, b.name));

  const knowledge = getRelatedEntities(technologyId, {
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
    .sort((a, b) => hu(a.name, b.name));

  const sources = getSourcesByIds(technology.sourceIds ?? []);

  // Derived from Products
  const famCounts = new Map<string, { family: ProductFamily; count: number }>();
  const brandCounts = new Map<string, { brand: Brand; count: number }>();
  const orgCounts = new Map<
    string,
    { org: Organization; label: string; count: number }
  >();
  const catCounts = new Map<string, { cat: Category; count: number }>();
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

    for (const c of getCategoriesForProduct(p.id)) {
      const related = getRelatedEntities(p.id, {
        relationTypes: ["belongsToCategory"],
        direction: "outgoing",
      }).find((r) => r.entity.id === c.id);
      if (!related || related.entity.type !== "category") continue;
      const cat = related.entity as Category;
      if (cat.id === "cat_all") continue;
      const prev = catCounts.get(cat.id);
      catCounts.set(cat.id, { cat, count: (prev?.count ?? 0) + 1 });
    }

    // Pairwise Surface: same Product must have both Tech and Surface edges
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

  const derivedFamilies: TechFamilyLink[] = [...famCounts.values()]
    .map(({ family, count }) => ({
      id: family.id,
      name: family.name,
      href: getEntityHref(family),
      origin: "derived" as const,
      productCount: count,
    }))
    .sort((a, b) => hu(a.name, b.name));

  const derivedBrands: TechBrandLink[] = [...brandCounts.values()]
    .map(({ brand, count }) => ({
      id: brand.id,
      name: brand.name,
      href: getEntityHref(brand),
      origin: "derived" as const,
      productCount: count,
    }))
    .sort((a, b) => hu(a.name, b.name));

  const derivedOrganizations: TechOrgLink[] = [...orgCounts.values()]
    .map(({ org, label }) => ({
      id: org.id,
      name: org.name,
      href: getEntityHref(org),
      label,
    }))
    .sort((a, b) => hu(a.name, b.name));

  const categories: TechCountedLink[] = [...catCounts.values()]
    .map(({ cat, count }) => ({
      id: cat.id,
      name: cat.name,
      href: getEntityHref(cat),
      productCount: count,
    }))
    .sort((a, b) => b.productCount - a.productCount || hu(a.name, b.name));

  const surfaces: TechCountedLink[] = [...surfCounts.values()]
    .map(({ surface, count }) => ({
      id: surface.id,
      name: surface.name,
      href: getEntityHref(surface),
      productCount: count,
    }))
    .sort((a, b) => b.productCount - a.productCount || hu(a.name, b.name));

  // Displayed Families / Brands: direct priority, dedupe by ID
  const famDisplay = new Map<string, TechFamilyLink>();
  for (const f of derivedFamilies) mergeOrigin(famDisplay, f.id, f);
  for (const f of directFamilies) mergeOrigin(famDisplay, f.id, f);
  // Re-assert direct origin wins for presentation flag
  for (const f of directFamilies) {
    const cur = famDisplay.get(f.id)!;
    famDisplay.set(f.id, {
      ...cur,
      origin:
        cur.origin === "derived" || cur.origin === "both" ? "both" : "direct",
    });
  }

  const brandDisplay = new Map<string, TechBrandLink>();
  for (const b of derivedBrands) mergeOrigin(brandDisplay, b.id, b);
  for (const b of directBrands) mergeOrigin(brandDisplay, b.id, b);
  for (const b of directBrands) {
    const cur = brandDisplay.get(b.id)!;
    brandDisplay.set(b.id, {
      ...cur,
      origin:
        cur.origin === "derived" || cur.origin === "both" ? "both" : "direct",
    });
  }

  return {
    technology,
    products,
    productGroups: groupTechnologyProducts(products),
    directFamilies,
    directBrands,
    directOrganizations,
    knowledge,
    sources,
    derivedFamilies,
    derivedBrands,
    derivedOrganizations,
    categories,
    surfaces,
    displayedFamilies: [...famDisplay.values()].sort((a, b) =>
      hu(a.name, b.name),
    ),
    displayedBrands: [...brandDisplay.values()].sort((a, b) =>
      hu(a.name, b.name),
    ),
  };
}
