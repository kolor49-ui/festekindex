/**
 * Search v1 catalog — builds SearchDocuments from the published repository.
 * Eligibility ≠ SEO indexability. DIRECT context only (no transitive expansion).
 */

import type {
  AnyEntity,
  Brand,
  Category,
  KnowledgeArticle,
  Organization,
  Product,
  ProductFamily,
  Surface,
  Technology,
} from "@/lib/data/types";
import {
  getEntityHref,
  listAllEntities,
  listBrands,
  listKnowledge,
  listOrganizations,
  listProductFamilies,
  listProducts,
  listSurfaces,
  listTechnologies,
  getRelatedEntities,
} from "@/lib/data/repository";
import {
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
  getCanonicalProductBrand,
  getCanonicalProductFamily,
} from "@/lib/navigation/entityNavigation";
import { getBrandForProductFamily } from "@/lib/data/organizationPortfolio";
import {
  getCategoriesForProduct,
  getSurfacesForProduct,
  getTechnologiesForProduct,
} from "@/lib/data/productHub";
import {
  SEARCH_TYPE_LABEL_HU,
  type SearchDocument,
  type SearchEntityType,
} from "./types";
import { normalizeSearchText } from "./normalize";

const EXCLUDED_IDS = new Set(["brand_7016", "cat_all"]);

const FILLER_MARKERS = [
  "a festékindex adatbázisában",
  "festékindex adatbázisában",
  "festék bázis v0.",
  "v0.1",
  "v0.2",
  "relations háló",
  "gráf",
  "repository",
  "entitás",
  "sourceids",
  "productclass",
  "indexable",
  "noindex",
  "vékony",
  "hiányos",
  "seed",
  "import",
];

function isMeaningfulCopy(text: string | undefined): string | undefined {
  const t = text?.trim() ?? "";
  if (!t) return undefined;
  const lower = t.toLowerCase();
  if (FILLER_MARKERS.some((m) => lower.includes(m))) return undefined;
  return t;
}

function websiteHost(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host || undefined;
  } catch {
    return undefined;
  }
}

function joinParts(parts: Array<string | undefined | null>): string {
  return parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(" · ");
}

function aliasesOf(entity: AnyEntity): string[] {
  if (entity.type === "technology" || entity.type === "surface") {
    return [...entity.aliases];
  }
  if (entity.type === "product" && entity.aliases?.length) {
    return [...entity.aliases];
  }
  return [];
}

function productReachableCount(brandId: string): number {
  const families = getRelatedEntities(brandId, {
    relationTypes: ["hasProductFamily"],
    direction: "outgoing",
  }).filter(
    (r) =>
      r.entity.type === "productFamily" && r.entity.status === "published",
  );
  let n = 0;
  const seen = new Set<string>();
  for (const f of families) {
    for (const r of getRelatedEntities(f.entity.id, {
      relationTypes: ["hasProduct"],
      direction: "outgoing",
    })) {
      if (r.entity.type === "product" && r.entity.status === "published") {
        seen.add(r.entity.id);
      }
    }
  }
  for (const r of getRelatedEntities(brandId, {
    relationTypes: ["hasProduct"],
    direction: "outgoing",
  })) {
    if (r.entity.type === "product" && r.entity.status === "published") {
      seen.add(r.entity.id);
    }
  }
  n = seen.size;
  return n;
}

function familyProductCount(familyId: string): number {
  return getRelatedEntities(familyId, {
    relationTypes: ["hasProduct"],
    direction: "outgoing",
  }).filter(
    (r) => r.entity.type === "product" && r.entity.status === "published",
  ).length;
}

function fromOrganization(o: Organization): SearchDocument {
  const aliases = aliasesOf(o);
  const city = o.registeredOffice?.city ?? o.hqCity;
  const identityParts = [o.name, o.legalName, ...aliases].filter(Boolean);
  const contextParts = [o.primaryActivity, city].filter(Boolean);
  const host = websiteHost(o.website);
  const low = [
    isMeaningfulCopy(o.shortDescription),
    host,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: o.id,
    type: "organization",
    name: o.name,
    displayName: o.name,
    href: getEntityHref(o),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.organization,
    normalizedName: normalizeSearchText(o.name),
    aliases,
    normalizedAliases: aliases.map(normalizeSearchText).filter(Boolean),
    identityText: identityParts.join(" "),
    contextText: contextParts.join(" "),
    lowWeightText: low || undefined,
    contextLabel: joinParts([city, o.primaryActivity]),
  };
}

