/**
 * FB-parity gate — autonomous quality bar before product Google unlock.
 *
 * Mirrors Festék Bázis Product Hub readiness:
 * - official sources
 * - editorial lead + professional Termékleírás depth
 * - no banned marketing fluff
 * - SEO text thresholds (same as productSeoText)
 * - brand or family identity (7016-style family-only OK)
 *
 * Does not invent content. FAIL = stay noindex / not unlock-eligible.
 */

import type { Product } from "@/lib/data/types";
import { allRelations } from "@/lib/data/imports/allRelations";
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

/** Multi-word / clear fluff — aligned with Editorial Standard + product-hub smoke. */
const BANNED_MARKETING: RegExp[] = [
  /tökéletes\s+választás/i,
  /forradalmi\s+megoldás/i,
  /páratlan\s+minőség/i,
  /a\s+legjobb\s+termék/i,
  /minden\s+felhasználási\s+területre\s+ideális/i,
  /ideális\s+választás/i,
  /legjobb\s+a\s+piacon/i,
  /csúcskategóriás/i,
  /kimagasl[oó]/i,
  /forradalmi/i,
];

export type FbParityReason =
  | "not_published"
  | "missing_sources"
  | "editorial_thin"
  | "professional_thin"
  | "seo_short_thin"
  | "seo_body_thin"
  | "banned_marketing"
  | "missing_identity_graph"
  | "missing_category"
  | "empty_professional_section";

export type FbParityResult = {
  productId: string;
  pass: boolean;
  reasons: FbParityReason[];
  marketingHits: string[];
};

function professionalPlain(product: Product): string {
  return (product.professionalDescription?.sections ?? [])
    .flatMap((s) => s.paragraphs)
    .join("\n")
    .trim();
}

function findBannedMarketing(text: string): string[] {
  const hits: string[] = [];
  for (const re of BANNED_MARKETING) {
    const m = text.match(re);
    if (m?.[0]) hits.push(m[0]);
  }
  return [...new Set(hits)];
}

/** Brand|Family --hasProduct--> Product (incoming hasProduct edge). */
function hasBrandOrFamily(productId: string): boolean {
  return allRelations.some(
    (r) =>
      r.status === "active" &&
      r.relationType === "hasProduct" &&
      r.toEntityId === productId,
  );
}

function hasCategory(productId: string): boolean {
  return allRelations.some(
    (r) =>
      r.status === "active" &&
      r.relationType === "belongsToCategory" &&
      r.fromEntityId === productId,
  );
}

/**
 * Legacy FB baseline: 3 products intentionally uncategorized in catalogue closure.
 * New unlock cohorts must NOT be added here — fix category from source instead.
 */
const LEGACY_UNCATEGORIZED_OK = new Set([
  "prod_valmor_airflow_primer",
  "prod_valmor_airflow_salt",
  "prod_valmor_deep_primer",
]);

/**
 * Evaluate one product against Festék Bázis parity bar.
 * Safe to call on overlays — they typically FAIL until enriched to FB depth.
 */
export function evaluateFbParity(product: Product): FbParityResult {
  const reasons: FbParityReason[] = [];
  const marketingHits: string[] = [];

  if (product.status !== "published") {
    return {
      productId: product.id,
      pass: false,
      reasons: ["not_published"],
      marketingHits,
    };
  }

  if (product.sourceIds.length < 1) reasons.push("missing_sources");

  const editorial = product.editorialSummary?.trim() ?? "";
  if (editorial.length < 40) reasons.push("editorial_thin");

  const sections = product.professionalDescription?.sections ?? [];
  const prof = professionalPlain(product);
  if (prof.length < 120) reasons.push("professional_thin");
  if (sections.length === 0) {
    reasons.push("empty_professional_section");
  } else {
    for (const s of sections) {
      if (!s.heading.trim() || s.paragraphs.every((p) => !p.trim())) {
        reasons.push("empty_professional_section");
        break;
      }
    }
  }

  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) reasons.push("seo_short_thin");
  if (body.length < 120) reasons.push("seo_body_thin");

  const scan = [editorial, product.sourceSummary ?? "", prof].join("\n");
  const banned = findBannedMarketing(scan);
  if (banned.length) {
    reasons.push("banned_marketing");
    marketingHits.push(...banned);
  }

  if (!hasBrandOrFamily(product.id)) reasons.push("missing_identity_graph");
  if (
    !hasCategory(product.id) &&
    !LEGACY_UNCATEGORIZED_OK.has(product.id)
  ) {
    reasons.push("missing_category");
  }

  return {
    productId: product.id,
    pass: reasons.length === 0,
    reasons: [...new Set(reasons)],
    marketingHits,
  };
}

export function isFbParityPass(product: Product): boolean {
  return evaluateFbParity(product).pass;
}
