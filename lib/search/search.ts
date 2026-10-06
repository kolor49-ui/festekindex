/**
 * Search v1 — universal search API.
 */

import { buildSearchCatalog } from "./catalog";
import { normalizeSearchText } from "./normalize";
import { rankSearchDocuments } from "./rank";
import type { SearchOptions, SearchResult } from "./types";

export const SEARCH_COMPACT_LIMIT = 12;
export const SEARCH_FULL_LIMIT = 40;
export const SEARCH_MIN_QUERY_LENGTH = 2;

/**
 * Universal mixed-entity search.
 * Empty or <2 char normalized query → [].
 */
export function searchCatalog(
  query: string,
  options?: SearchOptions,
): SearchResult[] {
  const normalized = normalizeSearchText(query);
  if (normalized.length < SEARCH_MIN_QUERY_LENGTH) {
    return [];
  }

  let docs = buildSearchCatalog();
  if (options?.types?.length) {
    const allowed = new Set(options.types);
    docs = docs.filter((d) => allowed.has(d.type));
  }

  const limit = options?.limit ?? SEARCH_COMPACT_LIMIT;
  return rankSearchDocuments(docs, query).slice(0, limit);
}

export {
  buildSearchCatalog,
  countSearchCatalogByType,
  getSearchDocumentById,
  resetSearchCatalogCache,
} from "./catalog";
export {
  normalizeSearchText,
  tokenizeSearchText,
  foldAccents,
} from "./normalize";
export type {
  SearchDocument,
  SearchResult,
  SearchOptions,
  SearchEntityType,
  ProgressiveItem,
} from "./types";
export { SEARCH_TYPE_LABEL_HU } from "./types";
