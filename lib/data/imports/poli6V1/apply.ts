/**
 * Apply Poli-Farbe 6 PASS overlay without touching Festék Bázis HOLD, PPG42, or JUB files.
 * After enrichment, unlock indexable when SEO text thresholds pass (FB-parity gated in tests).
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
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

const POLI6_UNLOCK_IDS = new Set(poli6Descriptions.map((d) => d.productId));

function meetsSeoThreshold(product: Product): boolean {
  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (product.sourceIds.length < 1 && body.length < 220) return false;
  return true;
}

function unlockPoli6ProductIndexability(products: Product[]): Product[] {
  return products.map((product) => {
    if (!POLI6_UNLOCK_IDS.has(product.id)) return product;
    if (product.status !== "published") return product;
    if (!meetsSeoThreshold(product)) return product;
    if (product.indexable === true) return product;
    return { ...product, indexable: true };
  });
}

export function applyPoli6V1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = unlockPoli6ProductIndexability(
    applyProductProfessionalDescriptionEnrichments(
      applyProductDescriptionEnrichments(products, poli6Descriptions),
      poli6ProfessionalDescriptions,
    ),
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, poli6Sources),
    relations: mergeRelationsByCanonicalKey(relations, poli6Relations),
  };
}
