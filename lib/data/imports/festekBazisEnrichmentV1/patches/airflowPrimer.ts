import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_airflow_primer";
const TDS = "src_valmor_airflow_primer_tds";

export const airflowPrimerPatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_airflow_primer",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-lelegzo-melyalapozo-1-1-p-322",
  productClass: "primer",
  sourceSummary:
    "VALMOR AIR FLOW Lélegző Mélyalapozó 1:1 oldószermentes, bel- és kültéri mélyalapozó magas páraáteresztő képességgel. A műszaki adatlap szerint nedvszívó ásványi felületekre (vakolat, gipszkarton) ajánlott; felhordás ecsettel vagy hengerrel. Dokumentált kiadósság 8–10 m²/l egy rétegben hígítva (glettelt felület), átvonhatóság minimum 2 óra (25 °C).",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    {
      id: "pack_valmor_airflow_primer_1l",
      amount: 1,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_valmor_airflow_primer_5l",
      amount: 5,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "range_unit", min: 8, max: 10, unit: "m2_per_l" },
      condition: {
        basis: "per_coat",
        note: "egy rétegben hígítva; glettelt minőségű felület",
      },
      rawValue:
        "Kiadósság: 8-10 m2/liter egy rétegben hígítva, glettelt minőségű felület esetén",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "recoat_time",
      value: { kind: "duration", value: 2, unit: "h" },
      condition: { temperatureC: 25, note: "minimum; átfesthetőség önmagával" },
      rawValue:
        "Átfesthetőségi idő: min. 2 óra, a száradási időt a levegő, illetve a felület magas páratartalma több órával is meghosszabbíthatja.",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "text", text: "nem kötelező; maximum 1:1 vízzel" },
      condition: { note: "alapfelület szívóképességétől függően; hígítószer: víz" },
      rawValue:
        "Az alapozót nem szükséges hígítani, de … hígíthatjuk maximum ugyanannyi víz hozzáadásával 1:1 arányban.",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "coat_count",
      value: { kind: "range", min: 1, max: 2 },
      rawValue: "Javasolt rétegszám 1-2 réteg",
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
      value: { kind: "multi_enum", values: ["interior", "exterior"] },
      rawValue: "bel- és kültéri felhasználásra alkalmas",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
