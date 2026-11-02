/**
 * Apply Baumit HU PASS+REVIEW overlay. HOLD excluded at codegen.
 * After enrichment, unlock indexable when SEO text thresholds pass (FB-parity gated in tests).
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
import {
  productSeoBodyText,
  productSeoShortText,
} from "@/lib/seo/productSeoText";

const BAUMIT_UNLOCK_IDS = new Set(baumitDescriptions.map((d) => d.productId));

function meetsSeoThreshold(product: Product): boolean {
  const short = productSeoShortText(product);
  const body = productSeoBodyText(product);
  if (short.length < 40) return false;
  if (body.length < 120) return false;
  if (product.sourceIds.length < 1 && body.length < 220) return false;
  return true;
}

function unlockBaumitProductIndexability(products: Product[]): Product[] {
  return products.map((product) => {
    if (!BAUMIT_UNLOCK_IDS.has(product.id)) return product;
    if (product.status !== "published") return product;
    if (!meetsSeoThreshold(product)) return product;
    if (product.indexable === true) return product;
    return { ...product, indexable: true };
  });
}

export function applyBaumitV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = unlockBaumitProductIndexability(
    applyProductProfessionalDescriptionEnrichments(
      applyProductDescriptionEnrichments(products, baumitDescriptions),
      baumitProfessionalDescriptions,
    ),
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, baumitSources),
    relations: mergeRelationsByCanonicalKey(relations, baumitRelations),
  };
}
