/**
 * Apply Caparol HU PASS+REVIEW overlay. HOLD excluded at codegen.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { caparolDescriptions } from "./descriptions";
import { caparolProfessionalDescriptions } from "./professionalDescriptions";
import { caparolRelations } from "./relations";
import { caparolSources } from "./sources";

export function applyCaparolV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, caparolDescriptions),
    caparolProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, caparolSources),
    relations: mergeRelationsByCanonicalKey(relations, caparolRelations),
  };
}
