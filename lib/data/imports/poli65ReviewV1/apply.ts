/**
 * Apply Poli-Farbe 65 REVIEW overlay without touching HOLD, PPG42, JUB, or poli6 PASS files.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { poli65ReviewDescriptions } from "./descriptions";
import { poli65ReviewProfessionalDescriptions } from "./professionalDescriptions";
import { poli65ReviewRelations } from "./relations";
import { poli65ReviewSources } from "./sources";

export function applyPoli65ReviewV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, poli65ReviewDescriptions),
    poli65ReviewProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, poli65ReviewSources),
    relations: mergeRelationsByCanonicalKey(relations, poli65ReviewRelations),
  };
}
