/**
 * Apply Remmers PASS+REVIEW overlay. HOLD excluded at codegen.
 * After enrichment, unlock indexable when SEO text thresholds pass (FB-parity gated in tests).
 * Thin SKUs stay noindex.
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
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

const REMMERS_UNLOCK_IDS = new Set(
  remmersDescriptions.map((d) => d.productId),
);

function meetsSeoThreshold(product: Product): boolean {
  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (product.sourceIds.length < 1 && body.length < 220) return false;
  return true;
}

function unlockRemmersProductIndexability(products: Product[]): Product[] {
  return products.map((product) => {
    if (!REMMERS_UNLOCK_IDS.has(product.id)) return product;
    if (product.status !== "published") return product;
    if (!meetsSeoThreshold(product)) return product;
    if (product.indexable === true) return product;
    return { ...product, indexable: true };
  });
}

export function applyRemmersV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = unlockRemmersProductIndexability(
    applyProductProfessionalDescriptionEnrichments(
      applyProductDescriptionEnrichments(products, remmersDescriptions),
      remmersProfessionalDescriptions,
    ),
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, remmersSources),
    relations: mergeRelationsByCanonicalKey(relations, remmersRelations),
  };
}
