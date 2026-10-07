/**
 * Search Phase C — presentation helpers (no ranking changes).
 */

import type { SearchResult } from "./types";

/** Secondary line: type · context — calm, professional. */
export function formatSearchResultMeta(hit: SearchResult): string {
  return [hit.typeLabelHu, hit.contextLabel].filter(Boolean).join(" · ");
}

/** Short product preview for full results — never dominates identity. */
export function clampSearchPreview(
  text: string | undefined,
  maxChars = 110,
): string | undefined {
  const t = text?.trim();
  if (!t) return undefined;
  if (t.length <= maxChars) return t;
  const cut = t.slice(0, maxChars - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 40 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}
