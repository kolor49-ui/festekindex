/**
 * Featured manufacturers for search UX — derived from ranked hits only.
 * No invented orgs; unpublished organizations are skipped.
 */

import {
  getEntityHref,
  getOrganizationById,
} from "@/lib/data/repository";
import { getSearchDocumentById } from "./catalog";
import type { SearchResult } from "./types";

export type FeaturedManufacturer = {
  id: string;
  name: string;
  slug: string;
  href: string;
  /** How many ranked hits point at this manufacturer. */
  hitCount: number;
};

export const SEARCH_FEATURED_MANUFACTURERS_LIMIT = 8;

/**
 * Aggregate manufacturers from search hits via catalog organizationId
 * (and direct organization hits).
 */
export function deriveFeaturedManufacturers(
  hits: SearchResult[],
  opts?: { limit?: number },
): FeaturedManufacturer[] {
  const limit = opts?.limit ?? SEARCH_FEATURED_MANUFACTURERS_LIMIT;
  if (!hits.length || limit <= 0) return [];

  const scoreByOrg = new Map<string, { hitCount: number; score: number }>();

  for (const hit of hits) {
    const doc = getSearchDocumentById(hit.id);
    if (!doc) continue;

    const orgId =
      doc.type === "organization" ? doc.id : doc.organizationId;
    if (!orgId) continue;

    const prev = scoreByOrg.get(orgId) ?? { hitCount: 0, score: 0 };
    prev.hitCount += 1;
    prev.score += hit.score;
    scoreByOrg.set(orgId, prev);
  }

  const rows: FeaturedManufacturer[] = [];
  for (const [orgId, agg] of scoreByOrg) {
    const org = getOrganizationById(orgId);
    if (!org || org.status !== "published") continue;
    rows.push({
      id: org.id,
      name: org.name,
      slug: org.slug,
      href: getEntityHref(org),
      hitCount: agg.hitCount,
    });
  }

  rows.sort((a, b) => {
    const sa = scoreByOrg.get(a.id)?.score ?? 0;
    const sb = scoreByOrg.get(b.id)?.score ?? 0;
    if (sb !== sa) return sb - sa;
    if (b.hitCount !== a.hitCount) return b.hitCount - a.hitCount;
    return a.name.localeCompare(b.name, "hu");
  });

  return rows.slice(0, limit);
}

/** Whether a ranked hit belongs to the given manufacturer organization. */
export function searchHitBelongsToManufacturer(
  hit: SearchResult,
  organizationId: string,
): boolean {
  const doc = getSearchDocumentById(hit.id);
  if (!doc) return false;
  if (doc.type === "organization") return doc.id === organizationId;
  return doc.organizationId === organizationId;
}
