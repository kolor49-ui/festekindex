import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_deep_primer";
const TDS = "src_valmor_deep_primer_tds";

export const valmorDeepPrimerPatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_deep_primer",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-univerzalis-melyalapozo-p-313",
  productClass: "primer",
  sourceSummary: "VALMOR Univerzális Mélyalapozó oldószermentes bel- és kültéri mélyalapozó (hígítást igényel). A műszaki adatlap szerint kiadósság 8–10 m²/l egy rétegben (glettelt felület); átvonhatóság 2 óra (25 °C); javasolt 1 réteg. Hígítási arány a termékváltozattól és felülettől függ (1:1 / 1:4 / 1:8).",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_valmor_deep_primer_1l", amount: 1, unit: "l", sourceIds: ["src_valmor_deep_primer_tds", "src_valmor_deep_primer"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_deep_primer_5l", amount: 5, unit: "l", sourceIds: ["src_valmor_deep_primer_tds", "src_valmor_deep_primer"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":8,"max":10,"unit":"m2_per_l"},
      condition: {"basis":"per_coat","note":"glettelt minőségű felület"},
      rawValue: "Kiadósság: 8-10 m2/liter egy rétegben, glettelt minőségű felület esetén",
      sourceIds: ["src_valmor_deep_primer_tds","src_valmor_deep_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":2,"unit":"h"},
      condition: {"temperatureC":25},
      rawValue: "Átfesthetőség önmagával, 25°C-on: 2 óra",
      sourceIds: ["src_valmor_deep_primer_tds","src_valmor_deep_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"text","text":"vízzel, felülettől és változattól függő arányban (1:1 / 1:4 / 1:8)"},
      rawValue: "1:1, 1:4 koncentrátum, 1:8 eszencia — felülettől függő hígítás",
      sourceIds: ["src_valmor_deep_primer_tds","src_valmor_deep_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"number","value":1},
      rawValue: "Javasolt rétegszám 1 réteg",
      sourceIds: ["src_valmor_deep_primer_tds","src_valmor_deep_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"matt"},
      rawValue: "Fényesség: matt",
      sourceIds: ["src_valmor_deep_primer_tds","src_valmor_deep_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "bel- és kültéri felhasználásra alkalmas",
      sourceIds: ["src_valmor_deep_primer_tds","src_valmor_deep_primer"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
