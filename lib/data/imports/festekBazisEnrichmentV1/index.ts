/**
 * Festék Bázis Product Enrichment v1 dataset entry.
 */

import { applyFestekBazisEnrichmentV1 } from "./apply";
import { enrichmentRelationsV1 } from "./relations";
import { productPatchesV1 } from "./productPatches";
import { enrichmentSourcesV1 } from "./sources";
import type { FestekBazisEnrichmentV1 } from "./types";

export type { FestekBazisEnrichmentV1, ProductEnrichmentPatch } from "./types";
export {
  applyFestekBazisEnrichmentV1,
  applyProductEnrichments,
  mergeSourcesWithEnrichment,
} from "./apply";

export const festekBazisEnrichmentV1: FestekBazisEnrichmentV1 = {
  version: "festek_bazis_enrichment_v1",
  accessedAt: "2026-10-06",
  sources: enrichmentSourcesV1,
  productPatches: productPatchesV1,
  relations: enrichmentRelationsV1,
};

export { enrichmentSourcesV1, productPatchesV1, enrichmentRelationsV1 };
