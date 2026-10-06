import type {
  AnyEntity,
  Brand,
  Category,
  EntityType,
  KnowledgeArticle,
  Organization,
  Product,
  ProductFamily,
  RelatedEntity,
  Relation,
  RelationType,
  SearchHit,
  SitemapEntry,
  Source,
  Surface,
  Technology,
} from "./types";
import { getRelationLabel } from "./relationTypes";
import { isSeoIndexable } from "@/lib/seo/indexability";
import { brands as brandsBase } from "./brands";
import { categories as categoriesBase } from "./categories";
import { knowledge } from "./knowledge";
import { organizations as organizationsBase } from "./organizations";
import { productFamilies as productFamiliesBase } from "./productFamilies";
import { products as productsBase } from "./products";
import { relations as relationsBase } from "./relations";
import { sources as sourcesBase } from "./sources";
import { comparisons } from "./comparisons";
import { surfaces as surfacesBase } from "./surfaces";
import { technologies as technologiesBase } from "./technologies";
import { festekBazisV02Seed } from "./imports/festekBazisV02Map";
import {
  mergeById,
  mergeRelationsByCanonicalKey,
  mergeSurfaces,
  mergeTechnologies,
} from "./imports/merge";

const SITE_ORIGIN = "https://festekindex.hu";

const organizations = mergeById(
  organizationsBase,
  festekBazisV02Seed.organizations,
);
const brands = mergeById(
  [...brandsBase, festekBazisV02Seed.archivedBrand7016],
  festekBazisV02Seed.brands,
);
const productFamilies = mergeById(
  productFamiliesBase,
  festekBazisV02Seed.productFamilies,
);
const products = mergeById(productsBase, festekBazisV02Seed.products);
const surfaces = mergeSurfaces(surfacesBase, festekBazisV02Seed.surfaces);
const technologies = mergeTechnologies(
  technologiesBase,
  festekBazisV02Seed.technologies,
);
const categories = mergeById(categoriesBase, festekBazisV02Seed.categories);
const relations = mergeRelationsByCanonicalKey(
  relationsBase,
  festekBazisV02Seed.relations,
);
const sources = mergeById(sourcesBase, festekBazisV02Seed.sources);

const TYPE_PATH: Record<EntityType, string> = {
  organization: "cegek",
  brand: "markak",
  technology: "technologiak",
  category: "kategoriak",
  productFamily: "termekcsaladok",
  product: "termekek",
  knowledge: "tudastar",
  comparison: "osszehasonlitas",
  surface: "feluletek",
};

const KIND_LABEL: Record<EntityType, string> = {
  organization: "Cég",
  brand: "Márka",
  technology: "Technológia",
  category: "Kategória",
  productFamily: "Termékcsalád",
  product: "Termék",
  knowledge: "Tudástár",
  comparison: "Összehasonlítás",
  surface: "Felület",
};

function allEntities(): AnyEntity[] {
  return [
    ...organizations,
    ...brands,
    ...technologies,
    ...categories,
    ...productFamilies,
    ...products,
    ...knowledge,
    ...comparisons,
    ...surfaces,
  ];
}

function entityMap(): Map<string, AnyEntity> {
  return new Map(allEntities().map((e) => [e.id, e]));
}

export function isIndexableEntity(entity: AnyEntity): boolean {
  return isSeoIndexable(entity);
}

export function getEntityHref(entity: Pick<AnyEntity, "type" | "slug">): string {
  return `/${TYPE_PATH[entity.type]}/${entity.slug}`;
}

