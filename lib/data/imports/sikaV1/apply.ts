/**
 * Apply Sika HU coating wave. HOLD none. indexable locked false until GO.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { sikaDescriptions } from "./descriptions";
import { sikaProfessionalDescriptions } from "./professionalDescriptions";
import { sikaRelations } from "./relations";
import { sikaSources } from "./sources";

export function applySikaV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, sikaDescriptions),
    sikaProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, sikaSources),
    relations: mergeRelationsByCanonicalKey(relations, sikaRelations),
  };
}
