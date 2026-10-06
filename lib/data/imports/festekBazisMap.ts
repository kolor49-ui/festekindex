/**
 * Festék Bázis v0.1 → FESTÉKINDEX canonical seed mapper.
 * Does not denormalize brandId/familyId onto Product entities.
 * Does not emit belongsToCategory from editorialTaxonomy (deferred to v0.2).
 */

import type {
  Brand,
  Organization,
  Product,
  ProductFamily,
  Relation,
  RelationType,
  Surface,
  Technology,
  TechnologyKind,
} from "../types";
import { RELATION_TYPE_DEFS } from "../relationTypes";
import raw from "./festek_bazis_v01.json";
import { mapSurfaceId } from "./surfaceIdMap";

const UPDATED_AT = "2026-10-05";
const SOURCE_ID = "src_festek_bazis_official";

type ImportPack = {
  entities: {
    organizations: Array<{
      id: string;
      name: string;
      slug: string;
      country: string;
      status: string;
    }>;
    brands: Array<{
      id: string;
      name: string;
      slug: string;
      status: string;
      note?: string;
    }>;
    productFamilies: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
    surfaces: Array<{ id: string; name: string; slug: string }>;
    technologies: Array<{ id: string; name: string; slug: string }>;
    products: Array<{
      id: string;
      name: string;
      slug: string;
      brandId: string;
      familyId?: string;
    }>;
  };
  relations: Array<{
    from: string;
    to: string;
    type: string;
    confidence?: string;
  }>;
};

const pack = raw as ImportPack;

const RELATION_TYPE_ALIASES: Record<string, RelationType> = {
  partOfSystemWith: "partOfSystem",
};

const TECH_KIND: Record<string, TechnologyKind> = {
  tech_brush: "application_method",
  tech_roller: "application_method",
  tech_spray: "spray_process",
  tech_airless: "spray_process",
  tech_airmix: "spray_process",
  tech_trowel: "application_method",
};

/** Existing repo Surface IDs — import must not re-emit these (copper/rez is new). */
const EXISTING_SURFACE_IDS = new Set([
  "surface_fa",
  "surface_acel",
  "surface_aluminium",
  "surface_horganyzott_acel",
  "surface_beton",
  "surface_vakolat",
  "surface_gipszkarton",
  "surface_mdf",
  "surface_osb",
  "surface_keramia_csempe",
  "surface_muanyag",
]);

/** Existing repo Technology IDs — skip re-emit. */
const EXISTING_TECH_IDS = new Set([
  "tech_airless",
  "tech_porfestek",
  "tech_csiszolas",
]);

function mapEntityStatus(
  rawStatus: string | undefined,
): "published" | "draft" {
  if (rawStatus === "candidate") return "draft";
  if (rawStatus === "verified" || rawStatus === "active") return "published";
  // Missing status on families/products → published unless overridden
  return "published";
}

function mapRelationStatus(confidence: string | undefined): "active" {
  if (confidence === "verified" || confidence === undefined) return "active";
  return "active";
}

function resolveRelationType(rawType: string): RelationType {
  if (rawType in RELATION_TYPE_ALIASES) {
    return RELATION_TYPE_ALIASES[rawType];
  }
  if (rawType in RELATION_TYPE_DEFS) {
    return rawType as RelationType;
  }
  throw new Error(`Unknown relation type in Festék Bázis import: ${rawType}`);
}

function mapEndpointId(id: string): string {
  if (id.startsWith("surface_")) {
    return mapSurfaceId(id);
  }
  return id;
}

function defaultShort(name: string, kind: string): string {
  return `${name} — ${kind} a FESTÉKINDEX adatbázisában (Festék Bázis v0.1 seed).`;
}

function defaultBody(name: string, kind: string): string {
  return `${name} ${kind} a FESTÉKINDEX normalizált graphjában. A tulajdonosi, termékcsalád-, felület- és technológia-kapcsolatok relations éleken élnek; a gyártói marketing-navigáció nem helyettesíti a szakmai Surface / Category dimenziókat. Forrás: Festék Bázis v0.1 curated seed.`;
}

