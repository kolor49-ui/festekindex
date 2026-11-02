/**
 * Apply Caparol HU PASS+REVIEW overlay. HOLD excluded at codegen.
 * After enrichment, unlock indexable when SEO text thresholds pass (FB-parity gated in tests).
 * Thin SKUs (seo body < 120) stay noindex.
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
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

const CAPAROL_UNLOCK_IDS = new Set(
  caparolDescriptions.map((d) => d.productId),
);

function meetsSeoThreshold(product: Product): boolean {
  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (product.sourceIds.length < 1 && body.length < 220) return false;
  return true;
}

function unlockCaparolProductIndexability(products: Product[]): Product[] {
  return products.map((product) => {
    if (!CAPAROL_UNLOCK_IDS.has(product.id)) return product;
    if (product.status !== "published") return product;
    if (!meetsSeoThreshold(product)) return product;
    if (product.indexable === true) return product;
    return { ...product, indexable: true };
  });
}

export function applyCaparolV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = unlockCaparolProductIndexability(
    applyProductProfessionalDescriptionEnrichments(
      applyProductDescriptionEnrichments(products, caparolDescriptions),
      caparolProfessionalDescriptions,
    ),
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, caparolSources),
    relations: mergeRelationsByCanonicalKey(relations, caparolRelations),
  };
}
