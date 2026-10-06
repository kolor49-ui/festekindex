/**
 * Search v1 ranking — match quality first, type only as tie-break.
 */

import {
  allTokensPresent,
  normalizeSearchText,
  tokenizeSearchText,
  tokensCoveredByPrefix,
} from "./normalize";
import type { SearchDocument, SearchEntityType, SearchResult } from "./types";

/** Match-quality tiers (higher = better). */
const TIER = {
  EXACT_NAME: 100_000,
  EXACT_ALIAS: 90_000,
  NAME_PREFIX: 80_000,
  ALL_TOKENS_IDENTITY: 70_000,
  TOKEN_PREFIX_IDENTITY: 60_000,
  CONTEXT: 30_000,
  LOW_WEIGHT: 10_000,
} as const;

/** Secondary type preference when match quality ties (identity entities first). */
const TYPE_TIE: Record<SearchEntityType, number> = {
  brand: 800,
  productFamily: 700,
  organization: 600,
  technology: 550,
  surface: 500,
  category: 450,
  product: 200,
  knowledge: 100,
};

function nameTokenCoverage(queryTokens: string[], nameNorm: string): number {
  const nameTokens = tokenizeSearchText(nameNorm);
  if (!nameTokens.length || !queryTokens.length) return 0;
  return queryTokens.length / nameTokens.length;
}

function scoreDocument(
  doc: SearchDocument,
  queryNorm: string,
  queryTokens: string[],
): number {
  const nameNorm = doc.normalizedName;
  const identityNorm = normalizeSearchText(doc.identityText);
  const identityTokens = tokenizeSearchText(identityNorm);
  const contextNorm = normalizeSearchText(doc.contextText);
  const contextTokens = tokenizeSearchText(contextNorm);
  const lowNorm = doc.lowWeightText
    ? normalizeSearchText(doc.lowWeightText)
    : "";

  let tier = 0;
  let coverage = 0;

  if (nameNorm === queryNorm) {
    tier = TIER.EXACT_NAME;
    coverage = 1;
  } else if (doc.normalizedAliases.some((a) => a === queryNorm)) {
    tier = TIER.EXACT_ALIAS;
    coverage = 1;
  } else if (nameNorm.startsWith(queryNorm) && queryNorm.length >= 2) {
    tier = TIER.NAME_PREFIX;
    coverage = nameTokenCoverage(queryTokens, nameNorm);
  } else if (
    queryTokens.length > 0 &&
    allTokensPresent(queryTokens, identityTokens)
  ) {
    tier = TIER.ALL_TOKENS_IDENTITY;
    coverage = nameTokenCoverage(queryTokens, nameNorm);
  } else if (
    queryTokens.length > 0 &&
    tokensCoveredByPrefix(queryTokens, identityTokens)
  ) {
    tier = TIER.TOKEN_PREFIX_IDENTITY;
    coverage = nameTokenCoverage(queryTokens, nameNorm);
  } else if (
    queryTokens.length > 0 &&
    (allTokensPresent(queryTokens, contextTokens) ||
      tokensCoveredByPrefix(queryTokens, contextTokens) ||
      (queryNorm.length >= 2 && contextNorm.includes(queryNorm)))
  ) {
    tier = TIER.CONTEXT;
    coverage = 0.2;
  } else if (
    lowNorm &&
    queryTokens.length > 0 &&
    ((queryNorm.length >= 2 && lowNorm.includes(queryNorm)) ||
      allTokensPresent(queryTokens, tokenizeSearchText(lowNorm)))
  ) {
    tier = TIER.LOW_WEIGHT;
    coverage = 0.05;
  } else {
    return 0;
  }

  // Coverage bonus within tier (0–99) — type tie-break must still be able to win
  const coverageBonus = Math.round(Math.min(1, coverage) * 99);
  // Type tie-break (0–99)
  const typeBonus = TYPE_TIE[doc.type] ?? 0;

  return tier + coverageBonus + typeBonus;
}

export function rankSearchDocuments(
  docs: SearchDocument[],
  query: string,
): SearchResult[] {
  const queryNorm = normalizeSearchText(query);
  if (queryNorm.length < 2) return [];

  const queryTokens = tokenizeSearchText(queryNorm);
  const scored: SearchResult[] = [];

  for (const doc of docs) {
    const score = scoreDocument(doc, queryNorm, queryTokens);
    if (score <= 0) continue;
    scored.push({
      id: doc.id,
      type: doc.type,
      name: doc.name,
      displayName: doc.displayName,
      href: doc.href,
      typeLabelHu: doc.typeLabelHu,
      contextLabel: doc.contextLabel,
      score,
    });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.displayName.localeCompare(b.displayName, "hu");
  });

  return scored;
}
