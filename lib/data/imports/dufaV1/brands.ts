import type { Brand } from "../../types";

/** New Düfa-family brands (umbrella brand_dufa already in lib/data/brands.ts). */
export const dufaBrands: Brand[] = [
  {
    id: "brand_profitec",
    type: "brand",
    slug: "profitec",
    name: "Profi Tec",
    shortDescription: "Profi Tec festékmárka — Meffert Hungária.",
    body: "A Profi Tec a Meffert Hungária Kft. gyártói portfóliójához kapcsolódó márka. Hivatalos forrás: dufa-hungary.hu.",
    status: "published",
    indexable: false,
    seoTitle: "Profi Tec | FESTÉKINDEX",
    seoDescription: "Profi Tec festékmárka — Meffert Hungária.",
    sourceIds: ["src_dufa_hungary"],
    updatedAt: "2026-11-01",
    verifiedAt: "2026-11-01",
  }
];
