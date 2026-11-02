/**
 * Apply KEMIKÁL PASS+REVIEW overlay. HOLD excluded at codegen.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { kemikalDescriptions } from "./descriptions";
import { kemikalProfessionalDescriptions } from "./professionalDescriptions";
import { kemikalRelations } from "./relations";
import { kemikalSources } from "./sources";

export function applyKemikalV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, kemikalDescriptions),
    kemikalProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, kemikalSources),
    relations: mergeRelationsByCanonicalKey(relations, kemikalRelations),
  };
}
