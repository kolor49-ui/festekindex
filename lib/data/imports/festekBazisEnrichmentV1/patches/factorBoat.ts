import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_factor_boat";
const TDS = "src_factor_boat_tds";

export const factorBoatPatch: ProductEnrichmentPatch = {
  productId: "prod_factor_boat",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-csonaklakk-p-343",
  productClass: "varnish",
  sourceSummary: "FACTOR Csónaklakk oldószeres alkid–poliuretán lakk bel- és kültérre. A műszaki adatlap szerint kiadósság 12–14 m²/l egy rétegben; fényesség fényes; rétegek között 8 óra, alapozóréteg után 5 óra. Hígítás COROR Szintetikus Hígítóval (kb. 5%).",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_factor_boat_0_75l", amount: 0.75, unit: "l", sourceIds: ["src_factor_boat_tds", "src_factor_boat"], verifiedAt: V, status: "verified" },
    { id: "pack_factor_boat_2_5l", amount: 2.5, unit: "l", sourceIds: ["src_factor_boat_tds", "src_factor_boat"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":12,"max":14,"unit":"m2_per_l"},
      condition: {"basis":"per_coat"},
      rawValue: "Kiadósság: 12-14 m2/liter egy rétegben",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":8,"unit":"h"},
      condition: {"temperatureC":25,"note":"rétegek közötti várakozási idő"},
      rawValue: "rétegek közötti várakozási idő 8 óra",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":5,"unit":"h"},
      condition: {"temperatureC":25,"note":"alapozóréteg után"},
      rawValue: "Alapozóréteg 5 óra",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage","value":5},
      condition: {"note":"kb.; COROR Szintetikus Hígító; felhordási konzisztencia"},
      rawValue: "kb. 5% mértékben hígítót",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"range","min":1,"max":3},
      rawValue: "Javasolt rétegszám 1-3 réteg",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"gloss"},
      rawValue: "Fényesség: fényes",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "binder",
      value: {"kind":"text","text":"uretanizált alkidgyanta"},
      rawValue: "Összetétel: Uretanizált alkydgyanta, oldószerek, adalékok",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "kül- és beltérben egyaránt felhasználható",
      sourceIds: ["src_factor_boat_tds","src_factor_boat"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
