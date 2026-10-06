import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_kontrol";
const TDS = "src_valmor_kontrol_tds";

export const valmorKontrolPatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_kontrol",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-kontrol-falfestek-p-315",
  productClass: "architectural_coating",
  sourceSummary: "VALMOR Kontrol diszperziós matt falfesték bel- és fedett kültérre. A műszaki adatlap szerint akril kötőanyagú; kiadósság 12–13 m²/l egy rétegben; átvonhatóság 2–4 óra (25 °C). Felhasználásra kész, hígítani nem szükséges; felhordás ecsettel, hengerrel vagy szórással.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [
    { id: "pack_valmor_kontrol_2l", amount: 2, unit: "l", sourceIds: ["src_valmor_kontrol_tds", "src_valmor_kontrol"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_kontrol_4l", amount: 4, unit: "l", sourceIds: ["src_valmor_kontrol_tds", "src_valmor_kontrol"], verifiedAt: V, status: "verified" },
    { id: "pack_valmor_kontrol_10l", amount: 10, unit: "l", sourceIds: ["src_valmor_kontrol_tds", "src_valmor_kontrol"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":12,"max":13,"unit":"m2_per_l"},
      condition: {"basis":"per_coat"},
      rawValue: "Kiadósság: 12-13 m2/liter egy rétegben",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: {"kind":"duration","value":2,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 1. száradási fokozat"},
      rawValue: "Száradási idő: 25°C-on 1.fokozat max. 2 óra",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration","value":24,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 5. száradási fokozat"},
      rawValue: "Száradási idő: 25°C-on 5.fokozat max. 24 óra",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration_range","min":2,"max":4,"unit":"h"},
      condition: {"temperatureC":25},
      rawValue: "átfesthető 2-4 óra",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"text","text":"hígítani nem szükséges"},
      rawValue: "A termék felhasználásra kész, hígítani nem szükséges.",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "coat_count",
      value: {"kind":"range","min":1,"max":2},
      rawValue: "Javasolt rétegszám 1-2 réteg",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"matt"},
      rawValue: "Fényesség: matt",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "binder",
      value: {"kind":"text","text":"akril kötőanyag"},
      rawValue: "Összetétel: akril kötőanyag, pigmentek, töltőanyagok, adalékanyagok",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "beltéri és kültéri falfesték",
      sourceIds: ["src_valmor_kontrol_tds","src_valmor_kontrol"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
