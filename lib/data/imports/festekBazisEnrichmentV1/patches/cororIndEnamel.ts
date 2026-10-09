import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_coror_ind_enamel";
const TDS = "src_coror_ind_enamel_tds";

export const cororIndEnamelPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_ind_enamel",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-indrusty-ipari-zomanc-p-444",
  productClass: "industrial_coating",
  // Binder withheld: same TDS conflicts „módosított alkid-akril bázisú” vs „Összetétel: módosított poliészter” — UNRESOLVED ≠ verified.
  sourceSummary: "COROR Industry Ipari Zománc ipari fedőzománc. A műszaki adatlap szerint anyagszükséglet 20–25 g/m² / 10 µm száraz; átvonhatóság 0,5 óra (25 °C); teljes száradás 2 óra. Hígítás COROR Industry S-31 Hígítóval.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_coror_ind_enamel_5_1kg", amount: 5.1, unit: "kg", sourceIds: ["src_coror_ind_enamel_tds", "src_coror_ind_enamel"], verifiedAt: V, status: "verified" },
    { id: "pack_coror_ind_enamel_6kg", amount: 6, unit: "kg", sourceIds: ["src_coror_ind_enamel_tds", "src_coror_ind_enamel"], verifiedAt: V, status: "verified" },
    { id: "pack_coror_ind_enamel_21_25kg", amount: 21.25, unit: "kg", sourceIds: ["src_coror_ind_enamel_tds", "src_coror_ind_enamel"], verifiedAt: V, status: "verified" },
    { id: "pack_coror_ind_enamel_25kg", amount: 25, unit: "kg", sourceIds: ["src_coror_ind_enamel_tds", "src_coror_ind_enamel"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "consumption",
      value: {"kind":"range_unit","min":20,"max":25,"unit":"g_per_m2"},
      condition: {"note":"10 µm száraz rétegvastagság; színtől függően"},
      rawValue: "Kiadósság: 20-25g/m2/10mikron száraz, színtől függően",
      sourceIds: ["src_coror_ind_enamel_tds","src_coror_ind_enamel"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: {"kind":"duration","value":12,"unit":"min"},
      condition: {"temperatureC":25,"note":"1. száradási fokozat"},
      sourceIds: ["src_coror_ind_enamel_tds"],
      rawValue: "Száradási idő: 25°C-on 1.fokozat 12 perc",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration","value":2,"unit":"h"},
      condition: {"temperatureC":25},
      note: "Műszaki adatlap: Teljes száradási idő 2 óra; 5. fokozat 60 perc",
      sourceIds: ["src_coror_ind_enamel_tds"],
      rawValue: "Teljes száradási idő 2 óra",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":0.5,"unit":"h"},
      condition: {"temperatureC":25},
      rawValue: "Átfesthetőség: 25 Celsius fokon 0,5 óra",
      sourceIds: ["src_coror_ind_enamel_tds","src_coror_ind_enamel"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"text","text":"COROR Industry S-31 Hígítóval (felhordási konzisztenciára)"},
      rawValue: "Hígítás: COROR INDUSTRY S-31 Hígítóval",
      sourceIds: ["src_coror_ind_enamel_tds","src_coror_ind_enamel"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"number","value":2},
      rawValue: "Javasolt rétegszám 2 réteg",
      sourceIds: ["src_coror_ind_enamel_tds","src_coror_ind_enamel"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"satin"},
      rawValue: "Fényesség: selyemfényű",
      sourceIds: ["src_coror_ind_enamel_tds","src_coror_ind_enamel"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "kül- és beltérben",
      sourceIds: ["src_coror_ind_enamel_tds","src_coror_ind_enamel"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
