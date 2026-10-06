import type { ProductEnrichmentPatch } from "../types";

const PAGE = "src_coror_aromatic";

/**
 * Composition ("aromás szénhidrogének keveréke") is NOT binder semantics.
 * No replacement specification key in this fix — structured binder removed.
 */
export const cororAromaticPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_aromatic",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-aromas-higito-p-335",
  productClass: "thinner",
  sourceSummary:
    "COROR Aromás Hígító nagy tisztaságú, vízmentes aromás szénhidrogén hígító. A hivatalos termékoldal szerint a COROR Rapid Korróziógátló Alapozó és más megnevezett termékek felhordási konzisztenciájának beállítására szolgál; zsírtalanításra és szerszámtisztításra is.",
  sourceSummarySourceIds: [PAGE],
  additionalSourceIds: [PAGE],
  packagingOptions: [],
  specifications: [],
};
