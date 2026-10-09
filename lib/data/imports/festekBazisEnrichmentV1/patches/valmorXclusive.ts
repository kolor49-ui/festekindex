import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_xclusive";
const TDS = "src_valmor_xclusive_tds";

export const valmorXclusivePatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_xclusive",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-xclusive-belteri-falfestek-p-467",
  productClass: "architectural_coating",
  sourceSummary: "VALMOR Xclusive Latex Matt mosható, dörzsálló (MSZ-EN 13300 I. osztály), páraáteresztő beltéri falfesték. A műszaki adatlap szerint kiadósság 12–13 m²/l egy rétegben (glettelt felület); javasolt 2 réteg; teljes száradás 2–4 óra (25 °C). Felhordás ecsettel, hengerrel vagy szórással; első réteg max. 10%, fedőréteg max. 5% vízzel hígítható.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_valmor_xclusive_2_5l", amount: 2.5, unit: "l", sourceIds: ["src_valmor_xclusive_tds", "src_valmor_xclusive"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_xclusive_5l", amount: 5, unit: "l", sourceIds: ["src_valmor_xclusive_tds", "src_valmor_xclusive"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_xclusive_10l", amount: 10, unit: "l", sourceIds: ["src_valmor_xclusive_tds", "src_valmor_xclusive"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":12,"max":13,"unit":"m2_per_l"},
      condition: {"basis":"per_coat","note":"glettelt minőségű felület"},
      rawValue: "Kiadósság: 12-13 m2 /liter egy rétegben, glettelt minőségű felület esetén",
      sourceIds: ["src_valmor_xclusive_tds","src_valmor_xclusive"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration_range","min":2,"max":4,"unit":"h"},
      condition: {"temperatureC":25},
      note: "Moshatóság 1 hét után.",
      rawValue: "Teljes száradási idő: (25 °C-on): 2-4 óra, moshatóság 1 hét után",
      sourceIds: ["src_valmor_xclusive_tds","src_valmor_xclusive"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage","value":10},
      condition: {"note":"első réteg; hígítószer: víz; maximum"},
      rawValue: "hígításképpen maximum 10%-ban vizet adhatunk hozzá",
      sourceIds: ["src_valmor_xclusive_tds","src_valmor_xclusive"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"percentage","value":5},
      condition: {"note":"fedőréteg; hígítószer: víz; maximum"},
      rawValue: "a fedőfestést max. 5% víz hozzáadásával végezzük",
      sourceIds: ["src_valmor_xclusive_tds","src_valmor_xclusive"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"number","value":2},
      rawValue: "Javasolt rétegszám 2 réteg",
      sourceIds: ["src_valmor_xclusive_tds","src_valmor_xclusive"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"matt"},
      rawValue: "festett felület sima, matt",
      sourceIds: ["src_valmor_xclusive_tds","src_valmor_xclusive"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior"]},
      rawValue: "beltéri falfesték",
      sourceIds: ["src_valmor_xclusive_tds","src_valmor_xclusive"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
