/**
 * FB-parity gate v1 — autonomous unlock bar.
 * Run: npx tsx scripts/test-fb-parity-v1.ts
 *
 * - Every currently indexable product MUST PASS parity.
 * - Overlay / locked products are scored for reporting (do not unlock).
 * - Summary printed for agent/operator GO decisions.
 */

import assert from "node:assert/strict";
import { listProducts } from "../lib/data/repository";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";
import {
  evaluateFbParity,
  type FbParityReason,
} from "../lib/seo/fbParity";
import { FB_PRODUCT_SEO_UNLOCK_COUNT } from "../lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1";

function section(name: string) {
  console.log(`\n=== ${name} ===`);
}

const OVERLAY_RE =
  /^prod_(trilak_|jub_|poli_farbe_|remmers_|dufa_|akzo_|caparol_|baumit_|revco_|egrokorr_)/;

section("parity evaluate all products");
const products = listProducts();
const results = products.map((p) => ({
  product: p,
  parity: evaluateFbParity(p),
  public: evaluatePublicIndexability(p).indexable,
}));

const unlocked = results.filter((r) => r.public);
const locked = results.filter((r) => !r.public);
const unlockedFail = unlocked.filter((r) => !r.parity.pass);
const lockedPass = locked.filter((r) => r.parity.pass);
const overlayLocked = locked.filter((r) => OVERLAY_RE.test(r.product.id));
const overlayParityPass = overlayLocked.filter((r) => r.parity.pass);

assert.equal(
  unlocked.length,
  FB_PRODUCT_SEO_UNLOCK_COUNT,
  "public product count must match FB unlock cohort",
);

assert.equal(
  unlockedFail.length,
  0,
  `unlocked products must PASS FB-parity: ${unlockedFail
    .map((r) => `${r.product.id}:{${r.parity.reasons.join(",")}}`)
    .join("; ")}`,
);

for (const r of unlocked) {
  assert.ok(r.parity.pass, r.product.id);
  assert.ok(!OVERLAY_RE.test(r.product.id), `overlay must not be public ${r.product.id}`);
}

console.log("unlocked parity OK", {
  unlocked: unlocked.length,
  locked: locked.length,
  lockedButParityPass: lockedPass.length,
  overlayLocked: overlayLocked.length,
  overlayParityPass: overlayParityPass.length,
});

section("reason histogram (locked only)");
const hist = new Map<FbParityReason, number>();
for (const r of locked) {
  for (const reason of r.parity.reasons) {
    hist.set(reason, (hist.get(reason) ?? 0) + 1);
  }
}
const histObj = Object.fromEntries(
  [...hist.entries()].sort((a, b) => b[1] - a[1]),
);
console.log(histObj);

section("overlay parity-pass candidates (noindex — future GO)");
if (overlayParityPass.length === 0) {
  console.log("none — next fill/enrich before unlock");
} else {
  for (const r of overlayParityPass.slice(0, 30)) {
    console.log("PASS_PARITY", r.product.id, r.product.name);
  }
  if (overlayParityPass.length > 30) {
    console.log(`… +${overlayParityPass.length - 30} more`);
  }
}

section("sample locked failures (debug)");
const lockedFail = locked.filter((r) => !r.parity.pass);
for (const r of lockedFail.slice(0, 8)) {
  console.log(
    r.product.id,
    r.parity.reasons.join(","),
    r.parity.marketingHits.join("|") || "-",
  );
}
if (lockedFail.length === 0) console.log("no locked failures");

console.log("\nALL FB-parity v1 checks passed.");
