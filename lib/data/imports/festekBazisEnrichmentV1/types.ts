/**
 * Festék Bázis Product Enrichment v1 — types for official-source overlays.
 * Does not invent facts; patches never change id/slug/name/status/indexable.
 */

import type {
  Product,
  ProductClass,
  ProductPackagingOption,
  ProductSpecification,
  Relation,
  Source,
} from "../../types";

export type ProductEnrichmentPatch = {
  productId: string;
  officialUrl?: string;
  productClass?: ProductClass;
  sourceSummary?: string;
  sourceSummarySourceIds?: string[];
  /** FESTÉKINDEX professional lead — official-source facts only. */
  editorialSummary?: string;
  /** Absolute list of verified/draft specs for this product (replaces empty). */
  specifications?: ProductSpecification[];
  packagingOptions?: ProductPackagingOption[];
  /** Extra entity-level source ids to merge into Product.sourceIds. */
  additionalSourceIds?: string[];
};

/** Description-only overlay (Product Description Enrichment v1). */
export type ProductDescriptionEnrichment = {
  productId: string;
  sourceSummary: string;
  sourceSummarySourceIds: string[];
  editorialSummary: string;
};

export type FestekBazisEnrichmentV1 = {
  version: "festek_bazis_enrichment_v1";
  accessedAt: string;
  sources: Source[];
  productPatches: ProductEnrichmentPatch[];
  relations: Relation[];
};

export type ProductIdentityFreeze = Pick<
  Product,
  "id" | "slug" | "name" | "status" | "indexable"
>;
