/**
 * FESTÉK BÁZIS Catalogue Completeness Audit + Closure v1.
 * Official productsCatalog inventory reconciled to FESTÉKINDEX.
 */

export type CatalogueCandidateDecision =
  | "EXISTING"
  | "ACCEPTED"
  | "REJECTED"
  | "UNRESOLVED";

export type CatalogueCandidate = {
  candidateKey: string;
  status: CatalogueCandidateDecision;
  productId?: string;
  slug?: string;
  brandId?: string | null;
  productFamilyId?: string | null;
  officialName?: string;
  officialUrl?: string;
  invoiceId?: string;
  expectedSpecCount?: number;
  expectedPackagingCount?: number;
  reason: string;
};

/** Locked baseline immediately before this catalogue closure (post professional-description). */
export const CATALOGUE_CLOSURE_V1_BASELINE = {
  products: 30,
  specifications: 221,
  packaging: 77,
  dilutedWith: 8,
  searchDocuments: 105,
  enrichmentSources: 59,
  mergedSources: 83,
} as const;

export const CATALOGUE_CLOSURE_V1_CANDIDATES: CatalogueCandidate[] = [
  {
    candidateKey: "FACTOR Vastaglazúr",
    status: "ACCEPTED",
    productId: "prod_factor_vastaglazur",
    slug: "factor-vastaglazur",
    brandId: "brand_factor",
    productFamilyId: null,
    officialName: "FACTOR Vastaglazúr",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-vastaglazur-p-327",
    invoiceId: "327",
    expectedSpecCount: 1,
    expectedPackagingCount: 4,
    reason: "Official festekbazis.hu product page p-327 + TDS invoiceId=327; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR AIR FLOW Beltéri Hőtükör-Festék",
    status: "ACCEPTED",
    productId: "prod_valmor_airflow_heat_mirror_paint",
    slug: "valmor-air-flow-belteri-hotukor-festek",
    brandId: "brand_valmor",
    productFamilyId: "pf_valmor_air_flow",
    officialName: "VALMOR AIR FLOW Beltéri Hőtükör-Festék",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-belteri-hotukor-festek-p-356",
    invoiceId: "356",
    expectedSpecCount: 1,
    expectedPackagingCount: 1,
    reason: "Official festekbazis.hu product page p-356 + TDS invoiceId=356; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR AIR FLOW Kenhető Hőtükör",
    status: "ACCEPTED",
    productId: "prod_valmor_airflow_heat_mirror_paste",
    slug: "valmor-air-flow-kenheto-hotukor",
    brandId: "brand_valmor",
    productFamilyId: "pf_valmor_air_flow",
    officialName: "VALMOR AIR FLOW Kenhető Hőtükör",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-kenheto-hotukor-p-321",
    invoiceId: "321",
    expectedSpecCount: 0,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-321 + TDS invoiceId=321; current catalogue listing.",
  },
  {
    candidateKey: "COROR Klórkaucsuk Bevonat",
    status: "ACCEPTED",
    productId: "prod_coror_chlorinated_rubber",
    slug: "coror-klorkaucsuk-bevonat",
    brandId: "brand_coror",
    productFamilyId: null,
    officialName: "COROR Klórkaucsuk Bevonat",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-klorkaucsuk-bevonat-p-334",
    invoiceId: "334",
    expectedSpecCount: 1,
    expectedPackagingCount: 4,
    reason: "Official festekbazis.hu product page p-334 + TDS invoiceId=334; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Biztonságos Padló- és Jelölőfesték",
    status: "ACCEPTED",
    productId: "prod_valmor_safe_floor",
    slug: "valmor-biztonsagos-padlo-es-jelolo-festek",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Biztonságos Padló- és Jelölőfesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-biztonsagos-padlo-es-jelolo-festek-p-306",
    invoiceId: "306",
    expectedSpecCount: 1,
    expectedPackagingCount: 4,
    reason: "Official festekbazis.hu product page p-306 + TDS invoiceId=306; current catalogue listing.",
  },
  {
    candidateKey: "FACTOR 2 in 1 Színezett Alapozó és Vékonylazúr",
    status: "ACCEPTED",
    productId: "prod_factor_2in1_lazur",
    slug: "factor-2-in-1-szinezett-alapozo-es-vekonylazur",
    brandId: "brand_factor",
    productFamilyId: null,
    officialName: "FACTOR 2 in 1 Színezett Alapozó és Vékonylazúr",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-2-in-1-szinezett-alapozo-es-vekonylazur-p-326",
    invoiceId: "326",
    expectedSpecCount: 1,
    expectedPackagingCount: 4,
    reason: "Official festekbazis.hu product page p-326 + TDS invoiceId=326; current catalogue listing.",
  },
  {
    candidateKey: "FACTOR Padlózománc",
    status: "ACCEPTED",
    productId: "prod_factor_floor_enamel",
    slug: "factor-padlozomanc",
    brandId: "brand_factor",
    productFamilyId: null,
    officialName: "FACTOR Padlózománc",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-padlozomanc-p-330",
    invoiceId: "330",
    expectedSpecCount: 1,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-330 + TDS invoiceId=330; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR AIR FLOW Fixatív Felületkezelő",
    status: "ACCEPTED",
    productId: "prod_valmor_airflow_fixative",
    slug: "valmor-air-flow-fixativ-feluletkezelo",
    brandId: "brand_valmor",
    productFamilyId: "pf_valmor_air_flow",
    officialName: "VALMOR AIR FLOW Fixatív Felületkezelő",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-fixativ-feluletkezelo-p-355",
    invoiceId: "355",
    expectedSpecCount: 0,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-355 + TDS invoiceId=355; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Aqua-Tech Kenhető Vízszigetelés",
    status: "ACCEPTED",
    productId: "prod_valmor_aqua_tech",
    slug: "valmor-aqua-tech-kenheto-vizszigeteles",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Aqua-Tech Kenhető Vízszigetelés",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-aqua-tech-kenheto-vizszigeteles-p-310",
    invoiceId: "310",
    expectedSpecCount: 1,
    expectedPackagingCount: 3,
    reason: "Official festekbazis.hu product page p-310 + TDS invoiceId=310; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Flexibilis Folyékony Fólia",
    status: "ACCEPTED",
    productId: "prod_valmor_liquid_foil",
    slug: "valmor-flexibilis-folyekony-folia",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Flexibilis Folyékony Fólia",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-flexibilis-folyekony-folia-p-308",
    invoiceId: "308",
    expectedSpecCount: 0,
    expectedPackagingCount: 3,
    reason: "Official festekbazis.hu product page p-308 + TDS invoiceId=308; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Hídképző Alapozó",
    status: "ACCEPTED",
    productId: "prod_valmor_bridge_primer",
    slug: "valmor-hidkepzo-alapozo",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Hídképző Alapozó",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-hidkepzo-alapozo-p-342",
    invoiceId: "342",
    expectedSpecCount: 0,
    expectedPackagingCount: 3,
    reason: "Official festekbazis.hu product page p-342 + TDS invoiceId=342; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Tapadóhíd",
    status: "ACCEPTED",
    productId: "prod_valmor_bond_bridge",
    slug: "valmor-tapadohid",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Tapadóhíd",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-tapadohid-p-309",
    invoiceId: "309",
    expectedSpecCount: 0,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-309 + TDS invoiceId=309; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Penészgátló Falfesték",
    status: "ACCEPTED",
    productId: "prod_valmor_mold_paint",
    slug: "valmor-peneszgatlo-falfestek",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Penészgátló Falfesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-peneszgatlo-falfestek-p-316",
    invoiceId: "316",
    expectedSpecCount: 1,
    expectedPackagingCount: 3,
    reason: "Official festekbazis.hu product page p-316 + TDS invoiceId=316; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Qlassique Fehér Beltéri Falfesték",
    status: "ACCEPTED",
    productId: "prod_valmor_qlassique",
    slug: "valmor-qlassique-feher-belteri-falfestek",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Qlassique Fehér Beltéri Falfesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-qlassique-feher-belteri-falfestek-p-314",
    invoiceId: "314",
    expectedSpecCount: 1,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-314 + TDS invoiceId=314; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Touchline pályafesték",
    status: "ACCEPTED",
    productId: "prod_valmor_touchline",
    slug: "valmor-touchline-palyafestek",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Touchline pályafesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-touchline-palyafestek-p-465",
    invoiceId: "465",
    expectedSpecCount: 1,
    expectedPackagingCount: 1,
    reason: "Official festekbazis.hu product page p-465 + TDS invoiceId=465; current catalogue listing.",
  },
  {
    candidateKey: "Immunetec by VALMOR Standard Beltéri Falfesték",
    status: "ACCEPTED",
    productId: "prod_valmor_immunetec_standard",
    slug: "immunetec-by-valmor-belteri-falfestek",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "Immunetec by VALMOR Standard Beltéri Falfesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-immunetec-by-valmor-belteri-falfestek-p-362",
    invoiceId: "362",
    expectedSpecCount: 1,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-362 + TDS invoiceId=362; current catalogue listing.",
  },
  {
    candidateKey: "Immunetec by VALMOR Prémium Beltéri Falfesték",
    status: "ACCEPTED",
    productId: "prod_valmor_immunetec_premium",
    slug: "immunetec-by-valmor-premium-belteri-falfestek",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "Immunetec by VALMOR Prémium Beltéri Falfesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-immunetec-by-valmor-premium-belteri-falfestek-p-363",
    invoiceId: "363",
    expectedSpecCount: 1,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-363 + TDS invoiceId=363; current catalogue listing.",
  },
  {
    candidateKey: "7016™ Antracit Akril Zománc",
    status: "ACCEPTED",
    productId: "prod_7016_enamel",
    slug: "7016-antracit-akril-zomanc",
    brandId: null,
    productFamilyId: "pf_7016",
    officialName: "7016™ Antracit Akril Zománc",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/7016-7016-antracit-akril-zomanc-p-345",
    invoiceId: "345",
    expectedSpecCount: 1,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-345 + TDS invoiceId=345; current catalogue listing.",
  },
  {
    candidateKey: "7016™ Antracit Kültéri Falfesték",
    status: "ACCEPTED",
    productId: "prod_7016_exterior",
    slug: "7016-antracit-kulteri-falfestek",
    brandId: null,
    productFamilyId: "pf_7016",
    officialName: "7016™ Antracit Kültéri Falfesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/7016-7016-antracit-kulteri-falfestek-p-347",
    invoiceId: "347",
    expectedSpecCount: 1,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-347 + TDS invoiceId=347; current catalogue listing.",
  },
  {
    candidateKey: "7016™ Antracit Pergola Fafesték",
    status: "ACCEPTED",
    productId: "prod_7016_pergola",
    slug: "7016-antracit-pergola-fafestek",
    brandId: null,
    productFamilyId: "pf_7016",
    officialName: "7016™ Antracit Pergola Fafesték",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/7016-7016-antracit-pergola-fafestek-p-344",
    invoiceId: "344",
    expectedSpecCount: 1,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-344 + TDS invoiceId=344; current catalogue listing.",
  },
  {
    candidateKey: "7016™ Antracit Kapart 1,5 Vakolat",
    status: "ACCEPTED",
    productId: "prod_7016_plaster",
    slug: "7016-antracit-kapart-1-5-vakolat",
    brandId: null,
    productFamilyId: "pf_7016",
    officialName: "7016™ Antracit Kapart 1,5 Vakolat",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/7016-7016-antracit-kapart-1-5-vakolat-p-346",
    invoiceId: "346",
    expectedSpecCount: 0,
    expectedPackagingCount: 3,
    reason: "Official festekbazis.hu product page p-346 + TDS invoiceId=346; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Kőbalzsam",
    status: "ACCEPTED",
    productId: "prod_valmor_stone_balm",
    slug: "valmor-kobalzsam",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Kőbalzsam",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-kobalzsam-p-307",
    invoiceId: "307",
    expectedSpecCount: 1,
    expectedPackagingCount: 3,
    reason: "Official festekbazis.hu product page p-307 + TDS invoiceId=307; current catalogue listing.",
  },
  {
    candidateKey: "VALMOR Rapid Polisztirol Ragasztó",
    status: "ACCEPTED",
    productId: "prod_valmor_eps_adhesive",
    slug: "valmor-rapid-polisztirol-ragaszto",
    brandId: "brand_valmor",
    productFamilyId: null,
    officialName: "VALMOR Rapid Polisztirol Ragasztó",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-rapid-polisztirol-ragaszto-p-312",
    invoiceId: "312",
    expectedSpecCount: 0,
    expectedPackagingCount: 2,
    reason: "Official festekbazis.hu product page p-312 + TDS invoiceId=312; current catalogue listing.",
  },
  {
    candidateKey: "COROR TOOLS RAL Classic színkártya",
    status: "REJECTED",
    officialUrl: "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-tools-ral-classic-szinkartya-p-453",
    reason: "Colour/tool card listing — not a coating Product; no professional description sections.",
  },
];

