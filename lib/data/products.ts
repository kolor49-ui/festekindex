import type { Product } from "./types";

/**
 * Concrete commercial products / SKUs — empty until Festék Bázis (and later) import.
 * Brand/Family/Surface/Technology links live in relations only (no belongsToBrand FK).
 * Example later: COROR Rapid Zománcfesték under pf_coror_rapid via hasProduct.
 */
export const products: Product[] = [];
