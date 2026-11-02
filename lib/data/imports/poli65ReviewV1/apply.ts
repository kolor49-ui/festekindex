/**
 * Apply Poli-Farbe 65 REVIEW overlay without touching HOLD, PPG42, JUB, or poli6 PASS files.
 * After enrichment, unlock indexable when SEO text thresholds pass (FB-parity gated in tests).
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { poli65ReviewDescriptions } from "./descriptions";
import { poli65ReviewProfessionalDescriptions } from "./professionalDescriptions";
import { poli65ReviewRelations } from "./relations";
import { poli65ReviewSources } from "./sources";
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

const POLI65_UNLOCK_IDS = new Set(
  poli65ReviewDescriptions.map((d) => d.productId),
);

function meetsSeoThreshold(product: Product): boolean {
  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (product.sourceIds.length < 1 && body.length < 220) return false;
  return true;
}

function unlockPoli65ProductIndexability(products: Product[]): Product[] {
  return products.map((product) => {
    if (!POLI65_UNLOCK_IDS.has(product.id)) return product;
    if (product.status !== "published") return product;
    if (!meetsSeoThreshold(product)) return product;
    if (product.indexable === true) return product;
    return { ...product, indexable: true };
  });
}

export function applyPoli65ReviewV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = unlockPoli65ProductIndexability(
    applyProductProfessionalDescriptionEnrichments(
      applyProductDescriptionEnrichments(products, poli65ReviewDescriptions),
      poli65ReviewProfessionalDescriptions,
    ),
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, poli65ReviewSources),
    relations: mergeRelationsByCanonicalKey(relations, poli65ReviewRelations),
  };
}
