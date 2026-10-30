import type { Surface } from "./types";

/**
 * Substrate / surface hubs — minimal seed for model + SEO routes.
 * Product links arrive with Festék Bázis (and later) imports via applicableToSurface.
 */
export const surfaces: Surface[] = [
  {
    id: "surface_fa",
    type: "surface",
    slug: "fa",
    name: "Fa",
    aliases: ["fafelület", "faanyag", "wood"],
    shortDescription:
      "Fa és faszerkezetek bevonatolása: lazúrok, lakkok, fafestékek és impregnálók.",
    body: "A fa felület a FESTÉKINDEX-en önálló felülettípus. Ide tartoznak a kültéri és beltéri fafelületek, faszerkezetek és faipari bevonatok alkalmazási köre. A konkrét termékek gyártói alkalmazási megadás alapján kapcsolódnak — a márka marketingje (pl. „A fára”) nem helyettesíti ezt a szakmai dimenziót.",
    status: "published",
    indexable: true,
    seoTitle: "Festék fára | Fa felületek | FESTÉKINDEX",
    seoDescription:
      "Fa felületekre alkalmazható festékek, lazúrok és lakkok a FESTÉKINDEX felületkatalógusában.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_acel",
    type: "surface",
    slug: "acel",
    name: "Acél",
    aliases: ["vas", "acélszerkezet", "steel"],
    shortDescription:
      "Acél és vasszerkezetek: korróziógátló alapozók, ipari zománcok és fémbevonatok.",
    body: "Az acél a korrózióvédelem és az ipari fémbevonatok egyik központi felülettípusa. Ide kapcsolódnak például a korróziógátló alapozók és zománcok; a felhordási mód (airless, air-mix, ecset) külön technológiai adatlapokon szerepel.",
    status: "published",
    indexable: true,
    seoTitle: "Festék acélra | Acél felületek | FESTÉKINDEX",
    seoDescription:
      "Acél felületekre alkalmazható korróziógátló és ipari bevonatok a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_aluminium",
    type: "surface",
    slug: "aluminium",
    name: "Alumínium",
    aliases: ["alu", "aluminum"],
    shortDescription:
      "Alumínium felületek bevonatolása: tapadás, előkészítés és megfelelő rendszer.",
    body: "Az alumínium felület olyan termékekhez kapcsolódik, amelyeket a gyártó kifejezetten alumíniumra is megad. A marketing-kategória nem korlátozza: ha a termék adatlapja alumíniumot is felsorol, alkalmazási kapcsolat keletkezik.",
    status: "published",
    indexable: true,
    seoTitle: "Festék alumíniumra | FESTÉKINDEX",
    seoDescription:
      "Alumínium felületekre alkalmazható festékek és bevonatok a FESTÉKINDEX felületkatalógusában.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_horganyzott_acel",
    type: "surface",
    slug: "horganyzott-acel",
    name: "Horganyzott acél",
    aliases: ["horganyzott", "Zn", "galvanized steel", "horgany"],
    shortDescription:
      "Horganyzott acél: speciális tapadás és korrózióvédelmi rétegrendek.",
    body: "A horganyzott acél felület SEO- és szakmai szempontból is fontos (festék horganyzott acélra). A kapcsolódó termékek csak ellenőrzött gyártói alkalmazási megadások alapján kapnak alkalmazási kapcsolatot.",
    status: "published",
    indexable: true,
    seoTitle: "Festék horganyzott acélra | FESTÉKINDEX",
    seoDescription:
      "Horganyzott acélra alkalmazható festékek és bevonatok a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_beton",
    type: "surface",
    slug: "beton",
    name: "Beton",
    aliases: ["betonfelület", "concrete"],
    shortDescription:
      "Beton és ásványi aljzatok: padlóbevonatok, betonvédelem, speciális rendszerek.",
    body: "A beton felület a padlóbevonatok, betonvédelem és egyes speciális bevonatok (pl. klórkaucsuk) közös dimenziója. A padlóbevonatok kategóriája mellett ez a felülettípus a „mire megy” kérdést válaszolja meg.",
    status: "published",
    indexable: true,
    seoTitle: "Festék betonra | Beton felületek | FESTÉKINDEX",
    seoDescription:
      "Betonfelületekre alkalmazható festékek és bevonatok a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_vakolat",
    type: "surface",
    slug: "vakolat",
    name: "Vakolat",
    aliases: ["vakolt felület", "ásványi vakolat"],
    shortDescription:
      "Vakolt falak és homlokzatok: falfestékek, homlokzatfestékek, vékonyvakolatok.",
    body: "A vakolat felület a dekoratív és homlokzati bevonatok gyakori aljzata. Beltéri falfestékek és homlokzati rendszerek gyártói alkalmazási megadás alapján kapcsolódhatnak ide, a marketing-kategóriáktól függetlenül.",
    status: "published",
    indexable: true,
    seoTitle: "Festék vakolatra | FESTÉKINDEX",
    seoDescription:
      "Vakolt felületekre alkalmazható festékek a FESTÉKINDEX felületkatalógusában.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_gipszkarton",
    type: "surface",
    slug: "gipszkarton",
    name: "Gipszkarton",
    aliases: ["gipszkarton lap", "GK", "drywall"],
    shortDescription:
      "Gipszkarton: beltéri falfestékek, alapozók és felületképző rendszerek.",
    body: "A gipszkarton felület tipikusan beltéri dekoratív bevonatokhoz kapcsolódik. Alapozók és falfestékek gyártói alkalmazási megadás alapján jelennek meg itt, ha a gyártó megadja az aljzatot.",
    status: "published",
    indexable: true,
    seoTitle: "Festék gipszkartonra | FESTÉKINDEX",
    seoDescription:
      "Gipszkarton felületekre alkalmazható festékek a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_mdf",
    type: "surface",
    slug: "mdf",
    name: "MDF",
    aliases: ["MDF lap", "közepes sűrűségű farostlemez"],
    shortDescription:
      "MDF: tapadóhidak, alapozók és bevonatok bútor- és beltéri alkalmazásokhoz.",
    body: "Az MDF felület a faipari és beltéri speciális alapozók gyakori célfelülete. A termék marketingje helyett a gyártói alkalmazási lista dönti el az alkalmazási kapcsolatot.",
    status: "published",
    indexable: true,
    seoTitle: "Festék MDF-re | FESTÉKINDEX",
    seoDescription: "MDF felületekre alkalmazható festékek és alapozók a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_osb",
    type: "surface",
    slug: "osb",
    name: "OSB",
    aliases: ["OSB lap", "oriented strand board"],
    shortDescription:
      "OSB: tapadásjavító alapozók és bevonatok szerkezeti / beltéri felületekre.",
    body: "Az OSB felület olyan termékekhez kapcsolódik, amelyeket a gyártó OSB-re is megad (pl. tapadóhíd). A felülettípus lehetővé teszi a „festék OSB-re” jellegű szakmai áttekintést.",
    status: "published",
    indexable: true,
    seoTitle: "Festék OSB-re | FESTÉKINDEX",
    seoDescription: "OSB felületekre alkalmazható festékek és alapozók a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_keramia_csempe",
    type: "surface",
    slug: "keramia-csempe",
    name: "Kerámia / csempe",
    aliases: ["csempe", "kerámia", "tile", "mázas kerámia"],
    shortDescription:
      "Kerámia és csempe: speciális tapadású alapozók és átvonó rendszerek.",
    body: "A kerámia/csempe felület a nehezen tapadó, mázas felületek szakmai dimenziója. Ide tartoznak a hídképző / tapadó alapozók, ha a gyártó csempét vagy kerámiát is felsorol.",
    status: "published",
    indexable: true,
    seoTitle: "Festék csempére | Kerámia felületek | FESTÉKINDEX",
    seoDescription:
      "Csempe és kerámia felületekre alkalmazható festékek és alapozók a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
  {
    id: "surface_muanyag",
    type: "surface",
    slug: "muanyag",
    name: "Műanyag",
    aliases: ["műanyag felület", "PVC", "plastic"],
    shortDescription:
      "Műanyag és PVC jellegű felületek: speciális tapadás és megfelelő rendszer.",
    body: "A műanyag felület olyan termékekhez kapcsolódik, amelyeket a gyártó műanyagra, PVC-re vagy hasonló aljzatra is megad. A FACTOR „A fára” marketing nem zárja ki a műanyag felületre való alkalmazást, ha a gyártói adatlap műanyagot is tartalmaz.",
    status: "published",
    indexable: true,
    seoTitle: "Festék műanyagra | FESTÉKINDEX",
    seoDescription:
      "Műanyag felületekre alkalmazható festékek és bevonatok a FESTÉKINDEX-en.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
];
