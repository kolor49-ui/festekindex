import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_coror_ind_primer";
const TDS = "src_coror_ind_primer_tds";

export const cororIndPrimerPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_ind_primer",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-industry-p-442",
  productClass: "primer",
  sourceSummary: "COROR Industry Korróziógátló Alapozó gyorsan száradó ipari korróziógátló alapozó vas/acélfelületekre. A műszaki adatlap szerint javasolt 2 réteg; átvonhatóság 12–30 perc; hígítás COROR Industry S-31 Hígítóval. Felhordás ecsettel, hengerrel vagy szórással.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_coror_ind_primer_7kg", amount: 7, unit: "kg", sourceIds: ["src_coror_ind_primer_tds", "src_coror_ind_primer"], verifiedAt: V, status: "verified" },
    { id: "pack_coror_ind_primer_30kg", amount: 30, unit: "kg", sourceIds: ["src_coror_ind_primer_tds", "src_coror_ind_primer"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "recoat_time",
      value: {"kind":"duration_range","min":12,"max":30,"unit":"min"},
      condition: {"note":"hőmérséklet- és páratartalom-függő"},
      rawValue: "rétegek között 12-30 perc száradási idő",
      sourceIds: ["src_coror_ind_primer_tds","src_coror_ind_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"text","text":"COROR Industry S-31 Hígítóval"},
      rawValue: "Hígítás: COROR INDUSTRY S-31 Hígítóval",
      sourceIds: ["src_coror_ind_primer_tds","src_coror_ind_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"number","value":2},
      rawValue: "Javasolt rétegszám 2 réteg",
      sourceIds: ["src_coror_ind_primer_tds","src_coror_ind_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"matt"},
      rawValue: "Fényesség: matt",
      sourceIds: ["src_coror_ind_primer_tds","src_coror_ind_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "kül- és beltérben",
      sourceIds: ["src_coror_ind_primer_tds","src_coror_ind_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
