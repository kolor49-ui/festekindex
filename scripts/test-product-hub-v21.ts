/**
 * Product Hub v2.1 — formatter + presentation model checks.
 * Run: npx tsx scripts/test-product-hub-v21.ts
 */

import assert from "node:assert/strict";
import {
  formatHuNumber,
  formatPackagingDisplay,
  formatSpecCondition,
  formatSpecValue,
  formatUnit,
} from "../lib/data/specificationFormat";
import {
  getPackagingForProduct,
  getRelatedProductsForHub,
  getTechnicalDataForProduct,
} from "../lib/data/productHub";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import {
  getProductById,
  getProductBySlug,
  listProducts,
  getActiveRelationsForEntity,
} from "../lib/data/repository";
import { festekBazisEnrichmentV1 } from "../lib/data/imports/festekBazisEnrichmentV1";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { ProductHubPage } from "../components/entity/ProductHubPage";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

section("formatter");
assert.equal(formatHuNumber(0.75), "0,75");
assert.equal(formatHuNumber(2.5), "2,5");
assert.equal(formatHuNumber(5.1), "5,1");
assert.equal(formatHuNumber(12), "12");
assert.equal(formatUnit("m2_per_l"), "m²/l");
assert.equal(formatUnit("g_per_m2"), "g/m²");
assert.equal(formatUnit("um"), "µm");
assert.equal(formatUnit("l_per_min"), "l/perc");
assert.equal(formatPackagingDisplay(0.75, "l"), "0,75 l");

assert.equal(
  formatSpecValue({ kind: "range_unit", min: 12, max: 13, unit: "m2_per_l" }),
  "12–13 m²/l",
);
assert.equal(
  formatSpecValue({ kind: "duration", value: 20, unit: "min" }),
  "20 perc",
);
assert.equal(
  formatSpecValue({ kind: "duration_range", min: 12, max: 30, unit: "min" }),
  "12–30 perc",
);
assert.equal(formatSpecValue({ kind: "percentage", value: 5 }), "5%");
assert.equal(
  formatSpecValue({ kind: "percentage_range", min: 5, max: 10 }),
  "5–10%",
);
assert.equal(formatSpecValue({ kind: "enum", value: "matt" }), "Matt");
assert.equal(
  formatSpecValue({ kind: "multi_enum", values: ["interior", "exterior"] }),
  "Beltéri és Kültéri",
);
assert.equal(
  formatSpecCondition({ temperatureC: 25 }),
  "25 °C-on",
);
assert.equal(
  formatSpecCondition({ relativeHumidityPct: 65 }),
  "65% relatív páratartalom mellett",
);
assert.equal(formatSpecCondition({ basis: "per_coat" }), "rétegenként");
assert.ok(
  formatSpecCondition({
    temperatureC: 25,
    note: "40 µm száraz rétegvastagság esetén",
  })?.includes("25 °C-on"),
);
assert.ok(
  formatSpecCondition({
    temperatureC: 25,
    note: "40 µm száraz rétegvastagság esetén",
  })?.includes("40 µm"),
);
console.log("formatter OK");

section("dataset regression");
const products = listProducts();
let specs = 0;
let packs = 0;
let diluted = 0;
for (const p of products) {
  specs += p.specifications?.length ?? 0;
  packs += p.packagingOptions?.length ?? 0;
}
for (const p of products) {
  for (const r of getActiveRelationsForEntity(p.id)) {
    if (r.relationType === "dilutedWith" && r.fromEntityId === p.id) diluted++;
  }
}
assert.equal(products.length, 27);
assert.equal(products.filter((p) => p.indexable).length, 0);
assert.equal(specs, 203);
assert.equal(packs, 68);
assert.equal(festekBazisEnrichmentV1.sources.length, 52);
assert.equal(diluted, 6);
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
assert.equal(getPackagingForProduct("prod_valmor_plaster").length, 0);
assert.ok(
  getRelatedProductsForHub("prod_factor_parquet").some(
    (r) => r.id === "prod_coror_synthetic" && r.label === "Hígító",
  ),
);
console.log("dataset OK");

section("hub models");
const air = getProductBySlug("valmor-air-flow-lelegzo-belteri-falfestek")!;
const airModel = buildProductHubModel(air)!;
assert.ok(airModel.technicalData.length > 0);
assert.ok(airModel.packaging.length > 0);
assert.ok(airModel.lead);
assert.ok(
  airModel.breadcrumbs.map((b) => b.name).join(" / ").includes("VALMOR AIR FLOW"),
);

const primer = getProductById("prod_coror_rapid_primer")!;
const primerModel = buildProductHubModel(primer)!;
const flatItems = primerModel.technicalData.flatMap((g) => g.items);
const coverage = flatItems.find((i) => i.key === "coverage");
assert.ok(coverage?.value.includes("12–13"));
assert.ok(coverage?.condition?.includes("40"));
const touch = flatItems.find((i) => i.key === "touch_dry_time");
assert.ok(touch?.value.includes("20"));
assert.ok(
  primerModel.relatedProducts.some((r) => r.id === "prod_coror_synthetic"),
);
assert.ok(
  primerModel.relatedProducts.some((r) => r.id === "prod_coror_aromatic"),
);

const aromatic = buildProductHubModel(getProductById("prod_coror_aromatic")!)!;
assert.ok(
  !aromatic.technicalData
    .flatMap((g) => g.items)
    .some((i) => i.key === "binder" || i.label === "Kötőanyag"),
);

const enamel = buildProductHubModel(getProductById("prod_coror_ind_enamel")!)!;
assert.ok(
  !enamel.technicalData
    .flatMap((g) => g.items)
    .some((i) => i.key === "binder"),
);

const plaster = buildProductHubModel(getProductById("prod_valmor_plaster")!)!;
assert.equal(plaster.packaging.length, 0);

const few = getTechnicalDataForProduct("prod_coror_aromatic");
assert.ok(few.length <= 1);

console.log("hub models OK");

section("public leakage");
const leakNeedles = [
  "sourceIds",
  "rawValue",
  "verifiedAt",
  "documentKind",
  "productClass",
  "dilutedWith",
  "partOfSystem",
  "compatibleWith",
  "range_unit",
  "m2_per_l",
  "architectural_coating",
  "industrial_coating",
];
const refs = [
  airModel,
  primerModel,
  aromatic,
  enamel,
  plaster,
  buildProductHubModel(getProductById("prod_factor_parquet")!)!,
  buildProductHubModel(getProductById("prod_7016_wall")!)!,
];
for (const model of refs) {
  const html = renderToStaticMarkup(createElement(ProductHubPage, { model }));
  for (const needle of leakNeedles) {
    assert.ok(
      !html.includes(needle),
      `leak "${needle}" in ${model.product.id}`,
    );
  }
  assert.ok(!html.includes("Nincs adat"));
  assert.ok(!html.includes("Nincs megadva"));
}
console.log("leakage OK");

console.log("\nALL Product Hub v2.1 checks passed.");
