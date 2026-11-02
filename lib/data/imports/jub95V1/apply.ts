/**
 * Apply JUB 95 PASS overlay without touching Festék Bázis HOLD or PPG42 files.
 * After enrichment, unlock indexable when SEO text thresholds pass (FB-parity gated in tests).
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { jub95Descriptions } from "./descriptions";
import { jub95ProfessionalDescriptions } from "./professionalDescriptions";
import { jub95Relations } from "./relations";
import { jub95Sources } from "./sources";
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

const JUB_UNLOCK_IDS = new Set(jub95Descriptions.map((d) => d.productId));

function meetsSeoThreshold(product: Product): boolean {
  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (product.sourceIds.length < 1 && body.length < 220) return false;
  return true;
}

function unlockJubProductIndexability(products: Product[]): Product[] {
  return products.map((product) => {
    if (!JUB_UNLOCK_IDS.has(product.id)) return product;
    if (product.status !== "published") return product;
    if (!meetsSeoThreshold(product)) return product;
    if (product.indexable === true) return product;
    return { ...product, indexable: true };
  });
}

export function applyJub95V1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = unlockJubProductIndexability(
    applyProductProfessionalDescriptionEnrichments(
      applyProductDescriptionEnrichments(products, jub95Descriptions),
      jub95ProfessionalDescriptions,
    ),
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, jub95Sources),
    relations: mergeRelationsByCanonicalKey(relations, jub95Relations),
  };
}