function fromBrand(b: Brand): SearchDocument {
  const aliases = aliasesOf(b);
  const owner = getCanonicalBrandOwner(b.id);
  const identityParts = [b.name, ...aliases];
  const hasProducts = productReachableCount(b.id) > 0;

  return {
    id: b.id,
    type: "brand",
    name: b.name,
    displayName: b.name,
    href: getEntityHref(b),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.brand,
    normalizedName: normalizeSearchText(b.name),
    aliases,
    normalizedAliases: aliases.map(normalizeSearchText).filter(Boolean),
    identityText: identityParts.join(" "),
    contextText: owner?.name ?? "",
    lowWeightText: isMeaningfulCopy(b.shortDescription),
    contextLabel: owner?.name,
    organizationId: owner?.id,
    hasProducts,
  };
}

function fromProductFamily(f: ProductFamily): SearchDocument {
  const aliases = aliasesOf(f);
  const brand = getBrandForProductFamily(f.id);
  const publishedBrand =
    brand?.status === "published" ? brand : undefined;
  const owner = publishedBrand
    ? getCanonicalBrandOwner(publishedBrand.id)
    : undefined;
  const mfr = !publishedBrand
    ? getCanonicalFamilyManufacturer(f.id)
    : undefined;
  const org = owner ?? mfr;
  const hasProducts = familyProductCount(f.id) > 0;

  return {
    id: f.id,
    type: "productFamily",
    name: f.name,
    displayName: f.name,
    href: getEntityHref(f),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.productFamily,
    normalizedName: normalizeSearchText(f.name),
    aliases,
    normalizedAliases: aliases.map(normalizeSearchText).filter(Boolean),
    identityText: [f.name, ...aliases].join(" "),
    contextText: [publishedBrand?.name, org?.name].filter(Boolean).join(" "),
    lowWeightText: isMeaningfulCopy(f.shortDescription),
    contextLabel: joinParts([publishedBrand?.name, org?.name]),
    brandId: publishedBrand?.id,
    organizationId: org?.id,
    hasProducts,
  };
}

function fromProduct(p: Product): SearchDocument {
  const aliases = aliasesOf(p);
  const brand = getCanonicalProductBrand(p.id);
  const family = getCanonicalProductFamily(p.id);
  const owner = brand ? getCanonicalBrandOwner(brand.id) : undefined;
  const mfr =
    !brand && family
      ? getCanonicalFamilyManufacturer(family.id)
      : undefined;
  const org = owner ?? mfr;

  const categories = getCategoriesForProduct(p.id);
  const technologies = getTechnologiesForProduct(p.id);
  const surfaces = getSurfacesForProduct(p.id);

  const contextNames = [
    family?.name,
    brand?.name,
    org?.name,
    ...categories.map((c) => c.name),
    ...technologies.map((t) => t.name),
    ...surfaces.map((s) => s.name),
  ].filter(Boolean) as string[];

  const low = [
    isMeaningfulCopy(p.sourceSummary),
    isMeaningfulCopy(p.editorialSummary),
    isMeaningfulCopy(p.shortDescription),
  ]
    .filter(Boolean)
    .join(" ");

  const contextLabel = joinParts([family?.name, brand?.name]);

  return {
    id: p.id,
    type: "product",
    name: p.name,
    displayName: p.name,
    href: getEntityHref(p),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.product,
    normalizedName: normalizeSearchText(p.name),
    aliases,
    normalizedAliases: aliases.map(normalizeSearchText).filter(Boolean),
    identityText: [p.name, ...aliases].join(" "),
    contextText: contextNames.join(" "),
    lowWeightText: low || undefined,
    contextLabel,
    brandId: brand?.id,
    productFamilyId: family?.id,
    organizationId: org?.id,
    categoryIds: categories.map((c) => c.id),
    technologyIds: technologies.map((t) => t.id),
    surfaceIds: surfaces.map((s) => s.id),
    hasProducts: true,
  };
}

function fromTechnology(t: Technology): SearchDocument {
  const aliases = [...t.aliases];
  return {
    id: t.id,
    type: "technology",
    name: t.name,
    displayName: t.name,
    href: getEntityHref(t),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.technology,
    normalizedName: normalizeSearchText(t.name),
    aliases,
    normalizedAliases: aliases.map(normalizeSearchText).filter(Boolean),
    identityText: [t.name, ...aliases].join(" "),
    contextText: "",
    lowWeightText:
      isMeaningfulCopy(t.shortDescription) ?? isMeaningfulCopy(t.body),
    contextLabel: undefined,
  };
}

