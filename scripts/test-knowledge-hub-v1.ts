/**
 * Knowledge Hub v1 — model + article parser + DIRECT-FIRST + leakage + regression.
 * Run: npx tsx scripts/test-knowledge-hub-v1.ts
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { KnowledgeHubPage } from "../components/entity/KnowledgeHubPage";
import {
  flattenKnowledgeArticleText,
  parseKnowledgeArticleBody,
  renderKnowledgeArticleBody,
} from "../lib/content/knowledgeArticle";
import {
  getKnowledgeDisplayedRelatedIds,
  getKnowledgePortfolio,
} from "../lib/data/knowledgeHub";
import {
  getActiveRelationsForEntity,
  getCanonicalUrl,
  getKnowledgeById,
  getProductById,
  getRelatedEntities,
  getSourceById,
  listKnowledge,
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

import { festekBazisV02Seed } from "../lib/data/imports/festekBazisV02Map";
import { mergeById } from "../lib/data/imports/merge";
import { categories as categoriesBase } from "../lib/data/categories";
import { sources as sourcesBase } from "../lib/data/sources";
import {
  buildKnowledgeHubJsonLd,
  buildKnowledgeHubModel,
} from "../lib/seo/knowledgeHubModel";
import { evaluateIndexability } from "../lib/seo/indexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";
import { getCanonicalBrandOwner } from "../lib/navigation/entityNavigation";
import { readFileSync } from "node:fs";
import { join } from "node:path";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const BODY_HASH: Record<string, string> = {
  know_airless_alapok:
    "ed4993e9910def4bac1ac9d059df20ee6f1cbcc737aa16d00b8b9fc80ac44ce5",
  know_porfestek_vs_folyadek:
    "f324d4d5e4b3863b6bedb63bf4d38a6f3fd9bf679eae6a1a21501b76c80943ee",
};

const SHORT_DESC: Record<string, string> = {
  know_airless_alapok:
    "Mi az airless technológia, hogyan működik, mire használják, és milyen biztonsági szabályokat kell betartani.",
  know_porfestek_vs_folyadek:
    "Szakmai összevetés: mikor előnyös a porfesték, mikor a folyékony bevonatrendszer, és milyen szempontok döntik el a választást.",
};

function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

// ─── Inventory ───────────────────────────────────────────────
section("inventory");
const knowledge = listKnowledge();
assert.equal(knowledge.length, 2);
const airless = getKnowledgeById("know_airless_alapok")!;
const powder = getKnowledgeById("know_porfestek_vs_folyadek")!;
assert.ok(airless);
assert.ok(powder);
assert.equal(airless.slug, "airless-festekszoras-alapok");
assert.equal(powder.slug, "porfestek-es-folyadek-bevonat");
console.log("inventory OK");

// ─── Graph counts ────────────────────────────────────────────
section("graph counts");
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
assert.equal(
  airlessOut.filter((r) => r.relation.relationType === "documents").length,
  2,
);
assert.equal(
  airlessOut.filter((r) => r.relation.relationType === "belongsToCategory")
    .length,
  1,
);
assert.ok(airlessOut.some((r) => r.entity.id === "tech_airless"));
assert.ok(airlessOut.some((r) => r.entity.id === "brand_graco"));
assert.ok(airlessOut.some((r) => r.entity.id === "cat_szoras"));

const powderOut = getRelatedEntities("know_porfestek_vs_folyadek", {
  direction: "outgoing",
});
assert.equal(
  powderOut.filter((r) => r.relation.relationType === "documents").length,
  1,
);
assert.equal(
  powderOut.filter((r) => r.relation.relationType === "belongsToCategory")
    .length,
  1,
);
assert.ok(powderOut.some((r) => r.entity.id === "tech_porfestek"));
assert.ok(powderOut.some((r) => r.entity.id === "cat_porfestek"));
assert.ok(!powderOut.some((r) => r.entity.type === "brand"));
console.log("graph OK");

// ─── Portfolio DIRECT-FIRST ──────────────────────────────────
section("portfolio DIRECT-FIRST");
const airlessPort = getKnowledgePortfolio("know_airless_alapok")!;
const powderPort = getKnowledgePortfolio("know_porfestek_vs_folyadek")!;
assert.ok(airlessPort);
assert.ok(powderPort);

assert.equal(airlessPort.documented.technologies.length, 1);
assert.equal(airlessPort.documented.technologies[0]!.id, "tech_airless");
assert.equal(airlessPort.documented.brands.length, 1);
assert.equal(airlessPort.documented.brands[0]!.id, "brand_graco");
assert.equal(airlessPort.documented.products.length, 0);
assert.equal(airlessPort.documented.productFamilies.length, 0);
assert.equal(airlessPort.documented.organizations.length, 0);
assert.equal(airlessPort.documented.surfaces.length, 0);
assert.equal(airlessPort.categories.length, 1);
assert.equal(airlessPort.categories[0]!.id, "cat_szoras");
assert.equal(airlessPort.sources.length, 5);

assert.equal(powderPort.documented.technologies.length, 1);
assert.equal(powderPort.documented.technologies[0]!.id, "tech_porfestek");
assert.equal(powderPort.documented.brands.length, 0);
assert.equal(powderPort.documented.products.length, 0);
assert.equal(powderPort.documented.organizations.length, 0);
assert.equal(powderPort.documented.surfaces.length, 0);
assert.equal(powderPort.categories.length, 1);
assert.equal(powderPort.categories[0]!.id, "cat_porfestek");
assert.equal(powderPort.sources.length, 6);

// Every displayed related id must have an explicit direct relation
for (const [id, port] of [
  ["know_airless_alapok", airlessPort],
  ["know_porfestek_vs_folyadek", powderPort],
] as const) {
  const displayed = getKnowledgeDisplayedRelatedIds(port);
  const directIds = new Set(
    getRelatedEntities(id, { direction: "outgoing" })
      .filter(
        (r) =>
          r.relation.relationType === "documents" ||
          r.relation.relationType === "belongsToCategory",
      )
      .map((r) => r.entity.id),
  );
  for (const did of displayed) {
    assert.ok(
      directIds.has(did),
      `${id}: displayed ${did} without direct relation`,
    );
  }
}
console.log("portfolio OK");

// ─── Content lock ────────────────────────────────────────────
section("content lock");
for (const [id, expected] of Object.entries(BODY_HASH)) {
  const k = getKnowledgeById(id)!;
  assert.equal(sha256(k.body ?? ""), expected, `${id} body hash mismatch`);
  assert.equal(k.shortDescription, SHORT_DESC[id], `${id} shortDescription`);
}
console.log("content lock OK");

// ─── Article parser ──────────────────────────────────────────
section("article parser");
const airlessBlocks = parseKnowledgeArticleBody(airless.body);
assert.ok(airlessBlocks.length > 5, "airless should have many blocks");
assert.ok(airlessBlocks.some((b) => b.type === "h2"));
assert.ok(airlessBlocks.some((b) => b.type === "p"));
assert.ok(
  airlessBlocks.some((b) => b.type === "h2" && b.text === "Hogyan működik?"),
);
assert.ok(
  airlessBlocks.some((b) => b.type === "h2" && b.text === "Biztonság"),
);
assert.ok(!airlessBlocks.some((b) => b.type === "p" && b.text.startsWith("##")));

const powderBlocks = parseKnowledgeArticleBody(powder.body);
assert.ok(powderBlocks.some((b) => b.type === "ul"));
assert.ok(powderBlocks.some((b) => b.type === "ol"));
assert.ok(
  powderBlocks.some(
    (b) => b.type === "h2" && /Alapvető technológiai/i.test(b.text),
  ),
);

const airlessHtml = renderToStaticMarkup(
  createElement("div", null, ...renderKnowledgeArticleBody(airless.body)),
);
assert.ok(airlessHtml.includes("<h2"));
assert.ok(airlessHtml.includes("<p"));
assert.ok(!airlessHtml.includes("## "));
assert.ok(!/<p[^>]*>[\s\S]*##/i.test(airlessHtml));
// Not a single paragraph dump
const pCount = (airlessHtml.match(/<p[\s>]/g) ?? []).length;
const h2Count = (airlessHtml.match(/<h2[\s>]/g) ?? []).length;
assert.ok(pCount >= 8, `expected many paragraphs, got ${pCount}`);
assert.ok(h2Count >= 6, `expected many H2, got ${h2Count}`);

const powderHtml = renderToStaticMarkup(
  createElement("div", null, ...renderKnowledgeArticleBody(powder.body)),
);
assert.ok(powderHtml.includes("<ul"));
assert.ok(powderHtml.includes("<ol"));
assert.ok(powderHtml.includes("<li"));
assert.ok(!powderHtml.includes("## "));
assert.ok(!powderHtml.includes("dangerouslySetInnerHTML"));

// Content not dropped — flatten covers substantive words
const flatAirless = flattenKnowledgeArticleText(airlessBlocks);
assert.ok(/injekci/i.test(flatAirless));
assert.ok(/fúvóka|tip/i.test(flatAirless));
const flatPowder = flattenKnowledgeArticleText(powderBlocks);
assert.ok(/Faraday/i.test(flatPowder));
assert.ok(/VOC/i.test(flatPowder));
assert.ok(!/Interpon/i.test(flatPowder));

// No HTML injection from body
const inject = parseKnowledgeArticleBody(
  'Hello\n\n## Title\n\n<script>alert(1)</script>\n\n- item',
);
const injectHtml = renderToStaticMarkup(
  createElement(
    "div",
    null,
    ...renderKnowledgeArticleBody(
      'Hello\n\n## Title\n\n<script>alert(1)</script>\n\n- item',
    ),
  ),
);
assert.ok(inject.some((b) => b.type === "h2"));
assert.ok(injectHtml.includes("&lt;script&gt;") || !injectHtml.includes("<script>alert"));
console.log("parser OK");

// ─── Hub models ──────────────────────────────────────────────
section("hub models");
const airlessModel = buildKnowledgeHubModel(airless)!;
const powderModel = buildKnowledgeHubModel(powder)!;
assert.ok(airlessModel);
assert.ok(powderModel);
assert.equal(airlessModel.h1, "Airless festékszórás — alapok");
assert.equal(
  powderModel.h1,
  "Porfesték és folyékony bevonat — mikor melyik?",
);
assert.equal(airlessModel.sources.length, 5);
assert.equal(powderModel.sources.length, 6);
assert.equal(airlessModel.documented.brands.length, 1);
assert.equal(powderModel.documented.brands.length, 0);
assert.ok(airlessModel.articleBody.length > 5);
assert.ok(powderModel.articleBody.length > 5);
console.log("models OK");

// ─── SSR pages + DIRECT-FIRST negative ───────────────────────
section("SSR pages + negative expansion");
const airlessPageHtml = renderToStaticMarkup(
  createElement(KnowledgeHubPage, { model: airlessModel }),
);
const powderPageHtml = renderToStaticMarkup(
  createElement(KnowledgeHubPage, { model: powderModel }),
);
const airlessVis = visibleText(airlessPageHtml);
const powderVis = visibleText(powderPageHtml);

assert.ok(airlessVis.includes("Airless festékszórás — alapok"));
assert.ok(airlessVis.includes("Szakmai terület"));
assert.ok(airlessVis.includes("Szórás- és alkalmazástechnika"));
assert.ok(airlessVis.includes("Kapcsolódó technológia"));
assert.ok(airlessVis.includes("Airless festékszórás"));
assert.ok(airlessVis.includes("Kapcsolódó márka"));
assert.ok(airlessVis.includes("Graco"));
assert.ok(airlessVis.includes("Források és adatellenőrzés"));
assert.ok(airlessPageHtml.includes("<h2"));
assert.ok(!airlessPageHtml.includes("## "));

// Forbidden derived entities as RELATED CONTEXT (not source publishers)
const forbiddenHrefs = [
  "/markak/wagner",
  "/cegek/euroll",
  "/cegek/graco",
  "/cegek/festek-bazis",
  "/markak/coror",
  "/markak/valmor",
  "/markak/factor",
  "/markak/interpon",
];
for (const href of forbiddenHrefs) {
  assert.ok(
    !airlessPageHtml.includes(`href="${href}"`) &&
      !airlessPageHtml.includes(`href='${href}'`),
    `Airless must not link ${href}`,
  );
}
assert.ok(!/href="\/termekek\//.test(airlessPageHtml));
assert.ok(!/href="\/termekcsaladok\//.test(airlessPageHtml));
assert.ok(!/href="\/feluletek\//.test(airlessPageHtml));
assert.deepEqual(
  airlessModel.documented.brands.map((b) => b.name),
  ["Graco"],
);
assert.ok(
  !airlessModel.documented.brands.some((b) =>
    /Wagner|Interpon|COROR|VALMOR|FACTOR/i.test(b.name),
  ),
);
assert.equal(airlessModel.documented.organizations.length, 0);
assert.equal(airlessModel.documented.products.length, 0);
assert.equal(airlessModel.documented.productFamilies.length, 0);
assert.equal(airlessModel.documented.surfaces.length, 0);
assert.ok(!airlessVis.includes("Kapcsolódó termék"));
assert.ok(!airlessVis.includes("Kapcsolódó termékcsalád"));
assert.ok(!airlessVis.includes("Kapcsolódó felület"));
assert.ok(!airlessVis.includes("Kapcsolódó cég"));

assert.ok(powderVis.includes("Porfesték és folyékony bevonat"));
assert.ok(powderVis.includes("Szakmai terület"));
assert.ok(powderVis.includes("Porfesték"));
assert.ok(powderVis.includes("Kapcsolódó technológia"));
assert.ok(powderVis.includes("Porfesték bevonatolás"));
assert.ok(powderVis.includes("Források"));
assert.ok(!/\bInterpon\b/i.test(powderVis));
assert.ok(!powderPageHtml.includes('href="/markak/interpon"'));
assert.ok(!powderVis.includes("Kapcsolódó márka"));
assert.ok(!powderVis.includes("Kapcsolódó termék"));
assert.ok(!powderVis.includes("Kapcsolódó cég"));
assert.ok(!powderVis.includes("Kapcsolódó felület"));
assert.equal(powderModel.documented.brands.length, 0);
assert.equal(powderModel.documented.organizations.length, 0);
assert.equal(powderModel.documented.products.length, 0);
assert.ok(powderPageHtml.includes("<ul"));
assert.ok(powderPageHtml.includes("<ol"));

// Empty brand section omitted for powder
assert.ok(!powderPageHtml.includes('id="kapcsolodo-markak"'));
// Brand section present for airless
assert.ok(airlessPageHtml.includes('id="kapcsolodo-markak"'));
console.log("SSR + negative OK");

// ─── Sources provenance ──────────────────────────────────────
section("sources provenance");
assert.equal(airless.sourceIds.length, 5);
assert.equal(powder.sourceIds.length, 6);
for (const k of knowledge) {
  assert.ok((k.sourceIds?.length ?? 0) > 0);
  for (const sid of k.sourceIds) {
    assert.ok(getSourceById(sid), `missing source ${sid}`);
  }
}
// Hub sources === Knowledge.sourceIds only (not Technology/Brand/Category)
assert.deepEqual(
  airlessModel.sources.map((s) => s.id).sort(),
  [...airless.sourceIds].sort(),
);
assert.deepEqual(
  powderModel.sources.map((s) => s.id).sort(),
  [...powder.sourceIds].sort(),
);
const umich = getSourceById("src_umich_powder_coating")!;
assert.ok(umich.url);
assert.ok(powderPageHtml.includes(umich.url!));
// No raw enums in source UI
assert.ok(!powderVis.includes("product_page"));
assert.ok(!powderVis.includes("documentKind"));
assert.ok(!airlessVis.includes("sourceIds"));
console.log("sources OK");

// ─── Public language ─────────────────────────────────────────
section("public language");
const LEAK_NEEDLES = [
  "Dokumentált entitások",
  "adatbázis entitásaihoz",
  "belongsToCategory",
  "sourceIds",
  "productClass",
  "indexable",
  "NOINDEX",
  "v0.1",
  "v0.2",
  "repository",
  "rawValue",
  "verifiedAt",
  "documentKind",
  "Knowledge entity",
  "Knowledge Hub",
  "Knowledge → Entity",
];
const LEAK_WORDS = [
  /\bentitás\b/i,
  /\bentitások\b/i,
  /\bentity\b/i,
  /\brelations?\b/i,
  /\bdocuments\b/i,
  /\bgráf\b/i,
  /\bgraph\b/i,
  /\bseed\b/i,
  /\bimport\b/i,
];

for (const [label, html] of [
  ["airless", airlessPageHtml],
  ["powder", powderPageHtml],
] as const) {
  const vis = visibleText(html);
  for (const needle of LEAK_NEEDLES) {
    assert.ok(!vis.includes(needle), `${label} leak: ${needle}`);
  }
  for (const re of LEAK_WORDS) {
    assert.ok(!re.test(vis), `${label} leak word: ${re}`);
  }
  assert.ok(!/\bVÉKONY\b/.test(vis));
  assert.ok(!/\bHIÁNYOS\b/.test(vis));
}

// List page
const listSrc = readFileSync(
  join(process.cwd(), "app/tudastar/page.tsx"),
  "utf8",
);
assert.ok(!listSrc.includes("adatbázis entitásaihoz"));
assert.ok(
  listSrc.includes("Festékekről, bevonatokról") ||
    listSrc.includes("szakmai útmutatók"),
);
const listHtml = renderToStaticMarkup(
  createElement(
    "div",
    null,
    createElement("h1", null, "Tudástár"),
    createElement(
      "p",
      null,
      "Festékekről, bevonatokról és alkalmazástechnológiákról szóló szakmai útmutatók és összehasonlítások.",
    ),
    ...knowledge.map((k) =>
      createElement(
        "a",
        { key: k.id, href: `/tudastar/${k.slug}` },
        createElement("b", null, k.name),
        createElement("small", null, k.shortDescription),
      ),
    ),
  ),
);
const listVis = visibleText(listHtml);
assert.ok(!listVis.includes("adatbázis entitásaihoz"));
assert.ok(listVis.includes(airless.name));
assert.ok(listVis.includes(powder.name));
assert.ok(listHtml.includes(`/tudastar/${airless.slug}`));
assert.ok(listHtml.includes(`/tudastar/${powder.slug}`));
console.log("public language OK");

// ─── Breadcrumb / SEO ────────────────────────────────────────
section("breadcrumb + SEO");
assert.deepEqual(
  airlessModel.breadcrumbs.map((c) => c.name),
  ["FESTÉKINDEX", "Tudástár", airless.name],
);
assert.deepEqual(
  powderModel.breadcrumbs.map((c) => c.name),
  ["FESTÉKINDEX", "Tudástár", powder.name],
);
assert.ok(!airlessModel.breadcrumbs.some((c) => /Szórás/i.test(c.name) && c.name !== airless.name));
assert.ok(!powderModel.breadcrumbs.some((c) => c.name === "Porfesték" && c.path.includes("kategoriak")));

assert.equal(airless.indexable, true);
assert.equal(powder.indexable, true);
assert.equal(evaluateIndexability(airless).indexable, true);
assert.equal(evaluateIndexability(powder).indexable, true);
assert.equal(airlessModel.indexable, true);
assert.equal(powderModel.indexable, true);

assert.ok(
  listPublishedForSitemap().some(
    (e) => e.path === `/tudastar/${airless.slug}`,
  ),
);
assert.ok(
  listPublishedForSitemap().some(
    (e) => e.path === `/tudastar/${powder.slug}`,
  ),
);
assert.ok(listPublishedForSitemap().some((e) => e.path === "/tudastar"));
assert.equal(airlessModel.canonicalUrl, getCanonicalUrl(airless));
assert.equal(powderModel.canonicalUrl, getCanonicalUrl(powder));

const jsonLd = buildKnowledgeHubJsonLd(airlessModel);
assert.ok(jsonLd.some((j) => j["@type"] === "BreadcrumbList"));
assert.ok(jsonLd.some((j) => j["@type"] === "Article"));
console.log("SEO OK");

// ─── Locked dataset ──────────────────────────────────────────
section("locked dataset");
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
assert.equal(knowledge.length, 2);
assert.equal(docs.length, 3);
assert.equal(knowCat.length, 2);
assert.equal(festekBazisEnrichmentV1.sources.length, expectedEnrichmentSourcesAfterClosure());

const knowSourceIds = new Set([
  ...airless.sourceIds,
  ...powder.sourceIds,
]);
assert.equal(knowSourceIds.size, 11);
assert.equal(
  sourcesBase.filter((s) => knowSourceIds.has(s.id)).length,
  11,
);

const globalSources = mergeById(
  mergeById(sourcesBase, festekBazisV02Seed.sources),
  festekBazisEnrichmentV1.sources,
);
console.log(`global merged Source count: ${globalSources.length}`);
assert.equal(globalSources.length, expectedMergedSourcesAfterClosure());

assert.equal(products.filter((p) => p.indexable).length, 0);
assert.equal(listSurfaces().filter((s) => s.indexable).length, 0);
console.log("dataset OK");

// ─── Critical regressions ────────────────────────────────────
section("critical regressions");
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
// Euroll is not Graco owner / not breadcrumb parent for Knowledge
assert.notEqual(getCanonicalBrandOwner("brand_graco")?.id, "org_euroll_hungaria");
assert.ok(
  !airlessModel.breadcrumbs.some((c) => /Euroll/i.test(c.name)),
);
console.log("critical OK");

console.log("\nALL Knowledge Hub v1 checks passed.");
