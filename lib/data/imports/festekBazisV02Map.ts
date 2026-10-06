/**
 * Festék Bázis v0.2 curated master → FESTÉKINDEX canonical seed.
 * - No Product.brandId / familyId
 * - Category IDs mapped to repo canonicals
 * - Thin products forced indexable:false
 * - Surfaces / pack technologies: indexable:false
 * - brand_7016 archived draft; pf_7016 is canonical
 */

import type {
  Brand,
  Category,
  Organization,
  Product,
  ProductFamily,
  Relation,
  RelationMetadata,
  Source,
  SourceType,
  Surface,
  SystemRole,
  Technology,
  TechnologyKind,
} from "../types";
import raw from "./festek_bazis_v02_master.json";
import { mapCategoryId } from "./categoryIdMap";

const UPDATED_AT = "2026-10-05";

type PackEntity = {
  id: string;
  type?: string;
  name: string;
  slug: string;
  status: string;
  indexable?: boolean;
  shortDescription?: string;
  body?: string;
  sourceIds?: string[];
  updatedAt?: string;
  verifiedAt?: string;
  aliases?: string[];
  kind?: string;
  legalName?: string;
  roles?: string[];
  country?: string;
  website?: string;
  taxNumber?: string;
  companyRegistrationNumber?: string;
  registeredOffice?: {
    postalCode?: string;
    city?: string;
    addressLine?: string;
  };
  primaryActivity?: string;
  foundedYear?: number;
  hqCity?: string;
};

type PackRelation = {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  relationType: string;
  status: string;
  sourceIds?: string[];
  metadata?: { sequence?: number; role?: string };
};

type PackSource = {
  id: string;
  title: string;
  url?: string;
  publisher?: string;
  sourceType?: string;
  type?: string;
  verifiedAt?: string;
  accessedAt?: string;
  notes?: string;
};

type Pack = {
  organizations: PackEntity[];
  brands: PackEntity[];
  productFamilies: PackEntity[];
  products: PackEntity[];
  surfaces: PackEntity[];
  technologies: PackEntity[];
  categories: PackEntity[];
  relations: PackRelation[];
  sources: PackSource[];
};

const pack = raw as Pack;

const EXISTING_REPO_CATEGORY_IDS = new Set([
  "cat_dekor",
  "cat_homlokzat",
  "cat_faipar",
  "cat_ipari",
  "cat_padlo",
  "cat_csiszolas",
  "cat_tuzvedo",
]);

function mapSourceType(rawType: string | undefined): SourceType {
  switch (rawType) {
    case "official_manufacturer":
    case "manufacturer":
      return "manufacturer";
    case "official_website":
      return "official_website";
    case "hu_representation":
      return "hu_representation";
    case "company_registry":
      return "company_registry";
    case "report":
      return "report";
    default:
      return "other";
  }
}

function meetsProductSeoThreshold(p: PackEntity): boolean {
  const short = (p.shortDescription ?? "").trim();
  const body = (p.body ?? "").trim();
  const sources = p.sourceIds?.length ?? 0;
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (sources < 1 && body.length < 220) return false;
  return true;
}

function structuralShort(name: string, kind: string): string {
  return `${name} — ${kind} a FESTÉKINDEX adatbázisában (Festék Bázis v0.2).`;
}

function mapTechKind(kind: string | undefined): TechnologyKind {
  const allowed: TechnologyKind[] = [
    "application_method",
    "spray_process",
    "equipment_class",
    "process",
    "other",
  ];
  if (kind && (allowed as string[]).includes(kind)) {
    return kind as TechnologyKind;
  }
  return "other";
}

function mapEndpoint(id: string): string {
  if (id.startsWith("cat_")) return mapCategoryId(id);
  return id;
}

function mapMetadata(
  meta: PackRelation["metadata"],
): RelationMetadata | undefined {
  if (!meta) return undefined;
  const role = meta.role as SystemRole | undefined;
  const out: RelationMetadata = {};
  if (typeof meta.sequence === "number") out.sequence = meta.sequence;
  if (
    role === "primer" ||
    role === "intermediate" ||
    role === "topcoat" ||
    role === "component" ||
    role === "other"
  ) {
    out.role = role;
  }
  return Object.keys(out).length ? out : undefined;
}

export type FestekBazisV02Seed = {
  organizations: Organization[];
  brands: Brand[];
  productFamilies: ProductFamily[];
  products: Product[];
  surfaces: Surface[];
  technologies: Technology[];
  categories: Category[];
  relations: Relation[];
  sources: Source[];
  /** Archived v0.1 Brand candidate — never published. */
  archivedBrand7016: Brand;
};

