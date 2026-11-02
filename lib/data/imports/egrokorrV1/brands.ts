import type { Brand } from "../../types";

/** EGROKORR sub-brands (brand_egrokorr already in lib/data/brands.ts). */
export const egrokorrBrands: Brand[] = [
  {
    id: "brand_dunaplaszt",
    type: "brand",
    slug: "dunaplaszt",
    name: "Dunaplaszt",
    shortDescription: "Dunaplaszt — EGROKORR bevonatmárka.",
    body: "A Dunaplaszt az EGROKORR Zrt. kapcsolódó portfóliójához tartozó márka. Hivatalos forrás: egrokorr.hu.",
    status: "published",
    indexable: false,
    seoTitle: "Dunaplaszt | FESTÉKINDEX",
    seoDescription: "Dunaplaszt — EGROKORR bevonatmárka.",
    sourceIds: ["src_egrokorr_official"],
    updatedAt: "2026-11-02",
    verifiedAt: "2026-11-02",
  },
  {
    id: "brand_sziloplaszt",
    type: "brand",
    slug: "sziloplaszt",
    name: "Sziloplaszt",
    shortDescription: "Sziloplaszt — EGROKORR márka.",
    body: "A Sziloplaszt az EGROKORR Zrt. kapcsolódó portfóliójához tartozó márka. Hivatalos forrás: egrokorr.hu.",
    status: "published",
    indexable: false,
    seoTitle: "Sziloplaszt | FESTÉKINDEX",
    seoDescription: "Sziloplaszt — EGROKORR márka.",
    sourceIds: ["src_egrokorr_official"],
    updatedAt: "2026-11-02",
    verifiedAt: "2026-11-02",
  }
];