export const ACCEPTED_CATALOGUE_CLOSURE_V1 =
  CATALOGUE_CLOSURE_V1_CANDIDATES.filter((c) => c.status === "ACCEPTED");

export function expectedProductCountAfterCatalogueClosure(): number {
  return CATALOGUE_CLOSURE_V1_BASELINE.products + ACCEPTED_CATALOGUE_CLOSURE_V1.length;
}

export function expectedSpecCountAfterCatalogueClosure(): number {
  return (
    CATALOGUE_CLOSURE_V1_BASELINE.specifications +
    ACCEPTED_CATALOGUE_CLOSURE_V1.reduce((n, c) => n + (c.expectedSpecCount ?? 0), 0)
  );
}

export function expectedPackagingCountAfterCatalogueClosure(): number {
  return (
    CATALOGUE_CLOSURE_V1_BASELINE.packaging +
    ACCEPTED_CATALOGUE_CLOSURE_V1.reduce((n, c) => n + (c.expectedPackagingCount ?? 0), 0)
  );
}

export function expectedSearchDocumentsAfterCatalogueClosure(): number {
  return CATALOGUE_CLOSURE_V1_BASELINE.searchDocuments + ACCEPTED_CATALOGUE_CLOSURE_V1.length;
}

export function expectedEnrichmentSourcesAfterCatalogueClosure(): number {
  return CATALOGUE_CLOSURE_V1_BASELINE.enrichmentSources + ACCEPTED_CATALOGUE_CLOSURE_V1.length * 2;
}

export function expectedMergedSourcesAfterCatalogueClosure(): number {
  // +1 page stub in master + 1 TDS enrichment overlay per accepted Product
  return CATALOGUE_CLOSURE_V1_BASELINE.mergedSources + ACCEPTED_CATALOGUE_CLOSURE_V1.length * 2;
}

export function expectedDilutedWithAfterCatalogueClosure(): number {
  return CATALOGUE_CLOSURE_V1_BASELINE.dilutedWith;
}

