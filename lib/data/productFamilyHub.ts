/**
 * ProductFamily portfolio queries for ProductFamily Hub.
 * Aggregates categories / technologies / surfaces from family products (deduped).
 */

import type {
  Category,
  KnowledgeArticle,
  Product,
  ProductFamily,
  Source,
  Surface,
  Technology,
} from "./types";
import {
  getEntityHref,
  getProductFamilyById,
  getRelatedEntities,
  getSourcesByIds,
} from "./repository";
import { getProductsForProductFamily, getBrandForProductFamily } from "./organizationPortfolio";
import {
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
} from "@/lib/navigation/entityNavigation";
import {
  getSystemRelationsForProduct,
  type ProductSystemPeer,
} from "./productHub";

export type FamilyProductCard = {
  id: string;
  name: string;
  href: string;
  slug: string;
  categoryName?: string;
  categoryHref?: string;
  surfaces: { id: string; name: string; href: string }[];
};

export type FamilyCategoryLink = {
  id: string;
  name: string;
  href: string;
  productCount: number;
};

export type FamilyTechLink = {
  id: string;
  name: string;
  href: string;
  kind: Technology["kind"];
};

export type FamilySurfaceLink = {
  id: string;
  name: string;
  href: string;
};

export type FamilyKnowledgeLink = {
  id: string;
  name: string;
  href: string;
  note?: string;
};

export type FamilySystemPeer = ProductSystemPeer;

export type ProductFamilyPortfolio = {
  family: ProductFamily;
  products: FamilyProductCard[];
  categories: FamilyCategoryLink[];
  technologies: FamilyTechLink[];
  surfaces: FamilySurfaceLink[];
  /** In-family partOfSystem peers (min 2), sorted when sequence exists. */
  systemPeers: FamilySystemPeer[];
  knowledge: FamilyKnowledgeLink[];
  sources: Source[];
  lastVerifiedAt?: string;
};

function isStructuralCopy(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  if (t.includes("a festékindex adatbázisában")) return true;
  if (t.includes("festék bázis v0.")) return true;
  return false;
}

