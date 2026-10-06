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
  SEARCH_TYPE_LABEL_HU,
} from "./search";

export type {
  SearchDocument,
  SearchResult,
  SearchOptions,
  SearchEntityType,
  ProgressiveItem,
} from "./types";

export {
  getProductSearchRoots,
  getProductSearchChildren,
  getProductSearchFamilyProducts,
  deriveProductLeafLabel,
} from "./productSelector";
