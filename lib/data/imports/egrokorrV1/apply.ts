/**
 * Apply EGROKORR PASS+REVIEW overlay. HOLD excluded at codegen.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { egrokorrDescriptions } from "./descriptions";
import { egrokorrProfessionalDescriptions } from "./professionalDescriptions";
import { egrokorrRelations } from "./relations";
import { egrokorrSources } from "./sources";

export function applyEgrokorrV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, egrokorrDescriptions),
    egrokorrProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, egrokorrSources),
    relations: mergeRelationsByCanonicalKey(relations, egrokorrRelations),
  };
}
