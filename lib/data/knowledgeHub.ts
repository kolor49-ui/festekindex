/**
 * Knowledge Hub portfolio queries — DIRECT-FIRST only.
 *
 * documented.*  ← Knowledge --documents--> Entity
 * categories    ← Knowledge --belongsToCategory--> Category
 *
 * Never expand Technology/Category/Brand into Products, Brands, Orgs, Surfaces.
 */

import type {
  AnyEntity,
  KnowledgeArticle,
  Source,
} from "./types";
import {
  getEntityHref,
  getKnowledgeById,
  getRelatedEntities,
  getSourcesByIds,
} from "./repository";

export type KnowledgeLink = {
  id: string;
  name: string;
  href: string;
};

export type KnowledgeDocumented = {
  organizations: KnowledgeLink[];
  brands: KnowledgeLink[];
  productFamilies: KnowledgeLink[];
  products: KnowledgeLink[];
  technologies: KnowledgeLink[];
  surfaces: KnowledgeLink[];
  /** Direct documents → Category (separate from belongsToCategory). */
  categories: KnowledgeLink[];
  comparisons: KnowledgeLink[];
};

export type KnowledgePortfolio = {
  article: KnowledgeArticle;
  documented: KnowledgeDocumented;
  /** Explicit belongsToCategory only. */
  categories: KnowledgeLink[];
  /** Knowledge.sourceIds only. */
  sources: Source[];
};

function hu(a: string, b: string): number {
  return a.localeCompare(b, "hu");
}

function toLink(entity: AnyEntity): KnowledgeLink | null {
  if (entity.status !== "published") return null;
  return {
    id: entity.id,
    name: entity.name,
    href: getEntityHref(entity),
  };
}

function sortLinks(links: KnowledgeLink[]): KnowledgeLink[] {
  return [...links].sort((a, b) => hu(a.name, b.name));
}

/**
 * Resolve DIRECT Knowledge relations only.
 * documents → documented.*; belongsToCategory → categories; sourceIds → sources.
 */
export function getKnowledgePortfolio(
  knowledgeId: string,
): KnowledgePortfolio | null {
  const article = getKnowledgeById(knowledgeId);
  if (!article || article.status !== "published") return null;

  const outgoing = getRelatedEntities(knowledgeId, {
    direction: "outgoing",
  });

  const documented: KnowledgeDocumented = {
    organizations: [],
    brands: [],
    productFamilies: [],
    products: [],
    technologies: [],
    surfaces: [],
    categories: [],
    comparisons: [],
  };
  const categories: KnowledgeLink[] = [];

  for (const related of outgoing) {
    const { entity, relation } = related;
    if (relation.relationType === "belongsToCategory") {
      if (entity.type === "category") {
        const link = toLink(entity);
        if (link) categories.push(link);
      }
      continue;
    }

    if (relation.relationType !== "documents") continue;

    const link = toLink(entity);
    if (!link) continue;

    switch (entity.type) {
      case "organization":
        documented.organizations.push(link);
        break;
      case "brand":
        documented.brands.push(link);
        break;
      case "productFamily":
        documented.productFamilies.push(link);
        break;
      case "product":
        documented.products.push(link);
        break;
      case "technology":
        documented.technologies.push(link);
        break;
      case "surface":
        documented.surfaces.push(link);
        break;
      case "category":
        documented.categories.push(link);
        break;
      case "comparison":
        documented.comparisons.push(link);
        break;
      default:
        break;
    }
  }

  return {
    article,
    documented: {
      organizations: sortLinks(documented.organizations),
      brands: sortLinks(documented.brands),
      productFamilies: sortLinks(documented.productFamilies),
      products: sortLinks(documented.products),
      technologies: sortLinks(documented.technologies),
      surfaces: sortLinks(documented.surfaces),
      categories: sortLinks(documented.categories),
      comparisons: sortLinks(documented.comparisons),
    },
    categories: sortLinks(categories),
    sources: getSourcesByIds(article.sourceIds ?? []),
  };
}

/** All entity IDs shown in related-content sections (direct relations only). */
export function getKnowledgeDisplayedRelatedIds(
  portfolio: KnowledgePortfolio,
): string[] {
  const ids = new Set<string>();
  for (const c of portfolio.categories) ids.add(c.id);
  const d = portfolio.documented;
  for (const list of [
    d.organizations,
    d.brands,
    d.productFamilies,
    d.products,
    d.technologies,
    d.surfaces,
    d.categories,
    d.comparisons,
  ]) {
    for (const item of list) ids.add(item.id);
  }
  return [...ids];
}
