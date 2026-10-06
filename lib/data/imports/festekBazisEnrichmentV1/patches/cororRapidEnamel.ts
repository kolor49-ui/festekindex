import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_coror_rapid_enamel";
const TDS = "src_coror_rapid_enamel_tds";

export const cororRapidEnamelPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_rapid_enamel",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-zomancfestek-p-332",
  productClass: "industrial_coating",
  sourceSummary:
    "COROR Rapid Zománcfesték oldószeres, selyemfényű, korróziógátló adalékot tartalmazó zománc bel- és kültérre. A műszaki adatlap szerint uretanizált alkid kötőanyagú; többek között acélra, alumíniumra, fára, betonra és vakolatra alkalmazható. Dokumentált kiadósság 9–11 m²/l egy rétegben; porszáraz 30 perc (25 °C). Hígítás elsősorban COROR Szintetikus Hígítóval.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_coror_rapid_enamel_0_25l", amount: 0.25, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
    { id: "pack_coror_rapid_enamel_0_75l", amount: 0.75, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
    { id: "pack_coror_rapid_enamel_2_5l", amount: 2.5, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
    { id: "pack_coror_rapid_enamel_5l", amount: 5, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
    { id: "pack_coror_rapid_enamel_10l", amount: 10, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
    { id: "pack_coror_rapid_enamel_20l", amount: 20, unit: "l", sourceIds: [TDS, PAGE], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "range_unit", min: 9, max: 11, unit: "m2_per_l" },
      condition: { basis: "per_coat" },
      rawValue: "Kiadósság: 9-11 m2/liter egy rétegben",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: { kind: "duration", value: 30, unit: "min" },
      condition: { temperatureC: 25 },
      rawValue: "30 perc porszáraz (25 °C)",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "recoat_time",
      value: { kind: "duration", value: 2, unit: "h" },
      condition: { temperatureC: 25, note: "önmagával; „száraz”" },
      rawValue: "2 óra száraz / átfesthetőség önmagával (25 °C)",
      sourceIds: [TDS, PAGE],
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
      value: {
        kind: "text",
        text: "COROR Szintetikus Hígító; alternatíva: lakkbenzin, nitrohígító",
      },
      rawValue:
        "Elsősorban Coror Szintetikus Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.",
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
      key: "coat_count",
      value: { kind: "range", min: 2, max: 3 },
      condition: { note: "rozsdára festés esetén minimum" },
      rawValue: "Rozsdára festés esetén minimum 2-3 réteg felhordása kötelező.",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "gloss",
      value: { kind: "enum", value: "satin" },
      rawValue: "Fényesség: selyemfényű",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "binder",
      value: { kind: "text", text: "uretánizált alkid" },
      rawValue: "Uretanizált alkid kötőanyagának köszönhetően…",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "application_environment",
      value: { kind: "multi_enum", values: ["interior", "exterior"] },
      rawValue: "kül- és beltérben",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
};
