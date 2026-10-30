/**
 * Apply PPG Trilak 42 PASS overlay without touching Festék Bázis HOLD enrichment files.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { ppgTrilak42Descriptions } from "./descriptions";
import { ppgTrilak42ProfessionalDescriptions } from "./professionalDescriptions";
import { ppgTrilak42Relations } from "./relations";
import { ppgTrilak42Sources } from "./sources";

export function applyPpgTrilak42V1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, ppgTrilak42Descriptions),
    ppgTrilak42ProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, ppgTrilak42Sources),
    relations: mergeRelationsByCanonicalKey(relations, ppgTrilak42Relations),
  };
}
