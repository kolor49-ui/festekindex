/**
 * Public list-card copy — never expose seed/import/version filler.
 * Shared by EntityList and related list surfaces.
 */

import type { AnyEntity, Product } from "@/lib/data/types";

const FILLER_MARKERS = [
  "a festékindex adatbázisában",
  "festékindex adatbázisában",
  "termékadatbázisában",
  "festék bázis v0.",
  "v0.1",
  "v0.2",
  "relations háló",
  "relations réteg",
  "gráf",
  "graph",
  "repository",
  "entitás",
  "sourceids",
  "productclass",
  "indexable",
  "noindex",
  "vékony",
  "hiányos",
  "seed",
  "curated seed",
  "normalizált graph",
];

/** True when text is structural/import filler unsuitable for public UI. */
export function isPublicListFiller(text: string | undefined): boolean {
  const t = text?.trim() ?? "";
  if (!t) return true;
  const lower = t.toLowerCase();
  return FILLER_MARKERS.some((m) => lower.includes(m));
}

export function publicSafeListText(
  text: string | undefined,
): string | undefined {
  const t = text?.trim() ?? "";
  if (!t || isPublicListFiller(t)) return undefined;
  return t;
}

/**
 * Resolve a public list-card description without inventing facts.
 * Prefer editorial → source → meaningful shortDescription; otherwise omit.
 */
export function publicListDescription(
  entity: AnyEntity,
): string | undefined {
  if (entity.type === "product") {
    const p = entity as Product;
    return (
      publicSafeListText(p.editorialSummary) ??
      publicSafeListText(p.sourceSummary) ??
      publicSafeListText(p.shortDescription)
    );
  }

  return publicSafeListText(entity.shortDescription);
}
