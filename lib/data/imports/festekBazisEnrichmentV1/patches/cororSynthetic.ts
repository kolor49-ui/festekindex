import type { ProductEnrichmentPatch } from "../types";

const PAGE = "src_coror_synthetic";

/** Product page confirms identity; detailed TDS HTML not extractable in this phase. */
export const cororSyntheticPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_synthetic",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-szintetikus-higito-p-461",
  productClass: "thinner",
  additionalSourceIds: [PAGE],
};
