/**
 * Base/raw entity SEO quality evaluation.
 *
 * evaluateIndexability = raw shortDescription/body/graph thresholds.
 * Final robots + sitemap decisions use evaluatePublicIndexability
 * (lib/seo/publicIndexability.ts), which applies hard gates then
 * approved Organization/Brand Hub public-page policy.
 */

import type { AnyEntity } from "@/lib/data/types";
import { allRelations } from "@/lib/data/imports/allRelations";

/**
 * Base/raw quality gate for programmatic entity pages.
 * Soft fails: short_description_thin, body_thin, insufficient_context_graph.
 * Hard early exits: not_published, flag_noindex, synthetic_nav_category.
 *
 * Does NOT alone decide robots/sitemap for Organization/Brand Hubs —
 * use evaluatePublicIndexability for the final public decision.
 */
export function evaluateIndexability(entity: AnyEntity): {
  indexable: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  if (entity.status !== "published") {
    return { indexable: false, reasons: ["not_published"] };
  }
  if (entity.indexable === false) {
    return { indexable: false, reasons: ["flag_noindex"] };
  }
  if (entity.id === "cat_all") {
    return { indexable: false, reasons: ["synthetic_nav_category"] };
  }

  const body = entity.body?.trim() ?? "";
  const short = entity.shortDescription?.trim() ?? "";
  const relatedCount = allRelations.filter(
    (r) =>
      r.status === "active" &&
      (r.fromEntityId === entity.id || r.toEntityId === entity.id),
  ).length;
  const sourceCount = entity.sourceIds.length;

  if (short.length < 40) reasons.push("short_description_thin");
  if (body.length < 120) reasons.push("body_thin");

  const hasGraphOrSources =
    relatedCount >= 2 || sourceCount >= 1 || body.length >= 220;
  if (!hasGraphOrSources) reasons.push("insufficient_context_graph");

  if (!entity.seoTitle?.trim()) reasons.push("missing_seo_title_fallback_ok");
  if (!entity.seoDescription?.trim())
    reasons.push("missing_seo_description_fallback_ok");

  const hardFails = reasons.filter(
    (r) =>
      r === "short_description_thin" ||
      r === "body_thin" ||
      r === "insufficient_context_graph",
  );

  return {
    indexable: hardFails.length === 0,
    reasons,
  };
}

/** @deprecated Prefer isPubliclyIndexable from publicIndexability for robots/sitemap. */
export function isSeoIndexable(entity: AnyEntity): boolean {
  return evaluateIndexability(entity).indexable;
}
