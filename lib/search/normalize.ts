/**
 * Search v1 Hungarian text normalization.
 * Accent-insensitive, punctuation-safe. Not the same as slug generation.
 */

/** Strip combining marks after NFD (accents). */
export function foldAccents(input: string): string {
  return input.normalize("NFD").replace(/\p{M}/gu, "");
}

/**
 * Normalize free text for matching:
 * Unicode NFD → strip accents → lower → ™/®/© drop →
 * punctuation/hyphen/slash → space → collapse whitespace.
 */
export function normalizeSearchText(input: string): string {
  return foldAccents(input)
    .toLowerCase()
    .replace(/[™®©]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Tokenize already-normalized (or raw) text into search tokens. */
export function tokenizeSearchText(input: string): string[] {
  const normalized = normalizeSearchText(input);
  if (!normalized) return [];
  return normalized.split(" ").filter(Boolean);
}

/**
 * Below this length, open prefix / raw substring matching is too greedy
 * (e.g. "fa" → "falfesték", or every product that merely mentions a surface).
 * Short queries use stricter token rules + identity-only ranking.
 */
export const MIN_FUZZY_QUERY_LENGTH = 3;

/**
 * Short domain roots that should still hit productive compounds.
 * Only listed stems (plus the exact root token) may prefix-match.
 * Add new roots here when a 2-letter professional query needs compounds
 * without pulling in false friends.
 */
const SHORT_COMPOUND_ALLOW: Record<string, readonly string[]> = {
  // fa (wood) — not fal / falfesték / farbe / factor
  fa: [
    "fa",
    "faanyag",
    "faved",
    "fafest",
    "faipari",
    "farost",
    "fabol",
    "fapad",
    "facsisz",
    "famazo",
    "faszer",
  ],
};

/**
 * Fallback false stems when a short root is not on the allowlist
 * (or as an extra guard). Prefer extending SHORT_COMPOUND_ALLOW.
 */
const BLOCKED_SHORT_STEMS: Record<string, readonly string[]> = {
  fa: ["fal", "farbe", "factor"],
};

export function isShortFuzzyQuery(queryNorm: string): boolean {
  return queryNorm.length > 0 && queryNorm.length < MIN_FUZZY_QUERY_LENGTH;
}

function allowedShortCompound(queryToken: string, haystackToken: string): boolean {
  const stems = SHORT_COMPOUND_ALLOW[queryToken];
  if (!stems) return false;
  for (const stem of stems) {
    // The bare root only matches as an exact token ("fa" ≠ "factor" / "fal…").
    if (stem === queryToken) {
      if (haystackToken === queryToken) return true;
      continue;
    }
    if (haystackToken === stem || haystackToken.startsWith(stem)) return true;
  }
  return false;
}

function isBlockedShortPrefix(queryToken: string, haystackToken: string): boolean {
  const blocked = BLOCKED_SHORT_STEMS[queryToken];
  if (!blocked) return false;
  return blocked.some((stem) => haystackToken.startsWith(stem));
}

/** Exact token, or allowed prefix (short-query compound / false-stem rules). */
export function tokenMatchesQueryToken(
  queryToken: string,
  haystackToken: string,
): boolean {
  if (!queryToken || !haystackToken) return false;
  if (haystackToken === queryToken) return true;
  if (!haystackToken.startsWith(queryToken)) return false;

  if (queryToken.length >= MIN_FUZZY_QUERY_LENGTH) return true;

  // Short query with an allowlist: only productive compounds.
  if (Object.prototype.hasOwnProperty.call(SHORT_COMPOUND_ALLOW, queryToken)) {
    return allowedShortCompound(queryToken, haystackToken);
  }

  // Other short queries (zo, al, gx…): open prefix, minus any false stems.
  return !isBlockedShortPrefix(queryToken, haystackToken);
}

/**
 * Fuzzy haystack check: long queries may use substring; short queries
 * only token-level matches (no raw `includes("fa")` inside "falfestek").
 */
export function normalizedContainsQuery(
  haystackNorm: string,
  queryNorm: string,
): boolean {
  if (!queryNorm || !haystackNorm) return false;
  if (queryNorm.length >= MIN_FUZZY_QUERY_LENGTH) {
    return haystackNorm.includes(queryNorm);
  }
  return tokenizeSearchText(haystackNorm).some((t) =>
    tokenMatchesQueryToken(queryNorm, t),
  );
}

/** True when every query token is a prefix of some haystack token (1:1 unused). */
export function tokensCoveredByPrefix(
  queryTokens: string[],
  haystackTokens: string[],
): boolean {
  if (!queryTokens.length) return false;
  const used = new Set<number>();
  for (const qt of queryTokens) {
    let found = false;
    for (let i = 0; i < haystackTokens.length; i++) {
      if (used.has(i)) continue;
      if (tokenMatchesQueryToken(qt, haystackTokens[i]!)) {
        used.add(i);
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

/** Every query token appears as a full token in haystack. */
export function allTokensPresent(
  queryTokens: string[],
  haystackTokens: string[],
): boolean {
  if (!queryTokens.length) return false;
  const set = new Set(haystackTokens);
  return queryTokens.every((t) => set.has(t));
}
