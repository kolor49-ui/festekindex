/**
 * Color System + Product Color Availability v1.
 * Run: npx tsx scripts/test-color-system-v1.ts
 */

import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductHubPage } from "../components/entity/ProductHubPage";
import {
  buildColorAvailabilityDisplay,
  formatColorPublicLabel,
  getColorById,
  getColorSystemById,
  listColorSystems,
  listColors,
} from "../lib/data/colorSystem";
import {
  festekBazisColorAuditV1,
  productColorAvailabilityV1,
} from "../lib/data/imports/festekBazisEnrichmentV1/colorSystemV1";
import {
  getProductById,
  getSourceById,
  listProducts,
} from "../lib/data/repository";
import { buildProductHubModel } from "../lib/seo/productHubModel";
import {
  expectedDilutedWithAfterClosure,
  expectedPackagingCountAfterClosure,
  expectedProductCountAfterClosure,
  expectedSearchDocumentsAfterClosure,
  expectedSpecCountAfterClosure,
} from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";
import { buildSearchCatalog } from "../lib/search";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

section("ColorSystem / Color catalog");
{
  const systems = listColorSystems();
  assert.ok(systems.some((s) => s.id === "color_system_ral"));
  assert.ok(systems.some((s) => s.id === "color_system_valmor"));
  assert.ok(systems.some((s) => s.id === "color_system_factor"));
  assert.ok(systems.some((s) => s.id === "color_system_coror"));
  assert.ok(systems.some((s) => s.id === "color_system_7016"));
  assert.equal(new Set(systems.map((s) => s.id)).size, systems.length);

  const colors = listColors();
  assert.ok(colors.length > 0);
  assert.equal(new Set(colors.map((c) => c.id)).size, colors.length);

  const ralKeys = new Set<string>();
  for (const c of colors) {
    assert.ok(getColorSystemById(c.colorSystemId), c.id);
    assert.ok(c.code.trim(), c.id);
    if (c.colorSystemId === "color_system_ral") {
      assert.ok(/^\d{4}$/.test(c.code), `RAL code ${c.id}`);
      const key = `${c.colorSystemId}:${c.code}`;
      assert.ok(!ralKeys.has(key), `dup RAL identity ${key}`);
      ralKeys.add(key);
      const label = formatColorPublicLabel(c);
      assert.equal(label.startsWith("RAL "), true, label);
    }
    // No approximate color science fields
    assert.ok(!("hex" in c) && !("rgb" in c) && !("approxHex" in c));
  }
  console.log("catalog OK", {
    systems: systems.length,
    colors: colors.length,
    ral: ralKeys.size,
  });
}

section("Product availability provenance");
{
  const seenRel = new Set<string>();
  for (const patch of productColorAvailabilityV1) {
    assert.ok(getProductById(patch.productId), patch.productId);
    const colors = patch.colors ?? [];
    const generics = patch.genericStatements ?? [];
    assert.ok(colors.length + generics.length > 0, patch.productId);

    for (const entry of colors) {
      assert.equal(entry.status, "verified");
      assert.ok(entry.sourceIds.length > 0, entry.colorId);
      assert.ok(getColorById(entry.colorId), entry.colorId);
      for (const sid of entry.sourceIds) {
        assert.ok(getSourceById(sid), `${patch.productId} ${sid}`);
      }
      const key = `${patch.productId}→${entry.colorId}`;
      assert.ok(!seenRel.has(key), `dup relation ${key}`);
      seenRel.add(key);
    }
    for (const g of generics) {
      assert.equal(g.status, "verified");
      assert.ok(g.text.trim());
      assert.ok(g.sourceIds.length > 0);
      for (const sid of g.sourceIds) {
        assert.ok(getSourceById(sid), `${patch.productId} gen ${sid}`);
      }
      assert.ok(
        !/belongsToCategory|colorSystemId|GENERIC|SPECIFIC|UNRESOLVED|sourceIds/i.test(
          g.text,
        ),
      );
    }
  }
  console.log("provenance OK", { relations: seenRel.size });
}

section("No finish-as-Color / no full RAL dump");
{
  const finishish = listColors().filter((c) =>
    /^(matt|fenyes|fényes|selyemfenyu|selyemfényű)$/i.test(c.code),
  );
  assert.equal(finishish.length, 0);
  assert.ok(listColors().length < 500, "must not import full RAL catalogue");
  console.log("safety OK");
}

section("Product Hub Színválaszték SSR");
{
  const specific = getProductById("prod_coror_rapid_enamel")!;
  const genericHeavy = getProductById("prod_valmor_airflow_interior")!;
  const none = getProductById("prod_coror_synthetic")!;

  const specificDisp = buildColorAvailabilityDisplay(specific)!;
  assert.ok(specificDisp.groups.some((g) => g.systemId === "color_system_ral"));
  assert.ok(specificDisp.genericStatements.length > 0);

  const sModel = buildProductHubModel(specific)!;
  const sHtml = renderToStaticMarkup(
    createElement(ProductHubPage, { model: sModel }),
  );
  assert.ok(sHtml.includes("Színválaszték"));
  assert.ok(sHtml.includes("RAL 7016") || sHtml.includes("RAL 9005"));
  assert.ok(sHtml.includes("Egyedi RAL"));
  assert.ok(!/#([0-9a-f]{6})/i.test(sHtml.match(/product-color-chip[\s\S]*?<\/li>/)?.[0] ?? ""));

  const gModel = buildProductHubModel(genericHeavy)!;
  const gHtml = renderToStaticMarkup(
    createElement(ProductHubPage, { model: gModel }),
  );
  assert.ok(gHtml.includes("Színválaszték"));
  assert.ok(gHtml.includes("Fehér") || gHtml.includes("fehér") || gHtml.includes("Pasztell"));
  // Must not invent RAL chips for fehér-only wall paint
  assert.ok(!gHtml.includes("RAL 7016"));

  const nModel = buildProductHubModel(none)!;
  const nHtml = renderToStaticMarkup(
    createElement(ProductHubPage, { model: nModel }),
  );
  assert.ok(!nHtml.includes("Színválaszték"));
  assert.ok(!nHtml.includes("Nincs adat"));

  const leak =
    /ColorSystem|colorSystemId|colorId|productColorAvailability|availabilityType|GENERIC|SPECIFIC|UNRESOLVED|sourceIds|rawValue|verifiedAt/i;
  for (const html of [sHtml, gHtml, nHtml]) {
    const visible = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ");
    assert.ok(!leak.test(visible));
  }
  console.log("hub SSR OK");
}

section("Baseline locks");
{
  const products = listProducts();
  assert.equal(products.length, expectedProductCountAfterClosure());
  let specs = 0;
  let packs = 0;
  let diluted = 0;
  for (const p of products) {
    specs += p.specifications?.length ?? 0;
    packs += p.packagingOptions?.length ?? 0;
    // dilutedWith counted elsewhere — smoke via expected helper
  }
  assert.equal(specs, expectedSpecCountAfterClosure());
  assert.equal(packs, expectedPackagingCountAfterClosure());
  assert.equal(buildSearchCatalog().length, expectedSearchDocumentsAfterClosure());
  assert.equal(expectedDilutedWithAfterClosure(), 8);
  assert.equal(festekBazisColorAuditV1.length, 53);
  console.log("baseline OK", { specs, packs, search: buildSearchCatalog().length });
}

console.log("\nALL Color System v1 checks passed.");
