import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_airflow_interior";
const TDS = "src_valmor_airflow_interior_tds";
const SDS = "src_valmor_airflow_interior_sds";

export const airflowInteriorPatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_airflow_interior",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-lelegzo-belteri-falfestek-p-319",
  productClass: "architectural_coating",
  sourceSummary:
    "VALMOR AIR FLOW Lélegző Beltéri Falfesték diszperziós jellegű, matt beltéri falfesték, magas páraáteresztő képességgel. A gyártói műszaki adatlap szerint vakolatra, betonra és gipszkartonra alkalmazható; felhordás ecsettel, hengerrel vagy szórással. Dokumentált kiadósság 4–5 m²/l két rétegben (fehér, glettelt felület), átvonhatóság 4 óra (25 °C).",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS, SDS],
  packagingOptions: [
    {
      id: "pack_valmor_airflow_interior_5l",
      amount: 5,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_valmor_airflow_interior_10l",
      amount: 10,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "range_unit", min: 4, max: 5, unit: "m2_per_l" },
      condition: { basis: "per_system", note: "két réteg; fehér, glettelt felület" },
      rawValue:
        "Kiadósság: 4-5 m2/liter két rétegben, fehér, glettelt minőségű felület esetén",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "recoat_time",
      value: { kind: "duration", value: 4, unit: "h" },
      condition: { temperatureC: 25 },
      note: "Átfesthetőség önmagával; magas páratartalom hosszabbíthatja.",
      rawValue: "Átfesthetőségi idő: (25 °C-on): 4 óra",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: { kind: "duration", value: 2, unit: "h" },
      condition: { temperatureC: 25, note: "maximum; 1. száradási fokozat" },
      rawValue: "Száradási idő: 25°C-on 1.fokozat max. 2 óra",
      sourceIds: [TDS],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: { kind: "duration", value: 24, unit: "h" },
      condition: { temperatureC: 25, note: "maximum; 5. száradási fokozat" },
      rawValue: "Száradási idő: 25°C-on 5.fokozat max. 24 óra",
      sourceIds: [TDS],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "percentage", value: 10 },
      condition: { note: "első réteg; hígítószer: víz; maximum" },
      rawValue: "hígításképpen maximum 10%-ban vizet adhatunk hozzá",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "percentage", value: 5 },
      condition: { note: "fedőréteg; hígítószer: víz; maximum" },
      rawValue: "fedőfestést max. 5% víz hozzáadásával végezzük",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "coat_count",
      value: { kind: "number", value: 2 },
      rawValue: "Javasolt rétegszám: 2 réteg",
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
      key: "binder",
      value: { kind: "text", text: "diszperziós" },
      note: "Műszaki adatlap: diszperziós jellegű; nem következett akril.",
      rawValue: "diszperziós jellegű matt, hófehér légáteresztő beltéri falfesték",
      sourceIds: [TDS],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "application_environment",
      value: { kind: "enum", value: "interior" },
      rawValue: "beltéri falfesték",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
