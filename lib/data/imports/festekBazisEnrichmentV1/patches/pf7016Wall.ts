import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_7016_wall";
const TDS = "src_7016_wall_tds";

/** Official pages omit ™; repository keeps 7016™ identity — IDENTITY REVIEW if rename considered. */
export const pf7016WallPatch: ProductEnrichmentPatch = {
  productId: "prod_7016_wall",
  officialUrl:
    "https://www.festekbazis.hu/hu/webaruhaz-7016-7016-antracit-egyretegu-belteri-falfestek-p-340",
  productClass: "architectural_coating",
  sourceSummary:
    "7016 Antracit Egyrétegű Beltéri Falfesték matt beltéri falfesték. A gyártói termékoldal és műszaki adatlap szerint vakolatra és glettelt felületekre alkalmazható; felhordás ecsettel, hengerrel vagy szórással. Dokumentált kiadósság 10–11 m²/l glettelt felületen; átvonhatóság 4 óra (25 °C). Kiszerelés 1 l és 2,5 l.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_7016_wall_1l", amount: 1, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
    { id: "pack_7016_wall_2_5l", amount: 2.5, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "range_unit", min: 10, max: 11, unit: "m2_per_l" },
      condition: { note: "glettelt minőségű felület esetén" },
      rawValue: "Kiadósság: 10-11 m2/liter, glettelt minőségű felület esetén",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "recoat_time",
      value: { kind: "duration", value: 4, unit: "h" },
      condition: { temperatureC: 25 },
      rawValue: "Átfesthetőségi idő: (25 °C–on): 4 óra",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "percentage", value: 10 },
      condition: { note: "első réteg; maximum; víz" },
      rawValue: "hígításképpen maximum 10%-ban vizet adhatunk hozzá",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "percentage", value: 5 },
      condition: { note: "fedőréteg; maximum; víz" },
      rawValue: "fedőfestést max. 5% víz hozzáadásával végezzük",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "coat_count",
      value: { kind: "range", min: 1, max: 2 },
      rawValue: "Javasolt rétegszám: 1 vagy 2 réteg",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "gloss",
      value: { kind: "enum", value: "matt" },
      rawValue: "Matt (termékoldal tulajdonság)",
      sourceIds: [PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "application_environment",
      value: { kind: "enum", value: "interior" },
      rawValue: "Beltéri Falfesték",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
