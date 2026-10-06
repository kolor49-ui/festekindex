/**
 * Entity Navigation Standard v1 — canonical hierarchy resolver.
 *
 * Hierarchy (when graph supports it deterministically):
 *   Organization ↔ Brand ↔ ProductFamily ↔ Product
 *
 * Breadcrumb parents use only unambiguous ownership/manufacture edges.
 * Distributor / representation / service relations are NEVER breadcrumb parents.
 *
 * No Festék Bázis / VALMOR hardcoding — repository relations only.
 */

import type {
  AnyEntity,
  Brand,
  Organization,
  Product,
  ProductFamily,
} from "@/lib/data/types";
import {
  getBrandById,
  getEntityHref,
  getOwnerOrganization,
  getRelatedEntities,
  TYPE_PATH,
} from "@/lib/data/repository";
import { getBrandForProductFamily } from "@/lib/data/organizationPortfolio";

export type NavCrumb = {
  name: string;
  path: string;
};

export type NavContextItem = {
  /** User-facing label (Márka, Termékcsalád, Tulajdonos, …) — never relation type ids. */
  label: string;
  name: string;
  href: string;
};

export type EntityNavigation = {
  breadcrumbs: NavCrumb[];
  /** Compact “Kapcsolódás” rows for deep pages. Empty when not applicable. */
  contextItems: NavContextItem[];
  /** Whether EntityDetailPage should render the context block. */
  showContextNav: boolean;
};

type HierarchyParents = {
  organization?: Organization;
  /** owns → Tulajdonos; manufactures-only → Gyártó */
  organizationRole?: "owner" | "manufacturer";
  brand?: Brand;
  family?: ProductFamily;
};

/** Relation types that may establish Brand → Organization hierarchy parent. */
const BRAND_OWNER_RELATIONS = ["owns"] as const;

/**
 * Deterministic owner Organization for a Brand.
 * Only Organization --owns--> Brand. Never distributes / represents / services.
 * If multiple owners exist → ambiguous → undefined.
 */
export function getCanonicalBrandOwner(
  brandId: string,
): Organization | undefined {
  const owners = getRelatedEntities(brandId, {
    relationTypes: [...BRAND_OWNER_RELATIONS],
    direction: "incoming",
  }).filter(
    (r) =>
      r.entity.type === "organization" && r.entity.status === "published",
  );

  if (owners.length !== 1) return undefined;
  return owners[0].entity as Organization;
}

/**
 * Manufacturer Organization for a ProductFamily via Organization --manufactures-->.
 * Only when exactly one published manufacturer.
 */
export function getCanonicalFamilyManufacturer(
  familyId: string,
): Organization | undefined {
  const mfrs = getRelatedEntities(familyId, {
    relationTypes: ["manufactures"],
    direction: "incoming",
  }).filter(
    (r) =>
      r.entity.type === "organization" && r.entity.status === "published",
  );
  if (mfrs.length !== 1) return undefined;
  return mfrs[0].entity as Organization;
}

/** ProductFamily parent via ProductFamily --hasProduct--> Product (incoming). */
export function getCanonicalProductFamily(
  productId: string,
): ProductFamily | undefined {
  const parents = getRelatedEntities(productId, {
    relationTypes: ["hasProduct"],
    direction: "incoming",
  }).filter(
    (r) =>
      r.entity.type === "productFamily" && r.entity.status === "published",
  );
  if (parents.length !== 1) return undefined;
  return parents[0].entity as ProductFamily;
}

/**
 * Brand for a Product:
 * 1) via unique ProductFamily → Brand --hasProductFamily-->
 * 2) else via unique Brand --hasProduct--> Product
 * Ambiguous (0 or >1) → undefined.
 */
export function getCanonicalProductBrand(
  productId: string,
): Brand | undefined {
  const family = getCanonicalProductFamily(productId);
  if (family) {
    const brand = getBrandForProductFamily(family.id);
    return brand?.status === "published" ? brand : undefined;
  }

  const brands = getRelatedEntities(productId, {
    relationTypes: ["hasProduct"],
    direction: "incoming",
  }).filter(
    (r) => r.entity.type === "brand" && r.entity.status === "published",
  );
  if (brands.length !== 1) return undefined;
  return brands[0].entity as Brand;
}

function resolveOrganizationForBrand(brand: Brand): {
  organization?: Organization;
  organizationRole?: "owner" | "manufacturer";
} {
  const owner = getCanonicalBrandOwner(brand.id);
  if (owner) {
    return { organization: owner, organizationRole: "owner" };
  }
  return {};
}

/**
 * Resolve hierarchy parents for portfolio entities.
 * Never invents parents; skips ambiguous graph forks.
 */
export function resolveHierarchyParents(
  entity: AnyEntity,
): HierarchyParents {
  if (entity.type === "organization") {
    return {};
  }

  if (entity.type === "brand") {
    return resolveOrganizationForBrand(entity as Brand);
  }

  if (entity.type === "productFamily") {
    const family = entity as ProductFamily;
    const brand = getBrandForProductFamily(family.id);
    const publishedBrand =
      brand?.status === "published" ? brand : undefined;

    // Prefer Brand → owns → Org for hierarchy. Fallback: unique manufactures.
    if (publishedBrand) {
      const viaBrand = resolveOrganizationForBrand(publishedBrand);
      if (viaBrand.organization) {
        return {
          brand: publishedBrand,
          family,
          organization: viaBrand.organization,
          organizationRole: viaBrand.organizationRole,
        };
      }
    }

    const mfr = getCanonicalFamilyManufacturer(family.id);
    if (mfr) {
      return {
        brand: publishedBrand,
        family,
        organization: mfr,
        organizationRole: "manufacturer",
      };
    }

    return { brand: publishedBrand, family };
  }

  if (entity.type === "product") {
    const product = entity as Product;
    const family = getCanonicalProductFamily(product.id);
    const brand = getCanonicalProductBrand(product.id);

    if (brand) {
      const viaBrand = resolveOrganizationForBrand(brand);
      return {
        brand,
        family,
        organization: viaBrand.organization,
        organizationRole: viaBrand.organizationRole,
      };
    }

    // Family without resolvable brand — still may have manufacturer
    if (family) {
      const mfr = getCanonicalFamilyManufacturer(family.id);
      return {
        family,
        organization: mfr,
        organizationRole: mfr ? "manufacturer" : undefined,
      };
    }

    return {};
  }

  return {};
}

