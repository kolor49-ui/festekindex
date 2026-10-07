/**
 * Product Professional Description v1 — structured Termékleírás.
 * Run: npx tsx scripts/test-product-professional-description-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductHubPage } from "../components/entity/ProductHubPage";
import { productProfessionalDescriptionEnrichmentsV1 } from "../lib/data/imports/festekBazisEnrichmentV1/professionalDescriptionEnrichment";
import {
  expectedDilutedWithAfterClosure,
  expectedMergedSourcesAfterClosure,
  expectedPackagingCountAfterClosure,
  expectedProductCountAfterClosure,
  expectedSearchDocumentsAfterClosure,
  expectedSpecCountAfterClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";
import {
  getActiveRelationsForEntity,
  getProductById,
  getSourceById,
  listProducts,
} from "../lib/data/repository";
import { buildSearchCatalog } from "../lib/search";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const INTERNAL =
  /professionalDescription|editorialSummary|sourceSummary|sourceIds|sectionKey|rawValue|verifiedAt|documentKind|productClass|belongsToCategory|partOfSystem|dilutedWith|NOINDEX|ProductFamily/i;

const MARKETING =
  /kimagasló|prémium|forradalmi|tökéletes|csúcskategóriás|ideális választás/i;

section("Baseline locks");
{
  const products = listProducts();
  assert.equal(products.length, expectedProductCountAfterClosure());
  assert.equal(products.length, 30);

  let specs = 0;
  let packs = 0;
  let diluted = 0;
  for (const p of products) {
    specs += p.specifications?.length ?? 0;
    packs += p.packagingOptions?.length ?? 0;
    assert.equal(evaluatePublicIndexability(p).indexable, false, p.id);
  }
  assert.equal(specs, expectedSpecCountAfterClosure());
  assert.equal(packs, expectedPackagingCountAfterClosure());
  assert.equal(
    buildSearchCatalog().length,
    expectedSearchDocumentsAfterClosure(),
  );
  assert.equal(buildSearchCatalog().length, 105);

  for (const p of products) {
    for (const r of getActiveRelationsForEntity(p.id)) {
      if (r.relationType === "dilutedWith" && r.fromEntityId === p.id) diluted++;
    }
  }
  assert.equal(diluted, expectedDilutedWithAfterClosure());
  assert.equal(expectedMergedSourcesAfterClosure(), 83);
  console.log("baseline OK", { specs, packs, diluted });
}

section("Coverage + provenance");
{
  const products = listProducts();
  const withDesc = products.filter((p) => p.professionalDescription?.sections?.length);
  assert.equal(withDesc.length, 30);
  assert.equal(productProfessionalDescriptionEnrichmentsV1.length, 30);

  let totalSections = 0;
  const headingCounts = new Map<string, number>();
  const fingerprints = new Map<string, string[]>();

  for (const p of withDesc) {
    const desc = p.professionalDescription!;
    assert.ok(desc.sourceIds.length > 0, `${p.id} description sourceIds`);
    for (const sid of desc.sourceIds) {
      assert.ok(getSourceById(sid), `${p.id} unknown source ${sid}`);
      const src = getSourceById(sid)!;
      assert.equal(src.type, "manufacturer", `${sid} manufacturer`);
      assert.ok(
        src.documentKind === "product_page" || src.documentKind === "tds",
        `${sid} official doc kind`,
      );
      assert.ok(
        src.url?.includes("festekbazis.hu"),
        `${sid} festekbazis only`,
      );
    }

    for (const s of desc.sections) {
      totalSections++;
      headingCounts.set(s.heading, (headingCounts.get(s.heading) ?? 0) + 1);
      assert.ok(s.heading.trim(), `${p.id} empty heading`);
      assert.ok(s.paragraphs.length > 0, `${p.id} ${s.heading} paragraphs`);
      for (const para of s.paragraphs) {
        assert.ok(para.trim().length > 0, `${p.id} empty para`);
        assert.ok(!MARKETING.test(para), `${p.id} marketing: ${para.slice(0, 60)}`);
        assert.ok(!INTERNAL.test(para), `${p.id} internal in content`);
      }
      for (const sid of s.sourceIds ?? []) {
        assert.ok(getSourceById(sid), `${p.id} section unknown source`);
      }
    }

    const fp = desc.sections
      .map((s) => `${s.heading}|${s.paragraphs.join(" ")}`)
      .join("||");
    const owners = fingerprints.get(fp) ?? [];
    owners.push(p.id);
    fingerprints.set(fp, owners);
  }

  for (const [fp, owners] of fingerprints) {
    assert.equal(
      owners.length,
      1,
      `identical professional descriptions: ${owners.join(", ")}`,
    );
    void fp;
  }

  // Sibling-copy smoke: Rapid Aqua ≠ solvent Rapid enamel Előkészítés
  const aqua = getProductById("prod_coror_rapid_aqua_enamel")!;
  const solvent = getProductById("prod_coror_rapid_enamel")!;
  const aquaPrep = aqua.professionalDescription!.sections.find(
    (s) => s.heading === "Előkészítés",
  )!.paragraphs.join(" ");
  const solventPrep = solvent.professionalDescription!.sections.find(
    (s) => s.heading === "Előkészítés",
  )!.paragraphs.join(" ");
  assert.notEqual(aquaPrep, solventPrep);

  console.log("coverage OK", {
    products: withDesc.length,
    totalSections,
    headings: Object.fromEntries(headingCounts),
  });
}

section("Reference content");
{
  const air = getProductById("prod_valmor_airflow_interior")!;
  const heads = air.professionalDescription!.sections.map((s) => s.heading);
  assert.deepEqual(heads, [
    "Alkalmazás",
    "Előkészítés",
    "Felhasználás",
    "Fényesség",
  ]);
  assert.match(
    air.professionalDescription!.sections[0]!.paragraphs.join(" "),
    /páraáteresztő|diszperziós|gipszkarton/i,
  );
  assert.match(
    air.professionalDescription!.sections[1]!.paragraphs.join(" "),
    /28 nap|mélyalapozó|gipsz/i,
  );
  assert.match(
    air.professionalDescription!.sections[2]!.paragraphs.join(" "),
    /\+10|10%|5%/i,
  );
  assert.match(
    air.professionalDescription!.sections[3]!.paragraphs.join(" "),
    /matt/i,
  );

  const reps = [
    "prod_factor_aqua_glaze",
    "prod_coror_rapid_aqua_enamel",
    "prod_coror_rapid_primer",
    "prod_coror_ind_enamel",
    "prod_coror_ind_s31",
    "prod_coror_aromatic",
    "prod_coror_synthetic",
  ];
  for (const id of reps) {
    const p = getProductById(id)!;
    assert.ok(
      p.professionalDescription?.sections?.length,
      `${id} professional description`,
    );
    assert.ok(
      p.professionalDescription!.sections.some((s) => s.heading === "Alkalmazás"),
      `${id} Alkalmazás`,
    );
  }

  // Thinners must not be forced into paint gloss/coats structure
  for (const id of [
    "prod_coror_ind_s31",
    "prod_coror_aromatic",
    "prod_coror_synthetic",
  ]) {
    const heads = getProductById(id)!.professionalDescription!.sections.map(
      (s) => s.heading,
    );
    assert.ok(!heads.includes("Fényesség"), `${id} no forced Fényesség`);
    assert.ok(heads.includes("Felhasználás"), `${id} Felhasználás`);
  }

  console.log("reference OK");
}

section("Hub render order + SSR + leakage");
{
  const products = listProducts().filter((p) => p.professionalDescription);
  assert.equal(products.length, 30);

  for (const p of products) {
    const model = buildProductHubModel(p)!;
    assert.ok(model.lead, `${p.id} short lead`);
    assert.ok(model.professionalDescription, `${p.id} hub professional`);
    const html = renderToStaticMarkup(
      createElement(ProductHubPage, { model }),
    );
    assert.ok(html.includes(">Termékleírás<"), `${p.id} Termékleírás`);
    assert.ok(html.includes('id="termekleiras"'), `${p.id} id`);
    for (const s of model.professionalDescription!.sections) {
      assert.ok(html.includes(s.heading), `${p.id} ${s.heading}`);
      assert.ok(
        html.includes(s.paragraphs[0]!.slice(0, 40)),
        `${p.id} para SSR`,
      );
    }
    assert.ok(!INTERNAL.test(html), `${p.id} internal leakage`);

    const h1 = html.indexOf(`<h1>${model.h1}</h1>`);
    const lead = html.indexOf(`<p class="page-lead">${model.lead}</p>`);
    const facts = html.indexOf("product-header-facts");
    const desc = html.indexOf('id="termekleiras"');
    const szakmai = html.indexOf("Szakmai környezet");
    const tech = html.indexOf('id="muszaki-adatok"');
    assert.ok(h1 >= 0 && lead > h1, `${p.id} H1→lead`);
    assert.ok(facts > lead, `${p.id} lead→facts`);
    assert.ok(desc > facts, `${p.id} facts→Termékleírás`);
    assert.ok(szakmai > desc, `${p.id} Termékleírás→Szakmai`);
    if (tech >= 0) {
      assert.ok(tech > szakmai, `${p.id} Szakmai→Műszaki`);
    }
  }

  console.log("render/SSR OK", products.length);
}

section("AIR FLOW acceptance smoke");
{
  const model = buildProductHubModel(
    getProductById("prod_valmor_airflow_interior")!,
  )!;
  const html = renderToStaticMarkup(
    createElement(ProductHubPage, { model }),
  );
  assert.ok(html.includes(model.lead!));
  assert.ok(html.includes("Termékleírás"));
  assert.ok(html.includes("Alkalmazás"));
  assert.ok(html.includes("Előkészítés"));
  assert.ok(html.includes("Felhasználás"));
  assert.ok(html.includes("Fényesség"));
  assert.ok(html.includes("matt"));
  assert.ok(html.includes("Szakmai környezet"));
  assert.ok(html.includes("Műszaki adatok"));
  console.log("AIR FLOW smoke OK");
}

console.log("\nALL Product Professional Description v1 checks passed.");
