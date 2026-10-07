/**
 * Search v1 — public SearchDocument + result types.
 * Internal IDs may exist structurally; never as searchable/public copy.
 */

export type SearchEntityType =
  | "organization"
  | "brand"
  | "productFamily"
  | "product"
  | "technology"
  | "surface"
  | "category"
  | "knowledge";

export type SearchDocument = {
  id: string;
  type: SearchEntityType;
  name: string;
  displayName: string;
  href: string;
  typeLabelHu: string;
  normalizedName: string;
  aliases: string[];
  normalizedAliases: string[];
  identityText: string;
  contextText: string;
  lowWeightText?: string;
  contextLabel?: string;
  organizationId?: string;
  brandId?: string;
  productFamilyId?: string;
  categoryIds?: string[];
  technologyIds?: string[];
  surfaceIds?: string[];
  hasProducts?: boolean;
};

/**
 * Presentation-only match classification derived from ranking tier.
 * Never expose these labels in public UI copy.
 */
export type SearchMatchKind = "identity" | "context";

export type SearchResult = {
  id: string;
  type: SearchEntityType;
  name: string;
  displayName: string;
  href: string;
  typeLabelHu: string;
  contextLabel?: string;
  score: number;
  /** Derived from score tier for UI hierarchy — not a public label. */
  matchKind: SearchMatchKind;
};

export type SearchOptions = {
  limit?: number;
  types?: SearchEntityType[];
};

export type ProgressiveItemType = "brand" | "productFamily" | "product";

export type ProgressiveItem = {
  id: string;
  type: ProgressiveItemType;
  name: string;
  displayName: string;
  href: string;
  typeLabelHu: string;
  /** Safe leaf label for progressive UI when deterministic; else full name. */
  leafLabel?: string;
};

export const SEARCH_TYPE_LABEL_HU: Record<SearchEntityType, string> = {
  organization: "Cég",
  brand: "Márka",
  productFamily: "Termékcsalád",
  product: "Termék",
  technology: "Technológia",
  surface: "Felület",
  category: "Szakmai terület",
  knowledge: "Tudástár",
};

export const PROGRESSIVE_TYPE_LABEL_HU: Record<ProgressiveItemType, string> = {
  brand: "Márka",
  productFamily: "Termékcsalád",
  product: "Termék",
};
