import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_factor_aqua_primer";
const TDS = "src_factor_aqua_primer_tds";

export const factorAquaPrimerPatch: ProductEnrichmentPatch = {
  productId: "prod_factor_aqua_primer",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-aqua-impregnalo-alapozo-p-324",
  productClass: "primer",
  sourceSummary:
    "FACTOR Aqua Impregnáló Alapozó oldószermentes, vizes bázisú faalapozó bel- és kültérre. A műszaki adatlap szerint akril-emulzió kötőanyagú; felhordás ecsettel vagy hengerrel (mártás a termékoldalon). Dokumentált kiadósság 12–14 m²/l egy rétegben; átvonhatóság 4 óra (25 °C). Hígítani nem szabad.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_factor_aqua_primer_0_75l", amount: 0.75, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
    { id: "pack_factor_aqua_primer_2_5l", amount: 2.5, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "range_unit", min: 12, max: 14, unit: "m2_per_l" },
      condition: { basis: "per_coat" },
      rawValue: "Kiadósság: 12-14 m2/liter egy rétegben",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "recoat_time",
      value: { kind: "duration", value: 4, unit: "h" },
      condition: { temperatureC: 25 },
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
      value: { kind: "text", text: "hígítani nem szabad" },
      rawValue: "A termék felhasználásra kész, hígítani nem szabad.",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "coat_count",
      value: { kind: "number", value: 1 },
      rawValue: "Javasolt rétegszám 1 réteg",
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
      value: { kind: "text", text: "akril-emulzió" },
      rawValue: "Összetétel: Víz, akril-emulzió, adalékok",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "application_environment",
      value: { kind: "multi_enum", values: ["interior", "exterior"] },
      rawValue: "bel- és kültéri",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
