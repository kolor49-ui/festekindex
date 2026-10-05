import type { Technology } from "./types";

export const technologies: Technology[] = [
  {
    id: "tech_airless",
    type: "technology",
    slug: "airless-festekszoras",
    name: "Airless festékszórás",
    aliases: ["Airless", "airless szórás", "airless technológia"],
    shortDescription:
      "Nagy nyomású, levegő nélküli festékszórási eljárás — gépek, anyagok, márkák.",
    body: "Az airless festékszórás nagy nyomáson, sűrített levegő nélkül juttatja a festéket a felületre. Professzionális építőipari és ipari felhasználásban elterjedt. A FESTÉKINDEX-en a Graco és Wagner márkák, a kapcsolódó gépcsaládok, valamint a magyarországi forgalmazók (Euroll, M.L.S.) kapcsolódnak ehhez a technológiához.",
    status: "published",
    indexable: true,
    seoTitle: "Airless festékszórás | FESTÉKINDEX",
    seoDescription:
      "Airless technológia: gépek, márkák (Graco, Wagner), forgalmazók és szakmai tudás.",
    categoryIds: ["cat_szoras"],
    sourceIds: ["src_airless_knowledge", "src_graco_official"],
    updatedAt: "2026-10-05",
    verifiedAt: "2026-10-01",
  },
  {
    id: "tech_porfestek",
    type: "technology",
    slug: "porfestek-bevonat",
    name: "Porfesték bevonatolás",
    aliases: ["powder coating", "porbevonat"],
    shortDescription:
      "Elektrosztatikus porfesték-felhordás és hőkezelés — ipari bevonati eljárás.",
    body: "A porfesték bevonatolás (powder coating) száraz por formájú festék elektrosztatikus felhordásán és hőkezelésén alapul. Környezetbarát, tartós ipari eljárás. A FESTÉKINDEX-en az Interpon márka és a porfesték kategória kapcsolódik hozzá.",
    status: "published",
    indexable: true,
    seoTitle: "Porfesték bevonatolás | FESTÉKINDEX",
    seoDescription:
      "Porfesték (powder coating) technológia, márkák és ipari alkalmazások.",
    categoryIds: ["cat_porfestek"],
    sourceIds: ["src_akzonobel_hu"],
    updatedAt: "2026-10-05",
  },
  {
    id: "tech_csiszolas",
    type: "technology",
    slug: "csiszolastechnika",
    name: "Csiszolástechnika",
    aliases: ["felületcsiszolás", "csiszolás"],
    shortDescription:
      "Felület-előkészítési csiszolási eljárások — gépek, abroncsok, rendszerek.",
    body: "A csiszolástechnika a bevonatolás minőségét meghatározó felület-előkészítési lépés. Gépi és kézi eljárások, csiszolóanyagok és rendszerek tartoznak ide. Kulcsmárka a FESTÉKINDEX mintájában: Mirka (Euroll forgalmazás).",
    status: "published",
    indexable: true,
    seoTitle: "Csiszolástechnika | FESTÉKINDEX",
    seoDescription:
      "Csiszolástechnika és felület-előkészítés: márkák, forgalmazók, kapcsolatok.",
    categoryIds: ["cat_csiszolas"],
    sourceIds: ["src_mirka_official"],
    updatedAt: "2026-10-05",
  },
];
