/**
 * Apply PPG Trilak 42 PASS overlay without touching Festék Bázis HOLD enrichment files.
 * After enrichment, unlock indexable when SEO text thresholds pass (FB-parity gated in tests).
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
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

const PPG_UNLOCK_IDS = new Set(
  ppgTrilak42Descriptions.map((d) => d.productId),
);

function meetsSeoThreshold(product: Product): boolean {
  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (product.sourceIds.length < 1 && body.length < 220) return false;
  return true;
}

function unlockPpgProductIndexability(products: Product[]): Product[] {
  return products.map((product) => {
    if (!PPG_UNLOCK_IDS.has(product.id)) return product;
    if (product.status !== "published") return product;
    if (!meetsSeoThreshold(product)) return product;
    if (product.indexable === true) return product;
    return { ...product, indexable: true };
  });
}

export function applyPpgTrilak42V1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = unlockPpgProductIndexability(
    applyProductProfessionalDescriptionEnrichments(
      applyProductDescriptionEnrichments(products, ppgTrilak42Descriptions),
      ppgTrilak42ProfessionalDescriptions,
    ),
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, ppgTrilak42Sources),
    relations: mergeRelationsByCanonicalKey(relations, ppgTrilak42Relations),
  };
}
