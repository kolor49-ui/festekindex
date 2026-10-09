import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_factor_pergola";
const TDS = "src_factor_pergola_tds";

export const factorPergolaPatch: ProductEnrichmentPatch = {
  productId: "prod_factor_pergola",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-pergola-kulteri-fafestek-p-323",
  productClass: "architectural_coating",
  sourceSummary: "FACTOR Pergola Kültéri Fafesték kültéri faszerkezetek időjárásálló védelmére. A műszaki adatlap szerint kiadósság 4–5 m²/l két rétegben; átvonhatóság 2–4 óra (25 °C); fényesség selyemfényű. Felhordás ecsettel vagy hengerrel; max. 5% vízzel hígítható.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_factor_pergola_0_75l", amount: 0.75, unit: "l", sourceIds: ["src_factor_pergola_tds", "src_factor_pergola"], verifiedAt: V, status: "verified" },
    { id: "pack_factor_pergola_2_5l", amount: 2.5, unit: "l", sourceIds: ["src_factor_pergola_tds", "src_factor_pergola"], verifiedAt: V, status: "verified" },
    { id: "pack_factor_pergola_10l", amount: 10, unit: "l", sourceIds: ["src_factor_pergola_tds", "src_factor_pergola"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":4,"max":5,"unit":"m2_per_l"},
      condition: {"basis":"per_system","note":"2 réteg"},
      rawValue: "Kiadósság: 4-5 m2/liter 2 rétegben",
      sourceIds: ["src_factor_pergola_tds","src_factor_pergola"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration_range","min":2,"max":4,"unit":"h"},
      condition: {"note":"Teljes száradási idő — Műszaki adatlap"},
      rawValue: "Teljes száradási idő: 2-4 óra",
      sourceIds: ["src_factor_pergola_tds","src_factor_pergola"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration_range","min":2,"max":4,"unit":"h"},
      condition: {"temperatureC":25},
      rawValue: "Átfesthetőség: 25 °C-on 2-4 óra",
      sourceIds: ["src_factor_pergola_tds","src_factor_pergola"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage","value":5},
      condition: {"note":"hígítószer: víz; maximum; nem kötelező"},
      rawValue: "hígítása nem szükséges, de lehetséges, maximum 5% víz hozzáadásával",
      sourceIds: ["src_factor_pergola_tds","src_factor_pergola"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"number","value":2},
      rawValue: "Javasolt rétegszám 2 réteg",
      sourceIds: ["src_factor_pergola_tds","src_factor_pergola"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"satin"},
      rawValue: "Fényesség: selyemfényű",
      sourceIds: ["src_factor_pergola_tds","src_factor_pergola"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["exterior"]},
      rawValue: "kültéri fafesték",
      sourceIds: ["src_factor_pergola_tds","src_factor_pergola"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
