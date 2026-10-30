/**
 * FESTÉK BÁZIS Catalogue Completeness Audit + Closure v1.
 * Run: npx tsx scripts/test-festek-bazis-catalogue-closure-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductHubPage } from "../components/entity/ProductHubPage";
import {
  ACCEPTED_CATALOGUE_CLOSURE_V1,
  CATALOGUE_CLOSURE_V1_BASELINE,
  CATALOGUE_CLOSURE_V1_CANDIDATES,
  expectedDilutedWithAfterCatalogueClosure,
  expectedMergedSourcesAfterCatalogueClosure,
  expectedPackagingCountAfterCatalogueClosure,
  expectedProductCountAfterCatalogueClosure,
  expectedSearchDocumentsAfterCatalogueClosure,
  expectedSpecCountAfterCatalogueClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/catalogueClosureV1";
import {
  getActiveRelationsForEntity,
  getEntityHref,
  getProductById,
  getProductBySlug,
  getSourceById,
  listProducts,
} from "../lib/data/repository";
import {
  getCanonicalProductBrand,
  getCanonicalProductFamily,
} from "../lib/navigation/entityNavigation";
import { buildSearchCatalog, searchCatalog } from "../lib/search";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const INTERNAL =
  /professionalDescription|editorialSummary|sourceSummary|sourceIds|rawValue|verifiedAt|documentKind|productClass|belongsToCategory|partOfSystem|dilutedWith|NOINDEX/i;

section("Candidate inventory decisions");
{
  const existing = CATALOGUE_CLOSURE_V1_CANDIDATES.filter(
    (c) => c.status === "EXISTING",
  );
  const accepted = CATALOGUE_CLOSURE_V1_CANDIDATES.filter(
    (c) => c.status === "ACCEPTED",
  );
  const rejected = CATALOGUE_CLOSURE_V1_CANDIDATES.filter(
    (c) => c.status === "REJECTED",
  );
  const unresolved = CATALOGUE_CLOSURE_V1_CANDIDATES.filter(
    (c) => c.status === "UNRESOLVED",
  );
  assert.equal(accepted.length, ACCEPTED_CATALOGUE_CLOSURE_V1.length);
  assert.equal(accepted.length, 23);
  assert.equal(rejected.length, 1);
  assert.equal(unresolved.length, 0);
  assert.ok(existing.length === 0); // EXISTING matches live in repo, not this candidate list
  assert.ok(
    rejected.some((c) => /színkártya|TOOLS/i.test(c.candidateKey + c.reason)),
  );
  console.log("decisions OK", {
    accepted: accepted.length,
    rejected: rejected.length,
  });
}

section("Accepted Products integrated");
{
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const c of ACCEPTED_CATALOGUE_CLOSURE_V1) {
    assert.ok(c.productId && c.slug && c.officialUrl);
    const p = getProductById(c.productId!);
    assert.ok(p, c.productId);
    assert.equal(p!.slug, c.slug);
    assert.equal(getProductBySlug(c.slug!)?.id, c.productId);
    assert.ok(getEntityHref(p!).startsWith("/termekek/"));
    assert.ok(p!.editorialSummary?.trim(), `${c.productId} editorial`);
    assert.ok(p!.sourceSummary?.trim(), `${c.productId} sourceSummary`);
    assert.ok(
      p!.professionalDescription?.sections?.length,
      `${c.productId} professionalDescription`,
    );
    assert.ok(p!.sourceIds.length > 0, `${c.productId} sources`);
    for (const sid of p!.sourceIds) {
      assert.ok(getSourceById(sid), `${c.productId} unknown ${sid}`);
    }
    for (const sid of p!.professionalDescription!.sourceIds) {
      const src = getSourceById(sid);
      assert.ok(src, `${c.productId} prof source ${sid}`);
      assert.ok(src!.url?.includes("festekbazis.hu"));
    }
    assert.equal(evaluatePublicIndexability(p!).indexable, false, c.productId);

    const brand = getCanonicalProductBrand(p!.id);
    const family = getCanonicalProductFamily(p!.id);
    if (c.brandId) assert.equal(brand?.id, c.brandId, c.productId);
    if (c.productFamilyId)
      assert.equal(family?.id, c.productFamilyId, c.productId);
    if (!c.brandId && c.productFamilyId) {
      assert.ok(family, c.productId);
      assert.ok(!brand || brand.id !== "brand_7016");
    }

    assert.ok(!ids.has(c.productId!));
    assert.ok(!slugs.has(c.slug!));
    ids.add(c.productId!);
    slugs.add(c.slug!);

    const model = buildProductHubModel(p!)!;
    assert.ok(model.lead);
    assert.ok(model.professionalDescription);
    const html = renderToStaticMarkup(
      createElement(ProductHubPage, { model }),
    );
    assert.ok(html.includes("Termékleírás"));
    assert.ok(html.includes(model.lead!));
    assert.ok(!INTERNAL.test(html), c.productId);
  }
  console.log("accepted integration OK", ACCEPTED_CATALOGUE_CLOSURE_V1.length);
}

section("Mandatory candidates");
{
  const vast = getProductBySlug("factor-vastaglazur")!;
  assert.ok(vast);
  assert.notEqual(vast.id, "prod_factor_aqua_glaze");
  assert.match(vast.professionalDescription!.sections[0]!.paragraphs.join(" "), /Vastaglazúr|fa/i);

  const hot = getProductBySlug("valmor-air-flow-belteri-hotukor-festek")!;
  assert.ok(hot);
  assert.equal(getCanonicalProductFamily(hot.id)?.id, "pf_valmor_air_flow");
  assert.match(
    hot.professionalDescription!.sections.map((s) => s.heading).join(","),
    /Alkalmazás/,
  );

  const klor = getProductBySlug("coror-klorkaucsuk-bevonat")!;
  assert.ok(klor);
  assert.equal(getCanonicalProductBrand(klor.id)?.id, "brand_coror");
  assert.ok(!getCanonicalProductFamily(klor.id));

  const floor = getProductBySlug("valmor-biztonsagos-padlo-es-jelolo-festek")!;
  assert.ok(floor);
  assert.equal(getCanonicalProductBrand(floor.id)?.id, "brand_valmor");
  console.log("mandatory OK");
}

section("Baselines / counts");
{
  const products = listProducts();
  assert.equal(products.length, expectedProductCountAfterCatalogueClosure());
  assert.equal(products.length, CATALOGUE_CLOSURE_V1_BASELINE.products + 23);

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
  assert.equal(specs, expectedSpecCountAfterCatalogueClosure());
  assert.equal(packs, expectedPackagingCountAfterCatalogueClosure());
  assert.equal(diluted, expectedDilutedWithAfterCatalogueClosure());
  assert.equal(diluted, 8);
  assert.equal(
    buildSearchCatalog().length,
    expectedSearchDocumentsAfterCatalogueClosure(),
  );
  assert.equal(expectedMergedSourcesAfterCatalogueClosure(), 129);
  console.log("counts OK", { specs, packs, diluted, products: products.length });
}

section("Search identity queries");
{
  const queries = [
    "vastaglazur",
    "hőtükör",
    "hotukor",
    "klorkaucsuk",
    "klórkaucsuk",
    "padló",
    "padlo",
    "jelölő",
    "jelolo",
  ];
  for (const q of queries) {
    const res = searchCatalog(q, { limit: 10 });
    assert.ok(res.length > 0, q);
  }
  const vast = searchCatalog("vastaglazur", { limit: 10 });
  assert.ok(
    vast.some(
      (r) =>
        r.type === "product" &&
        (r.id === "prod_factor_vastaglazur" || r.id === "prod_factor_aqua_glaze"),
    ),
  );
  const klor = searchCatalog("klórkaucsuk", { limit: 10 });
  assert.ok(klor.some((r) => r.id === "prod_coror_chlorinated_rubber"));
  console.log("search OK");
}

section("7016 safety");
{
  assert.ok(!getProductById("brand_7016"));
  for (const id of [
    "prod_7016_enamel",
    "prod_7016_exterior",
    "prod_7016_pergola",
    "prod_7016_plaster",
  ]) {
    assert.equal(getCanonicalProductFamily(id)?.id, "pf_7016");
    assert.ok(!getCanonicalProductBrand(id));
  }
  console.log("7016 OK");
}

console.log("\nALL FESTÉK BÁZIS Catalogue Closure v1 checks passed.");
