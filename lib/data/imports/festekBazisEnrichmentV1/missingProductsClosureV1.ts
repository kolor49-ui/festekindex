/**
 * Missing Products Closure v1 — audited candidate decisions.
 * Expected count increments derive from ACCEPTED fixtures, not hardcoded targets.
 */

export type MissingProductCandidateDecision =
  | "ACCEPTED"
  | "REJECTED"
  | "UNRESOLVED";

export type MissingProductCandidate = {
  candidateKey: string;
  status: MissingProductCandidateDecision;
  productId?: string;
  slug?: string;
  brandId?: string;
  productFamilyId?: string;
  officialName?: string;
  officialUrl?: string;
  expectedSpecCount?: number;
  expectedPackagingCount?: number;
  reason: string;
};

export const MISSING_PRODUCTS_CLOSURE_V1_CANDIDATES: MissingProductCandidate[] =
  [
    {
      candidateKey: "FACTOR Akril Vastaglazúr",
      status: "ACCEPTED",
      productId: "prod_factor_aqua_glaze",
      slug: "factor-aqua-akril-vastaglazur",
      brandId: "brand_factor",
      productFamilyId: "pf_factor_aqua",
      officialName: "FACTOR Aqua Akril Vastaglazúr",
      officialUrl:
        "https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-aqua-akril-vastaglazur-p-325",
      expectedSpecCount: 10,
      expectedPackagingCount: 4,
      reason:
        "Official festekbazis.hu product page p-325 + TDS invoiceId=325; current FACTOR Aqua Product.",
    },
    {
      candidateKey: "COROR Rapid Aqua Zománcfesték",
      status: "ACCEPTED",
      productId: "prod_coror_rapid_aqua_enamel",
      slug: "coror-rapid-aqua-zomancfestek",
      brandId: "brand_coror",
      productFamilyId: "pf_coror_rapid",
      officialName: "COROR Rapid Aqua Zománcfesték",
      officialUrl:
        "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-aqua-zomancfestek-p-460",
      expectedSpecCount: 8,
      expectedPackagingCount: 3,
      reason:
        "Official festekbazis.hu product page p-460 + TDS invoiceId=460; distinct water-based Rapid enamel vs solvent Rapid Zománcfesték (p-332).",
    },
    {
      candidateKey: "COROR Industry S-31 Hígító",
      status: "ACCEPTED",
      productId: "prod_coror_ind_s31",
      slug: "coror-industry-s-31-higito",
      brandId: "brand_coror",
      productFamilyId: "pf_coror_industry",
      officialName: "COROR Industry S-31 Hígító",
      officialUrl:
        "https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-indrusty-aromas-higito-p-443",
      expectedSpecCount: 0,
      expectedPackagingCount: 2,
      reason:
        "Official festekbazis.hu product page p-443 + TDS invoiceId=443; Industry thinner referenced by Industry Primer and Enamel TDS.",
    },
  ];

export const ACCEPTED_MISSING_PRODUCTS_V1 =
  MISSING_PRODUCTS_CLOSURE_V1_CANDIDATES.filter((c) => c.status === "ACCEPTED");

/** Pre-closure baselines (locked before this task). */
export const MISSING_PRODUCTS_CLOSURE_V1_BASELINE = {
  products: 27,
  specifications: 203,
  packaging: 68,
  dilutedWith: 6,
  searchDocuments: 102,
  enrichmentSources: 53,
  /** Merged sources before adding master page stubs + enrichment TDS overlays. */
  mergedSources: 77,
} as const;

export function expectedProductCountAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.products +
    ACCEPTED_MISSING_PRODUCTS_V1.length
  );
}

export function expectedSpecCountAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.specifications +
    ACCEPTED_MISSING_PRODUCTS_V1.reduce(
      (n, c) => n + (c.expectedSpecCount ?? 0),
      0,
    )
  );
}

export function expectedPackagingCountAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.packaging +
    ACCEPTED_MISSING_PRODUCTS_V1.reduce(
      (n, c) => n + (c.expectedPackagingCount ?? 0),
      0,
    )
  );
}

/** New dilutedWith edges added by this closure (Industry Primer/Enamel → S-31). */
export const NEW_DILUTED_WITH_FROM_S31_CLOSURE = 2;

export function expectedDilutedWithAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.dilutedWith +
    NEW_DILUTED_WITH_FROM_S31_CLOSURE
  );
}

/** Page + TDS sources per accepted Product. */
export const NEW_ENRICHMENT_SOURCES_PER_ACCEPTED = 2;

export function expectedEnrichmentSourcesAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.enrichmentSources +
    ACCEPTED_MISSING_PRODUCTS_V1.length * NEW_ENRICHMENT_SOURCES_PER_ACCEPTED
  );
}

/** Likely SearchDocument delta: +1 published Product SearchDocument each. */
export function expectedSearchDocumentsAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.searchDocuments +
    ACCEPTED_MISSING_PRODUCTS_V1.length
  );
}

/**
 * Relation increments from accepted Products (source-backed only).
 * - belongsToCategory: +1 each accepted
 * - usesTechnology: glaze ecset (+1), Rapid Aqua ecset/henger/szórás (+3)
 * - applicableToSurface: glaze fa (+1), Rapid Aqua 11 surfaces (+11)
 * - merged Sources: +3 page (master) +3 TDS (enrichment) = +6
 */
export const MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS = {
  belongsToCategory: 3,
  usesTechnology: 4,
  applicableToSurface: 12,
  mergedSources: 6,
  /** Pre-closure Product→Category baseline (3 products remain uncategorized). */
  productCategoryBaseline: 24,
  usesTechnologyBaseline: 60,
  applicableToSurfaceBaseline: 48,
} as const;

export function expectedProductCategoryRelationsAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS.productCategoryBaseline +
    MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS.belongsToCategory
  );
}

export function expectedUsesTechnologyAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS.usesTechnologyBaseline +
    MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS.usesTechnology
  );
}

export function expectedApplicableToSurfaceAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS.applicableToSurfaceBaseline +
    MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS.applicableToSurface
  );
}

export function expectedMergedSourcesAfterClosure(): number {
  return (
    MISSING_PRODUCTS_CLOSURE_V1_BASELINE.mergedSources +
    MISSING_PRODUCTS_CLOSURE_V1_RELATION_DELTAS.mergedSources
  );
}