export function getCanonicalUrl(entity: AnyEntity): string {
  const path = entity.canonicalPath ?? getEntityHref(entity);
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getEntityById(id: string): AnyEntity | undefined {
  return entityMap().get(id);
}

export function getOrganizationById(id: string): Organization | undefined {
  return organizations.find((o) => o.id === id);
}

export function getBrandById(id: string): Brand | undefined {
  return brands.find((b) => b.id === id);
}

export function getTechnologyById(id: string): Technology | undefined {
  return technologies.find((t) => t.id === id);
}

export function getSurfaceById(id: string): Surface | undefined {
  return surfaces.find((s) => s.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getProductFamilyById(id: string): ProductFamily | undefined {
  return productFamilies.find((p) => p.id === id);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getKnowledgeById(id: string): KnowledgeArticle | undefined {
  return knowledge.find((k) => k.id === id);
}

export function getEntityBySlug(
  type: EntityType,
  slug: string,
): AnyEntity | undefined {
  return allEntities().find((e) => e.type === type && e.slug === slug);
}

export function getOrganizationBySlug(slug: string): Organization | undefined {
  return organizations.find((o) => o.slug === slug);
}

export function getBrandBySlug(slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getTechnologyBySlug(slug: string): Technology | undefined {
  return technologies.find((t) => t.slug === slug);
}

export function getSurfaceBySlug(slug: string): Surface | undefined {
  return surfaces.find((s) => s.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductFamilyBySlug(slug: string): ProductFamily | undefined {
  return productFamilies.find((p) => p.slug === slug);
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getKnowledgeBySlug(slug: string): KnowledgeArticle | undefined {
  return knowledge.find((k) => k.slug === slug);
}

export function listOrganizations(opts?: {
  publishedOnly?: boolean;
}): Organization[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return organizations.filter((o) => !publishedOnly || o.status === "published");
}

export function listBrands(opts?: { publishedOnly?: boolean }): Brand[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return brands.filter((b) => !publishedOnly || b.status === "published");
}

export function listTechnologies(opts?: {
  publishedOnly?: boolean;
}): Technology[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return technologies.filter((t) => !publishedOnly || t.status === "published");
}

export function listSurfaces(opts?: { publishedOnly?: boolean }): Surface[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return surfaces.filter((s) => !publishedOnly || s.status === "published");
}

export function listProductFamilies(opts?: {
  publishedOnly?: boolean;
}): ProductFamily[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return productFamilies.filter(
    (p) => !publishedOnly || p.status === "published",
  );
}

export function listProducts(opts?: { publishedOnly?: boolean }): Product[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return products.filter((p) => !publishedOnly || p.status === "published");
}

export function listKnowledge(opts?: {
  publishedOnly?: boolean;
}): KnowledgeArticle[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return knowledge.filter((k) => !publishedOnly || k.status === "published");
}

export function listNavCategories(): Category[] {
  return categories
    .filter((c) => c.status === "published" && c.parentId === null)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryTree(rootId: string | null = null): Category[] {
  return categories
    .filter((c) => c.parentId === rootId && c.status === "published")
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getCategoryChildren(parentId: string): Category[] {
  return getCategoryTree(parentId);
}

export function getCategoryPath(categoryId: string): Category[] {
  const path: Category[] = [];
  let current = getCategoryById(categoryId);
  while (current) {
    path.unshift(current);
    current = current.parentId ? getCategoryById(current.parentId) : undefined;
  }
  return path;
}

export function getSourcesByIds(ids: string[]): Source[] {
  const set = new Set(ids);
  return sources.filter((s) => set.has(s.id));
}

export function getSourceById(id: string): Source | undefined {
  return sources.find((s) => s.id === id);
}

export function getActiveRelationsForEntity(entityId: string): Relation[] {
  return relations.filter(
    (r) =>
      r.status === "active" &&
      (r.fromEntityId === entityId || r.toEntityId === entityId),
  );
}

export function getRelatedEntities(
  entityId: string,
  opts?: {
    relationTypes?: RelationType[];
    direction?: "outgoing" | "incoming" | "both";
  },
): RelatedEntity[] {
  const direction = opts?.direction ?? "both";
  const typeFilter = opts?.relationTypes
    ? new Set(opts.relationTypes)
    : null;
  const map = entityMap();
  const results: RelatedEntity[] = [];

  for (const relation of getActiveRelationsForEntity(entityId)) {
    if (typeFilter && !typeFilter.has(relation.relationType)) continue;

    if (
      (direction === "outgoing" || direction === "both") &&
      relation.fromEntityId === entityId
    ) {
      const entity = map.get(relation.toEntityId);
      if (entity) {
        results.push({
          entity,
          relation,
          direction: "outgoing",
          label: getRelationLabel(relation.relationType, "outgoing"),
        });
      }
    }

    if (
      (direction === "incoming" || direction === "both") &&
      relation.toEntityId === entityId
    ) {
      const entity = map.get(relation.fromEntityId);
      if (entity) {
        results.push({
          entity,
          relation,
          direction: "incoming",
          label: getRelationLabel(relation.relationType, "incoming"),
        });
      }
    }
  }

  return results;
}

/** Brands owned / distributed / represented / serviced by an organization. */
export function getBrandsByOrganization(orgId: string): Brand[] {
  const related = getRelatedEntities(orgId, {
    relationTypes: [
      "owns",
      "distributes",
      "officialDistributor",
      "represents",
      "services",
    ],
    direction: "outgoing",
  });
  const brandIds = new Set(
    related.filter((r) => r.entity.type === "brand").map((r) => r.entity.id),
  );
  return brands.filter((b) => brandIds.has(b.id));
}

/** Owning organization for a brand (derived from owns). */
export function getOwnerOrganization(brandId: string): Organization | undefined {
  const related = getRelatedEntities(brandId, {
    relationTypes: ["owns"],
    direction: "incoming",
  });
  const org = related.find((r) => r.entity.type === "organization")?.entity;
  return org as Organization | undefined;
}

/** Entities linked to a category via belongsToCategory (incoming to category). */
export function getEntitiesByCategory(
  categoryId: string,
  opts?: { types?: EntityType[] },
): AnyEntity[] {
  const typeFilter = opts?.types ? new Set(opts.types) : null;
  return getRelatedEntities(categoryId, {
    relationTypes: ["belongsToCategory"],
    direction: "incoming",
  })
    .map((r) => r.entity)
    .filter(
      (e) =>
        e.status === "published" && (!typeFilter || typeFilter.has(e.type)),
    );
}

function categoryNamesFor(entity: AnyEntity): string[] {
  return getRelatedEntities(entity.id, {
    relationTypes: ["belongsToCategory"],
    direction: "outgoing",
  })
    .filter((r) => r.entity.type === "category")
    .map((r) => r.entity.name);
}

function toSearchHit(entity: AnyEntity): SearchHit {
  return {
    id: entity.id,
    type: entity.type,
    slug: entity.slug,
    name: entity.name,
    shortDescription: entity.shortDescription,
    href: getEntityHref(entity),
    kindLabel: KIND_LABEL[entity.type],
    categoryNames: categoryNamesFor(entity),
  };
}

export function searchEntities(
  query: string,
  opts?: { categoryId?: string; types?: EntityType[]; limit?: number },
): SearchHit[] {
  const term = query.trim().toLowerCase();
  const typeFilter = opts?.types ? new Set(opts.types) : null;
  const limit = opts?.limit ?? 50;

  let pool = allEntities().filter((e) => e.status === "published");

  if (opts?.categoryId && opts.categoryId !== "cat_all") {
    const inCat = new Set(
      getEntitiesByCategory(opts.categoryId).map((e) => e.id),
    );
    pool = pool.filter(
      (e) => e.id === opts.categoryId || inCat.has(e.id),
    );
  }

  if (typeFilter) {
    pool = pool.filter((e) => typeFilter.has(e.type));
  }

  pool = pool.filter((e) => e.id !== "cat_all");

  if (!term) {
    return pool.slice(0, limit).map(toSearchHit);
  }

  const scored = pool
    .map((entity) => {
      const aliases =
        entity.type === "technology" || entity.type === "surface"
          ? entity.aliases.join(" ")
          : entity.type === "product" && entity.aliases
            ? entity.aliases.join(" ")
            : "";

      const hay = [
        entity.name,
        entity.shortDescription,
        entity.body ?? "",
        ...categoryNamesFor(entity),
        aliases,
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (entity.name.toLowerCase() === term) score += 100;
      else if (entity.name.toLowerCase().startsWith(term)) score += 50;
      else if (entity.name.toLowerCase().includes(term)) score += 30;
      if (hay.includes(term)) score += 10;
      return { entity, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((x) => toSearchHit(x.entity));
}

export function getFeaturedHits(limit = 10): SearchHit[] {
  const featuredIds = [
    "org_graco_inc",
    "brand_graco",
    "org_euroll_hungaria",
    "tech_airless",
    "pf_graco_mark",
    "org_akzo_nobel_coatings",
    "brand_dulux",
    "brand_sikkens",
    "brand_international",
    "brand_wagner",
  ];
  const map = entityMap();
  return featuredIds
    .map((id) => map.get(id))
    .filter((e): e is AnyEntity => Boolean(e))
    .slice(0, limit)
    .map(toSearchHit);
}

export type RelationPreview = {
  entityId: string;
  name: string;
  href: string;
  kindLabel: string;
  relationLabel: string;
  description?: string;
};

/** Presentation-only: one entry per related entity, roles merged. */
export type AggregatedRelatedEntity = {
  entity: AnyEntity;
  href: string;
  kindLabel: string;
  roles: string[];
  rolesSummary: string;
  relations: Relation[];
};

export function aggregateRelatedByTarget(
  related: RelatedEntity[],
): AggregatedRelatedEntity[] {
  const map = new Map<
    string,
    {
      entity: AnyEntity;
      roles: string[];
      roleSet: Set<string>;
      relations: Relation[];
    }
  >();

  for (const item of related) {
    if (item.entity.status !== "published") continue;
    const id = item.entity.id;
    let bucket = map.get(id);
    if (!bucket) {
      bucket = {
        entity: item.entity,
        roles: [],
        roleSet: new Set(),
        relations: [],
      };
      map.set(id, bucket);
    }
    if (!bucket.roleSet.has(item.label)) {
      bucket.roleSet.add(item.label);
      bucket.roles.push(item.label);
    }
    bucket.relations.push(item.relation);
  }

  return [...map.values()].map((b) => ({
    entity: b.entity,
    href: getEntityHref(b.entity),
    kindLabel: KIND_LABEL[b.entity.type],
    roles: b.roles,
    rolesSummary: b.roles.join(" · "),
    relations: b.relations,
  }));
}

export function getRelationPreviews(
  entityId: string,
  limit = 12,
): RelationPreview[] {
  return aggregateRelatedByTarget(getRelatedEntities(entityId))
    .slice(0, limit)
    .map((agg) => ({
      entityId: agg.entity.id,
      name: agg.entity.name,
      href: agg.href,
      kindLabel: agg.kindLabel,
      relationLabel: agg.rolesSummary,
      description: agg.rolesSummary,
    }));
}

export function getRelationPreviewsMap(
  entityIds: string[],
  limit = 12,
): Record<string, RelationPreview[]> {
  const out: Record<string, RelationPreview[]> = {};
  for (const id of entityIds) {
    out[id] = getRelationPreviews(id, limit);
  }
  return out;
}

export function getStats() {
  return {
    entities: allEntities().filter(
      (e) => e.status === "published" && e.id !== "cat_all",
    ).length,
    brands: brands.filter((b) => b.status === "published").length,
    categories: categories.filter(
      (c) => c.status === "published" && c.id !== "cat_all",
    ).length,
  };
}

export function listPublishedForSitemap(): SitemapEntry[] {
  const entries: SitemapEntry[] = [
    { path: "/", lastModified: "2026-10-05" },
    { path: "/cegek", lastModified: "2026-10-05" },
    { path: "/markak", lastModified: "2026-10-05" },
    { path: "/technologiak", lastModified: "2026-10-05" },
    { path: "/kategoriak", lastModified: "2026-10-05" },
    { path: "/tudastar", lastModified: "2026-10-05" },
    { path: "/termekcsaladok", lastModified: "2026-10-05" },
    { path: "/termekek", lastModified: "2026-10-05" },
    { path: "/feluletek", lastModified: "2026-10-05" },
  ];

  for (const entity of allEntities()) {
    if (entity.id === "cat_all") continue;
    if (!isIndexableEntity(entity)) continue;
    entries.push({
      path: getEntityHref(entity),
      lastModified: entity.updatedAt,
    });
  }

  return entries;
}

/** @deprecated Prefer getRelationLabel(type, direction) from relationTypes */
export function getRelationTypeLabel(
  type: RelationType,
  direction: "outgoing" | "incoming" = "outgoing",
): string {
  return getRelationLabel(type, direction);
}

export { SITE_ORIGIN, TYPE_PATH, KIND_LABEL, getRelationLabel };
