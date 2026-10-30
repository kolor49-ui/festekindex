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
 * Below this length, bare prefix / substring matching is too greedy
 * (e.g. "fa" → "falfesték"). Exact tokens still match; known short
 * queries may allow compound prefixes except blocked stems.
 */
export const MIN_FUZZY_QUERY_LENGTH = 3;

/**
 * Short query → longer stems that share the same letters but mean
 * something else (Hungarian). "fa" (wood) must not hit "fal…" (wall).
 */
const BLOCKED_SHORT_STEMS: Record<string, readonly string[]> = {
  fa: ["fal", "farbe", "factor"],
};

function isBlockedShortPrefix(queryToken: string, haystackToken: string): boolean {
  const blocked = BLOCKED_SHORT_STEMS[queryToken];
  if (!blocked) return false;
  return blocked.some((stem) => haystackToken.startsWith(stem));
}

/** Exact token, or allowed prefix (with short-query false-stem guard). */
export function tokenMatchesQueryToken(
  queryToken: string,
  haystackToken: string,
): boolean {
  if (!queryToken || !haystackToken) return false;
  if (haystackToken === queryToken) return true;
  if (!haystackToken.startsWith(queryToken)) return false;
  if (queryToken.length >= MIN_FUZZY_QUERY_LENGTH) return true;
  return !isBlockedShortPrefix(queryToken, haystackToken);
}

/**
 * Fuzzy haystack check for short queries: token match only (no raw
 * `includes`, which would still hit "falfestek").
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
