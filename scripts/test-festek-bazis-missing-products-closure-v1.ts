/**
 * FESTÉK BÁZIS Missing Products Closure v1.
 * Run: npx tsx scripts/test-festek-bazis-missing-products-closure-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductHubPage } from "../components/entity/ProductHubPage";
import {
  getActiveRelationsForEntity,
  getBrandById,
  getProductById,
  getProductFamilyById,
  listProducts,
} from "../lib/data/repository";
import { productDescriptionEnrichmentsV1 } from "../lib/data/imports/festekBazisEnrichmentV1/descriptionEnrichment";
import { festekBazisEnrichmentV1 } from "../lib/data/imports/festekBazisEnrichmentV1";
import {
  ACCEPTED_MISSING_PRODUCTS_V1,
  MISSING_PRODUCTS_CLOSURE_V1_BASELINE,
  MISSING_PRODUCTS_CLOSURE_V1_CANDIDATES,
  expectedDilutedWithAfterClosure,
  expectedEnrichmentSourcesAfterClosure,
  expectedPackagingCountAfterClosure,
  expectedProductCountAfterClosure,
  expectedSearchDocumentsAfterClosure,
  expectedSpecCountAfterClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";
import {
  getCanonicalProductBrand,
  getCanonicalProductFamily,
  getCanonicalBrandOwner,
} from "../lib/navigation/entityNavigation";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";
import { buildSearchCatalog } from "../lib/search";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const INTERNAL =
  /belongsToCategory|hasProduct|partOfSystem|dilutedWith|\bgraph\b|sourceIds|rawValue|NOINDEX|\bVÉKONY\b|\bHIÁNYOS\b|brand_7016|productClass|repository|import\b|seed\b/i;

const MARKETING =
  /kiváló|kiemelkedő|prémium|forradalmi|tökéletes|nagyszerű|ideális választás|kimagasló|csúcskategóriás/i;

function visibleText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

section("Exactly three candidates audited");
{
  assert.equal(MISSING_PRODUCTS_CLOSURE_V1_CANDIDATES.length, 3);
  const keys = MISSING_PRODUCTS_CLOSURE_V1_CANDIDATES.map((c) => c.candidateKey);
  assert.deepEqual(keys, [
    "FACTOR Akril Vastaglazúr",
    "COROR Rapid Aqua Zománcfesték",
    "COROR Industry S-31 Hígító",
  ]);
  for (const c of MISSING_PRODUCTS_CLOSURE_V1_CANDIDATES) {
    assert.ok(
      c.status === "ACCEPTED" ||
        c.status === "REJECTED" ||
        c.status === "UNRESOLVED",
    );
  }
  console.log("candidates OK", ACCEPTED_MISSING_PRODUCTS_V1.length, "accepted");
}

section("Accepted candidates — identity + provenance");
{
  for (const c of ACCEPTED_MISSING_PRODUCTS_V1) {
    assert.ok(c.productId);
    const p = getProductById(c.productId!);
    assert.ok(p, `missing product ${c.productId}`);
    assert.equal(p!.slug, c.slug);
    assert.equal(p!.name, c.officialName);
    assert.equal(p!.status, "published");

    const brand = getCanonicalProductBrand(p!.id);
    assert.equal(brand?.id, c.brandId);

    const family = getCanonicalProductFamily(p!.id);
    assert.equal(family?.id, c.productFamilyId);

    assert.ok(p!.sourceSummary, `${p!.id} sourceSummary`);
    assert.ok(p!.editorialSummary, `${p!.id} editorialSummary`);
    assert.ok(!MARKETING.test(p!.sourceSummary!));
    assert.ok(!MARKETING.test(p!.editorialSummary!));
    assert.ok(!INTERNAL.test(p!.sourceSummary!));
    assert.ok(!INTERNAL.test(p!.editorialSummary!));

    assert.equal(p!.specifications?.length ?? 0, c.expectedSpecCount);
    assert.equal(p!.packagingOptions?.length ?? 0, c.expectedPackagingCount);

    for (const s of p!.specifications ?? []) {
      assert.ok(s.sourceIds?.length, `unsourced spec ${p!.id} ${s.key}`);
      assert.equal(s.status, "verified");
    }
    for (const pack of p!.packagingOptions ?? []) {
      assert.ok(pack.sourceIds?.length, `unsourced pack ${pack.id}`);
    }

    const desc = productDescriptionEnrichmentsV1.find(
      (d) => d.productId === p!.id,
    );
    assert.ok(desc, `description enrichment missing for ${p!.id}`);
    assert.ok(desc!.sourceSummarySourceIds.length > 0);

    const model = buildProductHubModel(p!)!;
    assert.ok(model);
    assert.equal(model.lead, p!.editorialSummary);
    const html = renderToStaticMarkup(
      createElement(ProductHubPage, { model }),
    );
    const visible = visibleText(html);
    assert.ok(html.includes(p!.name));
    assert.ok(!INTERNAL.test(visible), `internal leak on ${p!.id}`);
    assert.ok(html.includes("/markak/"));
    assert.ok(html.includes("/termekcsaladok/"));

    const searchDoc = buildSearchCatalog().find((d) => d.id === p!.id);
    assert.ok(searchDoc, `search doc missing for ${p!.id}`);
    assert.equal(searchDoc!.type, "product");
    assert.equal(searchDoc!.href, `/termekek/${p!.slug}`);

    assert.equal(evaluatePublicIndexability(p!).indexable, false);
  }
  console.log("accepted identity OK");
}

section("Rejected / unresolved not created");
{
  for (const c of MISSING_PRODUCTS_CLOSURE_V1_CANDIDATES) {
    if (c.status === "ACCEPTED") continue;
    assert.equal(c.productId, undefined);
  }
  console.log("no rejected entities OK");
}

section("No duplicates / no unrelated FB products");
{
  const products = listProducts();
  const ids = products.map((p) => p.id);
  const slugs = products.map((p) => p.slug);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(slugs).size, slugs.length);

  assert.equal(products.length, expectedProductCountAfterClosure());
  assert.equal(
    products.length,
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.products +
      ACCEPTED_MISSING_PRODUCTS_V1.length,
  );

  // Only the three accepted IDs are new vs baseline 27
  const acceptedIds = new Set(
    ACCEPTED_MISSING_PRODUCTS_V1.map((c) => c.productId!),
  );
  assert.equal(acceptedIds.size, ACCEPTED_MISSING_PRODUCTS_V1.length);

  // No new Brand / ProductFamily
  assert.ok(getBrandById("brand_factor"));
  assert.ok(getBrandById("brand_coror"));
  assert.ok(getProductFamilyById("pf_factor_aqua"));
  assert.ok(getProductFamilyById("pf_coror_rapid"));
  assert.ok(getProductFamilyById("pf_coror_industry"));
  const brand7016 = getBrandById("brand_7016");
  assert.ok(brand7016);
  assert.equal(brand7016!.status, "draft");
  assert.equal(brand7016!.indexable, false);
  console.log("duplicates / scope OK");
}

section("Counts derived from accepted fixtures");
{
  let specs = 0;
  let packs = 0;
  let diluted = 0;
  for (const p of listProducts()) {
    specs += p.specifications?.length ?? 0;
    packs += p.packagingOptions?.length ?? 0;
    for (const r of getActiveRelationsForEntity(p.id)) {
      if (r.relationType === "dilutedWith" && r.fromEntityId === p.id) {
        diluted++;
      }
    }
  }
  assert.equal(specs, expectedSpecCountAfterClosure());
  assert.equal(packs, expectedPackagingCountAfterClosure());
  assert.equal(diluted, expectedDilutedWithAfterClosure());
  assert.equal(
    festekBazisEnrichmentV1.sources.length,
    expectedEnrichmentSourcesAfterClosure(),
  );
  assert.equal(
    buildSearchCatalog().length,
    expectedSearchDocumentsAfterClosure(),
  );
  console.log("counts OK", {
    products: listProducts().length,
    specs,
    packs,
    diluted,
    search: buildSearchCatalog().length,
    enrichmentSources: festekBazisEnrichmentV1.sources.length,
  });
}

section("S-31 dilutedWith — Industry Primer + Enamel only");
{
  const s31 = getProductById("prod_coror_ind_s31")!;
  assert.ok(s31);
  assert.equal(getCanonicalProductBrand(s31.id)?.id, "brand_coror");
  assert.equal(getCanonicalProductFamily(s31.id)?.id, "pf_coror_industry");

  const primer = getActiveRelationsForEntity("prod_coror_ind_primer").filter(
    (r) =>
      r.relationType === "dilutedWith" &&
      r.fromEntityId === "prod_coror_ind_primer" &&
      r.toEntityId === "prod_coror_ind_s31",
  );
  const enamel = getActiveRelationsForEntity("prod_coror_ind_enamel").filter(
    (r) =>
      r.relationType === "dilutedWith" &&
      r.fromEntityId === "prod_coror_ind_enamel" &&
      r.toEntityId === "prod_coror_ind_s31",
  );
  assert.equal(primer.length, 1);
  assert.equal(enamel.length, 1);
  assert.ok(primer[0]!.sourceIds?.length);
  assert.ok(enamel[0]!.sourceIds?.length);

  // No dilutedWith from Rapid Aqua (water) or glaze to S-31
  for (const id of [
    "prod_coror_rapid_aqua_enamel",
    "prod_factor_aqua_glaze",
    "prod_coror_rapid_enamel",
  ]) {
    const bad = getActiveRelationsForEntity(id).filter(
      (r) =>
        r.relationType === "dilutedWith" &&
        r.toEntityId === "prod_coror_ind_s31",
    );
    assert.equal(bad.length, 0, `${id} must not dilute with S-31`);
  }

  // Existing six dilutedWith preserved among non-S31 edges
  let legacy = 0;
  for (const p of listProducts()) {
    for (const r of getActiveRelationsForEntity(p.id)) {
      if (
        r.relationType === "dilutedWith" &&
        r.fromEntityId === p.id &&
        r.toEntityId !== "prod_coror_ind_s31"
      ) {
        legacy++;
      }
    }
  }
  assert.equal(legacy, MISSING_PRODUCTS_CLOSURE_V1_BASELINE.dilutedWith);
  console.log("S-31 relations OK");
}

section("Rapid Aqua distinct from solvent Rapid Zománc");
{
  const aqua = getProductById("prod_coror_rapid_aqua_enamel")!;
  const solvent = getProductById("prod_coror_rapid_enamel")!;
  assert.notEqual(aqua.id, solvent.id);
  assert.notEqual(aqua.slug, solvent.slug);
  assert.ok(aqua.name.includes("Aqua"));
  assert.ok(!solvent.name.includes("Aqua"));
  // No automatic copy of solvent dilutedWith (synthetic)
  const aquaDiluted = getActiveRelationsForEntity(aqua.id).filter(
    (r) => r.relationType === "dilutedWith" && r.fromEntityId === aqua.id,
  );
  assert.equal(aquaDiluted.length, 0);
  console.log("Rapid Aqua distinct OK");
}

section("FACTOR Aqua glaze membership");
{
  const glaze = getProductById("prod_factor_aqua_glaze")!;
  assert.equal(getCanonicalProductFamily(glaze.id)?.id, "pf_factor_aqua");
  assert.equal(getCanonicalProductBrand(glaze.id)?.id, "brand_factor");
  assert.equal(
    getCanonicalBrandOwner("brand_factor")?.id,
    "org_festek_bazis_zrt",
  );
  const surfaces = getActiveRelationsForEntity(glaze.id).filter(
    (r) =>
      r.relationType === "applicableToSurface" &&
      r.fromEntityId === glaze.id,
  );
  assert.equal(surfaces.length, 1);
  assert.equal(surfaces[0]!.toEntityId, "surface_fa");
  const techs = getActiveRelationsForEntity(glaze.id).filter(
    (r) => r.relationType === "usesTechnology" && r.fromEntityId === glaze.id,
  );
  assert.equal(techs.length, 1);
  assert.equal(techs[0]!.toEntityId, "tech_ecset");
  console.log("FACTOR glaze OK");
}

section("Search / SEO / ranking unchanged policy");
{
  assert.equal(
    buildSearchCatalog().length,
    expectedSearchDocumentsAfterClosure(),
  );
  for (const p of listProducts()) {
    assert.equal(evaluatePublicIndexability(p).indexable, false);
  }
  // Ranking / normalization modules not modified by this closure — smoke only
  console.log("search/SEO policy OK");
}

section("Description coverage intact + extended");
{
  assert.equal(
    productDescriptionEnrichmentsV1.length,
    expectedProductCountAfterClosure(),
  );
  for (const p of listProducts()) {
    assert.ok(p.sourceSummary, p.id);
    assert.ok(p.editorialSummary, p.id);
  }
  console.log("descriptions OK", productDescriptionEnrichmentsV1.length);
}

console.log("\nALL Missing Products Closure v1 checks passed.");
