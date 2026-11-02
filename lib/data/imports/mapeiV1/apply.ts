/**
 * Apply Mapei HU paint/coating wave. indexable locked false until GO.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { mapeiDescriptions } from "./descriptions";
import { mapeiProfessionalDescriptions } from "./professionalDescriptions";
import { mapeiRelations } from "./relations";
import { mapeiSources } from "./sources";

export function applyMapeiV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, mapeiDescriptions),
    mapeiProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, mapeiSources),
    relations: mergeRelationsByCanonicalKey(relations, mapeiRelations),
  };
}
