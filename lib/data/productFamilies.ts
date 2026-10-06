import type { ProductFamily } from "./types";

/**
 * Product families (series / platforms). Concrete SKUs = Product (empty for now).
 * Brand / manufacturer links live in relations.
 * Blurbs = shortDescription only when source-backed.
 */
export const productFamilies: ProductFamily[] = [
  {
    id: "pf_graco_mark",
    type: "productFamily",
    slug: "graco-mark-vii",
    name: "Graco Mark VII",
    shortDescription:
      "Nagyobb teljesítményű professzionális airless festékszóró gépcsalád.",
    body: "A Graco Mark VII család professzionális airless festékszóró rendszereket foglal magába. A FESTÉKINDEX-en a Graco márkához, a Graco Inc. gyártói szervezethez és az airless technológiához kapcsolódik.",
    status: "published",
    indexable: true,
    seoTitle: "Graco Mark VII gépcsalád | FESTÉKINDEX",
    seoDescription:
      "Graco Mark VII professzionális airless gépcsalád — gyártó, forgalmazás, technológia.",
    sourceIds: ["src_graco_official", "src_euroll_official"],
    updatedAt: "2026-10-05",
    verifiedAt: "2026-10-01",
  },
  {
    id: "pf_graco_ultra",
    type: "productFamily",
    slug: "graco-ultra",
    name: "Graco Ultra",
    shortDescription:
      "Kompaktabb professzionális airless festékszóró gépcsalád.",
    body: "A Graco Ultra család kompaktabb airless szórástechnikai gépeket tartalmaz professzionális felhasználásra. Kapcsolódik a Graco márkához és az airless technológiához.",
    status: "published",
    indexable: true,
    seoTitle: "Graco Ultra gépcsalád | FESTÉKINDEX",
    seoDescription: "Graco Ultra kompakt airless festékszóró gépcsalád.",
    sourceIds: ["src_graco_official"],
    updatedAt: "2026-10-05",
    verifiedAt: "2026-10-01",
  },
  {
    id: "pf_graco_gx",
    type: "productFamily",
    slug: "graco-gx",
    name: "Graco GX",
    shortDescription:
      "Belépő- és középkategóriás professzionális airless festékszóró rendszer.",
    body: "A Graco GX család belépő- és középkategóriás professzionális airless gépeket kínál. A FESTÉKINDEX-en a Graco márkához és az airless technológiához kapcsolódik.",
    status: "published",
    indexable: true,
    seoTitle: "Graco GX gépcsalád | FESTÉKINDEX",
    seoDescription: "Graco GX belépő- és középkategóriás airless gépcsalád.",
    sourceIds: ["src_graco_official"],
    updatedAt: "2026-10-05",
    verifiedAt: "2026-10-01",
  },
];
