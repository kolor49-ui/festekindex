import type { ProductFamily } from "./types";

/**
 * Product families are modeled from day one (e.g. Graco Mark / Ultra / GX).
 * Sparse seed for now — relations wire them into the knowledge graph.
 */
export const productFamilies: ProductFamily[] = [
  {
    id: "pf_graco_mark",
    type: "productFamily",
    slug: "graco-mark",
    name: "Graco Mark",
    brandId: "brand_graco",
    shortDescription:
      "Graco Mark airless gépcsalád — professzionális festékszóró rendszerek.",
    body: "A Graco Mark család professzionális airless festékszóró gépeket foglal magába. A FESTÉKINDEX-en a Graco márkához, az airless technológiához és az Euroll forgalmazói kapcsolathoz kötődik.",
    status: "published",
    indexable: true,
    seoTitle: "Graco Mark gépcsalád | FESTÉKINDEX",
    seoDescription:
      "Graco Mark airless gépcsalád: technológia, forgalmazás, kapcsolódó tudás.",
    categoryIds: ["cat_szoras"],
    sourceIds: ["src_graco_official", "src_euroll_official"],
    updatedAt: "2026-10-05",
    verifiedAt: "2026-10-01",
  },
  {
    id: "pf_graco_ultra",
    type: "productFamily",
    slug: "graco-ultra",
    name: "Graco Ultra",
    brandId: "brand_graco",
    shortDescription: "Graco Ultra airless gépcsalád.",
    body: "A Graco Ultra család airless szórástechnikai gépeket tartalmaz. Kapcsolódik a Graco márkához és az airless festékszórás technológiához.",
    status: "published",
    indexable: true,
    seoTitle: "Graco Ultra gépcsalád | FESTÉKINDEX",
    seoDescription: "Graco Ultra airless gépcsalád a FESTÉKINDEX szakmai hálójában.",
    categoryIds: ["cat_szoras"],
    sourceIds: ["src_graco_official"],
    updatedAt: "2026-10-05",
  },
  {
    id: "pf_graco_gx",
    type: "productFamily",
    slug: "graco-gx",
    name: "Graco GX",
    brandId: "brand_graco",
    shortDescription: "Graco GX airless gépcsalád — belépő és középkategória.",
    body: "A Graco GX család belépő és középkategóriás airless gépeket kínál. A FESTÉKINDEX adatmodelljében a Graco márka és az airless technológia alá kapcsolódik.",
    status: "published",
    indexable: true,
    seoTitle: "Graco GX gépcsalád | FESTÉKINDEX",
    seoDescription: "Graco GX airless gépcsalád — szakmai adatlap és kapcsolatok.",
    categoryIds: ["cat_szoras"],
    sourceIds: ["src_graco_official"],
    updatedAt: "2026-10-05",
  },
];
