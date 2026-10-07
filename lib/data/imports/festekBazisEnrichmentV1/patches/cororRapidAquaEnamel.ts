import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-07";
const PAGE = "src_coror_rapid_aqua_enamel";
const TDS = "src_coror_rapid_aqua_enamel_tds";

export const cororRapidAquaEnamelPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_rapid_aqua_enamel",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-aqua-zomancfestek-p-460",
  productClass: "industrial_coating",
  sourceSummary:
    "COROR Rapid Aqua Zománcfesték vizes bázisú, selyemmatt, korróziógátló adalékot tartalmazó alapozó és fedőfesték bel- és kültérre. A műszaki adatlap szerint akril–uretán hibrid kötőanyagú; kiadósság 9–11 m²/l rétegenként; porszáraz 30 perc. Hígítás és szerszámtisztítás vízzel; felhordás ecsettel, hengerrel vagy szórással.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    {
      id: "pack_coror_rapid_aqua_enamel_0_25l",
      amount: 0.25,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_coror_rapid_aqua_enamel_0_75l",
      amount: 0.75,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_coror_rapid_aqua_enamel_2_5l",
      amount: 2.5,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "range_unit", min: 9, max: 11, unit: "m2_per_l" },
      condition: { basis: "per_coat" },
      rawValue: "Kiadósság: 9-11 m2/liter rétegenként",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: { kind: "duration", value: 30, unit: "min" },
      rawValue: "30 perc porszáraz",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "recoat_time",
      value: { kind: "duration", value: 2, unit: "h" },
      condition: { note: "önmagával; „száraz”" },
      rawValue: "2 óra száraz / átfesthetőség",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: { kind: "text", text: "vízzel" },
      rawValue: "Hígítás, szerszámtisztítás közvetlen használat után: Vízzel",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "coat_count",
      value: { kind: "range", min: 2, max: 3 },
      rawValue: "Javasolt rétegszám 2-3 réteg",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "gloss",
      value: { kind: "enum", value: "silk_matt" },
      rawValue: "Fényesség: selyem-matt",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "binder",
      value: { kind: "text", text: "akril és uretán hibrid" },
      rawValue:
        "Akril és uretán hibrid kötőanyag kombinációjának köszönhetően…",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "application_environment",
      value: { kind: "multi_enum", values: ["interior", "exterior"] },
      rawValue: "kül-, és beltérben egyaránt",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
