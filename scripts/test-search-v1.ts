/**
 * Search v1 — catalog, normalization, ranking, progressive helpers.
 * Run: npx tsx scripts/test-search-v1.ts
 */

import assert from "node:assert/strict";
import {
  buildSearchCatalog,
  countSearchCatalogByType,
  getProductSearchChildren,
  getProductSearchFamilyProducts,
  getProductSearchRoots,
  normalizeSearchText,
  resetSearchCatalogCache,
  searchCatalog,
  SEARCH_FULL_LIMIT,
  SEARCH_TYPE_LABEL_HU,
} from "../lib/search";
import { getCanonicalBrandOwner } from "../lib/navigation/entityNavigation";
import { listProducts, listSurfaces } from "../lib/data/repository";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

function topIds(query: string, limit = 12) {
  return searchCatalog(query, { limit }).map((r) => r.id);
}

function topTypes(query: string, limit = 12) {
  return searchCatalog(query, { limit }).map((r) => `${r.type}:${r.name}`);
}

resetSearchCatalogCache();

section("normalization");
assert.equal(normalizeSearchText("FESTÉK BÁZIS"), "festek bazis");
assert.equal(normalizeSearchText("festek bazis"), "festek bazis");
assert.equal(normalizeSearchText("korrózió"), "korrozio");
assert.equal(normalizeSearchText("korrozio"), "korrozio");
assert.equal(normalizeSearchText("hígító"), "higito");
assert.equal(normalizeSearchText("Air-mix"), "air mix");
assert.equal(normalizeSearchText("air mix"), "air mix");
assert.equal(normalizeSearchText("7016™"), "7016");
assert.equal(normalizeSearchText("7016"), "7016");
console.log("normalization OK");

section("eligibility");
{
  const catalog = buildSearchCatalog();
  const counts = countSearchCatalogByType();
  assert.equal(counts.product, 27, "all FB products searchable");
  assert.equal(counts.surface, 15, "all surfaces searchable");
  assert.equal(counts.organization, 9);
  assert.equal(counts.brand, 13, "published brands only");
  assert.equal(counts.productFamily, 8);
  assert.equal(counts.technology, 9);
  assert.equal(counts.category, 19, "cat_all excluded");
  assert.equal(counts.knowledge, 2);
  assert.ok(!catalog.some((d) => d.id === "brand_7016"));
  assert.ok(!catalog.some((d) => d.id === "cat_all"));
  assert.ok(catalog.some((d) => d.id === "surface_mdf"));
  assert.ok(
    catalog.some(
      (d) =>
        d.type === "surface" &&
        /kerámia|csempe/i.test(d.name),
    ),
  );
  assert.ok(!catalog.some((d) => d.type === "comparison" as never));
  // Internal fields must not appear in searchable text
  for (const d of catalog) {
    const blob = [
      d.identityText,
      d.contextText,
      d.lowWeightText ?? "",
      d.displayName,
      d.contextLabel ?? "",
    ]
      .join(" ")
      .toLowerCase();
    assert.ok(!blob.includes("sourceids"));
    assert.ok(!blob.includes("productclass"));
    assert.ok(!blob.includes("hasproduct"));
    assert.ok(!blob.includes("spray_process"));
    assert.ok(!/\bsrc_/.test(blob));
  }
  console.log("docs", catalog.length, counts);
}
console.log("eligibility OK");

section("empty / min query");
assert.deepEqual(searchCatalog(""), []);
assert.deepEqual(searchCatalog(" "), []);
assert.deepEqual(searchCatalog("a"), []);
assert.ok(searchCatalog("Fa").length > 0);
assert.ok(searchCatalog("GX").some((r) => /gx/i.test(r.name)));
console.log("empty/min OK");

section("ranking identity");
{
  const valmor = searchCatalog("valmor", { limit: 12 });
  assert.equal(valmor[0]?.id, "brand_valmor", "VALMOR Brand first");
  assert.ok(
    valmor.findIndex((r) => r.type === "productFamily") >
      -1 &&
      valmor.findIndex((r) => r.type === "productFamily") <
        valmor.findIndex((r) => r.type === "product"),
    "VALMOR Family before Products",
  );

  const air = searchCatalog("air flow", { limit: 12 });
  assert.equal(air[0]?.type, "productFamily");
  assert.ok(/air flow/i.test(air[0]!.name));

  const rapid = searchCatalog("coror rapid", { limit: 12 });
  assert.equal(rapid[0]?.type, "productFamily");
  assert.ok(/rapid/i.test(rapid[0]!.name));

  const beton = searchCatalog("beton", { limit: 12 });
  assert.equal(beton[0]?.type, "surface");
  assert.equal(beton[0]?.name, "Beton");

  const seven = searchCatalog("7016", { limit: 12 });
  assert.equal(seven[0]?.type, "productFamily");
  assert.ok(seven[0]!.name.includes("7016"));
  assert.ok(seven.some((r) => r.type === "product"));

  const airless = searchCatalog("airless", { limit: 12 });
  assert.ok(
    airless.some((r) => r.type === "technology" && /airless/i.test(r.name)),
  );
  assert.equal(airless[0]?.type, "technology");
  // Must not surface unrelated Acél via body noise
  assert.ok(!airless.some((r) => r.name === "Acél"));

  const por = searchCatalog("porfestek", { limit: 12 });
  assert.ok(por.some((r) => r.type === "category"));
  assert.ok(por.some((r) => r.type === "technology"));
  assert.ok(
    por.every((r) => r.typeLabelHu !== "Kategória"),
  );
  assert.ok(
    por.some((r) => r.type === "category" && r.typeLabelHu === "Szakmai terület"),
  );
}
console.log("ranking OK");

