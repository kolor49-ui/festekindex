/**
 * Apply Baumit HU PASS+REVIEW overlay. HOLD excluded at codegen.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { baumitDescriptions } from "./descriptions";
import { baumitProfessionalDescriptions } from "./professionalDescriptions";
import { baumitRelations } from "./relations";
import { baumitSources } from "./sources";

export function applyBaumitV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, baumitDescriptions),
    baumitProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, baumitSources),
    relations: mergeRelationsByCanonicalKey(relations, baumitRelations),
  };
}
