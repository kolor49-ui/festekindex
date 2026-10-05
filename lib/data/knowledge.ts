import type { KnowledgeArticle } from "./types";

export const knowledge: KnowledgeArticle[] = [
  {
    id: "know_airless_alapok",
    type: "knowledge",
    slug: "airless-festekszoras-alapok",
    name: "Airless festékszórás — alapok",
    shortDescription:
      "Mi az airless technológia, mire való, és mely márkák kapcsolódnak hozzá Magyarországon.",
    body: "Az airless festékszórás a professzionális festés egyik alapeljárása. Nagy nyomással, levegő nélkül juttatja a festéket a felületre — gyorsabb fedés, kevesebb túlpermet bizonyos alkalmazásokban. A FESTÉKINDEX tudáshálójában a Graco és Wagner márkák, az Euroll és M.L.S. forgalmazók, valamint a Graco Mark / Ultra / GX gépcsaládok kapcsolódnak ehhez a témához.",
    status: "published",
    indexable: true,
    seoTitle: "Airless festékszórás alapok | FESTÉKINDEX Tudástár",
    seoDescription:
      "Airless technológia magyarázata, kapcsolódó márkák, gépek és magyarországi forgalmazók.",
    categoryIds: ["cat_szoras"],
    topicIds: ["tech_airless", "brand_graco", "brand_wagner"],
    sourceIds: ["src_airless_knowledge"],
    updatedAt: "2026-10-05",
    verifiedAt: "2026-10-01",
  },
  {
    id: "know_porfestek_vs_folyadek",
    type: "knowledge",
    slug: "porfestek-es-folyadek-bevonat",
    name: "Porfesték és folyékony bevonat — mikor melyik?",
    shortDescription:
      "Rövid szakmai összevetés: powder coating vs. hagyományos folyékony festékrendszerek.",
    body: "A porfesték és a folyékony ipari bevonatok más-más gyártási környezetre és követelményre optimalizáltak. A porfesték jellemzően gyári, hőkezelhető alkatrészekhez ideális; a folyékony rendszerek rugalmasabbak helyszíni és nagy szerkezeteknél. A FESTÉKINDEX-en az Interpon márka és a porfesték kategória a powder coating oldalt képviseli.",
    status: "published",
    indexable: true,
    seoTitle: "Porfesték vs. folyékony bevonat | FESTÉKINDEX Tudástár",
    seoDescription:
      "Porfesték és folyékony bevonatok összevetése — szakmai döntési szempontok.",
    categoryIds: ["cat_porfestek", "cat_ipari"],
    topicIds: ["tech_porfestek", "brand_interpon"],
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
];
