import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-07";
const PAGE = "src_coror_ind_s31";
const TDS = "src_coror_ind_s31_tds";

/**
 * Composition (aromás szénhidrogének / n-butil-acetát) is thinner chemistry —
 * NOT binder semantics. No binder specification.
 */
export const cororIndS31Patch: ProductEnrichmentPatch = {
  productId: "prod_coror_ind_s31",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-indrusty-aromas-higito-p-443",
  productClass: "thinner",
  sourceSummary:
    "COROR Industry S-31 Hígító a COROR Industry termékcsalád festékeinek felhordási konzisztencia-beállítására fejlesztett hígító. A hivatalos termékoldal és műszaki adatlap szerint zsírtalanításra, festőszerszámok elmosására és lecsepegett festék eltávolítására is alkalmazható.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    {
      id: "pack_coror_ind_s31_5l",
      amount: 5,
      unit: "l",
      sourceIds: [TDS],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_coror_ind_s31_19l",
      amount: 19,
      unit: "l",
      sourceIds: [TDS],
      verifiedAt: V,
      status: "verified",
    },
  ],
  specifications: [],
};
