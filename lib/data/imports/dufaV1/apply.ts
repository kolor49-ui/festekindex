/**
 * Apply Düfa PASS+REVIEW overlay. HOLD excluded at codegen.
 * Does not touch PPG / JUB / Poli / Remmers / Festék Bázis files.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { dufaDescriptions } from "./descriptions";
import { dufaProfessionalDescriptions } from "./professionalDescriptions";
import { dufaRelations } from "./relations";
import { dufaSources } from "./sources";

export function applyDufaV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, dufaDescriptions),
    dufaProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, dufaSources),
    relations: mergeRelationsByCanonicalKey(relations, dufaRelations),
  };
}
