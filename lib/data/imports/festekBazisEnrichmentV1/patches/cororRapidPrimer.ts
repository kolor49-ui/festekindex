import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_coror_rapid_primer";
const TDS = "src_coror_rapid_primer_tds";

export const cororRapidPrimerPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_rapid_primer",
  officialUrl:
    "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-korroziogatlo-alapozo-p-331",
  productClass: "primer",
  sourceSummary:
    "COROR Rapid Korróziógátló Alapozó oldószeres, matt, bel- és kültéri fémalapozó. A műszaki adatlap szerint uretanizált alkid kötőanyagú; acélra, alumíniumra, horganyzottra és rézre alkalmazható. Dokumentált kiadósság 12–13 m²/l 40 μm száraz rétegvastagság esetén; érintésszáraz 20 perc (25 °C). Hígítás elsősorban COROR Szintetikus vagy Aromás Hígítóval.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    {
      id: "pack_coror_rapid_primer_0_25l",
      amount: 0.25,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_coror_rapid_primer_0_75l",
      amount: 0.75,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_coror_rapid_primer_2_5l",
      amount: 2.5,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_coror_rapid_primer_4_5l",
      amount: 4.5,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      id: "pack_coror_rapid_primer_20l",
      amount: 20,
      unit: "l",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
  ],
  specifications: [
    {
      key: "coverage",
      value: { kind: "range_unit", min: 12, max: 13, unit: "m2_per_l" },
      condition: { note: "40 μm száraz rétegvastagság esetén" },
      rawValue: "Kiadósság: 12-13 m2/liter 40 μm száraz rétegvastagság esetén",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "touch_dry_time",
      value: { kind: "duration", value: 20, unit: "min" },
      condition: { temperatureC: 25 },
      rawValue:
        "Coror Szintetikus és Aromás Hígítóval vagy hígítás nélkül (25 °C-on): 20 perc – érintésszáraz",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: { kind: "duration", value: 1, unit: "h" },
      condition: { temperatureC: 25, note: "maximum; 1. száradási fokozat" },
      rawValue: "Száradási idő: 25°C-on 1.fokozat max. 1 óra",
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
      key: "recoat_time",
      value: { kind: "duration", value: 2, unit: "h" },
      condition: {
        temperatureC: 25,
        note: "önmagával; Szintetikus/Aromás hígítóval vagy hígítás nélkül; „száraz”",
      },
      rawValue: "2 óra – száraz (átfesthetőség önmagával, 25 °C)",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "dilution",
      value: {
        kind: "text",
        text: "COROR Szintetikus vagy Aromás Hígító; alternatíva: lakkbenzin, nitrohígító",
      },
      rawValue:
        "Elsősorban Coror Szintetikus és Aromás Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.",
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
      value: { kind: "enum", value: "matt" },
      rawValue: "Fényesség: matt",
      sourceIds: [TDS, PAGE],
      verifiedAt: V,
      status: "verified",
    },
    {
      key: "binder",
      value: { kind: "text", text: "uretánizált alkid" },
      note: "Műszaki adatlap összetétel: Alkidgyanta; page: uretanizált alkid kötőanyag",
      rawValue: "Uretanizált alkid kötőanyagának köszönhetően… Összetétel: Alkidgyanta…",
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
