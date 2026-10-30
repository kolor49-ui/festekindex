import type { Technology } from "./types";

export const technologies: Technology[] = [
  {
    id: "tech_airless",
    type: "technology",
    slug: "airless-festekszoras",
    name: "Airless festékszórás",
    aliases: ["Airless", "airless szórás", "airless technológia"],
    kind: "spray_process",
    shortDescription:
      "Nagy nyomású, levegő nélküli festékszórási eljárás — gépek, anyagok, márkák.",
    body: "Az airless festékszórás nagy nyomáson, sűrített levegő nélkül juttatja a festéket a felületre. Kapcsolódó márkák például a Graco és a Wagner; a magyarországi forgalmazói kapcsolatok a márka- és cégadatlapokon érhetők el.",
    status: "published",
    indexable: true,
    seoTitle: "Airless festékszórás | FESTÉKINDEX",
    seoDescription:
      "Airless technológia: gépek, márkák (Graco, Wagner), forgalmazók.",
    sourceIds: ["src_airless_knowledge", "src_graco_official"],
    updatedAt: "2026-10-05",
    verifiedAt: "2026-10-01",
  },
  {
    id: "tech_porfestek",
    type: "technology",
    slug: "porfestek-bevonat",
    name: "Porfesték bevonatolás",
    aliases: ["powder coating", "porbevonat", "porfesték"],
    kind: "process",
    shortDescription:
      "Elektrosztatikus porfesték-felhordás és hőkezelés — ipari eljárás.",
    body: "A porfesték bevonatolás (powder coating) száraz por formájú festék elektrosztatikus felhordásán alapul. Kapcsolódó márka a mintában: Interpon.",
    status: "published",
    indexable: true,
    seoTitle: "Porfesték bevonatolás | FESTÉKINDEX",
    seoDescription:
      "Porfesték bevonatolás (powder coating): elektrosztatikus felhordás és hőkezelés — kapcsolódó márkákkal a FESTÉKINDEX-en.",
    sourceIds: ["src_akzonobel_hu"],
    updatedAt: "2026-10-30",
  },
  {
    id: "tech_csiszolas",
    type: "technology",
    slug: "csiszolastechnika",
    name: "Csiszolástechnika",
    aliases: ["felületcsiszolás", "csiszolás"],
    kind: "process",
    shortDescription: "Felület-előkészítési csiszolási eljárások.",
    body: "A csiszolástechnika a bevonatolás minőségét meghatározó felület-előkészítési lépés. Kapcsolódó márka: Mirka.",
    status: "published",
    indexable: true,
    seoTitle: "Csiszolástechnika | FESTÉKINDEX",
    seoDescription: "Csiszolástechnika és felület-előkészítés.",
    sourceIds: ["src_mirka_official"],
    updatedAt: "2026-10-05",
  },
];
