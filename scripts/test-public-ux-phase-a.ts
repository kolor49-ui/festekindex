/**
 * Public UX Closure Phase A — navigation recovery.
 * Run: npx tsx scripts/test-public-ux-phase-a.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppShell } from "../components/layout/AppShell";
import { BrandHubPage } from "../components/entity/BrandHubPage";
import { OrganizationHubPage } from "../components/entity/OrganizationHubPage";
import { ProductFamilyHubPage } from "../components/entity/ProductFamilyHubPage";
import { SurfaceHubPage } from "../components/entity/SurfaceHubPage";
import { HomeExplorer } from "../components/home/HomeExplorer";
import {
  getBrandById,
  getOrganizationById,
  getProductFamilyById,
  getSurfaceById,
  listProducts,
  listSurfaces,
} from "../lib/data/repository";
import { buildBrandHubModel } from "../lib/seo/brandHubModel";
import { buildOrganizationHubModel } from "../lib/seo/organizationHubModel";
import { resolveOrganizationPublicRole } from "../lib/seo/organizationPublicRole";
import { buildProductFamilyHubModel } from "../lib/seo/productFamilyHubModel";
import { buildSurfaceHubModel } from "../lib/seo/surfaceHubModel";
import {
  buildSearchCatalog,
  countSearchCatalogByType,
  searchCatalog,
} from "../lib/search";
import { getCanonicalBrandOwner } from "../lib/navigation/entityNavigation";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";
import type { SearchHit } from "../lib/data/types";

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

section("Surface recovery — MDF / Kerámia");
{
  const mdf = getSurfaceById("surface_mdf")!;
  const ker = listSurfaces().find((s) => /kerámia/i.test(s.name))!;
  assert.ok(mdf && ker);

  for (const surface of [mdf, ker]) {
    const model = buildSurfaceHubModel(surface)!;
    assert.equal(model.products.length, 0);
    assert.equal(evaluatePublicIndexability(surface).indexable, false);
    const html = renderToStaticMarkup(
      createElement(SurfaceHubPage, { model }),
    );
    assert.ok(html.includes("felulet-allapot"));
    assert.ok(html.includes("nincs kapcsolt termék"));
    assert.ok(html.includes('href="/kategoriak"'));
    assert.ok(html.includes('href="/technologiak"'));
    const q = encodeURIComponent(surface.name);
    assert.ok(html.includes(`href="/kereses?q=${q}"`));
    assert.ok(!html.includes("Kapcsolódó termékek"));
    assert.ok(!/belongsToCategory|hasProduct|applicableToSurface/.test(html));
    // Still in Search corpus
    assert.ok(
      buildSearchCatalog().some((d) => d.id === surface.id),
      `${surface.name} must remain searchable`,
    );
  }
  console.log("MDF/Kerámia recovery OK");
}

section("Populated Surface — Beton unchanged");
{
  const beton = listSurfaces().find((s) => s.name === "Beton")!;
  const model = buildSurfaceHubModel(beton)!;
  assert.ok(model.products.length > 0);
  const html = renderToStaticMarkup(
    createElement(SurfaceHubPage, { model }),
  );
  assert.ok(html.includes("Kapcsolódó termékek"));
  assert.ok(!html.includes("felulet-allapot"));
  assert.ok(!html.includes("nincs kapcsolt termék"));
  console.log("Beton OK");
}

section("Organization public roles");
{
  const euroll = getOrganizationById("org_euroll_hungaria")!;
  assert.deepEqual(
    [...euroll.roles].sort(),
    ["distributor", "representation", "service"].sort(),
  );
  assert.equal(resolveOrganizationPublicRole(euroll), "Forgalmazó");
  const euModel = buildOrganizationHubModel(euroll)!;
  assert.equal(euModel.kindLabel, "Forgalmazó");
  assert.ok(euModel.metaChips.some((c) => c.label === "Szerep" && c.value === "Forgalmazó"));
  assert.ok(!euModel.metaChips.some((c) => c.value === "Gyártó"));
  const euHtml = renderToStaticMarkup(
    createElement(OrganizationHubPage, { model: euModel }),
  );
  const euVis = visible(euHtml);
  assert.ok(euVis.includes("Forgalmazó"));
  // Must not present as Gyártó in kind/meta — company copy may mention other words
  assert.ok(!/<div class="entity-meta">Gyártó<\/div>/.test(euHtml));

  const fb = getOrganizationById("org_festek_bazis_zrt")!;
  assert.ok(fb.roles.includes("manufacturer"));
  assert.equal(resolveOrganizationPublicRole(fb), "Gyártó");
  const fbModel = buildOrganizationHubModel(fb)!;
  assert.equal(fbModel.kindLabel, "Gyártó");

  const gracoInc = getOrganizationById("org_graco_inc")!;
  assert.equal(resolveOrganizationPublicRole(gracoInc), "Gyártó");
  assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
  assert.notEqual(getCanonicalBrandOwner("brand_graco")?.id, "org_euroll_hungaria");
  console.log("roles OK");
}

section("Zero-product portfolio — no 0 termék");
{
  const gracoBrand = buildBrandHubModel(getBrandById("brand_graco")!)!;
  const brandHtml = renderToStaticMarkup(
    createElement(BrandHubPage, { model: gracoBrand }),
  );
  assert.ok(brandHtml.includes("Graco Mark VII") || brandHtml.includes("Mark VII"));
  assert.ok(brandHtml.includes("/termekcsaladok/"));
  assert.ok(!brandHtml.includes("0 termék"));

  const gracoOrg = buildOrganizationHubModel(getOrganizationById("org_graco_inc")!)!;
  const orgHtml = renderToStaticMarkup(
    createElement(OrganizationHubPage, { model: gracoOrg }),
  );
  assert.ok(!orgHtml.includes("0 termék"));

  for (const id of ["pf_graco_mark", "pf_graco_ultra", "pf_graco_gx"]) {
    const fam = buildProductFamilyHubModel(getProductFamilyById(id)!)!;
    assert.equal(fam.products.length, 0);
    const html = renderToStaticMarkup(
      createElement(ProductFamilyHubPage, { model: fam }),
    );
    assert.ok(!html.includes(">0 termék<") && !html.includes("0 termék"));
    assert.ok(!html.includes("id=\"termekek\""));
  }

  const valmor = buildBrandHubModel(getBrandById("brand_valmor")!)!;
  const vHtml = renderToStaticMarkup(
    createElement(BrandHubPage, { model: valmor }),
  );
  assert.ok(vHtml.includes("4 termék") || /AIR FLOW[\s\S]*?4 termék/.test(vHtml));
  const air = buildProductFamilyHubModel(getProductFamilyById("pf_valmor_air_flow")!)!;
  assert.equal(air.products.length, 4);
  console.log("zero-product presentation OK");
}

section("AppShell — not fake breadcrumb");
{
  const html = renderToStaticMarkup(
    createElement(AppShell, {
      categories: [] as { id: string; slug: string; name: string }[],
      children: createElement("main", null, "child"),
    }),
  );
  assert.ok(!html.includes("Minden terület"));
  assert.ok(html.includes("site-scope"));
  assert.ok(html.includes("A festékipar szakmai indexe"));
  assert.ok(html.includes('href="/"'));
  console.log("AppShell OK");
}

section("Home quick chips → Search v1");
{
  const hits: SearchHit[] = [];
  const html = renderToStaticMarkup(
    createElement(HomeExplorer, {
      initialHits: hits,
      relatedByEntityId: {},
    }),
  );
  for (const q of ["Graco", "Dulux", "Airless", "Porfesték", "Csiszolás"]) {
    assert.ok(
      html.includes(`href="/kereses?q=${encodeURIComponent(q)}"`),
      `missing chip link for ${q}`,
    );
  }
  // Search engine untouched
  assert.equal(buildSearchCatalog().length, 102);
  assert.equal(countSearchCatalogByType().product, 27);
  assert.equal(searchCatalog("valmor")[0]?.id, "brand_valmor");
  console.log("Home chips OK");
}

section("Public language + dataset lock");
{
  assert.equal(listProducts().length, 27);
  let specs = 0;
  let packs = 0;
  for (const p of listProducts()) {
    specs += p.specifications?.length ?? 0;
    packs += p.packagingOptions?.length ?? 0;
  }
  assert.equal(specs, 203);
  assert.equal(packs, 68);
  assert.equal(getCanonicalBrandOwner("brand_graco")?.id, "org_graco_inc");
  console.log("dataset OK");
}

console.log("\nALL Public UX Phase A checks passed.");
