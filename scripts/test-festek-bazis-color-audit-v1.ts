/**
 * FESTÉK BÁZIS Color Audit v1.
 * Run: npx tsx scripts/test-festek-bazis-color-audit-v1.ts
 */

import assert from "node:assert/strict";
import {
  festekBazisColorAuditV1,
  productColorAvailabilityV1,
  colorsV1,
} from "../lib/data/imports/festekBazisEnrichmentV1/colorSystemV1";
import {
  getCanonicalProductBrand,
  getCanonicalProductFamily,
} from "../lib/navigation/entityNavigation";
import {
  getProductById,
  getSourceById,
  listProducts,
} from "../lib/data/repository";
import { getColorById } from "../lib/data/colorSystem";
import { expectedProductCountAfterClosure } from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

section("53-Product audit coverage");
{
  const products = listProducts();
  assert.equal(products.length, expectedProductCountAfterClosure());
  assert.equal(festekBazisColorAuditV1.length, 53);

  const auditIds = new Set(festekBazisColorAuditV1.map((a) => a.productId));
  for (const p of products) {
    assert.ok(auditIds.has(p.id), `missing audit ${p.id}`);
  }
  assert.equal(auditIds.size, 53);

  for (const a of festekBazisColorAuditV1) {
    assert.ok(
      ["NONE", "GENERIC", "SPECIFIC", "UNRESOLVED"].includes(a.decision),
      a.productId,
    );
    assert.ok(a.evidence.includes("TDS") || a.evidence.includes("festekbazis"), a.productId);
  }

  const counts = {
    NONE: festekBazisColorAuditV1.filter((a) => a.decision === "NONE").length,
    GENERIC: festekBazisColorAuditV1.filter((a) => a.decision === "GENERIC")
      .length,
    SPECIFIC: festekBazisColorAuditV1.filter((a) => a.decision === "SPECIFIC")
      .length,
    UNRESOLVED: festekBazisColorAuditV1.filter(
      (a) => a.decision === "UNRESOLVED",
    ).length,
  };
  assert.equal(
    counts.NONE + counts.GENERIC + counts.SPECIFIC + counts.UNRESOLVED,
    53,
  );
  assert.equal(counts.UNRESOLVED, 0);
  assert.equal(counts.NONE, 1); // COROR Szintetikus Hígító
  console.log("coverage OK", counts);
}

section("SPECIFIC / GENERIC evidence + no inheritance");
{
  const availByProduct = new Map(
    productColorAvailabilityV1.map((p) => [p.productId, p]),
  );

  for (const a of festekBazisColorAuditV1) {
    const avail = availByProduct.get(a.productId);
    if (a.decision === "NONE") {
      assert.equal(avail, undefined, a.productId);
      continue;
    }
    assert.ok(avail, a.productId);
    if (a.decision === "SPECIFIC") {
      assert.ok((avail!.colors?.length ?? 0) > 0, a.productId);
      assert.equal(avail!.colors!.length, a.specificColorCount, a.productId);
    }
    if (a.decision === "GENERIC") {
      assert.equal(avail!.colors?.length ?? 0, 0, a.productId);
      assert.ok((avail!.genericStatements?.length ?? 0) > 0, a.productId);
    }

    for (const entry of avail!.colors ?? []) {
      for (const sid of entry.sourceIds) {
        const src = getSourceById(sid)!;
        assert.ok(src.url?.includes("festekbazis.hu"), `${a.productId} ${sid}`);
      }
    }
    for (const g of avail!.genericStatements ?? []) {
      for (const sid of g.sourceIds) {
        const src = getSourceById(sid)!;
        assert.ok(src.url?.includes("festekbazis.hu"), `${a.productId} ${sid}`);
      }
    }
  }

  // No Brand / Family inheritance: two sibling Products must not share
  // identical colorId sets unless both have independent availability records
  // (allowed) — but a Product without audit SPECIFIC must not gain colors.
  for (const p of listProducts()) {
    const brand = getCanonicalProductBrand(p.id);
    const family = getCanonicalProductFamily(p.id);
    const audit = festekBazisColorAuditV1.find((a) => a.productId === p.id)!;
    if (audit.decision === "NONE") {
      assert.ok(!p.colorAvailability?.colors?.length);
    }
    // Sanity: family alone never injects colors without product record
    if (family && !availByProduct.has(p.id)) {
      assert.ok(!p.colorAvailability);
    }
    void brand;
  }
  console.log("evidence OK");
}

section("No full RAL expansion from generic statements");
{
  const genericOnlyRalMentions = productColorAvailabilityV1.filter((p) =>
    (p.genericStatements ?? []).some((g) => /RAL/i.test(g.text)),
  );
  for (const p of genericOnlyRalMentions) {
    // Generic RAL statement must not auto-create hundreds of RAL colors on that Product
    const ralOnProduct = (p.colors ?? []).filter((c) => {
      const color = getColorById(c.colorId);
      return color?.colorSystemId === "color_system_ral";
    });
    // If Product also has specific RAL colors, fine — but count must stay product-scoped
    assert.ok(
      ralOnProduct.length < 50,
      `${p.productId} looks like full palette dump`,
    );
  }
  assert.ok(colorsV1.filter((c) => c.colorSystemId === "color_system_ral").length < 100);
  console.log("no palette dump OK");
}

section("7016 antracit not auto-mapped to RAL except explicit");
{
  const wall = getProductById("prod_7016_wall")!;
  const pergola = getProductById("prod_7016_pergola")!;
  const wallRal = (wall.colorAvailability?.colors ?? []).some(
    (c) => c.colorId === "color_ral_7016",
  );
  const pergolaRal = (pergola.colorAvailability?.colors ?? []).some(
    (c) => c.colorId === "color_ral_7016",
  );
  assert.equal(wallRal, false);
  assert.equal(pergolaRal, true);
  console.log("7016 mapping OK");
}

console.log("\nALL FESTÉK BÁZIS Color Audit v1 checks passed.");
