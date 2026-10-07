/**
 * Product Description Enrichment v1 — FESTÉK BÁZIS Products.
 * Run: npx tsx scripts/test-product-description-enrichment-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductHubPage } from "../components/entity/ProductHubPage";
import {
  getBrandById,
  getActiveRelationsForEntity,
  getProductById,
  listProducts,
} from "../lib/data/repository";
import { productDescriptionEnrichmentsV1 } from "../lib/data/imports/festekBazisEnrichmentV1/descriptionEnrichment";
import { enrichmentSourcesV1 } from "../lib/data/imports/festekBazisEnrichmentV1/sources";
import { festekBazisEnrichmentV1 } from "../lib/data/imports/festekBazisEnrichmentV1";
import {
  expectedDilutedWithAfterClosure,
  expectedEnrichmentSourcesAfterClosure,
  expectedPackagingCountAfterClosure,
  expectedProductCountAfterClosure,
  expectedSearchDocumentsAfterClosure,
  expectedSpecCountAfterClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";
import { getCanonicalBrandOwner } from "../lib/navigation/entityNavigation";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";
import { buildSearchCatalog } from "../lib/search";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const MARKETING =
  /kiváló|kiemelkedő|prémium|forradalmi|tökéletes|nagyszerű|ideális választás|kimagasló|csúcskategóriás/i;

const INTERNAL =
  /belongsToCategory|hasProduct|partOfSystem|dilutedWith|\bentity\b|\bgraph\b|sourceIds|rawValue|NOINDEX|\bVÉKONY\b|\bHIÁNYOS\b|brand_7016/i;

section("Coverage — FESTÉK BÁZIS Products");
{
  const products = listProducts();
  const expected = expectedProductCountAfterClosure();
  assert.equal(products.length, expected);
  assert.equal(productDescriptionEnrichmentsV1.length, expected);

  const ids = new Set(products.map((p) => p.id));
  for (const d of productDescriptionEnrichmentsV1) {
    assert.ok(ids.has(d.productId), `unknown product ${d.productId}`);
    assert.ok(d.sourceSummary.trim().length > 20);
    assert.ok(d.editorialSummary.trim().length > 20);
    assert.ok(d.sourceSummarySourceIds.length > 0);
    assert.ok(!MARKETING.test(d.editorialSummary), d.productId);
    assert.ok(!MARKETING.test(d.sourceSummary), d.productId);
    assert.ok(!INTERNAL.test(d.editorialSummary), d.productId);
    assert.ok(!INTERNAL.test(d.sourceSummary), d.productId);
  }

  const descIds = new Set(
    productDescriptionEnrichmentsV1.map((d) => d.productId),
  );
  for (const p of products) {
    assert.ok(descIds.has(p.id), `missing description for ${p.id}`);
    assert.ok(p.editorialSummary, `${p.id} editorialSummary`);
    assert.ok(p.sourceSummary, `${p.id} sourceSummary`);
  }
  console.log("coverage OK");
}

section("Provenance — official festekbazis.hu only");
{
  const sourceById = new Map(enrichmentSourcesV1.map((s) => [s.id, s]));
  // merged sources also available via products' referenced ids
  for (const d of productDescriptionEnrichmentsV1) {
    for (const sid of d.sourceSummarySourceIds) {
      const s = sourceById.get(sid);
      assert.ok(s, `missing enrichment source ${sid}`);
      assert.equal(s.type, "manufacturer");
      assert.ok(
        s.url?.includes("festekbazis.hu"),
        `non-official URL for ${sid}: ${s.url}`,
      );
      assert.ok(
        !/webaruhaz\.|shop\.|marketplace|blikk|árukereső/i.test(s.url ?? ""),
      );
    }
  }
  console.log("provenance OK");
}

section("No duplicate editorial spam");
{
  const texts = productDescriptionEnrichmentsV1.map((d) =>
    d.editorialSummary.replace(/\s+/g, " ").trim().toLowerCase(),
  );
  assert.equal(new Set(texts).size, texts.length);

  // Sibling roles must differ beyond product name tokens
  const primer = getProductById("prod_coror_rapid_primer")!.editorialSummary!;
  const enamel = getProductById("prod_coror_rapid_enamel")!.editorialSummary!;
  const thinner = getProductById("prod_coror_synthetic")!.editorialSummary!;
  assert.ok(/alapozó/i.test(primer));
  assert.ok(/zománc/i.test(enamel));
  assert.ok(/hígító/i.test(thinner));
  assert.notEqual(primer, enamel);
  console.log("differentiation OK");
}

section("Targeted reference Products");
{
  const air = getProductById("prod_valmor_airflow_interior")!;
  assert.ok(/páraáteresztő|lélegző|beltéri/i.test(air.editorialSummary!));
  assert.ok(air.editorialSummary!.length < 280);

  const parquet = getProductById("prod_factor_parquet")!;
  assert.ok(/parketta/i.test(parquet.editorialSummary!));

  const rapid = getProductById("prod_coror_rapid_primer")!;
  assert.ok(/korrózió|fém|acél/i.test(rapid.editorialSummary!));
  assert.ok(/Rapid/i.test(rapid.editorialSummary!));

  const ind = getProductById("prod_coror_ind_enamel")!;
  assert.ok(/ipari|zománc/i.test(ind.editorialSummary!));

  const aromatic = getProductById("prod_coror_aromatic")!;
  assert.ok(/aromás|hígító/i.test(aromatic.editorialSummary!));
  assert.ok(!/kötőanyag|alkidgyanta kötő/i.test(aromatic.editorialSummary!));

  const synthetic = getProductById("prod_coror_synthetic")!;
  assert.ok(synthetic.sourceSummary);
  assert.ok(synthetic.editorialSummary);
  assert.ok(/nem regenerált|nagy tisztaságú/i.test(synthetic.sourceSummary!));

  const p7016 = getProductById("prod_7016_wall")!;
  assert.ok(/termékcsalád|7016/i.test(p7016.editorialSummary!));
  assert.ok(!/márka/i.test(p7016.editorialSummary!));
  assert.ok(!getBrandById("brand_7016") || true);
  const brand7016 = getBrandById("brand_7016");
  if (brand7016) {
    assert.equal(evaluatePublicIndexability(brand7016).indexable, false);
  }
  console.log("reference OK");
}

section("Product Hub lead uses editorialSummary");
{
  const p = getProductById("prod_valmor_airflow_interior")!;
  const model = buildProductHubModel(p)!;
  assert.equal(model.lead, p.editorialSummary);
  const html = renderToStaticMarkup(
    createElement(ProductHubPage, { model }),
  );
  assert.ok(html.includes(p.editorialSummary!));
  assert.ok(html.indexOf(p.editorialSummary!) < html.indexOf("muszaki-adatok"));
  assert.ok(html.includes("hub-primary-section") || html.includes("szakmai-kornyezet"));
  console.log("Product Hub lead OK");
}

section("Product description visibility — 30/30 hub lead SSR");
{
  const products = listProducts();
  assert.equal(products.length, 30);

  let editorial = 0;
  let source = 0;
  let resolvedLead = 0;
  let renderedLead = 0;
  let leadBeforeSzakmai = 0;
  let leadAfterIdentity = 0;

  const representatives: Array<{ substr: string; needle: RegExp }> = [
    { substr: "FACTOR Aqua Akril Vastaglazúr", needle: /vastaglazúr|akril/i },
    { substr: "COROR Rapid Aqua Zománcfesték", needle: /vizes|zománc|rapid/i },
    { substr: "COROR Industry S-31 Hígító", needle: /hígító|industry/i },
    { substr: "COROR Rapid Korróziógátló Alapozó", needle: /alapozó|korrózió/i },
    {
      substr: "VALMOR AIR FLOW Lélegző Beltéri Falfesték",
      needle: /páraáteresztő|lélegző|beltéri/i,
    },
  ];

  for (const p of products) {
    if (p.editorialSummary?.trim()) editorial++;
    if (p.sourceSummary?.trim()) source++;

    const model = buildProductHubModel(p)!;
    assert.ok(model.lead?.trim(), `${p.id} resolved lead`);
    resolvedLead++;

    const html = renderToStaticMarkup(
      createElement(ProductHubPage, { model }),
    );
    const visibleLeadMarker = `<p class="page-lead">${model.lead}</p>`;
    assert.ok(
      html.includes(visibleLeadMarker),
      `${p.id} visible page-lead in SSR HTML`,
    );
    renderedLead++;

    const leadIdx = html.indexOf(visibleLeadMarker);
    const factsIdx = html.indexOf("product-header-facts");
    const szakmaiIdx = html.indexOf("Szakmai környezet");
    assert.ok(szakmaiIdx >= 0, `${p.id} Szakmai környezet`);
    assert.ok(leadIdx < szakmaiIdx, `${p.id} lead before Szakmai környezet`);
    leadBeforeSzakmai++;
    if (factsIdx >= 0) {
      assert.ok(leadIdx > factsIdx, `${p.id} lead after identity facts`);
      leadAfterIdentity++;
    }

    assert.ok(!/editorialSummary|sourceSummary|shortDescription/.test(html));
  }

  assert.equal(editorial, 30);
  assert.equal(source, 30);
  assert.equal(resolvedLead, 30);
  assert.equal(renderedLead, 30);
  assert.equal(leadBeforeSzakmai, 30);
  assert.equal(leadAfterIdentity, 30);

  for (const rep of representatives) {
    const p = products.find((x) => x.name.includes(rep.substr));
    assert.ok(p, `representative ${rep.substr}`);
    const model = buildProductHubModel(p!)!;
    assert.ok(model.lead && rep.needle.test(model.lead), rep.substr);
    const html = renderToStaticMarkup(
      createElement(ProductHubPage, { model }),
    );
    const marker = `<p class="page-lead">${model.lead}</p>`;
    assert.ok(html.includes(marker));
    assert.ok(
      html.indexOf(marker) < html.indexOf("Szakmai környezet"),
      `${rep.substr} before Szakmai`,
    );
    assert.ok(
      html.indexOf(marker) > html.indexOf("product-header-facts"),
      `${rep.substr} after identity`,
    );
  }

  console.log("Product description visibility OK", {
    editorial,
    source,
    resolvedLead,
    renderedLead,
  });
}

section("Locked data + hierarchy");
{
  assert.equal(listProducts().length, expectedProductCountAfterClosure());
  let specs = 0;
  let packs = 0;
  for (const p of listProducts()) {
    specs += p.specifications?.length ?? 0;
    packs += p.packagingOptions?.length ?? 0;
    assert.equal(evaluatePublicIndexability(p).indexable, false);
  }
  assert.equal(specs, expectedSpecCountAfterClosure());
  assert.equal(packs, expectedPackagingCountAfterClosure());

  let diluted = 0;
  for (const p of listProducts()) {
    for (const r of getActiveRelationsForEntity(p.id)) {
      if (r.relationType === "dilutedWith" && r.fromEntityId === p.id) diluted++;
    }
  }
  assert.equal(diluted, expectedDilutedWithAfterClosure());

  assert.equal(
    buildSearchCatalog().length,
    expectedSearchDocumentsAfterClosure(),
  );
  assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
  assert.notEqual(
    getCanonicalBrandOwner("brand_graco")?.id,
    "org_euroll_hungaria",
  );
  console.log("locks OK", { specs, packs, diluted });
}

section("Source count sanity");
{
  assert.ok(
    enrichmentSourcesV1.some((s) => s.id === "src_coror_synthetic_tds"),
  );
  assert.equal(
    festekBazisEnrichmentV1.sources.length,
    expectedEnrichmentSourcesAfterClosure(),
  );
  console.log("sources OK", enrichmentSourcesV1.length);
}

console.log("\nALL Product Description Enrichment v1 checks passed.");
