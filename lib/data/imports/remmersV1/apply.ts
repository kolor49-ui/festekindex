/**
 * Apply Remmers PASS+REVIEW overlay. HOLD excluded at codegen.
 * Does not touch PPG / JUB / Poli / Festék Bázis files.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { remmersDescriptions } from "./descriptions";
import { remmersProfessionalDescriptions } from "./professionalDescriptions";
import { remmersRelations } from "./relations";
import { remmersSources } from "./sources";

export function applyRemmersV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, remmersDescriptions),
    remmersProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, remmersSources),
    relations: mergeRelationsByCanonicalKey(relations, remmersRelations),
  };
}