function enrichProduct(p: Product): FamilyProductCard {
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

/**
 * partOfSystem peers among products of this family only.
 * Reuses product-level resolver; no parallel hierarchy logic.
 */
export function getSystemRelationsForProductFamily(
  familyId: string,
): FamilySystemPeer[] {
  const rawProducts = getProductsForProductFamily(familyId);
  const familyIds = new Set(rawProducts.map((p) => p.id));
  if (familyIds.size < 2) return [];

  const byId = new Map<string, FamilySystemPeer>();

  for (const product of rawProducts) {
    const peers = getSystemRelationsForProduct(product.id).filter((peer) =>
      familyIds.has(peer.id),
    );
    if (peers.length < 2) continue;

    for (const peer of peers) {
      const existing = byId.get(peer.id);
      if (!existing) {
        byId.set(peer.id, {
          ...peer,
          isCurrent: false,
        });
      } else {
        if (existing.sequence == null && peer.sequence != null) {
          existing.sequence = peer.sequence;
        }
        if (!existing.role && peer.role) existing.role = peer.role;
      }
    }
  }

  const list = [...byId.values()];
  if (list.length < 2) return [];

  const roleRank = (role: string | undefined): number | undefined => {
    if (!role) return undefined;
    if (role === "primer" || role === "base") return 1;
    if (role === "intermediate") return 2;
    if (role === "topcoat" || role === "finish") return 3;
    return undefined;
  };

  const sortKey = (peer: FamilySystemPeer): number => {
    if (typeof peer.sequence === "number") return peer.sequence;
    const fromRole = roleRank(peer.role);
    if (fromRole != null) return fromRole;
    // Incomplete metadata: pair opposite a known topcoat/primer
    const other = list.find((p) => p.id !== peer.id);
    if (!other) return 50;
    if (other.role === "topcoat" || other.sequence === 2) return 1;
    if (other.role === "primer" || other.sequence === 1) return 2;
    const otherRole = roleRank(other.role);
    if (otherRole != null) return otherRole === 1 ? 2 : otherRole - 1;
    return 50;
  };

  const hasOrder = list.some(
    (p) => typeof p.sequence === "number" || Boolean(p.role),
  );
  if (hasOrder) {
    list.sort(
      (a, b) => sortKey(a) - sortKey(b) || a.name.localeCompare(b.name, "hu"),
    );
  } else {
    list.sort((a, b) => a.name.localeCompare(b.name, "hu"));
  }
  return list;
}

function addCategory(
  categoryMap: Map<string, { cat: Category; count: number }>,
  cat: Category,
  increment: number,
) {
  if (cat.id === "cat_all") return;
  const prev = categoryMap.get(cat.id);
  categoryMap.set(cat.id, {
    cat,
    count: (prev?.count ?? 0) + increment,
  });
}

export function getProductFamilyPortfolio(
  familyId: string,
): ProductFamilyPortfolio | null {
  const family = getProductFamilyById(familyId);
  if (!family || family.status !== "published") return null;

  const rawProducts = getProductsForProductFamily(familyId);
  const products = rawProducts
    .map(enrichProduct)
    .sort((a, b) => a.name.localeCompare(b.name, "hu"));

  const categoryMap = new Map<string, { cat: Category; count: number }>();
  const techMap = new Map<string, Technology>();
  const surfaceMap = new Map<string, Surface>();
  const sourceIds = new Set<string>();
  const verified: string[] = [];

  for (const id of family.sourceIds) sourceIds.add(id);
  if (family.verifiedAt) verified.push(family.verifiedAt);

  // Family-level categories
  for (const r of getRelatedEntities(familyId, {
    relationTypes: ["belongsToCategory"],
    direction: "outgoing",
  })) {
    if (r.entity.type === "category" && r.entity.status === "published") {
      addCategory(categoryMap, r.entity as Category, 1);
      for (const id of r.relation.sourceIds) sourceIds.add(id);
    }
  }

  // Do not bulk-copy Brand/Organization source catalogs (§23).
  // Keep family + product + displayed-relation sources only.
  const brand = getBrandForProductFamily(family.id);
  const owner = brand ? getCanonicalBrandOwner(brand.id) : undefined;
  const mfr = getCanonicalFamilyManufacturer(family.id);
  for (const org of [owner, mfr]) {
    if (org?.verifiedAt) verified.push(org.verifiedAt);
  }

  for (const product of rawProducts) {
    for (const id of product.sourceIds) sourceIds.add(id);
    if (product.verifiedAt) verified.push(product.verifiedAt);

    for (const r of getRelatedEntities(product.id, {
      relationTypes: ["belongsToCategory"],
      direction: "outgoing",
    })) {
      if (r.entity.type !== "category" || r.entity.status !== "published") {
        continue;
      }
      addCategory(categoryMap, r.entity as Category, 1);
      for (const id of r.relation.sourceIds) sourceIds.add(id);
    }

    for (const r of getRelatedEntities(product.id, {
      relationTypes: ["usesTechnology"],
      direction: "outgoing",
    })) {
      if (r.entity.type === "technology" && r.entity.status === "published") {
        techMap.set(r.entity.id, r.entity as Technology);
        for (const id of r.relation.sourceIds) sourceIds.add(id);
      }
    }

    for (const r of getRelatedEntities(product.id, {
      relationTypes: ["applicableToSurface"],
      direction: "outgoing",
    })) {
      if (r.entity.type === "surface" && r.entity.status === "published") {
        surfaceMap.set(r.entity.id, r.entity as Surface);
        for (const id of r.relation.sourceIds) sourceIds.add(id);
      }
    }
  }

  const systemPeers = getSystemRelationsForProductFamily(familyId);
  for (const peer of systemPeers) {
    // System edges' relation sources already collected via product loops when present
    void peer;
  }

  const knowledge = getRelatedEntities(familyId, {
    relationTypes: ["documents"],
    direction: "incoming",
  })
    .filter(
      (r) => r.entity.type === "knowledge" && r.entity.status === "published",
    )
    .map((r) => {
      const k = r.entity as KnowledgeArticle;
      const note = k.shortDescription?.trim();
      return {
        id: k.id,
        name: k.name,
        href: getEntityHref(k),
        note: note && !isStructuralCopy(note) ? note : undefined,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "hu"));

  const categories: FamilyCategoryLink[] = [...categoryMap.values()]
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

  const technologies: FamilyTechLink[] = [...techMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "hu"))
    .map((t) => ({
      id: t.id,
      name: t.name,
      href: getEntityHref(t),
      kind: t.kind,
    }));

  const surfaces: FamilySurfaceLink[] = [...surfaceMap.values()]
    .sort((a, b) => a.name.localeCompare(b.name, "hu"))
    .map((s) => ({
      id: s.id,
      name: s.name,
      href: getEntityHref(s),
    }));

  const sources = getSourcesByIds([...sourceIds]);
  const lastVerifiedAt =
    verified.sort().at(-1) ??
    sources.map((s) => s.accessedAt).filter(Boolean).sort().at(-1);

  return {
    family,
    products,
    categories,
    technologies,
    surfaces,
    systemPeers,
    knowledge,
    sources,
    lastVerifiedAt,
  };
}

export function productFamilyHasHub(familyId: string): boolean {
  const family = getProductFamilyById(familyId);
  return Boolean(family && family.status === "published");
}
