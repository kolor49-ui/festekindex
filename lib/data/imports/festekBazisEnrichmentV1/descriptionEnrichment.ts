/**
 * Product Description Enrichment v1 — official-source introductions.
 * Rewrites sourceSummary (concise, no spec-table dump) and adds editorialSummary.
 * Does not touch specifications, packaging, relations, or indexability.
 */

import type { ProductDescriptionEnrichment } from "./types";
import { catalogueClosureDescriptionsV1 } from "./catalogueClosureDescriptionsV1";

export const productDescriptionEnrichmentsV1: ProductDescriptionEnrichment[] = [
  // —— VALMOR AIR FLOW ——
  {
    productId: "prod_valmor_airflow_interior",
    sourceSummary:
      "VALMOR AIR FLOW Lélegző Beltéri Falfesték diszperziós jellegű, matt beltéri falfesték magas páraáteresztő képességgel. A hivatalos műszaki adatlap szerint vakolatra, betonra és gipszkartonra alkalmazható; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: [
      "src_valmor_airflow_interior",
      "src_valmor_airflow_interior_tds",
    ],
    editorialSummary:
      "Matt, páraáteresztő beltéri falfesték az AIR FLOW rendszerből. Vakolat, beton és gipszkarton felületekre ajánlott.",
  },
  {
    productId: "prod_valmor_airflow_primer",
    sourceSummary:
      "VALMOR AIR FLOW Lélegző Mélyalapozó 1:1 oldószermentes, bel- és kültéri mélyalapozó magas páraáteresztő képességgel. A műszaki adatlap szerint nedvszívó ásványi felületekre (vakolat, gipszkarton) ajánlott; felhordás ecsettel vagy hengerrel.",
    sourceSummarySourceIds: [
      "src_valmor_airflow_primer",
      "src_valmor_airflow_primer_tds",
    ],
    editorialSummary:
      "Oldószermentes, páraáteresztő mélyalapozó nedvszívó ásványi felületekre. Az AIR FLOW rendszer alapozója bel- és kültérre.",
  },
  {
    productId: "prod_valmor_airflow_facade",
    sourceSummary:
      "VALMOR AIR FLOW Homlokzat és Lábazatfesték módosított vinil kötőanyagú, matt, magas páraáteresztő képességű festék. A műszaki adatlap szerint vakolatra és betonra alkalmazható; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: [
      "src_valmor_airflow_facade",
      "src_valmor_airflow_facade_tds",
    ],
    editorialSummary:
      "Matt, páraáteresztő homlokzat- és lábazatfesték az AIR FLOW rendszerből. Vakolat- és betonfelületekre szánt kültéri bevonat.",
  },
  {
    productId: "prod_valmor_airflow_salt",
    sourceSummary:
      "VALMOR AIR FLOW Sóglett törtfehér porkeverék, vízzel keverve beltéri rusztikus felületképző anyag. A műszaki adatlap szerint mész- vagy cementkötésű ásványi vakolatra hordható fel glettvassal; gipszkarton önmagában nem alkalmas.",
    sourceSummarySourceIds: [
      "src_valmor_airflow_salt",
      "src_valmor_airflow_salt_tds",
    ],
    editorialSummary:
      "Beltéri rusztikus felületképző porkeverék az AIR FLOW rendszerből. Mész- vagy cementkötésű ásványi vakolatra kell felhordani; gipszkarton önmagában nem megfelelő aljzat.",
  },

  // —— VALMOR standalone ——
  {
    productId: "prod_valmor_xclusive",
    sourceSummary:
      "VALMOR Xclusive Latex Matt mosható, dörzsálló (MSZ-EN 13300 I. osztály), páraáteresztő beltéri falfesték. A műszaki adatlap szerint glettelt felületekre ajánlott; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: ["src_valmor_xclusive", "src_valmor_xclusive_tds"],
    editorialSummary:
      "Mosható, dörzsálló (MSZ-EN 13300 I. osztály) páraáteresztő beltéri latex falfesték. Glettelt falakra szánt matt beltéri bevonat.",
  },
  {
    productId: "prod_valmor_kontrol",
    sourceSummary:
      "VALMOR Kontrol diszperziós matt falfesték bel- és fedett kültérre. A műszaki adatlap szerint akril kötőanyagú; felhasználásra kész, hígítani nem szükséges; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: ["src_valmor_kontrol", "src_valmor_kontrol_tds"],
    editorialSummary:
      "Akril diszperziós matt falfesték beltérre és fedett kültérre. Felhasználásra kész; hígítás nélkül hordható fel.",
  },
  {
    productId: "prod_valmor_deep_primer",
    sourceSummary:
      "VALMOR Univerzális Mélyalapozó oldószermentes bel- és kültéri mélyalapozó, hígítást igényel. A műszaki adatlap szerint a hígítási arány a termékváltozattól és a felülettől függ.",
    sourceSummarySourceIds: [
      "src_valmor_deep_primer",
      "src_valmor_deep_primer_tds",
    ],
    editorialSummary:
      "Oldószermentes mélyalapozó bel- és kültérre. Nedvszívó ásványi felületek előkészítésére szolgál; a megfelelő hígítási arány a felülettől függ.",
  },
  {
    productId: "prod_valmor_facade",
    sourceSummary:
      "VALMOR Homlokzatfesték diszperziós matt kültéri falfesték. A műszaki adatlap szerint vízzel hígítható; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: ["src_valmor_facade", "src_valmor_facade_tds"],
    editorialSummary:
      "Diszperziós matt kültéri falfesték. Homlokzati ásványi felületekre; nagyobb igénybevételű beltéri falakra is jelölt; vízzel hígítható.",
  },
  {
    productId: "prod_valmor_plinth",
    sourceSummary:
      "VALMOR Lábazatfesték kültéri, időjárásálló lábazatfesték. A műszaki adatlap szerint vízzel hígítható; alapozáshoz erősebb vízhígítás is javasolt.",
    sourceSummarySourceIds: ["src_valmor_plinth", "src_valmor_plinth_tds"],
    editorialSummary: "Matt, időjárásálló kültéri lábazatfesték lábazatra, alapvakolatra, betonra és téglára; felcsapódó víznek ellenálló, száradás után tisztítható bevonat.",
  },
  {
    productId: "prod_valmor_textured",
    sourceSummary:
      "VALMOR Szemcsés Lábazat- és Betonfesték vizes bázisú, kvarchomokkal dúsított bel- és kültéri bevonat. A műszaki adatlap szerint lábazatra és járófelületre is alkalmazható; felhordás ecsettel vagy struktúr hengerrel.",
    sourceSummarySourceIds: ["src_valmor_textured", "src_valmor_textured_tds"],
    editorialSummary: "Kvarchomokkal dúsított, matt bel- és kültéri lábazat- és betonfesték; enyhén strukturált film hajszálrepedések takarására és átlagos lakossági járóterhelésre.",
  },
  {
    productId: "prod_valmor_garage",
    sourceSummary:
      "VALMOR Garázsfesték oldószeres, selyemfényű bel- és kültéri padló-/garázsfesték uretán-alkid kötőanyaggal. A műszaki adatlap szerint hígítás és szerszámtisztítás COROR Szintetikus Hígítóval történik.",
    sourceSummarySourceIds: ["src_valmor_garage", "src_valmor_garage_tds"],
    editorialSummary:
      "Oldószeres, selyemfényű uretán-alkid padlófesték garázs- és hasonló járófelületekre. Bel- és kültéri használatra; COROR Szintetikus Hígítóval.",
  },
  {
    productId: "prod_valmor_floor",
    sourceSummary:
      "VALMOR Flexibilis Padlóbevonat vizes bázisú, matt bel- és kültéri padlóbevonat. A műszaki adatlap szerint felhordás ecsettel vagy hengerrel.",
    sourceSummarySourceIds: ["src_valmor_floor", "src_valmor_floor_tds"],
    editorialSummary: "Vízbázisú, matt, flexibilis bel- és kültéri padlóbevonat átlagos lakossági terhelésre; olaj- és vízálló film, járófelületen szigorú aljzatfeltételekkel.",
  },
  {
    productId: "prod_valmor_weather",
    sourceSummary:
      "VALMOR Időjárásálló és Szigetelőfesték bel- és kültéri, vízzel hígítható rugalmas festék. A műszaki adatlap szerint selyemmatt fényességű; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: ["src_valmor_weather", "src_valmor_weather_tds"],
    editorialSummary:
      "Vízzel hígítható, rugalmas időjárásálló és szigetelő festék. Bel- és kültéri felületekre szánt selyemmatt bevonat.",
  },
  {
    productId: "prod_valmor_plaster",
    sourceSummary:
      "VALMOR Vakolat műgyanta bázisú diszperziós vékonyvakolat bel- és homlokzati használatra. A műszaki adatlap szerint felhordás glettvassal vagy spaklival.",
    sourceSummarySourceIds: ["src_valmor_plaster", "src_valmor_plaster_tds"],
    editorialSummary: "Felhasználásra kész, fehér, matt műgyanta diszperziós vékonyvakolat bel- és homlokzati falakra; 1,5 mm kapart struktúra, algásodás elleni védelemmel a Műszaki adatlap szerint.",
  },

  // —— FACTOR ——
  {
    productId: "prod_factor_pergola",
    sourceSummary:
      "FACTOR Pergola Kültéri Fafesték kültéri faszerkezetek időjárásálló védelmére. A műszaki adatlap szerint selyemfényű; felhordás ecsettel vagy hengerrel, vízzel hígítható.",
    sourceSummarySourceIds: ["src_factor_pergola", "src_factor_pergola_tds"],
    editorialSummary:
      "Kültéri fafesték faszerkezetek időjárásálló védelmére. Selyemfényű, vízzel hígítható bevonat pergolákhoz és hasonló kültéri fához.",
  },
  {
    productId: "prod_factor_aqua_primer",
    sourceSummary:
      "FACTOR Aqua Impregnáló Alapozó oldószermentes, vizes bázisú faalapozó bel- és kültérre. A műszaki adatlap szerint akril-emulzió kötőanyagú; hígítani nem szabad; felhordás ecsettel vagy hengerrel.",
    sourceSummarySourceIds: [
      "src_factor_aqua_primer",
      "src_factor_aqua_primer_tds",
    ],
    editorialSummary:
      "Oldószermentes, vizes bázisú impregnáló faalapozó bel- és kültérre. A FACTOR Aqua rendszer első rétege; hígítás nélkül használandó.",
  },
  {
    productId: "prod_factor_aqua_parquet",
    sourceSummary:
      "FACTOR Aqua Parkettalakk vizes bázisú beltéri parkettalakk poliuretán és akrilgyanta kötőanyaggal. A műszaki adatlap szerint felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: [
      "src_factor_aqua_parquet",
      "src_factor_aqua_parquet_tds",
    ],
    editorialSummary: "Vízbázisú, egykomponensű poliuretán–akril beltéri parkettalakk; matt, selyem- vagy magasfényű, oldószer- és formaldehidmentes változatokban.",
  },
  {
    productId: "prod_factor_aqua_glaze",
    sourceSummary:
      "FACTOR Aqua Akril Vastaglazúr vizes bázisú, selyemfényű bel- és kültéri akril vastaglazúr fafelületekre. A műszaki adatlap szerint akrilgyanta kötőanyagú; kiadósság 12–14 m²/l egy rétegben; átvonhatóság 4 óra (25 °C). Hígítás vízzel; felhordás speciális vizes lazúr ecsettel.",
    sourceSummarySourceIds: [
      "src_factor_aqua_glaze",
      "src_factor_aqua_glaze_tds",
    ],
    editorialSummary:
      "Vizes bázisú, selyemfényű akril vastaglazúr bel- és kültéri fára. A FACTOR Aqua rendszer áttetsző fa-védő bevonata; kültérre a gyártó impregnáló alapozót javasol.",
  },
  {
    productId: "prod_factor_parquet",
    sourceSummary:
      "FACTOR Parkettalakk oldószeres beltéri parkettalakk módosított alkidgyanta kötőanyaggal. A műszaki adatlap szerint hígítás és tisztítás COROR Szintetikus Hígítóval történik.",
    sourceSummarySourceIds: ["src_factor_parquet", "src_factor_parquet_tds"],
    editorialSummary:
      "Oldószeres beltéri parkettalakk módosított alkidgyantával. Beltéri parketták védelmére; hígításhoz COROR Szintetikus Hígító javasolt.",
  },
  {
    productId: "prod_factor_boat",
    sourceSummary:
      "FACTOR Csónaklakk oldószeres alkid–poliuretán lakk bel- és kültérre. A műszaki adatlap szerint fényes; hígítás COROR Szintetikus Hígítóval.",
    sourceSummarySourceIds: ["src_factor_boat", "src_factor_boat_tds"],
    editorialSummary:
      "Oldószeres alkid–poliuretán lakk bel- és kültérre. Fényes fedőlakk fa- és hasonló felületekre; hígításhoz COROR Szintetikus Hígító javasolt.",
  },

  // —— COROR Rapid ——
  {
    productId: "prod_coror_rapid_primer",
    sourceSummary:
      "COROR Rapid Korróziógátló Alapozó oldószeres, matt, bel- és kültéri fémalapozó. A műszaki adatlap szerint uretanizált alkid kötőanyagú; acélra, alumíniumra, horganyzottra és rézre alkalmazható. Hígítás elsősorban COROR Szintetikus vagy Aromás Hígítóval.",
    sourceSummarySourceIds: [
      "src_coror_rapid_primer",
      "src_coror_rapid_primer_tds",
    ],
    editorialSummary:
      "Oldószeres, matt korróziógátló fémalapozó a COROR Rapid rendszerhez. Acél, alumínium, horganyzott és rézfelületek bel- és kültéri alapozására.",
  },
  {
    productId: "prod_coror_rapid_enamel",
    sourceSummary:
      "COROR Rapid Zománcfesték oldószeres, selyemfényű, korróziógátló adalékot tartalmazó zománc bel- és kültérre. A műszaki adatlap szerint uretanizált alkid kötőanyagú; többek között acélra, alumíniumra, fára, betonra és vakolatra alkalmazható. Hígítás elsősorban COROR Szintetikus Hígítóval.",
    sourceSummarySourceIds: [
      "src_coror_rapid_enamel",
      "src_coror_rapid_enamel_tds",
    ],
    editorialSummary:
      "Oldószeres, selyemfényű fedőzománc korróziógátló adalékkal a COROR Rapid rendszerben. Bel- és kültéri fém-, fa- és ásványi felületekre.",
  },
  {
    productId: "prod_coror_rapid_aqua_enamel",
    sourceSummary:
      "COROR Rapid Aqua Zománcfesték vizes bázisú, selyemmatt, korróziógátló adalékot tartalmazó alapozó és fedőfesték bel- és kültérre. A műszaki adatlap szerint akril–uretán hibrid kötőanyagú; felhordás ecsettel, hengerrel vagy szórással; hígítás vízzel.",
    sourceSummarySourceIds: [
      "src_coror_rapid_aqua_enamel",
      "src_coror_rapid_aqua_enamel_tds",
    ],
    editorialSummary:
      "Vizes bázisú, selyemmatt Rapid fedőzománc korróziógátló adalékkal. Bel- és kültéri fém-, fa-, műanyag- és ásványi felületekre; az oldószeres Rapid Zománcfestéktől külön termék.",
  },
  {
    productId: "prod_coror_rapid_stripper",
    sourceSummary:
      "COROR Rapid Festéklemaró gél régi festékbevonatok eltávolítására fém, fa és ásványi felületekről. A hivatalos termékoldal szerint hígítani nem szükséges; felhordás ecsettel.",
    sourceSummarySourceIds: ["src_coror_rapid_stripper"],
    editorialSummary:
      "Gél állagú festéklemaró régi bevonatok eltávolítására. Fém, fa és ásványi felületekre; hígítás nélkül, ecsettel hordható fel.",
  },

  // —— COROR Industry ——
  {
    productId: "prod_coror_ind_primer",
    sourceSummary:
      "COROR Industry Korróziógátló Alapozó gyorsan száradó ipari korróziógátló alapozó vas/acélfelületekre. A műszaki adatlap szerint hígítás COROR Industry S-31 Hígítóval; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: [
      "src_coror_ind_primer",
      "src_coror_ind_primer_tds",
    ],
    editorialSummary:
      "Gyorsan száradó ipari korróziógátló alapozó vas- és acélfelületekre. A COROR Industry rendszer alapozó rétege; hígításhoz a gyártó S-31 Hígítót jelöl meg.",
  },
  {
    productId: "prod_coror_ind_enamel",
    sourceSummary:
      "COROR Industry Ipari Zománc ipari fedőzománc. A műszaki adatlap szerint hígítás COROR Industry S-31 Hígítóval.",
    sourceSummarySourceIds: [
      "src_coror_ind_enamel",
      "src_coror_ind_enamel_tds",
    ],
    editorialSummary:
      "Ipari fedőzománc a COROR Industry rendszerhez. Vas- és acélipari felületek fedőbevonatára; hígításhoz a gyártó S-31 Hígítót jelöl meg.",
  },
  {
    productId: "prod_coror_ind_s31",
    sourceSummary:
      "COROR Industry S-31 Hígító a COROR Industry termékcsalád festékeinek felhordási konzisztencia-beállítására fejlesztett hígító. A hivatalos termékoldal szerint zsírtalanításra, festőszerszámok elmosására és lecsepegett festék eltávolítására is alkalmazható.",
    sourceSummarySourceIds: ["src_coror_ind_s31", "src_coror_ind_s31_tds"],
    editorialSummary:
      "Industry rendszerű hígító a COROR Industry alapozó és ipari zománc konzisztencia-beállításához. Zsírtalanításra és szerszámtisztításra is dokumentált.",
  },

  // —— COROR thinners ——
  {
    productId: "prod_coror_aromatic",
    sourceSummary:
      "COROR Aromás Hígító nagy tisztaságú, vízmentes aromás szénhidrogén hígító. A hivatalos termékoldal szerint a COROR Rapid Korróziógátló Alapozó és más megnevezett termékek felhordási konzisztenciájának beállítására szolgál; zsírtalanításra és szerszámtisztításra is.",
    sourceSummarySourceIds: ["src_coror_aromatic"],
    editorialSummary:
      "Nagy tisztaságú aromás szénhidrogén hígító. Elsősorban a COROR Rapid korróziógátló alapozó és rokon termékek hígítására, zsírtalanításra és szerszámtisztításra.",
  },
  {
    productId: "prod_coror_synthetic",
    sourceSummary:
      "COROR Szintetikus Hígító nagy tisztaságú, vízmentes, nem regenerált hígító. A hivatalos műszaki adatlap szerint alkidgyanta alapú lakkok, festékek és olajfestékek konzisztencia-beállítására, zsírtalanításra, lecsepegett festék eltávolítására és szerszámtisztításra szolgál; elsősorban VALMOR, FACTOR és COROR termékekhez.",
    sourceSummarySourceIds: [
      "src_coror_synthetic",
      "src_coror_synthetic_tds",
    ],
    editorialSummary:
      "Nagy tisztaságú, nem regenerált szintetikus hígító. Alkid alapú festékek és lakkok hígítására, zsírtalanításra és szerszámtisztításra; a gyártó VALMOR, FACTOR és COROR termékekhez ajánlja.",
  },

  // —— 7016™ ProductFamily (not Brand) ——
  {
    productId: "prod_7016_wall",
    sourceSummary:
      "7016™ Antracit Egyrétegű Beltéri Falfesték matt beltéri falfesték. A gyártói termékoldal és műszaki adatlap szerint vakolatra és glettelt felületekre alkalmazható; felhordás ecsettel, hengerrel vagy szórással.",
    sourceSummarySourceIds: ["src_7016_wall", "src_7016_wall_tds"],
    editorialSummary:
      "Matt beltéri falfesték a 7016™ termékcsaládból. Vakolat és glettelt felületekre szánt egyrétegű antracit beltéri bevonat.",
  },
  ...catalogueClosureDescriptionsV1,
];
