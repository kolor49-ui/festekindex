/**
 * Product SEO quality text — shared by indexability + FB unlock apply.
 * Kept free of repository/allRelations imports to avoid circular deps.
 */

import type { Product } from "@/lib/data/types";

/** Public lead text used on Product hubs. */
export function productSeoShortText(product: Product): string {
  return (
    product.editorialSummary?.trim() ||
    product.shortDescription?.trim() ||
    ""
  );
}

/** Public body / Termékleírás text used for SEO quality thresholds. */
export function productSeoBodyText(product: Product): string {
  const professional = (product.professionalDescription?.sections ?? [])
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .trim();
  return (
    professional ||
    product.sourceSummary?.trim() ||
    product.body?.trim() ||
    ""
  );
}
