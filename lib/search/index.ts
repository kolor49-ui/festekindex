/**
 * Search v1 public barrel.
 */

export {
  searchCatalog,
  buildSearchCatalog,
  countSearchCatalogByType,
  getSearchDocumentById,
  resetSearchCatalogCache,
  normalizeSearchText,
  tokenizeSearchText,
  foldAccents,
  SEARCH_COMPACT_LIMIT,
  SEARCH_FULL_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
  SEARCH_AUTOCOMPLETE_DESKTOP_LIMIT,
  SEARCH_AUTOCOMPLETE_MOBILE_LIMIT,
  SEARCH_TYPE_LABEL_HU,
} from "./search";

export { rankSearchDocuments, matchKindFromScore, IDENTITY_MATCH_SCORE_FLOOR } from "./rank";

export { formatSearchResultMeta, clampSearchPreview } from "./present";

export type {
  SearchDocument,
  SearchResult,
  SearchOptions,
  SearchEntityType,
  SearchMatchKind,
  ProgressiveItem,
} from "./types";

export {
  getProductSearchRoots,
  getProductSearchChildren,
  getProductSearchFamilyProducts,
  deriveProductLeafLabel,
} from "./productSelector";
