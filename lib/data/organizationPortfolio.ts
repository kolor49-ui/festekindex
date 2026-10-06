/**
 * Generic organization portfolio queries — derived from relations only.
 * No Festék Bázis-specific hardcoding; usable for any manufacturer org hub.
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
  getEntityHref,
  getRelatedEntities,
  getSourcesByIds,
  getOrganizationById,
} from "./repository";

export type PortfolioProductLink = {
  id: string;
  name: string;
  href: string;
  slug: string;
};

export type PortfolioFamilyCard = {
  id: string;
  name: string;
  href: string;
  /** Parent brand if hasProductFamily exists; null for org-only families (e.g. 7016). */
  brandName?: string;
  brandHref?: string;
  /** Verified short description only — never invented. */
  description?: string;
  productCount: number;
  products: PortfolioProductLink[];
};

export type PortfolioBrandGroup = {
  brand: Brand;
  href: string;
  families: PortfolioFamilyCard[];
  /** Products linked Brand --hasProduct--> (no family). */
  directProducts: PortfolioProductLink[];
};

export type PortfolioCategoryLink = {
  id: string;
  name: string;
  href: string;
  productCount: number;
};

export type PortfolioTechLink = {
  id: string;
  name: string;
  href: string;
};

export type OrganizationPortfolio = {
  organization: Organization;
  /** Published brands via owns (draft/candidate brands excluded). */
  ownedBrands: Brand[];
  brandGroups: PortfolioBrandGroup[];
  /** Manufactured families not under an owned published brand (e.g. pf_7016). */
  orphanFamilies: PortfolioFamilyCard[];
  /** All products in the portfolio (deduped by id). */
  allProducts: PortfolioProductLink[];
  categories: PortfolioCategoryLink[];
  technologies: PortfolioTechLink[];
  surfaces: PortfolioTechLink[];
  sources: Source[];
  lastVerifiedAt?: string;
};

function publishedProduct(entity: { type: string; status: string }): boolean {
  return entity.type === "product" && entity.status === "published";
}

function productLink(p: Product): PortfolioProductLink {
  return {
    id: p.id,
    name: p.name,
    href: getEntityHref(p),
    slug: p.slug,
  };
}

function familyDescription(family: ProductFamily): string | undefined {
  const short = family.shortDescription?.trim() ?? "";
  // Structural importer defaults — hide from hub cards
  if (!short) return undefined;
  if (short.includes("a FESTÉKINDEX adatbázisában")) return undefined;
  return short;
}

/** Published brands owned by the organization (owns only — not distributes). */
export function getOwnedPublishedBrands(orgId: string): Brand[] {
  return getRelatedEntities(orgId, {
    relationTypes: ["owns"],
    direction: "outgoing",
  })
    .filter(
      (r) => r.entity.type === "brand" && r.entity.status === "published",
    )
    .map((r) => r.entity as Brand);
}

/** ProductFamilies manufactured by the organization. */
export function getManufacturedProductFamilies(
  orgId: string,
): ProductFamily[] {
  return getRelatedEntities(orgId, {
    relationTypes: ["manufactures"],
    direction: "outgoing",
  })
    .filter(
      (r) =>
        r.entity.type === "productFamily" && r.entity.status === "published",
    )
    .map((r) => r.entity as ProductFamily);
}

/** Brand parent of a product family (incoming hasProductFamily). */
export function getBrandForProductFamily(
  familyId: string,
): Brand | undefined {
  const related = getRelatedEntities(familyId, {
    relationTypes: ["hasProductFamily"],
    direction: "incoming",
  });
  const brand = related.find(
    (r) => r.entity.type === "brand" && r.entity.status === "published",
  )?.entity;
  return brand as Brand | undefined;
}

/** Products under a product family. */
export function getProductsForProductFamily(familyId: string): Product[] {
  return getRelatedEntities(familyId, {
    relationTypes: ["hasProduct"],
    direction: "outgoing",
  })
    .filter((r) => publishedProduct(r.entity))
    .map((r) => r.entity as Product);
}

/** Orphan products: Brand --hasProduct--> Product (no family edge required). */
export function getDirectProductsForBrand(brandId: string): Product[] {
  return getRelatedEntities(brandId, {
    relationTypes: ["hasProduct"],
    direction: "outgoing",
  })
    .filter((r) => publishedProduct(r.entity))
    .map((r) => r.entity as Product);
}

function toFamilyCard(family: ProductFamily): PortfolioFamilyCard {
  const brand = getBrandForProductFamily(family.id);
  const products = getProductsForProductFamily(family.id).map(productLink);
  return {
    id: family.id,
    name: family.name,
    href: getEntityHref(family),
    brandName: brand?.name,
    brandHref: brand ? getEntityHref(brand) : undefined,
    description: familyDescription(family),
    productCount: products.length,
    products,
  };
}

