import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_airflow_facade";
const TDS = "src_valmor_airflow_facade_tds";

export const airflowFacadePatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_airflow_facade",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-homlokzat-es-labazatfestek-p-437",
  productClass: "architectural_coating",
  sourceSummary:
    "VALMOR AIR FLOW Homlokzat és Lábazatfesték módosított vinil kötőanyagú, matt, magas páraáteresztő képességű festék. A műszaki adatlap szerint vakolatra és betonra alkalmazható; felhordás ecsettel, hengerrel vagy szórással. Dokumentált kiadósság 5 m²/l (alapozás + két réteg, glettelt felület), átvonhatóság 4 óra (25 °C).",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    {
      id: "pack_valmor_airflow_facade_1l",
      amount: 1,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_valmor_airflow_facade_4l",
      amount: 4,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_valmor_airflow_facade_8l",
      amount: 8,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_valmor_airflow_facade_15l",
      amount: 15,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "number_unit", value: 5, unit: "m2_per_l" },
      condition: {
        basis: "per_system",
        note: "alapozás + két réteg; glettelt felület",
      },
      rawValue:
        "Kiadósság: 5 m2/liter alapozás + két réteg, glettelt minőségű felület esetén",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "recoat_time",
      value: { kind: "duration", value: 4, unit: "h" },
      condition: { temperatureC: 25 },
      rawValue:
        "Átfesthetőség önmagával, 25°C-on: 4 óra. A száradási időt a levegő, illetve a fal magas páratartalma több órával is meghosszabbíthatja.",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "percentage", value: 20 },
      condition: {
        note: "első réteg; kőporos/erősen nedvszívó/porózus felület; maximum; víz",
      },
      rawValue:
        "Kőporos, erősen nedvszívó, porózus felületek esetén az első réteg festéket maximum 20% vízzel hígítsuk.",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "percentage", value: 10 },
      condition: { note: "korábban festett felület; ajánlott; víz" },
      rawValue: "Korábban festett felületek esetén 10%-os hígítást ajánlunk.",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "percentage_range", min: 5, max: 10 },
      condition: { note: "fedőréteg; víz" },
      rawValue: "fedőfestést 5 - 10% víz hozzáadásával végezzük",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "coat_count",
      value: { kind: "number", value: 2 },
      rawValue: "Javasolt rétegszám 2 réteg",
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
      value: { kind: "text", text: "módosított vinil" },
      rawValue: "módosított vinil kötőanyagú falfesték",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "application_environment",
      value: { kind: "multi_enum", values: ["exterior", "interior"] },
      note: "Homlokzat/lábazat elsődleges; Műszaki adatlap/page: külső illetve belső felújítás is említve.",
      rawValue:
        "homlokzat és lábazat; külső illetve belső felújítási munkálatokhoz",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