section("accentless + product queries");
{
  assert.ok(
    searchCatalog("festek bazis").some((r) =>
      /festék bázis/i.test(r.name),
    ),
  );
  assert.ok(
    searchCatalog("korrozio").some(
      (r) => r.type === "product" && /korrózió/i.test(r.name),
    ) ||
      searchCatalog("korrozio").some((r) => /korrózió/i.test(r.name)),
  );
  assert.ok(
    searchCatalog("parkettalakk").some(
      (r) => r.type === "product" && /parkettalakk/i.test(r.name),
    ),
  );
  assert.ok(
    searchCatalog("higito").some(
      (r) => r.type === "product" && /hígító/i.test(r.name),
    ),
  );
  assert.ok(
    searchCatalog("alapozo").some(
      (r) => r.type === "product" && /alapozó/i.test(r.name),
    ),
  );
  assert.ok(searchCatalog("vakolat").some((r) => r.type === "surface"));
  assert.ok(searchCatalog("fa").some((r) => r.type === "surface" && r.name === "Fa"));
}
console.log("accent/product OK");

section("labels");
{
  for (const [type, label] of Object.entries(SEARCH_TYPE_LABEL_HU)) {
    assert.ok(label);
    if (type === "category") assert.equal(label, "Szakmai terület");
  }
  const hit = searchCatalog("porfestek").find((r) => r.type === "category");
  assert.equal(hit?.typeLabelHu, "Szakmai terület");
}
console.log("labels OK");

section("internal leakage queries");
{
  for (const q of [
    "src_",
    "prod_valmor_xclusive",
    "hasProduct",
    "spray_process",
    "brand_7016",
  ]) {
    const hits = searchCatalog(q, { limit: SEARCH_FULL_LIMIT });
    assert.equal(hits.length, 0, `expected empty for ${q}, got ${hits.map((h) => h.id)}`);
  }
}
console.log("leakage OK");

section("progressive roots");
{
  const roots = getProductSearchRoots();
  const ids = roots.map((r) => r.id);
  assert.ok(ids.includes("brand_valmor"));
  assert.ok(ids.includes("brand_factor"));
  assert.ok(ids.includes("brand_coror"));
  assert.ok(ids.includes("pf_7016"));
  assert.ok(!ids.includes("brand_graco"));
  assert.ok(!ids.includes("brand_wagner"));
  assert.ok(!ids.includes("brand_7016"));
  assert.ok(!ids.includes("brand_dulux"));
  assert.ok(!roots.some((r) => /nélkül|egyéb márka/i.test(r.name)));

  const valmor = getProductSearchChildren("brand_valmor", "brand");
  const vFam = valmor.filter((c) => c.type === "productFamily");
  const vProd = valmor.filter((c) => c.type === "product");
  assert.equal(vFam.length, 1);
  assert.equal(vFam[0]!.id, "pf_valmor_air_flow");
  assert.equal(vProd.length, 10);
  assert.ok(!valmor.some((c) => /nélkül/i.test(c.name)));

  const factor = getProductSearchChildren("brand_factor", "brand");
  assert.equal(factor.filter((c) => c.type === "productFamily").length, 1);
  assert.equal(factor.filter((c) => c.type === "product").length, 3);

  const coror = getProductSearchChildren("brand_coror", "brand");
  assert.equal(coror.filter((c) => c.type === "productFamily").length, 2);
  assert.equal(coror.filter((c) => c.type === "product").length, 2);

  const seven = getProductSearchChildren("pf_7016", "productFamily");
  assert.equal(seven.length, 1);
  assert.equal(seven[0]!.type, "product");

  const airFlow = getProductSearchFamilyProducts("pf_valmor_air_flow");
  assert.equal(airFlow.length, 4);

  assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
}
console.log("progressive OK");

section("direct surface context");
{
  const beton = searchCatalog("beton", { limit: 20 });
  assert.equal(beton[0]?.type, "surface");
  // Products with Beton surface or name may appear after Surface
  const productHits = beton.filter((r) => r.type === "product");
  for (const p of productHits) {
    const doc = buildSearchCatalog().find((d) => d.id === p.id)!;
    const viaSurface = doc.surfaceIds?.length
      ? doc.contextText.toLowerCase().includes("beton") ||
        doc.identityText.toLowerCase().includes("beton")
      : /beton/i.test(doc.identityText);
    assert.ok(
      viaSurface || /beton/i.test(doc.identityText + doc.contextText),
      `product ${p.id} matched beton without direct context`,
    );
  }
}
console.log("surface context OK");

section("dataset lock smoke");
{
  assert.equal(listProducts().length, 27);
  assert.equal(listSurfaces().length, 15);
  let specs = 0;
  let packs = 0;
  for (const p of listProducts()) {
    specs += p.specifications?.length ?? 0;
    packs += p.packagingOptions?.length ?? 0;
  }
  assert.equal(specs, 203);
  assert.equal(packs, 68);
}
console.log("dataset OK");

section("QA sample tops");
for (const q of [
  "festék bázis",
  "festek bazis",
  "valmor",
  "air flow",
  "coror rapid",
  "korrozio",
  "parkettalakk",
  "7016",
  "airless",
  "beton",
  "vakolat",
  "fa",
  "porfestek",
  "factor",
  "graco",
  "wagner",
  "higito",
  "zomanc",
  "alapozo",
  "homlokzat",
  "padlo",
]) {
  console.log(q, "→", topTypes(q, 5).join(" | "));
}

console.log("\nALL Search v1 checks passed.");
