/**
 * SEO Indexability Coherence Fix v1 — public evaluator + robots/sitemap.
 * Run: npx tsx scripts/test-seo-indexability-coherence-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  getBrandById,
  getCategoryById,
  getEntityHref,
  getKnowledgeById,
  getOrganizationById,
  getProductById,
  getProductFamilyById,
  getRelatedEntities,
  getTechnologyById,
  listAllEntities,
  listBrands,
  listKnowledge,
  listOrganizations,
  listProductFamilies,
  listProducts,
  listSurfaces,
  listTechnologies,
} from "../lib/data/repository";
import { allRelations } from "../lib/data/imports/allRelations";
import { festekBazisEnrichmentV1 } from "../lib/data/imports/festekBazisEnrichmentV1";
import {
  expectedDilutedWithAfterClosure,
  expectedEnrichmentSourcesAfterClosure,
  expectedPackagingCountAfterClosure,
  expectedProductCountAfterClosure,
  expectedSpecCountAfterClosure,
  expectedMergedSourcesAfterClosure,
  expectedProductCategoryRelationsAfterClosure,
  expectedUsesTechnologyAfterClosure,
  expectedApplicableToSurfaceAfterClosure,
  expectedSearchDocumentsAfterClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";

import { sources as sourcesBase } from "../lib/data/sources";
import { festekBazisV02Seed } from "../lib/data/imports/festekBazisV02Map";
import { mergeById } from "../lib/data/imports/merge";
import { evaluateIndexability } from "../lib/seo/indexability";
import {
  evaluatePublicIndexability,
  isPubliclyIndexable,
} from "../lib/seo/publicIndexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";
import {
  buildOrganizationHubModel,
  organizationHubMetadata,
} from "../lib/seo/organizationHubModel";
import {
  buildBrandHubModel,
  brandHubMetadata,
} from "../lib/seo/brandHubModel";
import {
  buildProductFamilyHubModel,
  productFamilyHubMetadata,
} from "../lib/seo/productFamilyHubModel";
import {
  buildProductHubModel,
  productHubMetadata,
} from "../lib/seo/productHubModel";
import {
  buildSurfaceHubModel,
  surfaceHubMetadata,
} from "../lib/seo/surfaceHubModel";
import {
  buildTechnologyHubModel,
  technologyHubMetadata,
} from "../lib/seo/technologyHubModel";
import {
  buildCategoryHubModel,
  categoryHubMetadata,
} from "../lib/seo/categoryHubModel";
import {
  buildKnowledgeHubModel,
  knowledgeHubMetadata,
} from "../lib/seo/knowledgeHubModel";
import { OrganizationHubPage } from "../components/entity/OrganizationHubPage";
import { BrandHubPage } from "../components/entity/BrandHubPage";
import { getCanonicalBrandOwner } from "../lib/navigation/entityNavigation";
import { categories as categoriesBase } from "../lib/data/categories";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

function robotsIndex(meta: { robots?: { index?: boolean } }): boolean {
  return meta.robots?.index === true;
}

section("hard gates");
assert.equal(
  evaluatePublicIndexability(getBrandById("brand_7016")!).indexable,
  false,
);
assert.equal(
  evaluatePublicIndexability(getBrandById("brand_7016")!).source,
  "not_published",
);
assert.equal(
  evaluatePublicIndexability(getCategoryById("cat_all")!).indexable,
  false,
);
assert.equal(
  evaluatePublicIndexability(getCategoryById("cat_all")!).source,
  "synthetic_nav_category",
);
assert.equal(
  evaluatePublicIndexability(getProductFamilyById("pf_7016")!).indexable,
  false,
);
assert.equal(
  evaluatePublicIndexability(getProductFamilyById("pf_7016")!).source,
  "flag_noindex",
);
assert.equal(
  evaluatePublicIndexability(getProductById("prod_valmor_airflow_interior")!)
    .indexable,
  false,
);
assert.equal(
  evaluatePublicIndexability(getProductById("prod_valmor_airflow_interior")!)
    .source,
  "flag_noindex",
);
assert.equal(
  evaluatePublicIndexability(listSurfaces()[0]!).indexable,
  false,
);
assert.equal(
  evaluatePublicIndexability(getTechnologyById("tech_airless")!).indexable,
  false,
);
assert.equal(
  evaluatePublicIndexability(getTechnologyById("tech_airless")!).source,
  "flag_noindex",
);
console.log("hard gates OK");

section("false-flag override (fixture)");
const valmor = getBrandById("brand_valmor")!;
const flaggedFalse = { ...valmor, indexable: false as const };
assert.equal(evaluateIndexability(flaggedFalse).indexable, false);
assert.equal(evaluatePublicIndexability(flaggedFalse).indexable, false);
assert.equal(evaluatePublicIndexability(flaggedFalse).source, "flag_noindex");
// Real VALMOR remains publicly indexable via Hub policy
assert.equal(evaluatePublicIndexability(valmor).indexable, true);
console.log("false-flag override OK");

section("Organization");
const fb = getOrganizationById("org_festek_bazis_zrt")!;
assert.equal(evaluateIndexability(fb).indexable, false);
assert.equal(evaluatePublicIndexability(fb).indexable, true);
assert.equal(
  evaluatePublicIndexability(fb).source,
  "organization_editorial_override",
);
const fbHub = buildOrganizationHubModel(fb)!;
assert.equal(fbHub.indexable, true);
assert.equal(robotsIndex(organizationHubMetadata(fbHub)), true);
assert.ok(
  listPublishedForSitemap().some((e) => e.path === getEntityHref(fb)),
);

const sika = getOrganizationById("org_sika_hungaria")!;
assert.equal(evaluatePublicIndexability(sika).indexable, false);
assert.ok(
  !listPublishedForSitemap().some((e) => e.path === getEntityHref(sika)),
);
const aerosols = getOrganizationById("org_european_aerosols")!;
assert.equal(evaluatePublicIndexability(aerosols).indexable, false);
assert.ok(
  !listPublishedForSitemap().some((e) => e.path === getEntityHref(aerosols)),
);
console.log("Organization OK");

section("Brands");
for (const [id, source] of [
  ["brand_valmor", "brand_editorial_override"],
  ["brand_factor", "brand_substantive_portfolio"],
  ["brand_coror", "brand_substantive_portfolio"],
] as const) {
  const b = getBrandById(id)!;
  assert.equal(evaluateIndexability(b).indexable, false, id);
  const pub = evaluatePublicIndexability(b);
  assert.equal(pub.indexable, true, id);
  assert.equal(pub.source, source, `${id} source`);
  const hub = buildBrandHubModel(b)!;
  assert.equal(hub.indexable, true, id);
  assert.equal(robotsIndex(brandHubMetadata(hub)), true, id);
  assert.ok(
    listPublishedForSitemap().some((e) => e.path === getEntityHref(b)),
    id,
  );
}
for (const id of [
  "brand_graco",
  "brand_wagner",
  "brand_dulux",
  "brand_sikkens",
  "brand_international",
]) {
  const b = getBrandById(id)!;
  assert.equal(evaluatePublicIndexability(b).indexable, true, id);
  assert.ok(listPublishedForSitemap().some((e) => e.path === getEntityHref(b)));
}
for (const id of [
  "brand_mirka",
  "brand_interpon",
  "brand_milesi",
  "brand_hera",
  "brand_sika",
]) {
  const b = getBrandById(id)!;
  assert.equal(evaluatePublicIndexability(b).indexable, false, id);
  assert.ok(
    !listPublishedForSitemap().some((e) => e.path === getEntityHref(b)),
    id,
  );
}
console.log("Brands OK");

section("ProductFamily");
for (const id of [
  "pf_valmor_air_flow",
  "pf_factor_aqua",
  "pf_coror_rapid",
  "pf_coror_industry",
  "pf_7016",
]) {
  const f = getProductFamilyById(id)!;
  assert.equal(evaluatePublicIndexability(f).indexable, false, id);
  const hub = buildProductFamilyHubModel(f)!;
  assert.equal(hub.indexable, false, id);
  assert.equal(robotsIndex(productFamilyHubMetadata(hub)), false, id);
  assert.ok(
    !listPublishedForSitemap().some((e) => e.path === getEntityHref(f)),
    id,
  );
}
for (const id of ["pf_graco_mark", "pf_graco_ultra", "pf_graco_gx"]) {
  const f = getProductFamilyById(id)!;
  assert.equal(evaluatePublicIndexability(f).indexable, true, id);
  assert.ok(listPublishedForSitemap().some((e) => e.path === getEntityHref(f)));
}
const familySm = listPublishedForSitemap().filter((e) =>
  e.path.startsWith("/termekcsaladok/"),
);
assert.equal(familySm.length, 3);
console.log("ProductFamily OK");

section("Product / Surface locks");
assert.equal(listProducts().length, expectedProductCountAfterClosure());
assert.equal(
  listProducts().filter((p) => evaluatePublicIndexability(p).indexable).length,
  0,
);
assert.equal(
  listPublishedForSitemap().filter((e) => e.path.startsWith("/termekek/"))
    .length,
  0,
);
assert.equal(listSurfaces().length, 15);
assert.equal(
  listSurfaces().filter((s) => evaluatePublicIndexability(s).indexable).length,
  0,
);
assert.equal(
  listPublishedForSitemap().filter((e) => e.path.startsWith("/feluletek/"))
    .length,
  0,
);
console.log("Product/Surface OK");

section("Technology / Category / Knowledge");
assert.equal(
  evaluatePublicIndexability(getTechnologyById("tech_porfestek")!).indexable,
  true,
);
assert.ok(
  listPublishedForSitemap().some(
    (e) => e.path === "/technologiak/porfestek-bevonat",
  ),
);
assert.equal(
  evaluatePublicIndexability(getTechnologyById("tech_airless")!).indexable,
  false,
);
assert.equal(
  listPublishedForSitemap().filter((e) =>
    e.path.startsWith("/technologiak/"),
  ).length,
  1,
);

const indexableCats = [
  "cat_dekor",
  "cat_homlokzat",
  "cat_ipari",
  "cat_porfestek",
  "cat_szoras",
];
for (const id of indexableCats) {
  assert.equal(
    evaluatePublicIndexability(getCategoryById(id)!).indexable,
    true,
    id,
  );
}
assert.equal(
  listPublishedForSitemap().filter((e) => e.path.startsWith("/kategoriak/"))
    .length,
  5,
);

assert.equal(listKnowledge().length, 2);
for (const k of listKnowledge()) {
  assert.equal(evaluatePublicIndexability(k).indexable, true);
  assert.ok(
    listPublishedForSitemap().some((e) => e.path === `/tudastar/${k.slug}`),
  );
}
console.log("Tech/Category/Knowledge OK");

section("sitemap total + M1/M2/M3");
const sm = listPublishedForSitemap();
assert.equal(sm.length, 35, `expected 35 sitemap URLs, got ${sm.length}`);
const detailOrgs = sm.filter(
  (e) => e.path.startsWith("/cegek/") && e.path !== "/cegek",
);
const detailBrands = sm.filter(
  (e) => e.path.startsWith("/markak/") && e.path !== "/markak",
);
assert.equal(detailOrgs.length, 7);
assert.equal(detailBrands.length, 8);
assert.ok(sm.some((e) => e.path === "/cegek/festek-bazis-zrt"));
assert.ok(sm.some((e) => e.path === "/markak/valmor"));
assert.ok(sm.some((e) => e.path === "/markak/factor"));
assert.ok(sm.some((e) => e.path === "/markak/coror"));

type Row = {
  entity: ReturnType<typeof listAllEntities>[number];
  pub: ReturnType<typeof evaluatePublicIndexability>;
  robots: boolean | null;
  sitemap: boolean;
};
const rows: Row[] = [];

function hubRobots(entity: Row["entity"]): boolean | null {
  if (entity.status !== "published" || entity.id === "cat_all") return null;
  switch (entity.type) {
    case "organization": {
      const m = buildOrganizationHubModel(entity);
      return m ? robotsIndex(organizationHubMetadata(m)) : null;
    }
    case "brand": {
      const m = buildBrandHubModel(entity);
      return m ? robotsIndex(brandHubMetadata(m)) : null;
    }
    case "productFamily": {
      const m = buildProductFamilyHubModel(entity);
      return m ? robotsIndex(productFamilyHubMetadata(m)) : null;
    }
    case "product": {
      const m = buildProductHubModel(entity);
      return m ? robotsIndex(productHubMetadata(m)) : null;
    }
    case "surface": {
      const m = buildSurfaceHubModel(entity);
      return m ? robotsIndex(surfaceHubMetadata(m)) : null;
    }
    case "technology": {
      const m = buildTechnologyHubModel(entity);
      return m ? robotsIndex(technologyHubMetadata(m)) : null;
    }
    case "category": {
      const m = buildCategoryHubModel(entity);
      return m ? robotsIndex(categoryHubMetadata(m)) : null;
    }
    case "knowledge": {
      const m = buildKnowledgeHubModel(entity);
      return m ? robotsIndex(knowledgeHubMetadata(m)) : null;
    }
    default:
      return null;
  }
}

const smSet = new Set(sm.map((e) => e.path));
for (const entity of listAllEntities()) {
  if (entity.id === "cat_all") continue;
  if (entity.status !== "published") continue;
  const pub = evaluatePublicIndexability(entity);
  const robots = hubRobots(entity);
  rows.push({
    entity,
    pub,
    robots,
    sitemap: smSet.has(getEntityHref(entity)),
  });
}

const M1 = rows.filter((r) => r.robots === true && !r.sitemap);
const M2 = rows.filter((r) => r.robots === false && r.sitemap);
const M3 = rows.filter(
  (r) => r.entity.indexable === false && r.pub.indexable === true,
);
const M4 = rows.filter((r) => !r.pub.baseIndexable && r.pub.indexable);
assert.equal(M1.length, 0, `M1 remaining: ${M1.map((r) => r.entity.id)}`);
assert.equal(M2.length, 0, `M2: ${M2.map((r) => r.entity.id)}`);
assert.equal(M3.length, 0, `M3: ${M3.map((r) => r.entity.id)}`);
assert.equal(M4.length, 4);
assert.deepEqual(
  M4.map((r) => r.entity.id).sort(),
  [
    "brand_coror",
    "brand_factor",
    "brand_valmor",
    "org_festek_bazis_zrt",
  ].sort(),
);

for (const r of rows) {
  if (r.robots === null) continue;
  assert.equal(
    r.robots,
    r.pub.indexable,
    `robots≠public ${r.entity.id}`,
  );
  assert.equal(
    r.sitemap,
    r.pub.indexable,
    `sitemap≠public ${r.entity.id}`,
  );
}
console.log("coherence OK");

section("public UI smoke / leakage");
const fbHtml = renderToStaticMarkup(
  createElement(OrganizationHubPage, {
    model: buildOrganizationHubModel(fb)!,
  }),
);
const valmorHtml = renderToStaticMarkup(
  createElement(BrandHubPage, {
    model: buildBrandHubModel(valmor)!,
  }),
);
for (const html of [fbHtml, valmorHtml]) {
  const vis = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  assert.ok(!vis.includes("organization_editorial_override"));
  assert.ok(!vis.includes("brand_substantive_portfolio"));
  assert.ok(!vis.includes("base_quality_fail"));
  assert.ok(!/\bsourceIds\b/.test(vis));
}
console.log("UI smoke OK");

section("dataset regression");
const products = listProducts();
let specs = 0;
let packs = 0;
let diluted = 0;
for (const p of products) {
  specs += p.specifications?.length ?? 0;
  packs += p.packagingOptions?.length ?? 0;
  for (const r of getRelatedEntities(p.id, {
    relationTypes: ["dilutedWith"],
    direction: "outgoing",
  })) {
    diluted++;
  }
}
const categories = mergeById(
  categoriesBase,
  festekBazisV02Seed.categories,
).filter((c) => c.status === "published");
const productCat = allRelations.filter(
  (r) =>
    r.relationType === "belongsToCategory" &&
    r.status === "active" &&
    !!getProductById(r.fromEntityId),
);
const productUses = allRelations.filter(
  (r) =>
    r.relationType === "usesTechnology" &&
    r.status === "active" &&
    !!getProductById(r.fromEntityId),
);
const ats = allRelations.filter(
  (r) => r.relationType === "applicableToSurface" && r.status === "active",
);
assert.equal(products.length, expectedProductCountAfterClosure());
assert.equal(specs, expectedSpecCountAfterClosure());
assert.equal(packs, expectedPackagingCountAfterClosure());
assert.equal(diluted, expectedDilutedWithAfterClosure());
assert.equal(categories.length, 20);
assert.equal(productCat.length, expectedProductCategoryRelationsAfterClosure());
assert.equal(listTechnologies().length, 9);
assert.equal(productUses.length, expectedUsesTechnologyAfterClosure());
assert.equal(listSurfaces().length, 15);
assert.equal(ats.length, expectedApplicableToSurfaceAfterClosure());
assert.equal(listKnowledge().length, 2);
assert.equal(festekBazisEnrichmentV1.sources.length, expectedEnrichmentSourcesAfterClosure());
const globalSources = mergeById(
  mergeById(sourcesBase, festekBazisV02Seed.sources),
  festekBazisEnrichmentV1.sources,
);
assert.equal(globalSources.length, expectedMergedSourcesAfterClosure());
assert.equal(
  allRelations.filter(
    (r) =>
      r.fromEntityId === "brand_7016" || r.toEntityId === "brand_7016",
  ).length,
  0,
);
assert.equal(
  (getProductById("prod_coror_aromatic")?.specifications ?? []).filter(
    (s) => s.key === "binder",
  ).length,
  0,
);
assert.equal(
  (getProductById("prod_coror_ind_enamel")?.specifications ?? []).filter(
    (s) => s.key === "binder" && s.status === "verified",
  ).length,
  0,
);
assert.equal(
  (getProductById("prod_valmor_plaster")?.packagingOptions ?? []).filter(
    (o) => o.status === "verified",
  ).length,
  0,
);
assert.ok(
  getRelatedEntities("prod_factor_parquet", {
    relationTypes: ["dilutedWith"],
    direction: "outgoing",
  }).some((r) => r.entity.id === "prod_coror_synthetic"),
);
assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
assert.equal(listOrganizations().filter((o) => o.id === "org_festek_bazis_zrt").length, 1);
assert.equal(
  ["brand_valmor", "brand_factor", "brand_coror"].filter((id) =>
    listBrands().some((b) => b.id === id),
  ).length,
  3,
);
assert.equal(listProductFamilies().length, 8);
console.log("dataset OK");

console.log("\nALL SEO Indexability Coherence v1 checks passed.");
