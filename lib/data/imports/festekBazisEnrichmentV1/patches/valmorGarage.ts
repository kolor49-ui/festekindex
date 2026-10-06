import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_garage";
const TDS = "src_valmor_garage_tds";

export const valmorGaragePatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_garage",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-garazsfestek-p-305",
  productClass: "architectural_coating",
  sourceSummary: "VALMOR Garázsfesték oldószeres, selyemfényű bel- és kültéri padló-/garázsfesték (uretán-alkid). A műszaki adatlap szerint kiadósság 3–4 m²/l alapozás + két réteg; átvonhatóság 10 óra (25 °C, lépésálló). Hígítás és szerszámtisztítás COROR Szintetikus Hígítóval.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_valmor_garage_0_75l", amount: 0.75, unit: "l", sourceIds: ["src_valmor_garage_tds", "src_valmor_garage"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_garage_2_5l", amount: 2.5, unit: "l", sourceIds: ["src_valmor_garage_tds", "src_valmor_garage"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":3,"max":4,"unit":"m2_per_l"},
      condition: {"basis":"per_system","note":"alapozás + két réteg; glettelt"},
      rawValue: "Kiadósság: 3-4 m2/liter alapozás + két réteg",
      sourceIds: ["src_valmor_garage_tds","src_valmor_garage"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: {"kind":"duration","value":1,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 1. száradási fokozat"},
      sourceIds: ["src_valmor_garage_tds"],
      rawValue: "Száradási idő: 25°C-on 1.fokozat max. 1 óra",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration","value":10,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 5. száradási fokozat"},
      sourceIds: ["src_valmor_garage_tds"],
      rawValue: "Száradási idő: 25°C-on 5.fokozat max. 10 óra",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":10,"unit":"h"},
      condition: {"temperatureC":25,"note":"lépésálló"},
      rawValue: "Átfesthetőség: 10 óra – lépésálló",
      sourceIds: ["src_valmor_garage_tds","src_valmor_garage"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage","value":20},
      condition: {"note":"nedvszívó felület alapozása; COROR Szintetikus Hígító"},
      rawValue: "alapozását 20% Coror Szintetikus Hígító hozzáadásával",
      sourceIds: ["src_valmor_garage_tds","src_valmor_garage"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"range","min":2,"max":3},
      rawValue: "Javasolt rétegszám 2-3 réteg",
      sourceIds: ["src_valmor_garage_tds","src_valmor_garage"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"satin"},
      rawValue: "Fényesség: selyemfényű",
      sourceIds: ["src_valmor_garage_tds","src_valmor_garage"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "binder",
      value: {"kind":"text","text":"uretán-alkid"},
      rawValue: "uretán-alkid bázisú",
      sourceIds: ["src_valmor_garage_tds","src_valmor_garage"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "bel- és kültéri felhasználású",
      sourceIds: ["src_valmor_garage_tds","src_valmor_garage"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
