import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_factor_aqua_parquet";
const TDS = "src_factor_aqua_parquet_tds";

export const factorAquaParquetPatch: ProductEnrichmentPatch = {
  productId: "prod_factor_aqua_parquet",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-aqua-parkettalakk-p-328",
  productClass: "varnish",
  sourceSummary: "FACTOR Aqua Parkettalakk vizes bázisú beltéri parkettalakk (poliuretán és akrilgyanta). A műszaki adatlap szerint kiadósság 10–12 m²/l egy rétegben; átvonhatóság 4 óra (25 °C); javasolt 2–3 réteg. Felhordás ecsettel, hengerrel vagy szórással.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_factor_aqua_parquet_0_75l", amount: 0.75, unit: "l", sourceIds: ["src_factor_aqua_parquet_tds", "src_factor_aqua_parquet"], verifiedAt: V, status: "verified" },
    { id: "pack_factor_aqua_parquet_2_5l", amount: 2.5, unit: "l", sourceIds: ["src_factor_aqua_parquet_tds", "src_factor_aqua_parquet"], verifiedAt: V, status: "verified" },
    { id: "pack_factor_aqua_parquet_20l", amount: 20, unit: "l", sourceIds: ["src_factor_aqua_parquet_tds", "src_factor_aqua_parquet"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":10,"max":12,"unit":"m2_per_l"},
      condition: {"basis":"per_coat"},
      rawValue: "Kiadósság: 10-12 m2/liter egy rétegben",
      sourceIds: ["src_factor_aqua_parquet_tds","src_factor_aqua_parquet"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: {"kind":"duration","value":2,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 1. száradási fokozat"},
      sourceIds: ["src_factor_aqua_parquet_tds"],
      rawValue: "Száradási idő: 25°C-on 1.fokozat max. 2 óra",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration","value":24,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 5. száradási fokozat"},
      sourceIds: ["src_factor_aqua_parquet_tds"],
      rawValue: "Száradási idő: 25°C-on 5.fokozat max. 24 óra",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":4,"unit":"h"},
      condition: {"temperatureC":25},
      rawValue: "Átfesthetőség: (25 °C-on): 4 óra",
      sourceIds: ["src_factor_aqua_parquet_tds","src_factor_aqua_parquet"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage","value":25},
      condition: {"note":"alapozó réteg; hígítószer: víz"},
      rawValue: "Alapozó rétegként használhatjuk a termék 25%-ban vízzel hígított elegyét",
      sourceIds: ["src_factor_aqua_parquet_tds","src_factor_aqua_parquet"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage","value":5},
      condition: {"note":"első réteg; hígítószer: víz"},
      rawValue: "Az első réteg esetén 5%-os hígítás javasolt",
      sourceIds: ["src_factor_aqua_parquet_tds","src_factor_aqua_parquet"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"range","min":2,"max":3},
      rawValue: "Javasolt rétegszám 2-3 réteg",
      sourceIds: ["src_factor_aqua_parquet_tds","src_factor_aqua_parquet"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "binder",
      value: {"kind":"text","text":"poliuretán és akrilgyanta"},
      rawValue: "polyuretan és akrilgyanta bázisú",
      sourceIds: ["src_factor_aqua_parquet_tds","src_factor_aqua_parquet"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior"]},
      rawValue: "beltéri felhasználásra ajánlott",
      sourceIds: ["src_factor_aqua_parquet_tds","src_factor_aqua_parquet"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
