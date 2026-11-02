import type { Brand } from "../../types";

/** New KEMIKÁL sub-brands (Kemikál already in lib/data/brands.ts). */
export const kemikalBrands: Brand[] = [
  {
    id: "brand_bornit",
    type: "brand",
    slug: "bornit",
    name: "Bornit",
    shortDescription: "Bornit — KEMIKÁL forgalmazott bitumenes márka.",
    body: "A Bornit a KEMIKÁL Építőanyagipari Zrt. kapcsolódó portfóliójához tartozó márka. Hivatalos forrás: kemikal.hu.",
    status: "published",
    indexable: false,
    seoTitle: "Bornit | FESTÉKINDEX",
    seoDescription: "Bornit — KEMIKÁL forgalmazott bitumenes márka.",
    sourceIds: ["src_kemikal_hu"],
    updatedAt: "2026-11-02",
    verifiedAt: "2026-11-02",
  },
  {
    id: "brand_tetol",
    type: "brand",
    slug: "tetol",
    name: "Tetol",
    shortDescription: "Tetol — KEMIKÁL forgalmazott faanyagvédelmi márka.",
    body: "A Tetol a KEMIKÁL Építőanyagipari Zrt. kapcsolódó portfóliójához tartozó márka. Hivatalos forrás: kemikal.hu.",
    status: "published",
    indexable: false,
    seoTitle: "Tetol | FESTÉKINDEX",
    seoDescription: "Tetol — KEMIKÁL forgalmazott faanyagvédelmi márka.",
    sourceIds: ["src_kemikal_hu"],
    updatedAt: "2026-11-02",
    verifiedAt: "2026-11-02",
  }
];
