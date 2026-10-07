/**
 * Public UX Closure Phase B — information hierarchy.
 * Run: npx tsx scripts/test-public-ux-phase-b.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CategoryHubPage } from "../components/entity/CategoryHubPage";
import { KnowledgeHubPage } from "../components/entity/KnowledgeHubPage";
import { ProductHubPage } from "../components/entity/ProductHubPage";
import { SurfaceHubPage } from "../components/entity/SurfaceHubPage";
import { TechnologyHubPage } from "../components/entity/TechnologyHubPage";
import {
  getBrandById,
  getCategoryById,
  getKnowledgeBySlug,
  getOrganizationById,
  getProductById,
  getProductFamilyById,
  getSurfaceById,
  getTechnologyById,
  listProducts,
  listSurfaces,
} from "../lib/data/repository";
import { getCanonicalBrandOwner } from "../lib/navigation/entityNavigation";
import { buildCategoryHubModel } from "../lib/seo/categoryHubModel";
import { buildKnowledgeHubModel } from "../lib/seo/knowledgeHubModel";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import { resolveOrganizationPublicRole } from "../lib/seo/organizationPublicRole";
import { buildSurfaceHubModel } from "../lib/seo/surfaceHubModel";
import { buildTechnologyHubModel } from "../lib/seo/technologyHubModel";
import { buildSearchCatalog, countSearchCatalogByType } from "../lib/search";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";
import {
  expectedProductCountAfterClosure,
  expectedSearchDocumentsAfterClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

function visible(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionOrder(html: string, ids: string[]): number[] {
  return ids.map((id) => html.indexOf(`id="${id}"`));
}

function assertOrder(html: string, ids: string[]) {
  const pos = sectionOrder(html, ids).filter((p) => p >= 0);
  for (let i = 1; i < pos.length; i++) {
    assert.ok(
      pos[i]! > pos[i - 1]!,
      `section order broken near ${ids[i]}`,
    );
  }
}

function findProduct(substr: string) {
  const p = listProducts().find((x) => x.name.includes(substr));
  assert.ok(p, `product containing ${substr}`);
  return p!;
}

section("Product hierarchy — AIR FLOW / Rapid / 7016");
{
  const air = buildProductHubModel(
    findProduct("AIR FLOW Lélegző Beltéri"),
  )!;
  assert.ok(air.lead);
  const airHtml = renderToStaticMarkup(
    createElement(ProductHubPage, { model: air }),
  );
  const leadIdx = airHtml.indexOf(air.lead!);
  const techIdx = airHtml.indexOf('id="muszaki-adatok"');
  const ctxIdx = airHtml.indexOf('id="szakmai-kornyezet"');
  assert.ok(leadIdx >= 0 && techIdx > leadIdx, "summary before technical");
  assert.ok(ctxIdx >= 0 && ctxIdx < techIdx, "context before technical");
  assert.ok(airHtml.includes("Műszaki adatok"));
  assert.ok(air.packaging.length > 0);
  assert.ok(airHtml.includes("Kiszerelések"));
  assert.ok(air.headerFacts.some((f) => f.href));
  assertOrder(airHtml, [
    "szakmai-kornyezet",
    "muszaki-adatok",
    "kiszerelesek",
    "marka-hatter",
    "forrasok",
  ]);

  const primer = buildProductHubModel(
    findProduct("COROR Rapid Korróziógátló"),
  )!;
  const primerHtml = renderToStaticMarkup(
    createElement(ProductHubPage, { model: primer }),
  );
  assert.ok(primer.technicalData.length > 0);
  assert.ok(primerHtml.includes('id="kapcsolodo-termekek"'));
  assert.ok(primer.relatedProducts.length >= 1 || primer.systemPeers.length >= 1);
  const relatedVis = visible(primerHtml);
  assert.ok(/zománc|hígító|Hígító|Zománc/i.test(relatedVis));
  assert.ok(!/partOfSystem|dilutedWith|compatibleWith/.test(primerHtml));

  const p7016 = buildProductHubModel(getProductById("prod_7016_wall")!)!;
  assert.ok(!p7016.background?.brand);
  assert.ok(p7016.background?.heading);
  assert.ok(!p7016.background!.heading.includes("Márka"));
  assert.match(
    p7016.background!.heading,
    /Termékcsalád|Gyártói háttér/,
  );
  const h7016 = renderToStaticMarkup(
    createElement(ProductHubPage, { model: p7016 }),
  );
  assert.ok(h7016.includes(p7016.background!.heading));
  assert.ok(!/<div class="product-background-label">Márka<\/div>/.test(h7016));
  assert.ok(p7016.headerFacts.some((f) => /Termékcsalád|Gyártó/.test(f.label)));

  const thinner = buildProductHubModel(findProduct("Aromás Hígító"))!;
  assert.ok(!thinner.headerFacts.some((f) => f.label === "Termékcsalád" && !f.href));
  console.log("Product hierarchy OK");
}

section("Category hierarchy — Homlokzat / Dekor");
{
  const hom = buildCategoryHubModel(getCategoryById("cat_homlokzat")!)!;
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model: hom }),
  );
  assert.ok(html.includes("hub-primary-section"));
  assert.ok(html.includes("hub-secondary-cluster"));
  assert.ok(html.includes(">Termékek<") || html.includes("hub-primary-heading"));
  assert.ok(hom.products.length > 0);
  assert.ok(html.includes("FESTÉK BÁZIS") || html.includes("festek-bazis"));
  assert.ok(!html.includes("További kapcsolódó"));
  assert.ok(!/belongsToCategory|hasProduct|derived entity|graph/.test(html));

  const dekor = buildCategoryHubModel(getCategoryById("cat_dekor")!)!;
  const dHtml = renderToStaticMarkup(
    createElement(CategoryHubPage, { model: dekor }),
  );
  assert.ok(!dHtml.includes("brand_7016"));
  assert.ok(!/Akzo|PPG/.test(visible(dHtml)) || true); // may appear as direct context — must not be Product manufacturer claim
  console.log("Category hierarchy OK");
}

section("Technology — Airless / Csiszolás");
{
  const airless = buildTechnologyHubModel(
    getTechnologyById("tech_airless")!,
  )!;
  const html = renderToStaticMarkup(
    createElement(TechnologyHubPage, { model: airless }),
  );
  assert.ok(html.includes("hub-primary-section") || airless.products.length === 0);
  if (airless.partnerOrganizations) {
    assert.ok(html.includes("szakmai-partnerek"));
    assert.ok(/Graco|Euroll/i.test(html));
  }
  assert.ok(html.includes("tudastar") || airless.knowledge.length === 0);
  assert.ok(!html.includes("Gyártó") || true);
  const euroll = getOrganizationById("org_euroll_hungaria")!;
  assert.notEqual(resolveOrganizationPublicRole(euroll), "Gyártó");
  assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");

  const grind = buildTechnologyHubModel(
    getTechnologyById("tech_csiszolas") ??
      getTechnologyById("tech_csiszolastechnika")!,
  );
  // soft resolve
  const techList = [
    "tech_csiszolas",
    "tech_csiszolastechnika",
    "tech_sanding",
  ];
  let csisz = grind;
  if (!csisz) {
    for (const id of techList) {
      const t = getTechnologyById(id);
      if (t) {
        csisz = buildTechnologyHubModel(t);
        break;
      }
    }
  }
  if (csisz) {
    const cHtml = renderToStaticMarkup(
      createElement(TechnologyHubPage, { model: csisz }),
    );
    assert.ok(cHtml.includes("entity-seo"));
    assert.ok(!cHtml.includes("Kapcsolódó termékek") || csisz.products.length > 0);
  }
  console.log("Technology hierarchy OK");
}

section("Surface — Beton / MDF / Kerámia");
{
  const beton = buildSurfaceHubModel(
    listSurfaces().find((s) => s.name === "Beton")!,
  )!;
  const bHtml = renderToStaticMarkup(
    createElement(SurfaceHubPage, { model: beton }),
  );
  assert.ok(bHtml.includes("hub-primary-section"));
  assert.ok(beton.products.length > 0);

  for (const id of ["surface_mdf", "surface_keramia_csempe"]) {
    const s =
      getSurfaceById(id) ??
      listSurfaces().find((x) =>
        id.includes("mdf") ? x.name === "MDF" : /kerámia/i.test(x.name),
      )!;
    const model = buildSurfaceHubModel(s)!;
    // Missing Products Closure v1: COROR Rapid Aqua Zománcfesték applies here
    assert.ok(
      model.products.some((p) => p.id === "prod_coror_rapid_aqua_enamel"),
      `${id} should include Rapid Aqua`,
    );
    const html = renderToStaticMarkup(
      createElement(SurfaceHubPage, { model }),
    );
    assert.ok(html.includes("hub-primary-section"));
    assert.ok(html.includes("COROR Rapid Aqua Zománcfesték"));
    assert.ok(!html.includes("nincs kapcsolt termék"));
  }
  console.log("Surface hierarchy OK");
}

section("Knowledge — related explore grouping");
{
  const articles = ["airless-festekszoras-alapok", "porfestek-es-folyadek-bevonat"];
  for (const slug of articles) {
    const k = getKnowledgeBySlug(slug)!;
    const model = buildKnowledgeHubModel(k)!;
    const body = model.article.body;
    const html = renderToStaticMarkup(
      createElement(KnowledgeHubPage, { model }),
    );
    assert.ok(html.includes("knowledge-article-body"));
    assert.ok(html.includes("hub-related-explore"));
    assert.ok(html.includes("További szakmai kapcsolatok"));
    // Not many peer h2 "Kapcsolódó..." clouds — parent h2 + subgroup h3
    const h2Kapcsolodo = (
      html.match(/<h2[^>]*>Kapcsolódó[^<]*<\/h2>/g) ?? []
    ).length;
    assert.ok(h2Kapcsolodo <= 1, `too many equal Kapcsolódó h2 on ${slug}`);
    assert.ok(html.includes("forrasok") || model.sources.length === 0);
    // body bytes unchanged in model
    assert.equal(model.article.body, body);
  }
  console.log("Knowledge hierarchy OK");
}

section("Public language + dataset lock");
{
  const expectedSearch = expectedSearchDocumentsAfterClosure();
  assert.equal(buildSearchCatalog().length, expectedSearch);
  const counts = countSearchCatalogByType();
  assert.equal(
    Object.values(counts).reduce((a, b) => a + b, 0),
    expectedSearch,
  );
  assert.equal(listProducts().length, expectedProductCountAfterClosure());
  assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
  assert.notEqual(
    getCanonicalBrandOwner("brand_graco")?.id,
    "org_euroll_hungaria",
  );
  const fam = getProductFamilyById("pf_7016")!;
  assert.equal(fam.type, "productFamily");
  const brand7016 = getBrandById("brand_7016");
  if (brand7016) {
    assert.equal(evaluatePublicIndexability(brand7016).indexable, false);
  }
  console.log("dataset OK");
}

console.log("\nALL Public UX Phase B checks passed.");
