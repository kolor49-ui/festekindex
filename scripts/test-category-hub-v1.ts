/**
 * Category Hub v1 — model + public-leakage + regression checks.
 * Run: npx tsx scripts/test-category-hub-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CategoryHubPage } from "../components/entity/CategoryHubPage";
import { getCategoryPortfolio } from "../lib/data/categoryHub";
import {
  listNavCategories,
  listProducts,
  listSurfaces,
  listTechnologies,
    getProductById,
  getCategoryById,
  getActiveRelationsForEntity,
  getRelatedEntities,
  getEntityHref,
} from "../lib/data/repository";
import { allRelations } from "../lib/data/imports/allRelations";
import { festekBazisEnrichmentV1 } from "../lib/data/imports/festekBazisEnrichmentV1";
import { categories as categoriesBase } from "../lib/data/categories";
import { festekBazisV02Seed } from "../lib/data/imports/festekBazisV02Map";
import { mergeById } from "../lib/data/imports/merge";
import {
  buildCategoryHubModel,
  publicSafeCategoryCopy,
} from "../lib/seo/categoryHubModel";
import { evaluateIndexability } from "../lib/seo/indexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";
import {
  getCanonicalBrandOwner,
  getCanonicalProductBrand,
  getCanonicalProductFamily,
} from "../lib/navigation/entityNavigation";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const categories = mergeById(
  categoriesBase,
  festekBazisV02Seed.categories,
).filter((c) => c.status === "published");

const productCatRels = allRelations.filter(
  (r) =>
    r.relationType === "belongsToCategory" &&
    r.status === "active" &&
    !!getProductById(r.fromEntityId),
);

function countIncoming(type: string) {
  return allRelations.filter((r) => {
    if (r.relationType !== "belongsToCategory" || r.status !== "active") {
      return false;
    }
    const hit = getRelatedEntities(r.toEntityId, {
      relationTypes: ["belongsToCategory"],
      direction: "incoming",
    }).find((x) => x.relation.id === r.id);
    return hit?.entity.type === type;
  }).length;
}

section("inventory + relation counts");
assert.equal(categories.length, 20, "Categories = 20");
assert.equal(productCatRels.length, 24, "Product→Category = 24");

const productsWithCat = new Set(productCatRels.map((r) => r.fromEntityId));
const products = listProducts();
assert.equal(products.length, 27);
assert.equal(productsWithCat.size, 24);
assert.equal(products.length - productsWithCat.size, 3);

assert.equal(countIncoming("productFamily"), 1);
assert.equal(countIncoming("brand"), 12);
assert.equal(countIncoming("organization"), 8);
assert.equal(countIncoming("technology"), 3);
assert.equal(countIncoming("knowledge"), 2);
assert.equal(countIncoming("surface"), 0);
assert.equal(countIncoming("comparison"), 0);
console.log("counts OK");

section("uncategorized Products");
const without = products
  .filter((p) => !productsWithCat.has(p.id))
  .map((p) => p.id)
  .sort();
assert.deepEqual(without, [
  "prod_valmor_airflow_primer",
  "prod_valmor_airflow_salt",
  "prod_valmor_deep_primer",
]);
console.log("uncategorized OK");

section("multi-category distribution");
const catCountByProduct = new Map<string, number>();
for (const r of productCatRels) {
  catCountByProduct.set(
    r.fromEntityId,
    (catCountByProduct.get(r.fromEntityId) ?? 0) + 1,
  );
}
let zero = 0;
let one = 0;
let multi = 0;
for (const p of products) {
  const n = catCountByProduct.get(p.id) ?? 0;
  if (n === 0) zero++;
  else if (n === 1) one++;
  else multi++;
}
assert.equal(zero, 3);
assert.equal(one, 24);
assert.equal(multi, 0);
console.log("distribution OK");

section("cat_all exclusion");
assert.equal(getCategoryPortfolio("cat_all"), null);
const catAll = getCategoryById("cat_all")!;
assert.equal(buildCategoryHubModel(catAll), null);
assert.ok(!listPublishedForSitemap().some((e) => e.path.includes("minden-terulet")));
assert.equal(evaluateIndexability(catAll).indexable, false);
console.log("cat_all OK");

type RichExp = {
  p: number;
  f: number;
  b: number;
  o: number;
  t: number;
  s: number;
  k: number;
};

const RICHNESS: Record<string, RichExp> = {
  cat_faipar: { p: 5, f: 1, b: 1, o: 1, t: 4, s: 1, k: 0 },
  cat_homlokzat: { p: 5, f: 1, b: 1, o: 1, t: 4, s: 5, k: 0 },
  cat_dekor: { p: 4, f: 2, b: 1, o: 1, t: 3, s: 3, k: 0 },
  cat_ipari: { p: 4, f: 2, b: 1, o: 1, t: 5, s: 9, k: 0 },
  cat_higito_segedanyag: { p: 2, f: 0, b: 1, o: 1, t: 0, s: 0, k: 0 },
  cat_padlo: { p: 2, f: 0, b: 1, o: 1, t: 3, s: 0, k: 0 },
  cat_csiszolas: { p: 1, f: 1, b: 1, o: 1, t: 1, s: 3, k: 0 },
  cat_tuzvedo: { p: 1, f: 0, b: 1, o: 1, t: 3, s: 0, k: 0 },
};

section("product-backed richness");
for (const [id, exp] of Object.entries(RICHNESS)) {
  const portfolio = getCategoryPortfolio(id);
  assert.ok(portfolio, id);
  assert.equal(portfolio!.products.length, exp.p, `${id} P`);
  assert.equal(portfolio!.derivedFamilies.length, exp.f, `${id} F`);
  assert.equal(portfolio!.derivedBrands.length, exp.b, `${id} B`);
  assert.equal(portfolio!.derivedOrganizations.length, exp.o, `${id} O`);
  assert.equal(portfolio!.derivedTechnologies.length, exp.t, `${id} T`);
  assert.equal(portfolio!.surfaces.length, exp.s, `${id} S`);
  assert.equal(portfolio!.knowledge.length, exp.k, `${id} K`);
  const model = buildCategoryHubModel(portfolio!.category);
  assert.ok(model, `model ${id}`);
}
console.log("richness OK");

section("zero-Product Categories");
const zeroProductIds = [
  "cat_aeroszol",
  "cat_alapanyag",
  "cat_auto",
  "cat_beton",
  "cat_epitesi",
  "cat_feluletkezelo",
  "cat_szerszam",
  "cat_kf",
  "cat_maszkolas",
  "cat_porfestek",
  "cat_szoras",
];
for (const id of zeroProductIds) {
  const portfolio = getCategoryPortfolio(id);
  assert.ok(portfolio, id);
  assert.equal(portfolio!.products.length, 0, `${id} P0`);
  const model = buildCategoryHubModel(portfolio!.category);
  assert.ok(model, `model ${id}`);
  assert.equal(model!.products.length, 0);
}
console.log("zero-Product OK");

section("Porfesték Category");
{
  const p = getCategoryPortfolio("cat_porfestek")!;
  assert.equal(p.products.length, 0);
  assert.ok(p.directBrands.some((b) => b.id === "brand_interpon"));
  assert.ok(p.directTechnologies.some((t) => t.id === "tech_porfestek"));
  assert.equal(p.knowledge.length, 1);
  const model = buildCategoryHubModel(p.category)!;
  assert.equal(evaluateIndexability(p.category).indexable, true);
  assert.equal(model.indexable, true);
  assert.ok(
    listPublishedForSitemap().some((e) => e.path === "/kategoriak/porfestek"),
  );
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(!html.includes("Kapcsolódó termékek"));
}
console.log("Porfesték OK");

section("Szórás Category");
{
  const p = getCategoryPortfolio("cat_szoras")!;
  assert.equal(p.products.length, 0);
  assert.ok(p.directFamilies.some((f) => f.id === "pf_graco_mark"));
  assert.ok(p.directBrands.some((b) => b.id === "brand_graco"));
  assert.ok(p.directBrands.some((b) => b.id === "brand_wagner"));
  assert.ok(p.directOrganizations.some((o) => o.id === "org_graco_inc"));
  assert.ok(p.directOrganizations.some((o) => o.id === "org_euroll_hungaria"));
  assert.ok(p.directTechnologies.some((t) => t.id === "tech_airless"));
  assert.equal(p.knowledge.length, 1);
  const gracoOwner = getCanonicalBrandOwner("brand_graco");
  assert.equal(gracoOwner?.id, "org_graco_inc");
  assert.notEqual(gracoOwner?.id, "org_euroll_hungaria");
  const model = buildCategoryHubModel(p.category)!;
  assert.equal(model.indexable, true);
  // Euroll must not appear as breadcrumb parent of Category
  assert.ok(!model.breadcrumbs.some((c) => /euroll/i.test(c.name)));
}
console.log("Szórás OK");

section("Faipari Brand separation");
{
  const p = getCategoryPortfolio("cat_faipar")!;
  assert.equal(p.products.length, 5);
  assert.ok(p.derivedBrands.some((b) => b.id === "brand_factor"));
  assert.ok(p.derivedOrganizations.some((o) => o.id === "org_festek_bazis_zrt"));
  assert.ok(p.directBrands.some((b) => b.id === "brand_sikkens"));
  assert.ok(p.directBrands.some((b) => b.id === "brand_milesi"));
  assert.equal(p.brandPresentation.mode, "split");
  assert.ok(
    p.brandPresentation.productBrands.every((b) => b.id === "brand_factor"),
  );
  assert.ok(
    p.brandPresentation.additionalBrands.some((b) => b.id === "brand_sikkens"),
  );
  assert.ok(
    p.brandPresentation.additionalBrands.some((b) => b.id === "brand_milesi"),
  );
  const model = buildCategoryHubModel(p.category)!;
  assert.equal(model.indexable, false);
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(html.includes("Márkák a kapcsolódó termékek között"));
  assert.ok(html.includes("További kapcsolódó márkák"));
  assert.ok(html.includes("FACTOR"));
  assert.ok(html.includes("Sikkens"));
  // Product-derived company navigation (not omitted beside Brands)
  assert.ok(model.organizationContext);
  assert.equal(model.organizationContext!.mode, "unified");
  assert.equal(model.organizationContext!.unified.length, 1);
  assert.equal(
    model.organizationContext!.unified[0]!.id,
    "org_festek_bazis_zrt",
  );
  assert.ok(html.includes("Cégek"));
  assert.ok(html.includes('href="/cegek/festek-bazis-zrt"'));
  assert.ok(html.includes("FESTÉK BÁZIS Zrt."));
  assert.ok(!html.includes("Tulajdonos"));
  assert.ok(!html.includes("Gyártók és szakmai szereplők"));
}
console.log("Faipari OK");

section("Homlokzat company navigation");
{
  const p = getCategoryPortfolio("cat_homlokzat")!;
  assert.ok(p.derivedOrganizations.some((o) => o.id === "org_festek_bazis_zrt"));
  assert.equal(p.derivedOrganizations.length, 1);
  assert.equal(p.directOrganizations.length, 0);
  const model = buildCategoryHubModel(p.category)!;
  assert.ok(model.organizationContext, "Homlokzat must expose Cégek");
  assert.equal(model.organizationContext!.mode, "unified");
  assert.equal(model.organizationContext!.unified.length, 1);
  assert.equal(
    model.organizationContext!.unified[0]!.href,
    "/cegek/festek-bazis-zrt",
  );
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(html.includes("Cégek"));
  assert.equal(
    (html.match(/FESTÉK BÁZIS Zrt\./g) ?? []).length,
    1,
    "FB appears once in company chips",
  );
  assert.ok(html.includes('href="/cegek/festek-bazis-zrt"'));
  assert.ok(!html.includes("id=\"gyartok-szereplok\""));
  assert.ok(html.includes("id=\"cegek\""));
  // Section order: Márkák before Cégek
  const markak = html.indexOf("id=\"markak\"");
  const cegek = html.indexOf("id=\"cegek\"");
  assert.ok(markak >= 0 && cegek > markak);
}
console.log("Homlokzat company OK");

section("Dekor / 7016 safety");
{
  const p = getCategoryPortfolio("cat_dekor")!;
  assert.ok(p.derivedFamilies.some((f) => f.id === "pf_7016"));
  assert.ok(!p.derivedBrands.some((b) => b.id === "brand_7016"));
  assert.ok(!p.directBrands.some((b) => b.id === "brand_7016"));
  const wall = getProductById("prod_7016_wall")!;
  const family = getCanonicalProductFamily(wall.id);
  const brand = getCanonicalProductBrand(wall.id);
  assert.equal(family?.id, "pf_7016");
  assert.equal(brand, undefined);
  // 7016 resolves manufacturer via Family, not fake Brand
  assert.ok(p.derivedOrganizations.some((o) => o.id === "org_festek_bazis_zrt"));
  const model = buildCategoryHubModel(p.category)!;
  assert.equal(model.organizationContext?.mode, "split");
  assert.ok(
    model.organizationContext!.productOrgs.some(
      (o) => o.id === "org_festek_bazis_zrt",
    ),
  );
  assert.ok(
    model.organizationContext!.additionalOrgs.every(
      (o) => o.id !== "org_festek_bazis_zrt",
    ),
  );
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(!html.includes("brand_7016"));
  assert.ok(html.includes("7016"));
  assert.ok(html.includes("Cégek"));
  assert.ok(html.includes('href="/cegek/festek-bazis-zrt"'));
  assert.ok(html.includes("További kapcsolódó cégek"));
  assert.ok(!html.includes("Tulajdonos"));
  assert.ok(!html.includes("Képviselet"));
}
console.log("7016 OK");

section("Ipari company navigation");
{
  const model = buildCategoryHubModel(getCategoryById("cat_ipari")!)!;
  assert.ok(model.organizationContext);
  assert.ok(
    model.organizationContext!.productOrgs.some(
      (o) => o.id === "org_festek_bazis_zrt",
    ),
  );
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(html.includes("Cégek"));
  assert.ok(html.includes('href="/cegek/festek-bazis-zrt"'));
}
console.log("Ipari company OK");

section("empty company section omitted");
{
  const model = buildCategoryHubModel(getCategoryById("cat_porfestek")!)!;
  assert.equal(model.organizationContext, undefined);
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(!html.includes("Cégek"));
  assert.ok(!html.includes("id=\"cegek\""));
}
console.log("empty company OK");

section("Szórás Graco/Euroll company safety");
{
  const p = getCategoryPortfolio("cat_szoras")!;
  assert.equal(p.products.length, 0);
  assert.equal(p.derivedOrganizations.length, 0);
  assert.ok(p.directOrganizations.some((o) => o.id === "org_graco_inc"));
  assert.ok(p.directOrganizations.some((o) => o.id === "org_euroll_hungaria"));
  const gracoOwner = getCanonicalBrandOwner("brand_graco");
  assert.equal(gracoOwner?.id, "org_graco_inc");
  assert.notEqual(gracoOwner?.id, "org_euroll_hungaria");
  const model = buildCategoryHubModel(p.category)!;
  assert.ok(model.organizationContext);
  assert.equal(model.organizationContext!.mode, "unified");
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(html.includes("Cégek"));
  assert.ok(html.includes("Graco Inc."));
  assert.ok(html.includes("Euroll Hungária Kft."));
  assert.ok(html.includes('href="/cegek/graco-inc"'));
  assert.ok(html.includes('href="/cegek/euroll-hungaria"'));
  // No manufacturer/owner role leakage; Euroll is not Graco owner
  assert.ok(!html.includes("Tulajdonos"));
  assert.ok(!html.includes("Gyártó"));
  assert.ok(!html.includes("Forgalmazó"));
  assert.ok(!model.breadcrumbs.some((c) => /euroll/i.test(c.name)));
}
console.log("Szórás company OK");

section("pairwise Technology / Surface");
for (const c of categories.filter((x) => x.id !== "cat_all")) {
  const portfolio = getCategoryPortfolio(c.id);
  if (!portfolio) continue;
  const productIds = new Set(portfolio.products.map((p) => p.id));
  for (const t of portfolio.derivedTechnologies) {
    let found = false;
    for (const pid of productIds) {
      const has = getRelatedEntities(pid, {
        relationTypes: ["usesTechnology"],
        direction: "outgoing",
      }).some((r) => r.entity.id === t.id);
      if (has) {
        found = true;
        break;
      }
    }
    assert.ok(found, `${c.id} orphan derived tech ${t.id}`);
  }
  for (const s of portfolio.surfaces) {
    let found = false;
    for (const pid of productIds) {
      const has = getRelatedEntities(pid, {
        relationTypes: ["applicableToSurface"],
        direction: "outgoing",
      }).some((r) => r.entity.id === s.id);
      if (has) {
        found = true;
        break;
      }
    }
    assert.ok(found, `${c.id} orphan derived surface ${s.id}`);
  }
}
console.log("pairwise OK");

section("Hígító copy firewall");
{
  const unsafe = publicSafeCategoryCopy(
    "Hígító és segédanyag — szerkesztői kategória a FESTÉKINDEX adatbázisában (Festék Bázis v0.2).",
  );
  assert.equal(unsafe, undefined);
  const model = buildCategoryHubModel(getCategoryById("cat_higito_segedanyag")!)!;
  assert.equal(model.lead, undefined);
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  assert.ok(!html.includes("v0.2"));
  assert.ok(!html.includes("adatbázisában"));
}
console.log("Hígító OK");

section("SEO indexability matrix");
const indexableYes = [
  "cat_dekor",
  "cat_homlokzat",
  "cat_ipari",
  "cat_porfestek",
  "cat_szoras",
];
const indexableNo = [
  "cat_faipar",
  "cat_higito_segedanyag",
  "cat_padlo",
  "cat_csiszolas",
  "cat_tuzvedo",
  "cat_aeroszol",
  "cat_alapanyag",
  "cat_auto",
  "cat_beton",
  "cat_epitesi",
  "cat_feluletkezelo",
  "cat_szerszam",
  "cat_kf",
  "cat_maszkolas",
];
for (const id of indexableYes) {
  assert.equal(
    evaluateIndexability(getCategoryById(id)!).indexable,
    true,
    `${id} should be indexable`,
  );
}
for (const id of indexableNo) {
  assert.equal(
    evaluateIndexability(getCategoryById(id)!).indexable,
    false,
    `${id} should be noindex`,
  );
}
const sitemapCats = listPublishedForSitemap()
  .filter((e) => e.path.startsWith("/kategoriak/"))
  .map((e) => e.path)
  .sort();
assert.deepEqual(sitemapCats, [
  "/kategoriak/dekor-es-falfestek",
  "/kategoriak/homlokzat-es-hoszigeteles",
  "/kategoriak/ipari-bevonat-es-korroziovedelem",
  "/kategoriak/porfestek",
  "/kategoriak/szoras-es-alkalmazastechnika",
]);
console.log("SEO OK");

section("public leakage");
const LEAK_NEEDLES = [
  "belongsToCategory",
  "usesTechnology",
  "applicableToSurface",
  "sourceIds",
  "productClass",
  "indexable",
  "NOINDEX",
  "VÉKONY",
  "HIÁNYOS",
  "v0.1",
  "v0.2",
  "repository",
  "rawValue",
  "verifiedAt",
  "documentKind",
  "brand_7016",
];
const LEAK_WORDS = [
  /\bentitás\b/i,
  /\bentitások\b/i,
  /\brelations?\b/i,
  /\bgráf\b/i,
  /\bgraph\b/i,
];

const leakTargets = [
  "cat_faipar",
  "cat_homlokzat",
  "cat_dekor",
  "cat_ipari",
  "cat_higito_segedanyag",
  "cat_csiszolas",
  "cat_porfestek",
  "cat_szoras",
  "cat_epitesi",
];

for (const id of leakTargets) {
  const model = buildCategoryHubModel(getCategoryById(id)!)!;
  const html = renderToStaticMarkup(
    createElement(CategoryHubPage, { model }),
  );
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  for (const needle of LEAK_NEEDLES) {
    assert.ok(
      !visible.includes(needle),
      `${id} leaks ${needle}`,
    );
  }
  for (const re of LEAK_WORDS) {
    assert.ok(!re.test(visible), `${id} leaks ${re}`);
  }
  assert.ok(!visible.includes("Kapcsolódó entitások"));
}
console.log("leakage OK");

section("Csiszolás semantic separation");
{
  const p = getCategoryPortfolio("cat_csiszolas")!;
  assert.equal(p.products.length, 1);
  assert.equal(p.products[0]!.id, "prod_coror_rapid_stripper");
  assert.ok(p.directBrands.some((b) => b.id === "brand_mirka"));
  assert.ok(p.directOrganizations.some((o) => o.id === "org_euroll_hungaria"));
  assert.ok(p.directTechnologies.some((t) => t.id === "tech_csiszolas"));
  // Mirka is direct-only, not product-derived
  assert.ok(!p.derivedBrands.some((b) => b.id === "brand_mirka"));
  assert.equal(p.brandPresentation.mode, "split");
}
console.log("Csiszolás OK");

section("dataset regression");
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
const productUses = allRelations.filter(
  (r) =>
    r.relationType === "usesTechnology" &&
    r.status === "active" &&
    !!getProductById(r.fromEntityId),
);
const ats = allRelations.filter(
  (r) => r.relationType === "applicableToSurface" && r.status === "active",
);

assert.equal(specs, 203);
assert.equal(packs, 68);
assert.equal(festekBazisEnrichmentV1.sources.length, 52);
assert.equal(diluted, 6);
assert.equal(listTechnologies().length, 9);
assert.equal(productUses.length, 60);
assert.equal(
  productUses.filter((r) => (r.sourceIds?.length ?? 0) > 0).length,
  60,
);
assert.equal(new Set(productUses.map((r) => r.fromEntityId)).size, 23);
assert.equal(listSurfaces().length, 15);
assert.equal(ats.length, 48);
assert.equal(ats.filter((r) => (r.sourceIds?.length ?? 0) > 0).length, 48);
assert.equal(products.filter((p) => p.indexable).length, 0);
assert.equal(listSurfaces().filter((s) => s.indexable).length, 0);
assert.equal(
  evaluateIndexability(listTechnologies().find((t) => t.id === "tech_porfestek")!)
    .indexable,
  true,
);
assert.ok(
  listPublishedForSitemap().some(
    (e) => e.path === "/technologiak/porfestek-bevonat",
  ),
);

const aromatic = getProductById("prod_coror_aromatic")!;
assert.equal(
  (aromatic.specifications ?? []).filter((s) => s.key === "binder").length,
  0,
);
const enamel = getProductById("prod_coror_ind_enamel")!;
assert.equal(
  (enamel.specifications ?? []).filter(
    (s) => s.key === "binder" && s.status === "verified",
  ).length,
  0,
);
const plaster = getProductById("prod_valmor_plaster")!;
assert.equal(
  (plaster.packagingOptions ?? []).filter((o) => o.status === "verified")
    .length,
  0,
);
const parquetDiluted = getRelatedEntities("prod_factor_parquet", {
  relationTypes: ["dilutedWith"],
  direction: "outgoing",
}).map((r) => r.entity.id);
assert.ok(parquetDiluted.includes("prod_coror_synthetic"));

const brand7016Rels = allRelations.filter(
  (r) =>
    r.fromEntityId === "brand_7016" || r.toEntityId === "brand_7016",
);
assert.equal(brand7016Rels.length, 0);

assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
console.log("dataset OK");

section("nav Category list");
const nav = listNavCategories().filter((c) => c.id !== "cat_all");
assert.equal(nav.length, 19);
for (const c of nav) {
  assert.ok(getEntityHref(c).startsWith("/kategoriak/"));
  assert.ok(buildCategoryHubModel(c));
}
console.log("nav OK");

console.log("\nALL Category Hub v1 checks passed.");