/**
 * Full manufacturer portfolio graph for an organization hub.
 * Aggregates categories / technologies / surfaces from portfolio products (deduped by id).
 */
export function getOrganizationPortfolio(
  orgId: string,
): OrganizationPortfolio | null {
  const organization = getOrganizationById(orgId);
  if (!organization || organization.status !== "published") return null;

  const ownedBrands = getOwnedPublishedBrands(orgId);
  const ownedBrandIds = new Set(ownedBrands.map((b) => b.id));

  const manufacturedFamilies = getManufacturedProductFamilies(orgId);
  const familiesByBrand = new Map<string, ProductFamily[]>();
  const orphanFamilyEntities: ProductFamily[] = [];

  for (const family of manufacturedFamilies) {
    const brand = getBrandForProductFamily(family.id);
    if (brand && ownedBrandIds.has(brand.id)) {
      const list = familiesByBrand.get(brand.id) ?? [];
      list.push(family);
      familiesByBrand.set(brand.id, list);
    } else {
      orphanFamilyEntities.push(family);
    }
  }

  // Also include families owned via Brand --hasProductFamily--> even if manufactures missing
  for (const brand of ownedBrands) {
    const viaBrand = getRelatedEntities(brand.id, {
      relationTypes: ["hasProductFamily"],
      direction: "outgoing",
    })
      .filter(
        (r) =>
          r.entity.type === "productFamily" &&
          r.entity.status === "published",
      )
      .map((r) => r.entity as ProductFamily);
    const existing = familiesByBrand.get(brand.id) ?? [];
    const seen = new Set(existing.map((f) => f.id));
    for (const f of viaBrand) {
      if (!seen.has(f.id)) {
        existing.push(f);
        seen.add(f.id);
      }
    }
    familiesByBrand.set(brand.id, existing);
  }

  const brandGroups: PortfolioBrandGroup[] = ownedBrands.map((brand) => {
    const families = (familiesByBrand.get(brand.id) ?? []).map(toFamilyCard);
    const familyProductIds = new Set(
      families.flatMap((f) => f.products.map((p) => p.id)),
    );
    const directProducts = getDirectProductsForBrand(brand.id)
      .filter((p) => !familyProductIds.has(p.id))
      .map(productLink);
    return {
      brand,
      href: getEntityHref(brand),
      families,
      directProducts,
    };
  });

  const orphanFamilies = orphanFamilyEntities.map(toFamilyCard);

  const productMap = new Map<string, Product>();
  for (const group of brandGroups) {
    for (const f of group.families) {
      for (const pl of f.products) {
        const raw = getProductsForProductFamily(f.id).find((p) => p.id === pl.id);
        if (raw) productMap.set(raw.id, raw);
      }
    }
    for (const pl of group.directProducts) {
      const raw = getDirectProductsForBrand(group.brand.id).find(
        (p) => p.id === pl.id,
      );
      if (raw) productMap.set(raw.id, raw);
    }
  }
  for (const f of orphanFamilies) {
    for (const p of getProductsForProductFamily(f.id)) {
      productMap.set(p.id, p);
    }
  }

  const allProducts = [...productMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "hu"))
    .map(productLink);

  // Categories / tech / surfaces from products — dedupe by entity id
  const categoryMap = new Map<string, { cat: Category; count: number }>();
  const techMap = new Map<string, Technology>();
  const surfaceMap = new Map<string, Surface>();
  const sourceIdSet = new Set<string>();
  const verifiedDates: string[] = [];

  if (organization.verifiedAt) verifiedDates.push(organization.verifiedAt);
  for (const id of organization.sourceIds) sourceIdSet.add(id);

  for (const product of productMap.values()) {
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

  // Collect sourceIds from active relations touching portfolio entities
  for (const group of brandGroups) {
    for (const id of group.brand.sourceIds) sourceIdSet.add(id);
  }

  const categories: PortfolioCategoryLink[] = [...categoryMap.values()]
    .sort((a, b) => b.count - a.count || a.cat.name.localeCompare(b.cat.name, "hu"))
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
    organization,
    ownedBrands,
    brandGroups,
    orphanFamilies,
    allProducts,
    categories,
    technologies,
    surfaces,
    sources,
    lastVerifiedAt,
  };
}

/** Whether this org should use the rich manufacturer hub template. */
export function organizationHasManufacturerHub(orgId: string): boolean {
  const portfolio = getOrganizationPortfolio(orgId);
  if (!portfolio) return false;
  return (
    portfolio.ownedBrands.length > 0 ||
    portfolio.orphanFamilies.length > 0 ||
    portfolio.allProducts.length > 0
  );
}