function fromSurface(s: Surface): SearchDocument {
  const aliases = [...s.aliases];
  return {
    id: s.id,
    type: "surface",
    name: s.name,
    displayName: s.name,
    href: getEntityHref(s),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.surface,
    normalizedName: normalizeSearchText(s.name),
    aliases,
    normalizedAliases: aliases.map(normalizeSearchText).filter(Boolean),
    identityText: [s.name, ...aliases].join(" "),
    contextText: "",
    lowWeightText:
      isMeaningfulCopy(s.shortDescription) ?? isMeaningfulCopy(s.body),
    contextLabel: undefined,
  };
}

function fromCategory(c: Category): SearchDocument {
  const identityParts = [c.name, c.navLabel].filter(Boolean) as string[];
  return {
    id: c.id,
    type: "category",
    name: c.name,
    displayName: c.name,
    href: getEntityHref(c),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.category,
    normalizedName: normalizeSearchText(c.name),
    aliases: [],
    normalizedAliases: [],
    identityText: identityParts.join(" "),
    contextText: "",
    lowWeightText:
      isMeaningfulCopy(c.shortDescription) ?? isMeaningfulCopy(c.body),
    contextLabel: undefined,
  };
}

function fromKnowledge(k: KnowledgeArticle): SearchDocument {
  const documented = getRelatedEntities(k.id, {
    relationTypes: ["documents"],
    direction: "outgoing",
  }).filter(
    (r) =>
      r.entity.status === "published" &&
      (r.entity.type === "category" ||
        r.entity.type === "technology" ||
        r.entity.type === "brand"),
  );
  const contextNames = documented.map((r) => r.entity.name);

  return {
    id: k.id,
    type: "knowledge",
    name: k.name,
    displayName: k.name,
    href: getEntityHref(k),
    typeLabelHu: SEARCH_TYPE_LABEL_HU.knowledge,
    normalizedName: normalizeSearchText(k.name),
    aliases: [],
    normalizedAliases: [],
    identityText: k.name,
    contextText: contextNames.join(" "),
    lowWeightText:
      isMeaningfulCopy(k.body) ?? isMeaningfulCopy(k.shortDescription),
    contextLabel: contextNames.length
      ? joinParts(contextNames.slice(0, 2))
      : undefined,
  };
}

function isEligible(entity: AnyEntity): boolean {
  if (entity.status !== "published") return false;
  if (EXCLUDED_IDS.has(entity.id)) return false;
  if (entity.type === "comparison") return false;
  return true;
}

let cachedCatalog: SearchDocument[] | null = null;

/** Build (or return cached) SearchDocument catalog. */
export function buildSearchCatalog(): SearchDocument[] {
  if (cachedCatalog) return cachedCatalog;

  const docs: SearchDocument[] = [];

  for (const o of listOrganizations()) {
    if (isEligible(o)) docs.push(fromOrganization(o));
  }
  for (const b of listBrands()) {
    if (isEligible(b)) docs.push(fromBrand(b));
  }
  for (const f of listProductFamilies()) {
    if (isEligible(f)) docs.push(fromProductFamily(f));
  }
  for (const p of listProducts()) {
    if (isEligible(p)) docs.push(fromProduct(p));
  }
  for (const t of listTechnologies()) {
    if (isEligible(t)) docs.push(fromTechnology(t));
  }
  for (const s of listSurfaces()) {
    if (isEligible(s)) docs.push(fromSurface(s));
  }
  for (const e of listAllEntities()) {
    if (e.type !== "category") continue;
    if (isEligible(e)) docs.push(fromCategory(e as Category));
  }
  for (const k of listKnowledge()) {
    if (isEligible(k)) docs.push(fromKnowledge(k));
  }

  cachedCatalog = docs;
  return docs;
}

/** Test helper — clear memoized catalog. */
export function resetSearchCatalogCache(): void {
  cachedCatalog = null;
}

export function getSearchDocumentById(
  id: string,
): SearchDocument | undefined {
  return buildSearchCatalog().find((d) => d.id === id);
}

export function countSearchCatalogByType(): Record<
  SearchEntityType,
  number
> {
  const counts = {
    organization: 0,
    brand: 0,
    productFamily: 0,
    product: 0,
    technology: 0,
    surface: 0,
    category: 0,
    knowledge: 0,
  } satisfies Record<SearchEntityType, number>;
  for (const d of buildSearchCatalog()) {
    counts[d.type]++;
  }
  return counts;
}
