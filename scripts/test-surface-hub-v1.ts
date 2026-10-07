/**
 * Surface Hub v1 — model + public-leakage checks.
 * Run: npx tsx scripts/test-surface-hub-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SurfaceHubPage } from "../components/entity/SurfaceHubPage";
import {
  getSurfacePortfolio,
} from "../lib/data/surfaceHub";
import {
  listSurfaces,
  listProducts,
    getProductById,
  getActiveRelationsForEntity,
  getSurfaceById,
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
  buildSurfaceHubModel,
  publicSafeSurfaceCopy,
} from "../lib/seo/surfaceHubModel";
import { evaluateIndexability } from "../lib/seo/indexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const EXPECTED: Record<
  string,
  { p: number; f: number; b: number; o: number; c: number; t: number; k: number }
> = {
  // Counts include Missing Products Closure v1 (Aqua Vastaglazúr + Rapid Aqua)
  surface_vakolat: { p: 11, f: 3, b: 2, o: 1, c: 4, t: 4, k: 0 },
  surface_beton: { p: 9, f: 2, b: 2, o: 1, c: 3, t: 4, k: 0 },
  surface_fa: { p: 9, f: 2, b: 2, o: 1, c: 3, t: 4, k: 0 },
  surface_acel: { p: 6, f: 2, b: 1, o: 1, c: 2, t: 5, k: 0 },
  surface_gipszkarton: { p: 3, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_tegla: { p: 3, f: 0, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_aluminium: { p: 3, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_eps_xps: { p: 2, f: 0, b: 1, o: 1, c: 1, t: 2, k: 0 },
  surface_horganyzott_acel: { p: 3, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_rez: { p: 3, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_ko: { p: 2, f: 0, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_muanyag: { p: 2, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_osb: { p: 2, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_keramia_csempe: { p: 1, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
  surface_mdf: { p: 1, f: 1, b: 1, o: 1, c: 1, t: 3, k: 0 },
};

section("build all models");
const surfaces = listSurfaces();
assert.equal(surfaces.length, 15);

for (const s of surfaces) {
  const portfolio = getSurfacePortfolio(s.id);
  assert.ok(portfolio, `portfolio missing for ${s.id}`);
  const model = buildSurfaceHubModel(s);
  assert.ok(model, `model missing for ${s.id}`);

  const exp = EXPECTED[s.id];
  assert.ok(exp, `unexpected surface ${s.id}`);

  const actual = {
    p: portfolio.products.length,
    f: portfolio.families.length,
    b: portfolio.brands.length,
    o: portfolio.organizations.length,
    c: portfolio.categories.length,
    t: portfolio.technologies.length,
    k: portfolio.knowledge.length,
  };

  assert.deepEqual(
    actual,
    exp,
    `count drift ${s.id}: got ${JSON.stringify(actual)} expected ${JSON.stringify(exp)}`,
  );

  // Dedupe by id
  const uniq = <T extends { id: string }>(arr: T[]) =>
    new Set(arr.map((x) => x.id)).size === arr.length;
  assert.ok(uniq(portfolio.products), `dup products ${s.id}`);
  assert.ok(uniq(portfolio.families), `dup families ${s.id}`);
  assert.ok(uniq(portfolio.brands), `dup brands ${s.id}`);
  assert.ok(uniq(portfolio.categories), `dup categories ${s.id}`);
  assert.ok(uniq(portfolio.technologies), `dup technologies ${s.id}`);

  // Product appears once across groups
  const groupedIds = portfolio.productGroups.flatMap((g) =>
    g.products.map((p) => p.id),
  );
  assert.equal(
    groupedIds.length,
    new Set(groupedIds).size,
    `dup in groups ${s.id}`,
  );
  assert.equal(groupedIds.length, portfolio.products.length);

  // Indexability freeze
  assert.equal(s.indexable, false, `indexable flag ${s.id}`);
  assert.equal(evaluateIndexability(s).indexable, false, `eval indexable ${s.id}`);
  assert.equal(model.indexable, false);

  // 7016 never brand
  assert.ok(
    !portfolio.brands.some((b) => b.id === "brand_7016" || b.name.includes("7016")),
    `7016 brand leak ${s.id}`,
  );

  // Empty sections omitted in model flags
  if (portfolio.knowledge.length === 0) {
    assert.equal(model.knowledge.length, 0);
  }
  if (portfolio.families.length === 0) {
    assert.equal(model.families.length, 0);
  }
}
console.log("models OK");

section("reference regressions");
const tegla = getSurfacePortfolio("surface_tegla")!;
assert.equal(tegla.families.length, 0);
assert.equal(tegla.products.length, 3);

const mdf = buildSurfaceHubModel(getSurfaceById("surface_mdf")!)!;
assert.equal(mdf.products.length, 1);
assert.equal(mdf.products[0]?.id, "prod_coror_rapid_aqua_enamel");
assert.equal(mdf.families.length, 1);
assert.equal(mdf.brands.length, 1);
assert.equal(mdf.categories.length, 1);
assert.equal(mdf.technologies.length, 3);
assert.equal(mdf.knowledge.length, 0);

const keramia = buildSurfaceHubModel(getSurfaceById("surface_keramia_csempe")!)!;
assert.equal(keramia.products.length, 1);
assert.equal(keramia.products[0]?.id, "prod_coror_rapid_aqua_enamel");

const fa = getSurfacePortfolio("surface_fa")!;
assert.deepEqual(
  fa.brands.map((b) => b.name).sort(),
  ["COROR", "FACTOR"],
);

const acel = getSurfacePortfolio("surface_acel")!;
assert.equal(acel.brands.length, 1);
assert.equal(acel.brands[0]?.name, "COROR");
assert.ok(acel.technologies.some((t) => /airless/i.test(t.name)));
assert.ok(acel.technologies.some((t) => /air-mix|airmix|air mix/i.test(t.name) || /Air-mix/.test(t.name)));

// Manufacturer omitted when brands present
const vakolatModel = buildSurfaceHubModel(getSurfaceById("surface_vakolat")!)!;
assert.equal(vakolatModel.manufacturerContext, undefined);

// Grouping: Vakolat >=4 products + >=2 cats → grouped
assert.ok(
  vakolatModel.productGroups.some((g) => g.categoryName),
  "Vakolat should category-group",
);

// Tégla <=3 → flat
const teglaModel = buildSurfaceHubModel(getSurfaceById("surface_tegla")!)!;
assert.ok(
  teglaModel.productGroups.every((g) => !g.categoryName) ||
    teglaModel.productGroups.length === 1,
);
assert.ok(!teglaModel.productGroups.some((g) => g.categoryName));

console.log("reference OK");

section("public copy firewall");
assert.equal(
  publicSafeSurfaceCopy(
    "A fa felület a FESTÉKINDEX-en önálló Surface entitás. applicableToSurface relationnel.",
  ),
  undefined,
);
assert.equal(
  publicSafeSurfaceCopy(
    "Tégla — felület / aljzat a FESTÉKINDEX adatbázisában (Festék Bázis v0.2).",
  ),
  undefined,
);
assert.ok(
  publicSafeSurfaceCopy(
    "Fa és faszerkezetek bevonatolása: lazúrok, lakkok, fafestékek és impregnálók.",
  ),
);

const leakNeedles = [
  "applicableToSurface",
  "belongsToCategory",
  "usesTechnology",
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
  "Surface hub",
  "v0.2",
  "repository",
  "entitás",
];

const refs = [
  "surface_vakolat",
  "surface_beton",
  "surface_fa",
  "surface_acel",
  "surface_tegla",
  "surface_muanyag",
  "surface_mdf",
  "surface_keramia_csempe",
].map((id) => buildSurfaceHubModel(getSurfaceById(id)!)!);

for (const model of refs) {
  const html = renderToStaticMarkup(createElement(SurfaceHubPage, { model }));
  // Strip scripts + tags — audit visible copy, not CSS classes (entity-card) / JSON-LD
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  for (const needle of leakNeedles) {
    assert.ok(
      !visible.includes(needle),
      `leak "${needle}" in ${model.surface.id}`,
    );
  }
  assert.ok(!/\bentity\b/i.test(visible), `entity leak ${model.surface.id}`);
  assert.ok(!/\brelation\b/i.test(visible), `relation leak ${model.surface.id}`);
  assert.ok(!/\bgraph\b/i.test(visible), `graph leak ${model.surface.id}`);
  assert.ok(!visible.includes("Nincs adat"));
  assert.ok(!visible.includes("0 termék"));
  assert.ok(!visible.includes("Források és adatellenőrzés"));
  if (model.knowledge.length === 0) {
    assert.ok(!visible.includes("Kapcsolódó szakmai tartalom"));
  }
}
console.log("leakage OK");

section("populated MDF / Tegla section HTML");
const mdfHtml = renderToStaticMarkup(
  createElement(SurfaceHubPage, { model: mdf }),
);
assert.ok(
  mdfHtml.includes('id="kapcsolodo-termekek"') ||
    mdfHtml.includes(">Termékek<"),
);
assert.ok(mdfHtml.includes("COROR Rapid Aqua Zománcfesték"));
assert.ok(!mdfHtml.includes("felulet-allapot"));
assert.ok(!mdfHtml.includes("nincs kapcsolt termék"));
assert.ok(!mdfHtml.includes("Kapcsolódó szakmai tartalom"));

const teglaHtml = renderToStaticMarkup(
  createElement(SurfaceHubPage, { model: teglaModel }),
);
assert.ok(
  teglaHtml.includes('id="kapcsolodo-termekek"') ||
    teglaHtml.includes(">Termékek<"),
);
assert.ok(!teglaHtml.includes("Termékcsaládok"));
console.log("section HTML OK");

section("dataset regression");
const products = listProducts();
let specs = 0;
let packs = 0;
let diluted = 0;
for (const p of products) {
  specs += p.specifications?.length ?? 0;
  packs += p.packagingOptions?.length ?? 0;
  for (const r of getActiveRelationsForEntity(p.id)) {
    if (r.relationType === "dilutedWith" && r.fromEntityId === p.id) diluted++;
  }
}
const ats = allRelations.filter(
  (r) => r.relationType === "applicableToSurface" && r.status === "active",
);
assert.equal(products.length, expectedProductCountAfterClosure());
assert.equal(specs, expectedSpecCountAfterClosure());
assert.equal(packs, expectedPackagingCountAfterClosure());
assert.equal(festekBazisEnrichmentV1.sources.length, expectedEnrichmentSourcesAfterClosure());
assert.equal(diluted, expectedDilutedWithAfterClosure());
assert.equal(products.filter((p) => p.indexable).length, 0);
assert.equal(surfaces.length, 15);
assert.equal(ats.length, expectedApplicableToSurfaceAfterClosure());
assert.equal(
  ats.filter((r) => (r.sourceIds?.length ?? 0) > 0).length,
  expectedApplicableToSurfaceAfterClosure(),
);
assert.equal(surfaces.filter((s) => s.indexable).length, 0);
assert.equal(
  listPublishedForSitemap().filter((e) => e.path.startsWith("/feluletek/"))
    .length,
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
  getActiveRelationsForEntity("prod_factor_parquet").some(
    (r) =>
      r.relationType === "dilutedWith" &&
      r.fromEntityId === "prod_factor_parquet" &&
      r.toEntityId === "prod_coror_synthetic",
  ),
);
console.log("dataset OK");

console.log("\nALL Surface Hub v1 checks passed.");