export function mapFestekBazisV02(): FestekBazisV02Seed {
  const sources: Source[] = pack.sources.map((s) => ({
    id: s.id,
    type: mapSourceType(s.sourceType ?? s.type),
    title: s.title,
    url: s.url,
    publisher: s.publisher,
    accessedAt: s.accessedAt ?? s.verifiedAt,
    notes: s.notes,
  }));

  const organizations: Organization[] = pack.organizations.map((o) => ({
    id: o.id,
    type: "organization",
    slug: o.slug,
    name: o.name,
    legalName: o.legalName ?? o.name,
    country: o.country ?? "HU",
    roles: (o.roles as Organization["roles"]) ?? ["manufacturer"],
    website: o.website?.trim() || undefined,
    taxNumber: o.taxNumber?.trim() || undefined,
    companyRegistrationNumber:
      o.companyRegistrationNumber?.trim() || undefined,
    registeredOffice: o.registeredOffice
      ? {
          postalCode: o.registeredOffice.postalCode?.trim() || undefined,
          city: o.registeredOffice.city?.trim() || undefined,
          addressLine: o.registeredOffice.addressLine?.trim() || undefined,
        }
      : undefined,
    primaryActivity: o.primaryActivity?.trim() || undefined,
    // foundedYear omitted unless pack provides it with org-level source support
    foundedYear:
      typeof o.foundedYear === "number" && Number.isFinite(o.foundedYear)
        ? o.foundedYear
        : undefined,
    hqCity: o.hqCity?.trim() || undefined,
    shortDescription:
      (o.shortDescription ?? "").trim() ||
      structuralShort(o.name, "magyar festékgyártó szervezet"),
    body: (o.body ?? "").trim() || undefined,
    status: o.status === "published" ? "published" : "draft",
    indexable: o.indexable !== false,
    seoTitle: `${o.name} | FESTÉKINDEX`,
    seoDescription: `${o.name} — magyar festék- és bevonóanyag-gyártó a FESTÉKINDEX-en.`,
    sourceIds: o.sourceIds ?? [],
    updatedAt: o.updatedAt ?? UPDATED_AT,
    verifiedAt: o.verifiedAt,
  }));

  const brands: Brand[] = pack.brands.map((b) => ({
    id: b.id,
    type: "brand",
    slug: b.slug,
    name: b.name,
    shortDescription:
      (b.shortDescription ?? "").trim() ||
      structuralShort(b.name, "festékmárka"),
    body: (b.body ?? "").trim() || undefined,
    status: b.status === "published" ? "published" : "draft",
    // Thin brand pages: keep published for hub wiring, SEO gate via evaluateIndexability
    indexable: b.indexable !== false,
    seoTitle: `${b.name} | FESTÉKINDEX`,
    seoDescription: `${b.name} márka a FESTÉKINDEX-en.`,
    sourceIds: b.sourceIds ?? [],
    updatedAt: b.updatedAt ?? UPDATED_AT,
  }));

  const archivedBrand7016: Brand = {
    id: "brand_7016",
    type: "brand",
    slug: "7016-archived-brand-candidate",
    name: "7016 (archivált Brand-jelölt)",
    shortDescription:
      "Archivált v0.1 Brand-jelölt. A kanonikus 7016 entitás a pf_7016 ProductFamily.",
    body: "A v0.1 seed brand_7016 candidate státuszban szerepelt. A v0.2 master a gyártói szóhasználat alapján ProductFamily-ként modellezi (pf_7016). Ez a Brand rekord draft és nem indexelhető; owns / hasProduct élek nem kapcsolódnak hozzá.",
    status: "draft",
    indexable: false,
    seoTitle: "7016 archivált Brand-jelölt | FESTÉKINDEX",
    seoDescription: "Archivált Brand-jelölt — kanonikus: pf_7016.",
    sourceIds: ["src_fb_7016_family"],
    updatedAt: UPDATED_AT,
  };

  const productFamilies: ProductFamily[] = pack.productFamilies.map((pf) => ({
    id: pf.id,
    type: "productFamily",
    slug: pf.slug,
    name: pf.name,
    shortDescription:
      (pf.shortDescription ?? "").trim() ||
      structuralShort(pf.name, "termékcsalád"),
    body: (pf.body ?? "").trim() || undefined,
    status: pf.status === "published" ? "published" : "draft",
    indexable: pf.indexable === true,
    seoTitle: `${pf.name} | FESTÉKINDEX`,
    seoDescription: `${pf.name} termékcsalád a FESTÉKINDEX-en.`,
    sourceIds: pf.sourceIds ?? [],
    updatedAt: pf.updatedAt ?? UPDATED_AT,
  }));

  const products: Product[] = pack.products.map((p) => {
    const packIndexable = p.indexable === true;
    const seoOk = meetsProductSeoThreshold(p);
    return {
      id: p.id,
      type: "product",
      slug: p.slug,
      name: p.name,
      shortDescription:
        (p.shortDescription ?? "").trim() ||
        structuralShort(p.name, "termék"),
      body: (p.body ?? "").trim() || undefined,
      status: p.status === "published" ? "published" : "draft",
      // Never auto-enable index when SEO threshold fails
      indexable: packIndexable && seoOk,
      seoTitle: `${p.name} | FESTÉKINDEX`,
      seoDescription: `${p.name} a FESTÉKINDEX termékadatbázisában.`,
      sourceIds: p.sourceIds ?? [],
      updatedAt: p.updatedAt ?? UPDATED_AT,
    };
  });

  const surfaces: Surface[] = pack.surfaces.map((s) => ({
    id: s.id,
    type: "surface",
    slug: s.slug,
    name: s.name,
    aliases: s.aliases ?? [],
    shortDescription:
      (s.shortDescription ?? "").trim() ||
      structuralShort(s.name, "felület / aljzat"),
    body: (s.body ?? "").trim() || undefined,
    status: s.status === "published" ? "published" : "draft",
    indexable: false,
    seoTitle: `Festék ${s.name.toLowerCase()}re | FESTÉKINDEX`,
    seoDescription: `${s.name} felületek a FESTÉKINDEX-en.`,
    sourceIds: s.sourceIds ?? [],
    updatedAt: s.updatedAt ?? UPDATED_AT,
  }));

  const technologies: Technology[] = pack.technologies.map((t) => ({
    id: t.id,
    type: "technology",
    slug: t.slug,
    name: t.name,
    aliases: t.aliases?.length ? t.aliases : [t.name],
    kind: mapTechKind(t.kind),
    shortDescription:
      (t.shortDescription ?? "").trim() ||
      structuralShort(t.name, "felhordási mód / technológia"),
    body: (t.body ?? "").trim() || undefined,
    status: t.status === "published" ? "published" : "draft",
    indexable: false,
    seoTitle: `${t.name} | FESTÉKINDEX`,
    seoDescription: `${t.name} a FESTÉKINDEX-en.`,
    sourceIds: t.sourceIds ?? [],
    updatedAt: t.updatedAt ?? UPDATED_AT,
  }));

  // Only emit categories that are not already in the repo (after ID map).
  const categories: Category[] = [];
  for (const c of pack.categories) {
    const id = mapCategoryId(c.id);
    if (EXISTING_REPO_CATEGORY_IDS.has(id)) continue;
    categories.push({
      id,
      type: "category",
      slug: c.slug,
      name: c.name,
      parentId: null,
      sortOrder: 90,
      shortDescription:
        (c.shortDescription ?? "").trim() ||
        structuralShort(c.name, "szerkesztői kategória"),
      body: (c.body ?? "").trim() || undefined,
      status: c.status === "published" ? "published" : "draft",
      indexable: c.indexable !== false,
      seoTitle: `${c.name} | FESTÉKINDEX`,
      seoDescription: `${c.name} szakterület a FESTÉKINDEX-en.`,
      sourceIds: c.sourceIds ?? [],
      updatedAt: c.updatedAt ?? UPDATED_AT,
    });
  }

  const seenRel = new Set<string>();
  const relations: Relation[] = [];
  for (const r of pack.relations) {
    const fromEntityId = mapEndpoint(r.fromEntityId);
    const toEntityId = mapEndpoint(r.toEntityId);
    const relationType = r.relationType as Relation["relationType"];
    const key = `${fromEntityId}|${relationType}|${toEntityId}`;
    if (seenRel.has(key)) continue;
    seenRel.add(key);

    // Never attach owns / brand hasProduct to archived brand_7016
    if (
      (relationType === "owns" || relationType === "hasProduct") &&
      (fromEntityId === "brand_7016" || toEntityId === "brand_7016")
    ) {
      continue;
    }

    relations.push({
      id: r.id,
      fromEntityId,
      toEntityId,
      relationType,
      sourceIds: r.sourceIds ?? [],
      status: r.status === "active" ? "active" : "draft",
      metadata: mapMetadata(r.metadata),
      verifiedAt: UPDATED_AT,
    });
  }

  return {
    organizations,
    brands,
    productFamilies,
    products,
    surfaces,
    technologies,
    categories,
    relations,
    sources,
    archivedBrand7016,
  };
}

export const festekBazisV02Seed = mapFestekBazisV02();
