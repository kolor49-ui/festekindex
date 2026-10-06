import type { KnowledgeArticle } from "./types";

export const knowledge: KnowledgeArticle[] = [
  {
    id: "know_airless_alapok",
    type: "knowledge",
    slug: "airless-festekszoras-alapok",
    name: "Airless festékszórás — alapok",
    shortDescription:
      "Mi az airless technológia, és mely márkák / gépek kapcsolódnak hozzá Magyarországon.",
    body: "Az airless festékszórás a professzionális festés egyik alapeljárása. A tudásanyag a Technology és Brand entitásokat documents relationnel köti (kanonikus: Knowledge → Entity).",
    status: "published",
    indexable: true,
    seoTitle: "Airless festékszórás alapok | FESTÉKINDEX Tudástár",
    seoDescription:
      "Airless technológia magyarázata, kapcsolódó márkák és forgalmazók.",
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
      "Rövid szakmai összevetés: powder coating vs. folyékony festékrendszerek.",
    body: "A porfesték és a folyékony ipari bevonatok más-más környezetre optimalizáltak. A tudásanyag a porfesték technológiát documents relationnel köti.",
    status: "published",
    indexable: true,
    seoTitle: "Porfesték vs. folyékony bevonat | FESTÉKINDEX Tudástár",
    seoDescription: "Porfesték és folyékony bevonatok összevetése.",
    sourceIds: [],
    updatedAt: "2026-10-05",
  },
];
