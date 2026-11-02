/**
 * Apply AkzoNobel HU PASS+REVIEW overlay. HOLD excluded at codegen.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { akzoDescriptions } from "./descriptions";
import { akzoProfessionalDescriptions } from "./professionalDescriptions";
import { akzoRelations } from "./relations";
import { akzoSources } from "./sources";

export function applyAkzoV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, akzoDescriptions),
    akzoProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, akzoSources),
    relations: mergeRelationsByCanonicalKey(relations, akzoRelations),
  };
}
