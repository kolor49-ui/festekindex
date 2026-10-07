/**
 * Entity Fact Link Consistency — header/summary entity values must be crawlable links.
 * Run: npx tsx scripts/test-entity-fact-links-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BrandHubPage } from "../components/entity/BrandHubPage";
import { ProductFamilyHubPage } from "../components/entity/ProductFamilyHubPage";
import { ProductHubPage } from "../components/entity/ProductHubPage";
import {
  getBrandById,
  getProductById,
  getProductFamilyById,
} from "../lib/data/repository";
import { buildBrandHubModel } from "../lib/seo/brandHubModel";
import { buildProductFamilyHubModel } from "../lib/seo/productFamilyHubModel";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import {
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
} from "../lib/navigation/entityNavigation";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

function hasLinkedFact(
  html: string,
  label: string,
  href: string,
  name: string,
): boolean {
  // Chip structure: <dt>Label</dt><dd><a href="...">Name</a></dd>
  const re = new RegExp(
    `<dt>${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</dt>\\s*<dd>\\s*<a[^>]*href="${href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*</a>`,
    "i",
  );
  return re.test(html);
}

function hasPlainFact(html: string, label: string, value: string): boolean {
  const re = new RegExp(
    `<dt>${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</dt>\\s*<dd>${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</dd>`,
    "i",
  );
  return re.test(html);
}

section("Brand VALMOR — Tulajdonos chip linked");
{
  const brand = getBrandById("brand_valmor")!;
  const model = buildBrandHubModel(brand)!;
  const owner = model.metaChips.find((c) => c.href?.includes("/cegek/"));
  assert.ok(owner, "owner chip with href");
  assert.equal(owner!.value, "FESTÉK BÁZIS Zrt.");
  assert.equal(owner!.href, "/cegek/festek-bazis-zrt");
  assert.equal(getCanonicalBrandOwner("brand_valmor")?.id, "org_festek_bazis_zrt");

  const html = renderToStaticMarkup(
    createElement(BrandHubPage, { model }),
  );
  assert.ok(
    hasLinkedFact(html, owner!.label, "/cegek/festek-bazis-zrt", "FESTÉK BÁZIS Zrt."),
  );
  // Counts remain plain text
  const countChip = model.metaChips.find((c) => c.label === "Termékek");
  if (countChip) {
    assert.equal(countChip.href, undefined);
    assert.ok(hasPlainFact(html, "Termékek", countChip.value));
  }
}
console.log("VALMOR brand OK");

section("Brand Graco — owner Graco Inc, not Euroll");
{
  const model = buildBrandHubModel(getBrandById("brand_graco")!)!;
  const ownerChip = model.metaChips.find((c) => c.href);
  assert.ok(ownerChip);
  assert.equal(ownerChip!.href, "/cegek/graco-inc");
  assert.ok(/Graco Inc/i.test(ownerChip!.value));
  assert.ok(!model.metaChips.some((c) => /euroll/i.test(c.value)));
  assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
  const html = renderToStaticMarkup(
    createElement(BrandHubPage, { model }),
  );
  assert.ok(html.includes('href="/cegek/graco-inc"'));
  assert.ok(!hasLinkedFact(html, "Tulajdonos", "/cegek/euroll-hungaria", "Euroll"));
}
console.log("Graco brand OK");

section("Product COROR Rapid primer — Márka / Family / Org linked");
{
  const model = buildProductHubModel(
    getProductById("prod_coror_rapid_primer")!,
  )!;
  const brand = model.headerFacts.find((f) => f.label === "Márka");
  const family = model.headerFacts.find((f) => f.label === "Termékcsalád");
  const org = model.headerFacts.find(
    (f) => f.label === "Tulajdonos" || f.label === "Gyártó",
  );
  assert.equal(brand?.href, "/markak/coror");
  assert.ok(family?.href?.startsWith("/termekcsaladok/"));
  assert.equal(org?.href, "/cegek/festek-bazis-zrt");
  const html = renderToStaticMarkup(
    createElement(ProductHubPage, { model }),
  );
  assert.ok(hasLinkedFact(html, "Márka", "/markak/coror", "COROR"));
  assert.ok(
    hasLinkedFact(html, org!.label, "/cegek/festek-bazis-zrt", "FESTÉK BÁZIS Zrt."),
  );
}
console.log("Product facts OK");

section("ProductFamily COROR Rapid — Márka + Tulajdonos linked");
{
  const model = buildProductFamilyHubModel(
    getProductFamilyById("pf_coror_rapid")!,
  )!;
  const brand = model.headerFacts.find((f) => f.label === "Márka");
  const org = model.headerFacts.find(
    (f) => f.label === "Tulajdonos" || f.label === "Gyártó",
  );
  assert.equal(brand?.href, "/markak/coror");
  assert.equal(org?.href, "/cegek/festek-bazis-zrt");
  const html = renderToStaticMarkup(
    createElement(ProductFamilyHubPage, { model }),
  );
  assert.ok(hasLinkedFact(html, "Márka", "/markak/coror", "COROR"));
  assert.ok(
    hasLinkedFact(html, org!.label, "/cegek/festek-bazis-zrt", "FESTÉK BÁZIS Zrt."),
  );
  const termekek = model.headerFacts.find((f) => f.label === "Termékek");
  assert.ok(termekek && !termekek.href);
}
console.log("ProductFamily facts OK");

section("ProductFamily 7016 — Gyártó linked, no Brand invented");
{
  const model = buildProductFamilyHubModel(getProductFamilyById("pf_7016")!)!;
  assert.ok(!model.headerFacts.some((f) => f.label === "Márka"));
  const org = model.headerFacts.find((f) => f.label === "Gyártó");
  assert.ok(org);
  assert.equal(org!.href, "/cegek/festek-bazis-zrt");
  assert.equal(
    getCanonicalFamilyManufacturer("pf_7016")?.id,
    "org_festek_bazis_zrt",
  );
  const html = renderToStaticMarkup(
    createElement(ProductFamilyHubPage, { model }),
  );
  assert.ok(
    hasLinkedFact(html, "Gyártó", "/cegek/festek-bazis-zrt", "FESTÉK BÁZIS Zrt."),
  );
  assert.ok(!html.includes("brand_7016"));
  assert.ok(!/Márka<\/dt>\s*<dd>[^<]*7016/i.test(html));
}
console.log("7016 family OK");

section("Product 7016 — no fake Brand, Family + Gyártó linked");
{
  const model = buildProductHubModel(getProductById("prod_7016_wall")!)!;
  assert.ok(!model.headerFacts.some((f) => f.label === "Márka"));
  const family = model.headerFacts.find((f) => f.label === "Termékcsalád");
  const org = model.headerFacts.find((f) => f.label === "Gyártó");
  assert.equal(family?.href, "/termekcsaladok/7016");
  assert.equal(org?.href, "/cegek/festek-bazis-zrt");
  const html = renderToStaticMarkup(
    createElement(ProductHubPage, { model }),
  );
  assert.ok(html.includes('href="/termekcsaladok/7016"'));
  assert.ok(html.includes('href="/cegek/festek-bazis-zrt"'));
  assert.ok(!html.includes("brand_7016"));
}
console.log("7016 product OK");

console.log("\nALL Entity Fact Link Consistency checks passed.");
