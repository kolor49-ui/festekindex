/**
 * Apply Poli-Farbe 6 PASS overlay without touching Festék Bázis HOLD, PPG42, or JUB files.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { poli6Descriptions } from "./descriptions";
import { poli6ProfessionalDescriptions } from "./professionalDescriptions";
import { poli6Relations } from "./relations";
import { poli6Sources } from "./sources";

export function applyPoli6V1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, poli6Descriptions),
    poli6ProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, poli6Sources),
    relations: mergeRelationsByCanonicalKey(relations, poli6Relations),
  };
}