function listCrumb(entity: AnyEntity): NavCrumb {
  const path = `/${TYPE_PATH[entity.type]}`;
  const labels: Partial<Record<AnyEntity["type"], string>> = {
    organization: "Cégek",
    brand: "Márkák",
    productFamily: "Termékcsaládok",
    product: "Termékek",
    technology: "Technológiák",
    category: "Kategóriák",
    knowledge: "Tudástár",
    surface: "Felületek",
    comparison: "Összehasonlítások",
  };
  return {
    name: labels[entity.type] ?? "Index",
    path,
  };
}

function orgRoleLabel(role: "owner" | "manufacturer" | undefined): string {
  if (role === "manufacturer") return "Gyártó";
  return "Tulajdonos";
}

function dedupeCrumbs(crumbs: NavCrumb[]): NavCrumb[] {
  const seen = new Set<string>();
  const out: NavCrumb[] = [];
  for (const c of crumbs) {
    if (seen.has(c.path)) continue;
    seen.add(c.path);
    out.push(c);
  }
  return out;
}

function buildPortfolioBreadcrumbs(
  entity: AnyEntity,
  parents: HierarchyParents,
): NavCrumb[] {
  const crumbs: NavCrumb[] = [{ name: "FESTÉKINDEX", path: "/" }];

  if (entity.type === "organization") {
    crumbs.push(listCrumb(entity));
    crumbs.push({ name: entity.name, path: getEntityHref(entity) });
    return dedupeCrumbs(crumbs);
  }

  if (entity.type === "brand") {
    // Preserve /markak index navigation; owner lives in Brand Hub context section.
    crumbs.push(listCrumb(entity));
    crumbs.push({ name: entity.name, path: getEntityHref(entity) });
    return dedupeCrumbs(crumbs);
  }

  if (entity.type === "productFamily" || entity.type === "product") {
    if (parents.organization) {
      crumbs.push({
        name: parents.organization.name,
        path: getEntityHref(parents.organization),
      });
    }
    if (parents.brand) {
      crumbs.push({
        name: parents.brand.name,
        path: getEntityHref(parents.brand),
      });
    }
    if (entity.type === "product" && parents.family) {
      crumbs.push({
        name: parents.family.name,
        path: getEntityHref(parents.family),
      });
    }
    crumbs.push({ name: entity.name, path: getEntityHref(entity) });
    return dedupeCrumbs(crumbs);
  }

  // Other entity types: index list + self
  crumbs.push(listCrumb(entity));
  crumbs.push({ name: entity.name, path: getEntityHref(entity) });
  return dedupeCrumbs(crumbs);
}

function buildContextItems(
  entity: AnyEntity,
  parents: HierarchyParents,
): NavContextItem[] {
  const items: NavContextItem[] = [];

  if (entity.type === "product") {
    if (parents.brand) {
      items.push({
        label: "Márka",
        name: parents.brand.name,
        href: getEntityHref(parents.brand),
      });
    }
    if (parents.family) {
      items.push({
        label: "Termékcsalád",
        name: parents.family.name,
        href: getEntityHref(parents.family),
      });
    }
    if (parents.organization) {
      items.push({
        label: orgRoleLabel(parents.organizationRole),
        name: parents.organization.name,
        href: getEntityHref(parents.organization),
      });
    }
    return items;
  }

  if (entity.type === "productFamily") {
    if (parents.brand) {
      items.push({
        label: "Márka",
        name: parents.brand.name,
        href: getEntityHref(parents.brand),
      });
    }
    if (parents.organization) {
      items.push({
        label: orgRoleLabel(parents.organizationRole),
        name: parents.organization.name,
        href: getEntityHref(parents.organization),
      });
    }
    return items;
  }

  // Brand / Organization / others: no separate context block
  // (Brand Hub already renders Tulajdonos / Gyártó)
  return items;
}

/**
 * Full navigation model for any entity page.
 * Visible breadcrumb and JSON-LD BreadcrumbList must both use `breadcrumbs`.
 */
export function getEntityNavigation(entity: AnyEntity): EntityNavigation {
  const parents = resolveHierarchyParents(entity);
  const breadcrumbs = buildPortfolioBreadcrumbs(entity, parents);
  const contextItems = buildContextItems(entity, parents);

  const showContextNav =
    (entity.type === "product" || entity.type === "productFamily") &&
    contextItems.length > 0;

  return {
    breadcrumbs,
    contextItems,
    showContextNav,
  };
}

/** Convenience: crumbs only (hub models / metadata). */
export function getEntityBreadcrumb(entity: AnyEntity): NavCrumb[] {
  return getEntityNavigation(entity).breadcrumbs;
}

/** Convenience: context rows only. */
export function getEntityContext(entity: AnyEntity): NavContextItem[] {
  return getEntityNavigation(entity).contextItems;
}

/** Re-export for callers that resolve owner without duplicating owns logic. */
export { getOwnerOrganization, getBrandById };
