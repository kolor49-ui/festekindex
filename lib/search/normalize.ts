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
      if (haystackTokens[i]!.startsWith(qt)) {
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
