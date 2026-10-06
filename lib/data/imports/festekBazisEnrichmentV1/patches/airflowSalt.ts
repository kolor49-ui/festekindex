import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_airflow_salt";
const TDS = "src_valmor_airflow_salt_tds";

/** Additive unit kg_per_m2 used — source states Kg/m2; no conversion to g/m2. */
export const airflowSaltPatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_airflow_salt",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-soglett-p-354",
  productClass: "filler",
  sourceSummary:
    "VALMOR AIR FLOW Sóglett törtfehér porkeverék, vízzel keverve beltéri rusztikus felületképző anyag. A műszaki adatlap szerint mész- vagy cementkötésű ásványi vakolatra hordható fel glettvassal; gipszkarton önmagában nem alkalmas. Dokumentált anyagfelhasználás 1,4–1,5 kg/m² 1 mm rétegvastagsághoz; kiszerelés 8,5 kg.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    {
      id: "pack_valmor_airflow_salt_8_5kg",
      amount: 8.5,
      unit: "kg",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
  specifications: [
    {
      key: "consumption",
      value: { kind: "range_unit", min: 1.4, max: 1.5, unit: "kg_per_m2" },
      condition: { note: "1 mm rétegvastagsághoz" },
      rawValue: "Kiadósság: 1 mm rétegvastagsághoz 1,4-1,5 Kg/m2",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: { kind: "duration", value: 1, unit: "day" },
      condition: { note: "1 mm rétegvastagság; páratartalom függvényében" },
      rawValue: "Teljes száradási idő: 1mm 1 nap, … a levegő és a páratartalom függvényében",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: { kind: "duration", value: 6, unit: "day" },
      condition: { note: "6 mm rétegvastagság; kb.; páratartalom függvényében" },
      rawValue: "6mm kb. 6 nap, a levegő és a páratartalom függvényében",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "gloss",
      value: { kind: "enum", value: "matt" },
      rawValue: "Fényesség: matt",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "application_environment",
      value: { kind: "enum", value: "interior" },
      rawValue: "beltéri … felületképző anyag",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
