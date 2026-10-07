import type { ProductEnrichmentPatch } from "../types";

const PAGE = "src_coror_synthetic";
const TDS = "src_coror_synthetic_tds";

/** Official product page + TDS (description overlay supplies summaries). */
export const cororSyntheticPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_synthetic",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-szintetikus-higito-p-461",
  productClass: "thinner",
  additionalSourceIds: [PAGE, TDS],
};
