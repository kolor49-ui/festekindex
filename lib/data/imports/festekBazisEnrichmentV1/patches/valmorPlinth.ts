import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_plinth";
const TDS = "src_valmor_plinth_tds";

export const valmorPlinthPatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_plinth",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-labazatfestek-p-303",
  productClass: "architectural_coating",
  sourceSummary: "VALMOR Lábazatfesték jellemzően kültéri, időjárásálló lábazatfesték. A műszaki adatlap szerint kiadósság 3,5–4,0 m²/l két rétegben (glettelt); átvonhatóság 4 óra (25 °C); javasolt 2–3 réteg. Hígítás 5–10% vízzel; alapozáshoz 1:1 vízhígítás.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_valmor_plinth_1l", amount: 1, unit: "l", sourceIds: ["src_valmor_plinth_tds", "src_valmor_plinth"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_plinth_4l", amount: 4, unit: "l", sourceIds: ["src_valmor_plinth_tds", "src_valmor_plinth"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_plinth_8l", amount: 8, unit: "l", sourceIds: ["src_valmor_plinth_tds", "src_valmor_plinth"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":3.5,"max":4,"unit":"m2_per_l"},
      condition: {"basis":"per_system","note":"két réteg; glettelt felület"},
      rawValue: "Kiadósság: 3,5-4,0 m2/liter két rétegben (glettelt minőségű felület esetén)",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration","value":4,"unit":"h"},
      condition: {"note":"Teljes száradási idő — Műszaki adatlap; páratartalom befolyásolja"},
      rawValue: "Teljes száradási idő: 4 óra",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":4,"unit":"h"},
      condition: {"temperatureC":25},
      rawValue: "Átfesthetőség önmagával, 25 °C-on 4 óra",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage_range","min":5,"max":10},
      condition: {"note":"hígítószer: víz; felhordás megkönnyítése"},
      rawValue: "Festéket hígíthatjuk 5-10% víz hozzáadásával",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"text","text":"1:1 vízzel (alapozó keverék)"},
      condition: {"note":"felület alapozása"},
      rawValue: "VALMOR Lábazatfesték és víz 1:1 arányban hígított keverékét használjuk",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"range","min":2,"max":3},
      rawValue: "Javasolt rétegszám 2-3 réteg",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"matt"},
      rawValue: "Fényesség: matt",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "binder",
      value: {"kind":"text","text":"emulzió"},
      rawValue: "Összetétel: emulzió, pigmentek, töltőanyagok, adalékok",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["exterior"]},
      rawValue: "jellemzően kültérben használható",
      sourceIds: ["src_valmor_plinth_tds","src_valmor_plinth"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
