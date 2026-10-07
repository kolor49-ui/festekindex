/**
 * Public UX Closure Phase C — Search UX + Autocomplete.
 * Run: npx tsx scripts/test-public-ux-phase-c-search.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchBox } from "../components/search/SearchBox";
import { SearchResultsList } from "../components/search/SearchResultsList";
import {
  buildSearchCatalog,
  formatSearchResultMeta,
  matchKindFromScore,
  normalizeSearchText,
  rankSearchDocuments,
  searchCatalog,
  SEARCH_AUTOCOMPLETE_DESKTOP_LIMIT,
  SEARCH_AUTOCOMPLETE_MOBILE_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_TYPE_LABEL_HU,
} from "../lib/search";
import {
  expectedSearchDocumentsAfterClosure,
  expectedProductCountAfterClosure,
  expectedSpecCountAfterClosure,
  expectedPackagingCountAfterClosure,
  expectedDilutedWithAfterClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";
import {
  getActiveRelationsForEntity,
  listProducts,
} from "../lib/data/repository";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const INTERNAL =
  /\bSearchDocument\b|\bmatchKind\b|\bidentity match\b|\bcontext match\b|belongsToCategory|hasProduct|partOfSystem|dilutedWith|\bgraph\b|sourceIds|rawValue|NOINDEX|productClass|repository|rank score/i;

const PUBLIC_LABELS = [
  "Cég",
  "Márka",
  "Termékcsalád",
  "Termék",
  "Technológia",
  "Felület",
  "Szakmai terület",
  "Tudástár",
] as const;

section("SearchDocuments baseline");
{
  assert.equal(buildSearchCatalog().length, 105);
  assert.equal(
    buildSearchCatalog().length,
    expectedSearchDocumentsAfterClosure(),
  );
  console.log("catalog OK", buildSearchCatalog().length);
}

section("Autocomplete eligibility");
{
  assert.equal(SEARCH_MIN_QUERY_LENGTH, 2);
  assert.equal(SEARCH_AUTOCOMPLETE_DESKTOP_LIMIT, 8);
  assert.equal(SEARCH_AUTOCOMPLETE_MOBILE_LIMIT, 6);

  assert.equal(normalizeSearchText(" ").length, 0);
  assert.equal(searchCatalog("").length, 0);
  assert.equal(searchCatalog("c").length, 0);
  assert.equal(searchCatalog(" ").length, 0);
  assert.ok(searchCatalog("co").length > 0);
  assert.ok(
    searchCatalog("cor", { limit: SEARCH_AUTOCOMPLETE_DESKTOP_LIMIT }).length <=
      SEARCH_AUTOCOMPLETE_DESKTOP_LIMIT,
  );
  assert.ok(
    searchCatalog("cor", { limit: SEARCH_AUTOCOMPLETE_MOBILE_LIMIT }).length <=
      SEARCH_AUTOCOMPLETE_MOBILE_LIMIT,
  );
  console.log("eligibility OK");
}

section("Public type labels + no internal enums");
{
  for (const label of Object.values(SEARCH_TYPE_LABEL_HU)) {
    assert.ok(PUBLIC_LABELS.includes(label as (typeof PUBLIC_LABELS)[number]));
  }
  const hits = searchCatalog("coror", { limit: 8 });
  for (const h of hits) {
    assert.ok(PUBLIC_LABELS.includes(h.typeLabelHu as (typeof PUBLIC_LABELS)[number]));
    assert.ok(h.href.startsWith("/"));
    assert.ok(!h.href.includes("undefined"));
    const meta = formatSearchResultMeta(h);
    assert.ok(!INTERNAL.test(meta));
    assert.ok(!INTERNAL.test(h.displayName));
    assert.ok(!/\bOrganization\b|\bBrand\b|\bProductFamily\b|\bProduct\b/.test(meta));
  }
  console.log("labels OK");
}

section("Identity vs context classification");
{
  assert.equal(matchKindFromScore(100_000), "identity");
  assert.equal(matchKindFromScore(60_000), "identity");
  assert.equal(matchKindFromScore(30_000), "context");
  assert.equal(matchKindFromScore(10_000), "context");

  const beton = searchCatalog("beton", { limit: 20 });
  const surface = beton.find((h) => h.id === "surface_beton");
  assert.ok(surface);
  assert.equal(surface!.matchKind, "identity");
  assert.equal(surface!.typeLabelHu, "Felület");

  // At least one contextual product may appear for beton
  const contextHits = beton.filter((h) => h.matchKind === "context");
  for (const h of contextHits) {
    assert.ok(h.score < 60_000);
  }
  console.log("matchKind OK", {
    identity: beton.filter((h) => h.matchKind === "identity").length,
    context: contextHits.length,
  });
}

section("Regression queries");
{
  const cases: { q: string; expectId?: string; expectType?: string }[] = [
    { q: "cor", expectId: "brand_coror" },
    { q: "coror", expectId: "brand_coror" },
    { q: "air", expectId: "tech_airless" },
    { q: "airless", expectId: "tech_airless" },
    { q: "beton", expectId: "surface_beton" },
    { q: "vastag", expectId: "prod_factor_aqua_glaze" },
    { q: "aqua zom", expectId: "prod_coror_rapid_aqua_enamel" },
    { q: "s-31", expectId: "prod_coror_ind_s31" },
    { q: "s31", expectId: "prod_coror_ind_s31" },
    { q: "7016", expectId: "pf_7016" },
  ];

  for (const c of cases) {
    const hits = searchCatalog(c.q, { limit: 12 });
    assert.ok(hits.length > 0, `no hits for ${c.q}`);
    if (c.expectId) {
      assert.ok(
        hits.some((h) => h.id === c.expectId),
        `${c.q} missing ${c.expectId}; top=${hits.map((h) => h.id).join(",")}`,
      );
    }
  }

  const pf = searchCatalog("7016", { limit: 8 }).find((h) => h.id === "pf_7016")!;
  assert.equal(pf.typeLabelHu, "Termékcsalád");
  assert.notEqual(pf.typeLabelHu, "Márka");
  assert.ok(!searchCatalog("7016").some((h) => h.id === "brand_7016"));

  console.log("regression queries OK");
}

section("New Product search");
{
  for (const id of [
    "prod_factor_aqua_glaze",
    "prod_coror_rapid_aqua_enamel",
    "prod_coror_ind_s31",
  ]) {
    const doc = buildSearchCatalog().find((d) => d.id === id);
    assert.ok(doc, id);
    assert.equal(doc!.type, "product");
    assert.equal(doc!.typeLabelHu, "Termék");
  }
  console.log("new products searchable OK");
}

section("SearchBox SSR smoke + leakage");
{
  const catalog = buildSearchCatalog();
  const html = renderToStaticMarkup(
    createElement(SearchBox, {
      catalog,
      initialQuery: "",
      variant: "page",
    }),
  );
  assert.ok(html.includes('role="combobox"'));
  assert.ok(html.includes('name="q"'));
  assert.ok(html.includes("Keresés"));
  assert.ok(!INTERNAL.test(html));
  // Closed when empty — no listbox options yet
  assert.ok(!html.includes("search-suggest-item"));

  const resultsHtml = renderToStaticMarkup(
    createElement(SearchResultsList, {
      results: searchCatalog("coror", { limit: 8 }),
      query: "coror",
    }),
  );
  assert.ok(resultsHtml.includes("Termék") || resultsHtml.includes("Márka"));
  assert.ok(!INTERNAL.test(resultsHtml));
  assert.ok(!resultsHtml.includes("identity match"));
  assert.ok(!resultsHtml.includes("SearchDocument"));

  const emptyHtml = renderToStaticMarkup(
    createElement(SearchResultsList, {
      results: [],
      query: "zzzznotfound",
    }),
  );
  assert.ok(emptyHtml.includes("Nincs találat"));
  assert.ok(emptyHtml.includes('href="/cegek"'));
  assert.ok(emptyHtml.includes('href="/markak"'));
  assert.ok(emptyHtml.includes('href="/technologiak"'));
  assert.ok(emptyHtml.includes('href="/kategoriak"'));
  console.log("UI smoke OK");
}

section("Ranking / normalization unchanged smoke");
{
  // Same engine: prefix still wins; catalog size locked
  const ranked = rankSearchDocuments(buildSearchCatalog(), "coror");
  assert.equal(ranked[0]?.id, "brand_coror");
  assert.ok(normalizeSearchText("7016™").includes("7016"));
  // Hyphenated identifiers remain searchable via catalog compact aliases (S-31 ↔ s31)
  assert.ok(searchCatalog("s31").some((h) => h.id === "prod_coror_ind_s31"));
  console.log("engine lock OK");
}

section("Data regression gate");
{
  assert.equal(listProducts().length, expectedProductCountAfterClosure());
  let specs = 0;
  let packs = 0;
  let diluted = 0;
  for (const p of listProducts()) {
    specs += p.specifications?.length ?? 0;
    packs += p.packagingOptions?.length ?? 0;
    assert.equal(evaluatePublicIndexability(p).indexable, false);
    for (const r of getActiveRelationsForEntity(p.id)) {
      if (r.relationType === "dilutedWith" && r.fromEntityId === p.id) diluted++;
    }
  }
  assert.equal(specs, expectedSpecCountAfterClosure());
  assert.equal(packs, expectedPackagingCountAfterClosure());
  assert.equal(diluted, expectedDilutedWithAfterClosure());
  assert.equal(listProducts().length, 30);
  console.log("data gate OK");
}

console.log("\nALL Public UX Phase C Search checks passed.");
