/**
 * Apply REVCO / Saint-Gobain PASS+REVIEW overlay. HOLD excluded at codegen.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { revcoDescriptions } from "./descriptions";
import { revcoProfessionalDescriptions } from "./professionalDescriptions";
import { revcoRelations } from "./relations";
import { revcoSources } from "./sources";

export function applyRevcoV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, revcoDescriptions),
    revcoProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, revcoSources),
    relations: mergeRelationsByCanonicalKey(relations, revcoRelations),
  };
}
