/**
 * Apply JUB 95 PASS overlay without touching Festék Bázis HOLD or PPG42 files.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { jub95Descriptions } from "./descriptions";
import { jub95ProfessionalDescriptions } from "./professionalDescriptions";
import { jub95Relations } from "./relations";
import { jub95Sources } from "./sources";

export function applyJub95V1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, jub95Descriptions),
    jub95ProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, jub95Sources),
    relations: mergeRelationsByCanonicalKey(relations, jub95Relations),
  };
}