function relId(
  from: string,
  type: string,
  to: string,
): string {
  return `rel_fb_${from}_${type}_${to}`.replace(/[^a-zA-Z0-9_]/g, "_");
}

export type FestekBazisMappedSeed = {
  organizations: Organization[];
  brands: Brand[];
  productFamilies: ProductFamily[];
  products: Product[];
  surfaces: Surface[];
  technologies: Technology[];
  relations: Relation[];
};

export function mapFestekBazisV01(): FestekBazisMappedSeed {
  const organizations: Organization[] = pack.entities.organizations.map(
    (o) => ({
      id: o.id,
      type: "organization" as const,
      slug: o.slug,
      name: o.name,
      legalName: "FESTÉK BÁZIS Zártkörűen Működő Részvénytársaság",
      country: o.country,
      roles: ["manufacturer" as const],
      shortDescription: defaultShort(o.name, "magyar festékgyártó szervezet"),
      body: defaultBody(o.name, "magyar festék- és bevonóanyag-gyártó szervezet"),
      status: mapEntityStatus(o.status),
      indexable: true,
      seoTitle: `${o.name} | FESTÉKINDEX`,
      seoDescription: `${o.name}: VALMOR, FACTOR, COROR márkák — magyar festékgyártó a FESTÉKINDEX-en.`,
      sourceIds: [SOURCE_ID],
      updatedAt: UPDATED_AT,
    }),
  );

  const brands: Brand[] = pack.entities.brands.map((b) => {
    const status = mapEntityStatus(b.status);
    const isCandidate = b.status === "candidate";
    return {
      id: b.id,
      type: "brand" as const,
      slug: b.slug,
      name: b.name,
      shortDescription: isCandidate
        ? `${b.name} — márkajelölt (candidate); formális Brand státusz ellenőrzés alatt. ${b.note ?? ""}`.trim()
        : defaultShort(b.name, "festékmárka"),
      body: isCandidate
        ? `${b.name} a hivatalos gyártói oldalon saját név alatt futó terméksor. A FESTÉKINDEX-en egyelőre draft Brand-jelölt (indexable: false); owns relation nincs, amíg a formális márkastátusz nincs ellenőrizve. ${b.note ?? ""}`
        : defaultBody(b.name, "festékmárka (Festék Bázis)"),
      status,
      indexable: !isCandidate,
      seoTitle: `${b.name} | FESTÉKINDEX`,
      seoDescription: `${b.name} márka a FESTÉKINDEX-en.`,
      sourceIds: [SOURCE_ID],
      updatedAt: UPDATED_AT,
    };
  });

  const productFamilies: ProductFamily[] = pack.entities.productFamilies.map(
    (pf) => ({
      id: pf.id,
      type: "productFamily" as const,
      slug: pf.slug,
      name: pf.name,
      shortDescription: defaultShort(pf.name, "termékcsalád"),
      body: defaultBody(pf.name, "termékcsalád"),
      status: "published" as const,
      indexable: true,
      seoTitle: `${pf.name} | FESTÉKINDEX`,
      seoDescription: `${pf.name} termékcsalád a FESTÉKINDEX-en.`,
      sourceIds: [SOURCE_ID],
      updatedAt: UPDATED_AT,
    }),
  );

  const products: Product[] = pack.entities.products.map((p) => {
    const underCandidate = p.brandId === "brand_7016";
    return {
      id: p.id,
      type: "product" as const,
      slug: p.slug,
      name: p.name,
      shortDescription: defaultShort(p.name, "termék"),
      body: defaultBody(p.name, "konkrét termék"),
      status: underCandidate ? ("draft" as const) : ("published" as const),
      indexable: !underCandidate,
      seoTitle: `${p.name} | FESTÉKINDEX`,
      seoDescription: `${p.name} a FESTÉKINDEX termékadatbázisában.`,
      sourceIds: [SOURCE_ID],
      updatedAt: UPDATED_AT,
    };
  });

  // Only emit Surfaces that are not already in the repo (after ID mapping).
  const surfaces: Surface[] = [];
  for (const s of pack.entities.surfaces) {
    const id = mapSurfaceId(s.id);
    if (EXISTING_SURFACE_IDS.has(id)) continue;
    surfaces.push({
      id,
      type: "surface",
      slug: s.slug,
      name: s.name,
      aliases:
        id === "surface_rez" ? ["réz", "copper", "Cu"] : [s.name.toLowerCase()],
      shortDescription: defaultShort(s.name, "felület / aljzat"),
      body: defaultBody(s.name, "felülettípus (Surface)"),
      status: "published",
      indexable: true,
      seoTitle: `Festék ${s.name.toLowerCase()}re | FESTÉKINDEX`,
      seoDescription: `${s.name} felületekre alkalmazható bevonatok a FESTÉKINDEX-en.`,
      sourceIds: [SOURCE_ID],
      updatedAt: UPDATED_AT,
    });
  }

  const technologies: Technology[] = [];
  for (const t of pack.entities.technologies) {
    if (EXISTING_TECH_IDS.has(t.id)) continue;
    const kind = TECH_KIND[t.id] ?? "other";
    technologies.push({
      id: t.id,
      type: "technology",
      slug: t.slug,
      name: t.name,
      aliases: [t.name],
      kind,
      shortDescription: defaultShort(t.name, "felhordási / alkalmazási mód"),
      body: defaultBody(t.name, "felhordási technológia"),
      status: "published",
      indexable: true,
      seoTitle: `${t.name} | FESTÉKINDEX`,
      seoDescription: `${t.name} a FESTÉKINDEX technológia-hálójában.`,
      sourceIds: [SOURCE_ID],
      updatedAt: UPDATED_AT,
    });
  }

  const relations: Relation[] = [];
  const seen = new Set<string>();

  const pushRelation = (r: Relation) => {
    const key = `${r.fromEntityId}|${r.relationType}|${r.toEntityId}`;
    if (seen.has(key)) return;
    seen.add(key);
    relations.push(r);
  };

  // Pack relations (mapped types + surface IDs). Skip owns→7016 if ever present.
  for (const edge of pack.relations) {
    const relationType = resolveRelationType(edge.type);
    const fromEntityId = mapEndpointId(edge.from);
    const toEntityId = mapEndpointId(edge.to);

    if (
      relationType === "owns" &&
      toEntityId === "brand_7016"
    ) {
      continue;
    }

    pushRelation({
      id: relId(fromEntityId, relationType, toEntityId),
      fromEntityId,
      toEntityId,
      relationType,
      sourceIds: [SOURCE_ID],
      status: mapRelationStatus(edge.confidence),
      verifiedAt: edge.confidence === "verified" ? UPDATED_AT : undefined,
    });
  }

  // Generate hasProduct from brandId/familyId — never both for same product.
  for (const p of pack.entities.products) {
    if (p.familyId) {
      pushRelation({
        id: relId(p.familyId, "hasProduct", p.id),
        fromEntityId: p.familyId,
        toEntityId: p.id,
        relationType: "hasProduct",
        sourceIds: [SOURCE_ID],
        status: "active",
        verifiedAt: UPDATED_AT,
      });
    } else {
      pushRelation({
        id: relId(p.brandId, "hasProduct", p.id),
        fromEntityId: p.brandId,
        toEntityId: p.id,
        relationType: "hasProduct",
        sourceIds: [SOURCE_ID],
        status: "active",
        verifiedAt: UPDATED_AT,
      });
    }
  }

  // Safety: never emit owns for 7016
  const filtered = relations.filter(
    (r) =>
      !(
        r.relationType === "owns" &&
        (r.toEntityId === "brand_7016" || r.fromEntityId === "brand_7016")
      ),
  );

  return {
    organizations,
    brands,
    productFamilies,
    products,
    surfaces,
    technologies,
    relations: filtered,
  };
}

export const festekBazisV01Seed = mapFestekBazisV01();
