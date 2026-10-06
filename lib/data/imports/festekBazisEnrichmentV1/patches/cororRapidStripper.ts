import type { ProductEnrichmentPatch } from "../types";

const V = "2026-10-06";
const PAGE = "src_coror_rapid_stripper";

export const cororRapidStripperPatch: ProductEnrichmentPatch = {
  productId: "prod_coror_rapid_stripper",
  officialUrl: "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-festeklemaro-p-333",
  productClass: "surface_prep",
  sourceSummary: "COROR Rapid Festéklemaró gél régi festékbevonatok eltávolítására fém, fa és ásványi felületekről. A hivatalos termékoldal szerint kiadósság 5–10 m²/l; hatóidő 2 perc–2 óra; hígítani nem szükséges. Felhordás ecsettel.",
  sourceSummarySourceIds: [PAGE],
  additionalSourceIds: [PAGE],
  packagingOptions: [
    { id: "pack_coror_rapid_stripper_0_6l", amount: 0.6, unit: "l", sourceIds: ["src_coror_rapid_stripper"], verifiedAt: V, status: "verified" },
  ],
  specifications: [
    {
      key: "coverage",
      value: {"kind":"range_unit","min":5,"max":10,"unit":"m2_per_l"},
      condition: {"note":"eltávolítandó festék fajtája és rétegszámai befolyásolhatják"},
      rawValue: "Kiadósság: 5-10 m2/liter",
      sourceIds: ["src_coror_rapid_stripper"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "dilution",
      value: {"kind":"text","text":"hígítani nem szükséges"},
      rawValue: "A festékmarót hígítani nem szükséges.",
      sourceIds: ["src_coror_rapid_stripper"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
    {
      key: "application_environment",
      value: {"kind":"multi_enum","values":["interior","exterior"]},
      rawValue: "kül- és beltérben",
      sourceIds: ["src_coror_rapid_stripper"],
      verifiedAt: "2026-10-06",
      status: "verified",
    },
  ],
};
