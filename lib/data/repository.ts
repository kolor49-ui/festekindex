import type {
  AnyEntity,
  Brand,
  Category,
  EntityType,
  KnowledgeArticle,
  Organization,
  ProductFamily,
  RelatedEntity,
  Relation,
  RelationType,
  SearchHit,
  SitemapEntry,
  Source,
  Technology,
} from "./types";
import { brands } from "./brands";
import { categories } from "./categories";
import { knowledge } from "./knowledge";
import { organizations } from "./organizations";
import { productFamilies } from "./productFamilies";
import { relations } from "./relations";
import { sources } from "./sources";
import { technologies } from "./technologies";

const SITE_ORIGIN = "https://festekindex.hu";

const TYPE_PATH: Record<EntityType, string> = {
  organization: "cegek",
  brand: "markak",
  technology: "technologiak",
  category: "kategoriak",
  productFamily: "termekcsaladok",
  knowledge: "tudastar",
};

const KIND_LABEL: Record<EntityType, string> = {
  organization: "Cég",
  brand: "Márka",
  technology: "Technológia",
  category: "Kategória",
  productFamily: "Termékcsalád",
  knowledge: "Tudástár",
};

function allEntities(): AnyEntity[] {
  return [
    ...organizations,
    ...brands,
    ...technologies,
    ...categories,
    ...productFamilies,
    ...knowledge,
  ];
}

function entityMap(): Map<string, AnyEntity> {
  return new Map(allEntities().map((e) => [e.id, e]));
}

function hasMeaningfulContent(entity: AnyEntity): boolean {
  const body = entity.body?.trim() ?? "";
  const short = entity.shortDescription?.trim() ?? "";
  return body.length >= 80 || (short.length >= 40 && body.length >= 40);
}

export function isIndexableEntity(entity: AnyEntity): boolean {
  return (
    entity.status === "published" &&
    entity.indexable === true &&
    hasMeaningfulContent(entity)
  );
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

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getProductFamilyById(id: string): ProductFamily | undefined {
  return productFamilies.find((p) => p.id === id);
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

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProductFamilyBySlug(slug: string): ProductFamily | undefined {
  return productFamilies.find((p) => p.slug === slug);
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

export function listProductFamilies(opts?: {
  publishedOnly?: boolean;
}): ProductFamily[] {
  const publishedOnly = opts?.publishedOnly ?? true;
  return productFamilies.filter(
    (p) => !publishedOnly || p.status === "published",
  );
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
  opts?: { relationTypes?: RelationType[]; direction?: "outgoing" | "incoming" | "both" },
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
        results.push({ entity, relation, direction: "outgoing" });
      }
    }

    if (
      (direction === "incoming" || direction === "both") &&
      relation.toEntityId === entityId
    ) {
      const entity = map.get(relation.fromEntityId);
      if (entity) {
        results.push({ entity, relation, direction: "incoming" });
      }
    }
  }

  return results;
}

export function getBrandsByOrganization(orgId: string): Brand[] {
  const related = getRelatedEntities(orgId, {
    relationTypes: ["owns", "distributes", "officialDistributor", "represents", "manufactures"],
    direction: "outgoing",
  });
  const brandIds = new Set(
    related.filter((r) => r.entity.type === "brand").map((r) => r.entity.id),
  );
  return brands.filter((b) => brandIds.has(b.id) || b.ownerOrgId === orgId);
}

export function getEntitiesByCategory(
  categoryId: string,
  opts?: { types?: EntityType[] },
): AnyEntity[] {
  const typeFilter = opts?.types ? new Set(opts.types) : null;
  const byField = allEntities().filter(
    (e) =>
      e.type !== "category" &&
      e.status === "published" &&
      e.categoryIds.includes(categoryId) &&
      (!typeFilter || typeFilter.has(e.type)),
  );

  const byRelation = getRelatedEntities(categoryId, {
    relationTypes: ["belongsToCategory"],
    direction: "incoming",
  })
    .map((r) => r.entity)
    .filter((e) => !typeFilter || typeFilter.has(e.type));

  const map = new Map<string, AnyEntity>();
  for (const e of [...byField, ...byRelation]) {
    map.set(e.id, e);
  }
  return [...map.values()];
}

function categoryNamesFor(entity: AnyEntity): string[] {
  return entity.categoryIds
    .map((id) => getCategoryById(id)?.name)
    .filter((n): n is string => Boolean(n));
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
      (e) =>
        e.id === opts.categoryId ||
        inCat.has(e.id) ||
        e.categoryIds.includes(opts.categoryId!),
    );
  }

  if (typeFilter) {
    pool = pool.filter((e) => typeFilter.has(e.type));
  }

  // Exclude the synthetic "all" category from result lists
  pool = pool.filter((e) => e.id !== "cat_all");

  if (!term) {
    return pool.slice(0, limit).map(toSearchHit);
  }

  const scored = pool
    .map((entity) => {
      const hay = [
        entity.name,
        entity.shortDescription,
        entity.body ?? "",
        ...categoryNamesFor(entity),
        entity.type === "technology" ? entity.aliases.join(" ") : "",
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
    "brand_graco",
    "brand_wagner",
    "org_euroll_hungaria",
    "org_akzo_nobel_coatings",
    "org_ppg_trilak",
    "brand_milesi",
    "brand_mirka",
    "org_sika_hungaria",
    "brand_interpon",
    "org_european_aerosols",
  ];
  const map = entityMap();
  return featuredIds
    .map((id) => map.get(id))
    .filter((e): e is AnyEntity => Boolean(e))
    .slice(0, limit)
    .map(toSearchHit);
}

export function getStats() {
  return {
    entities: allEntities().filter((e) => e.status === "published" && e.id !== "cat_all")
      .length,
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

export function getRelationTypeLabel(type: RelationType): string {
  const labels: Record<RelationType, string> = {
    owns: "Tulajdonos",
    brandOf: "Márkája",
    manufactures: "Gyártja",
    distributes: "Forgalmazza",
    officialDistributor: "Hivatalos forgalmazó",
    represents: "Képviseli",
    services: "Szervizeli",
    usesTechnology: "Technológia",
    belongsToCategory: "Kategória",
    compatibleWith: "Kompatibilis",
    relatedTo: "Kapcsolódó",
    productFamilyOf: "Termékcsalád",
    documentedBy: "Dokumentálja",
  };
  return labels[type];
}

export { SITE_ORIGIN, TYPE_PATH, KIND_LABEL };
