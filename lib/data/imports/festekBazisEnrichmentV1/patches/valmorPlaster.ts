import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_valmor_plaster";
const TDS = "src_valmor_plaster_tds";

export const valmorPlasterPatch: ProductEnrichmentPatch = {
  productId: "prod_valmor_plaster",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-vakolat-p-318",
  productClass: "filler",
  sourceSummary: "VALMOR Vakolat műgyanta bázisú diszperziós vékonyvakolat bel- és homlokzati használatra. A műszaki adatlap szerint anyagszükséglet 2,4–2,9 kg/m² (1,5 mm kapart struktúra); átvonhatóság 10 óra (25 °C). Felhordás glettvassal / spaklival.",
  sourceSummarySourceIds: [PAGE, TDS],
  additionalSourceIds: [PAGE, TDS],
  packagingOptions: [

  ],
  specifications: [
    {
      key: "consumption",
      value: {"kind":"range_unit","min":2.4,"max":2.9,"unit":"kg_per_m2"},
      condition: {"note":"1,5 mm „kapart” struktúra; függ felhordás módjától és alapfelülettől"},
      rawValue: "Kiadósság: 2,4-2,9kg kg/m2 a 1,5 mm „kapart” struktúra esetében",
      sourceIds: ["src_valmor_plaster_tds","src_valmor_plaster"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dust_dry_time",
      value: {"kind":"duration","value":2,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 1. száradási fokozat"},
      sourceIds: ["src_valmor_plaster_tds"],
      rawValue: "Száradási idő: 25°C-on 1.fokozat max. 2 óra",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "full_cure_time",
      value: {"kind":"duration","value":24,"unit":"h"},
      condition: {"temperatureC":25,"note":"maximum; 5. száradási fokozat"},
      sourceIds: ["src_valmor_plaster_tds"],
      rawValue: "Száradási idő: 25°C-on 5.fokozat max. 24 óra",
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "recoat_time",
      value: {"kind":"duration","value":10,"unit":"h"},
      condition: {"temperatureC":25},
      rawValue: "Átfesthetőség: 10 óra",
      sourceIds: ["src_valmor_plaster_tds","src_valmor_plaster"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "gloss",
      value: {"kind":"enum","value":"matt"},
      rawValue: "Fényesség: matt",
      sourceIds: ["src_valmor_plaster_tds","src_valmor_plaster"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "binder",
      value: {"kind":"text","text":"vizes diszperziós kötőanyag"},
      rawValue: "Összetétel: Vizes diszperziós kötőanyag, pigment, töltőanyagok és egyéb adalékanyagok",
      sourceIds: ["src_valmor_plaster_tds","src_valmor_plaster"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "beltéri és homlokzati vakolat",
      sourceIds: ["src_valmor_plaster_tds","src_valmor_plaster"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
