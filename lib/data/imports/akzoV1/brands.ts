import type { Brand } from "../../types";

/** New Akzo-family brands (Dulux/Sikkens already in lib/data/brands.ts). */
export const akzoBrands: Brand[] = [
  {
    id: "brand_hammerite",
    type: "brand",
    slug: "hammerite",
    name: "Hammerite",
    shortDescription: "Fémvédelmi zománc márka — Akzo Nobel Coatings.",
    body: "A Hammerite az Akzo Nobel Coatings Zrt. kapcsolódó portfóliójához tartozó márka. Hivatalos forrás: dulux.hu.",
    status: "published",
    indexable: false,
    seoTitle: "Hammerite | FESTÉKINDEX",
    seoDescription: "Fémvédelmi zománc márka — Akzo Nobel Coatings.",
    sourceIds: ["src_akzonobel_hu"],
    updatedAt: "2026-11-02",
    verifiedAt: "2026-11-02",
  },
  {
    id: "brand_sadolin",
    type: "brand",
    slug: "sadolin",
    name: "Sadolin",
    shortDescription: "Faanyagvédő és lazúr márka — Akzo Nobel Coatings.",
    body: "A Sadolin az Akzo Nobel Coatings Zrt. kapcsolódó portfóliójához tartozó márka. Hivatalos forrás: dulux.hu.",
    status: "published",
    indexable: false,
    seoTitle: "Sadolin | FESTÉKINDEX",
    seoDescription: "Faanyagvédő és lazúr márka — Akzo Nobel Coatings.",
    sourceIds: ["src_akzonobel_hu"],
    updatedAt: "2026-11-02",
    verifiedAt: "2026-11-02",
  }
];
