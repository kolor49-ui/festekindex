/**
 * Technology Hub v1 — model + public-leakage + regression checks.
 * Run: npx tsx scripts/test-technology-hub-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TechnologyHubPage } from "../components/entity/TechnologyHubPage";
import { getTechnologyPortfolio } from "../lib/data/technologyHub";
import {
  listTechnologies,
  listProducts,
  listSurfaces,
    getProductById,
  getTechnologyById,
  getActiveRelationsForEntity,
  getRelatedEntities,
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

import {
  buildTechnologyHubModel,
  publicSafeTechnologyCopy,
} from "../lib/seo/technologyHubModel";
import { evaluateIndexability } from "../lib/seo/indexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";
import { buildSurfaceHubModel } from "../lib/seo/surfaceHubModel";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

type Exp = {
  p: number;
  fDer: number;
  bDer: number;
  oDer: number;
  c: number;
  s: number;
  k: number;
  fDir?: number;
  bDir?: number;
};

const EXPECTED: Record<string, Exp> = {
  tech_ecset: { p: 43, fDer: 5, bDer: 3, oDer: 1, c: 7, s: 15, k: 0, fDir: 0 },
  tech_henger: { p: 39, fDer: 5, bDer: 3, oDer: 1, c: 7, s: 15, k: 0, fDir: 0 },
  tech_szoras: { p: 23, fDer: 5, bDer: 3, oDer: 1, c: 6, s: 14, k: 0, fDir: 0 },
  tech_glettvas: { p: 5, fDer: 2, bDer: 1, oDer: 1, c: 2, s: 3, k: 0, fDir: 0 },
  tech_air_mix: { p: 1, fDer: 1, bDer: 1, oDer: 1, c: 1, s: 1, k: 0, fDir: 0 },
  tech_airless: {
    p: 1,
    fDer: 1,
    bDer: 1,
    oDer: 1,
    c: 1,
    s: 1,
    k: 1,
    fDir: 3,
    bDir: 2,
  },
  tech_martas: { p: 1, fDer: 1, bDer: 1, oDer: 1, c: 1, s: 1, k: 0, fDir: 0 },
  tech_csiszolas: {
    p: 0,
    fDer: 0,
    bDer: 0,
    oDer: 0,
    c: 0,
    s: 0,
    k: 0,
    fDir: 0,
    bDir: 1,
  },
  tech_porfestek: {
    p: 0,
    fDer: 0,
    bDer: 0,
    oDer: 0,
    c: 0,
    s: 0,
    k: 1,
    fDir: 0,
    bDir: 1,
  },
};

section("build all models");
const technologies = listTechnologies();
assert.equal(technologies.length, 9);

for (const t of technologies) {
  const portfolio = getTechnologyPortfolio(t.id);
  assert.ok(portfolio, `portfolio ${t.id}`);
  const model = buildTechnologyHubModel(t);
  assert.ok(model, `model ${t.id}`);

  const exp = EXPECTED[t.id];
  assert.ok(exp, `unexpected tech ${t.id}`);

  const actual = {
    p: portfolio.products.length,
    fDer: portfolio.derivedFamilies.length,
    bDer: portfolio.derivedBrands.length,
    oDer: portfolio.derivedOrganizations.length,
    c: portfolio.categories.length,
    s: portfolio.surfaces.length,
    k: portfolio.knowledge.length,
    fDir: portfolio.directFamilies.length,
    bDir: portfolio.directBrands.length,
  };

  assert.equal(actual.p, exp.p, `${t.id} P`);
  assert.equal(actual.fDer, exp.fDer, `${t.id} Fder`);
  assert.equal(actual.bDer, exp.bDer, `${t.id} Bder`);
  assert.equal(actual.oDer, exp.oDer, `${t.id} Oder`);
  assert.equal(actual.c, exp.c, `${t.id} C`);
  assert.equal(actual.s, exp.s, `${t.id} S`);
  assert.equal(actual.k, exp.k, `${t.id} K`);
  if (exp.fDir != null) assert.equal(actual.fDir, exp.fDir, `${t.id} Fdir`);
  if (exp.bDir != null) assert.equal(actual.bDir, exp.bDir, `${t.id} Bdir`);

  const uniq = <T extends { id: string }>(arr: T[]) =>
    new Set(arr.map((x) => x.id)).size === arr.length;
  assert.ok(uniq(portfolio.products), `dup products ${t.id}`);
  assert.ok(uniq(portfolio.displayedFamilies), `dup families ${t.id}`);
  assert.ok(uniq(portfolio.displayedBrands), `dup brands ${t.id}`);
  assert.ok(uniq(portfolio.categories), `dup cats ${t.id}`);
  assert.ok(uniq(portfolio.surfaces), `dup surfaces ${t.id}`);

  const groupedIds = portfolio.productGroups.flatMap((g) =>
    g.products.map((p) => p.id),
  );
  assert.equal(groupedIds.length, new Set(groupedIds).size);
  assert.equal(groupedIds.length, portfolio.products.length);

  // Indexability unchanged vs evaluateIndexability
  assert.equal(model.indexable, evaluateIndexability(t).indexable);

  assert.ok(
    !portfolio.displayedBrands.some(
      (b) => b.id === "brand_7016" || /7016/.test(b.name),
    ),
    `7016 brand leak ${t.id}`,
  );
}
console.log("models OK");

section("Airless semantic");
const airless = getTechnologyPortfolio("tech_airless")!;
const airlessModel = buildTechnologyHubModel(getTechnologyById("tech_airless")!)!;
assert.equal(airless.products.length, 1);
assert.equal(airless.products[0]?.id, "prod_coror_ind_enamel");
assert.equal(airless.derivedFamilies[0]?.id, "pf_coror_industry");
assert.deepEqual(
  airless.directFamilies.map((f) => f.name).sort(),
  ["Graco GX", "Graco Mark VII", "Graco Ultra"].sort(),
);
assert.ok(airless.directBrands.some((b) => b.id === "brand_graco"));
assert.ok(airless.directBrands.some((b) => b.id === "brand_wagner"));
assert.ok(
  airless.directOrganizations.some((o) => o.id === "org_euroll_hungaria"),
);
assert.equal(airless.knowledge.length, 1);
assert.ok(airless.sources.length >= 1);
assert.ok(airlessModel.partnerOrganizations);
assert.equal(
  airlessModel.partnerOrganizations!.organizations[0]?.label,
  "Forgalmazó",
);
// Breadcrumb: no Euroll parent
assert.ok(
  !airlessModel.breadcrumbs.some((c) => /euroll/i.test(c.name)),
  "Euroll must not be breadcrumb parent",
);
// Displayed families include both Graco dirs and COROR Industry
assert.ok(
  airlessModel.families.some((f) => f.id === "pf_coror_industry"),
);
assert.ok(airlessModel.families.some((f) => /Graco Mark/i.test(f.name)));
assert.equal(airlessModel.families.length, 4); // 3 direct + 1 derived
console.log("Airless OK");

section("zero-product hubs");
const csisz = buildTechnologyHubModel(getTechnologyById("tech_csiszolas")!)!;
assert.equal(csisz.products.length, 0);
assert.ok(csisz.brands.some((b) => /Mirka/i.test(b.name)));
assert.ok(csisz.sources.length >= 1);
assert.equal(csisz.indexable, false);

const por = buildTechnologyHubModel(getTechnologyById("tech_porfestek")!)!;
assert.equal(por.products.length, 0);
assert.ok(por.brands.some((b) => /Interpon/i.test(b.name)));
assert.equal(por.knowledge.length, 1);
assert.ok(por.sources.length >= 1);
assert.equal(por.indexable, true);
assert.ok(
  listPublishedForSitemap().some((e) => e.path === "/technologiak/porfestek-bevonat"),
);
console.log("zero-product OK");

section("public copy firewall");
assert.equal(
  publicSafeTechnologyCopy(
    "Ecsetes felhordás — felhordási mód / technológia a FESTÉKINDEX adatbázisában (Festék Bázis v0.2).",
  ),
  undefined,
);
assert.equal(
  publicSafeTechnologyCopy(
    "Az airless … relations hálóban kapcsolódnak.",
  ),
  undefined,
);
assert.ok(
  publicSafeTechnologyCopy(
    "Nagy nyomású, levegő nélküli festékszórási eljárás — gépek, anyagok, márkák.",
  ),
);

// Ecset lead must be omitted (structural)
const ecsetModel = buildTechnologyHubModel(getTechnologyById("tech_ecset")!)!;
assert.equal(ecsetModel.lead, undefined);

const leakNeedles = [
  "usesTechnology",
  "applicableToSurface",
  "belongsToCategory",
  "sourceIds",
  "rawValue",
  "verifiedAt",
  "documentKind",
  "productClass",
  "indexable",
  "NOINDEX",
  "VÉKONY",
  "HIÁNYOS",
  "STRONG HUB",
  "Technology hub",
  "Technology entity",
  "v0.2",
  "v0.1",
  "entitás",
  "repository",
  "relations háló",
];

const refs = [
  "tech_ecset",
  "tech_henger",
  "tech_szoras",
  "tech_glettvas",
  "tech_airless",
  "tech_air_mix",
  "tech_martas",
  "tech_csiszolas",
  "tech_porfestek",
].map((id) => buildTechnologyHubModel(getTechnologyById(id)!)!);

for (const model of refs) {
  const html = renderToStaticMarkup(
    createElement(TechnologyHubPage, { model }),
  );
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  for (const needle of leakNeedles) {
    assert.ok(
      !visible.includes(needle),
      `leak "${needle}" in ${model.technology.id}`,
    );
  }
  assert.ok(!/\bentity\b/i.test(visible));
  assert.ok(!/\brelation\b/i.test(visible));
  assert.ok(!/\bgraph\b/i.test(visible));
  assert.ok(!visible.includes("Nincs adat"));
  // Avoid false positive on "10 termék" containing "0 termék"
  assert.ok(!/(^|[^\d])0 termék/.test(visible));
  // No Product section when empty
  if (model.products.length === 0) {
    assert.ok(!visible.includes("Kapcsolódó termékek"));
  }
}
// Airless HTML: no false hierarchy wording
const airlessHtml = renderToStaticMarkup(
  createElement(TechnologyHubPage, { model: airlessModel }),
);
const airlessVisible = airlessHtml
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<[^>]+>/g, " ");
assert.ok(airlessVisible.includes("Forgalmazó"));
assert.ok(airlessVisible.includes("Euroll"));
assert.ok(airlessVisible.includes("Graco"));
assert.ok(airlessVisible.includes("COROR Industry Ipari Zománc"));
assert.ok(!airlessVisible.includes("Tulajdonos"));
console.log("leakage OK");

section("spray overlap regression");
const enamelTechs = getRelatedEntities("prod_coror_ind_enamel", {
  relationTypes: ["usesTechnology"],
  direction: "outgoing",
}).map((r) => r.entity.id);
assert.ok(enamelTechs.includes("tech_szoras"));
assert.ok(enamelTechs.includes("tech_airless"));
assert.ok(enamelTechs.includes("tech_air_mix"));
console.log("spray OK");

section("dataset regression");
const products = listProducts();
let specs = 0;
let packs = 0;
let diluted = 0;
const productUses = allRelations.filter(
  (r) =>
    r.relationType === "usesTechnology" &&
    r.status === "active" &&
    !!getProductById(r.fromEntityId),
);
const withTech = new Set(productUses.map((r) => r.fromEntityId));
for (const p of products) {
  specs += p.specifications?.length ?? 0;
  packs += p.packagingOptions?.length ?? 0;
  for (const r of getActiveRelationsForEntity(p.id)) {
    if (r.relationType === "dilutedWith" && r.fromEntityId === p.id) diluted++;
  }
}
assert.equal(products.length, expectedProductCountAfterClosure());
assert.equal(specs, expectedSpecCountAfterClosure());
assert.equal(packs, expectedPackagingCountAfterClosure());
assert.equal(festekBazisEnrichmentV1.sources.length, expectedEnrichmentSourcesAfterClosure());
assert.equal(diluted, expectedDilutedWithAfterClosure());
assert.equal(technologies.length, 9);
assert.equal(productUses.length, expectedUsesTechnologyAfterClosure());
assert.equal(
  productUses.filter((r) => (r.sourceIds?.length ?? 0) > 0).length,
  expectedUsesTechnologyAfterClosure(),
);
assert.equal(withTech.size, 48);
assert.equal(products.length - withTech.size, 5);
const without = products
  .filter((p) => !withTech.has(p.id))
  .map((p) => p.id)
  .sort();
assert.deepEqual(without, [
  "prod_coror_aromatic",
  "prod_coror_ind_s31",
  "prod_coror_synthetic",
  "prod_valmor_deep_primer",
  "prod_valmor_plinth",
].sort());

const surfaces = listSurfaces();
assert.equal(surfaces.length, 15);
assert.equal(
  allRelations.filter(
    (r) => r.relationType === "applicableToSurface" && r.status === "active",
  ).length,
  expectedApplicableToSurfaceAfterClosure(),
);
assert.equal(products.filter((p) => p.indexable).length, 0);
assert.equal(surfaces.filter((s) => s.indexable).length, 0);
assert.equal(
  listPublishedForSitemap().filter((e) => e.path.startsWith("/feluletek/"))
    .length,
  0,
);

// Surface hub still builds
for (const s of surfaces) {
  assert.ok(buildSurfaceHubModel(s));
}

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
console.log("dataset OK");

console.log("\nALL Technology Hub v1 checks passed.");
