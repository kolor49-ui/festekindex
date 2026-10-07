/**
 * Knowledge Content Enrichment v1 — regression checks.
 * Run: npx tsx scripts/test-knowledge-content-v1.ts
 */

import assert from "node:assert/strict";
import {
  getKnowledgeById,
  getRelatedEntities,
  getSourceById,
  listKnowledge,
  listProducts,
  listSurfaces,
  listTechnologies,
    getProductById,
  getActiveRelationsForEntity,
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

import { evaluateIndexability } from "../lib/seo/indexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";
import { getCanonicalBrandOwner } from "../lib/navigation/entityNavigation";
import { categories as categoriesBase } from "../lib/data/categories";
import { festekBazisV02Seed } from "../lib/data/imports/festekBazisV02Map";
import { mergeById } from "../lib/data/imports/merge";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const FORBIDDEN = [
  "entitás",
  "entitások",
  "belongsToCategory",
  "documents relation",
  "Knowledge → Entity",
  "sourceIds",
  "productClass",
  "indexable",
  "NOINDEX",
  "VÉKONY",
  "HIÁNYOS",
  "v0.1",
  "v0.2",
  "repository",
  "gráf",
  "rawValue",
  "verifiedAt",
  "documentKind",
  "kanonikus",
];

section("inventory");
const knowledge = listKnowledge();
assert.equal(knowledge.length, 2);
assert.ok(getKnowledgeById("know_airless_alapok"));
assert.ok(getKnowledgeById("know_porfestek_vs_folyadek"));
assert.equal(
  getKnowledgeById("know_airless_alapok")!.slug,
  "airless-festekszoras-alapok",
);
assert.equal(
  getKnowledgeById("know_porfestek_vs_folyadek")!.slug,
  "porfestek-es-folyadek-bevonat",
);
console.log("inventory OK");

section("graph unchanged");
const docs = allRelations.filter(
  (r) => r.relationType === "documents" && r.status === "active",
);
assert.equal(docs.length, 3);
const knowCat = allRelations.filter(
  (r) =>
    r.relationType === "belongsToCategory" &&
    r.status === "active" &&
    !!getKnowledgeById(r.fromEntityId),
);
assert.equal(knowCat.length, 2);
const relatedToKnow = allRelations.filter(
  (r) =>
    r.relationType === "relatedTo" &&
    r.status === "active" &&
    (!!getKnowledgeById(r.fromEntityId) || !!getKnowledgeById(r.toEntityId)),
);
assert.equal(relatedToKnow.length, 0);

const airlessOut = getRelatedEntities("know_airless_alapok", {
  direction: "outgoing",
});
const airlessDocs = airlessOut.filter(
  (r) => r.relation.relationType === "documents",
);
const airlessCats = airlessOut.filter(
  (r) => r.relation.relationType === "belongsToCategory",
);
assert.equal(airlessDocs.length, 2);
assert.ok(airlessDocs.some((r) => r.entity.id === "tech_airless"));
assert.ok(airlessDocs.some((r) => r.entity.id === "brand_graco"));
assert.equal(airlessCats.length, 1);
assert.equal(airlessCats[0]!.entity.id, "cat_szoras");

const powderOut = getRelatedEntities("know_porfestek_vs_folyadek", {
  direction: "outgoing",
});
const powderDocs = powderOut.filter(
  (r) => r.relation.relationType === "documents",
);
const powderCats = powderOut.filter(
  (r) => r.relation.relationType === "belongsToCategory",
);
assert.equal(powderDocs.length, 1);
assert.equal(powderDocs[0]!.entity.id, "tech_porfestek");
assert.equal(powderCats.length, 1);
assert.equal(powderCats[0]!.entity.id, "cat_porfestek");

// Forbidden expansions
const forbiddenTargets = new Set([
  "brand_wagner",
  "brand_interpon",
  "org_euroll_hungaria",
  "org_festek_bazis_zrt",
  "brand_valmor",
  "brand_factor",
  "brand_coror",
]);
for (const r of [...airlessOut, ...powderOut]) {
  assert.ok(
    !forbiddenTargets.has(r.entity.id),
    `unexpected relation to ${r.entity.id}`,
  );
  assert.notEqual(r.entity.type, "product");
  assert.notEqual(r.entity.type, "surface");
  assert.notEqual(r.entity.type, "productFamily");
}
console.log("graph OK");

section("content quality smoke");
for (const k of knowledge) {
  const body = k.body?.trim() ?? "";
  assert.ok(body.length >= 1200, `${k.id} body too short: ${body.length}`);
  assert.ok(k.shortDescription.trim().length >= 40);
  const lower = body.toLowerCase();
  for (const needle of FORBIDDEN) {
    if (needle === "VÉKONY" || needle === "HIÁNYOS") {
      const re = new RegExp(`\\b${needle}\\b`, "i");
      assert.ok(!re.test(body), `${k.id} body contains ${needle}`);
      continue;
    }
    assert.ok(
      !lower.includes(needle.toLowerCase()),
      `${k.id} body contains ${needle}`,
    );
  }
  assert.ok(!/\brelations?\b/i.test(body), `${k.id} relation word`);
  assert.ok((k.sourceIds?.length ?? 0) >= 3, `${k.id} needs sources`);
  for (const sid of k.sourceIds) {
    const src = getSourceById(sid);
    assert.ok(src, `missing source ${sid}`);
    assert.ok(src!.title?.trim());
  }
}
const airless = getKnowledgeById("know_airless_alapok")!;
assert.ok(/injekci/i.test(airless.body ?? ""));
assert.ok(/tip/i.test(airless.body ?? "") || /fúvóka/i.test(airless.body ?? ""));
const powder = getKnowledgeById("know_porfestek_vs_folyadek")!;
assert.ok(/Faraday/i.test(powder.body ?? ""));
assert.ok(/folyékony/i.test(powder.body ?? ""));
assert.ok(/VOC/i.test(powder.body ?? ""));
assert.ok(!/Interpon/i.test(powder.body ?? ""));
assert.ok(!/Graco/i.test(airless.body ?? ""), "Airless body must stay brand-neutral");
console.log("content OK");

section("SEO unchanged");
for (const k of knowledge) {
  assert.equal(k.indexable, true);
  assert.equal(evaluateIndexability(k).indexable, true);
  assert.ok(
    listPublishedForSitemap().some((e) => e.path === `/tudastar/${k.slug}`),
  );
}
console.log("SEO OK");

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
assert.equal(products.filter((p) => p.indexable).length, 0);
assert.equal(listSurfaces().filter((s) => s.indexable).length, 0);
assert.equal(festekBazisEnrichmentV1.sources.length, expectedEnrichmentSourcesAfterClosure());

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
assert.equal(
  allRelations.filter(
    (r) =>
      r.fromEntityId === "brand_7016" || r.toEntityId === "brand_7016",
  ).length,
  0,
);
assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
console.log("dataset OK");

console.log("\nALL Knowledge Content Enrichment v1 checks passed.");
