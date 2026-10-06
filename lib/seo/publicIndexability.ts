/**
 * Final PUBLIC indexability — robots + sitemap consume this.
 *
 * evaluateIndexability = base/raw entity text+graph quality
 * evaluatePublicIndexability = hard gates + approved Hub public-page policy
 *
 * Hard gates (publication, explicit indexable=false, synthetic) ALWAYS win.
 * Organization/Brand may pass via Hub quality after hard gates.
 * Other types preserve base evaluator behavior.
 */

import type { AnyEntity, Brand } from "@/lib/data/types";
import { getBrandPortfolio } from "@/lib/data/brandPortfolio";
import { evaluateIndexability } from "@/lib/seo/indexability";
import {
  hasBrandEditorialIndexOverride,
  hasOrganizationEditorialIndexOverride,
} from "@/lib/seo/hubSeoOverrides";

export type PublicIndexSource =
  | "base"
  | "organization_editorial_override"
  | "brand_editorial_override"
  | "brand_substantive_portfolio"
  | "not_published"
  | "flag_noindex"
  | "synthetic_nav_category"
  | "base_quality_fail";

export type PublicIndexability = {
  indexable: boolean;
  /** Internal debug/test only — never render publicly. */
  source: PublicIndexSource;
  baseIndexable: boolean;
  baseReasons: string[];
};

/** Brand Hub substantive portfolio — single shared definition. */
export function isBrandPortfolioSubstantive(portfolio: {
  allProducts: readonly unknown[];
  families: readonly unknown[];
  organizations: readonly unknown[];
}): boolean {
  return (
    portfolio.allProducts.length + portfolio.families.length >= 1 &&
    portfolio.organizations.length >= 1
  );
}

function hardGateSource(
  entity: AnyEntity,
): PublicIndexSource | null {
  if (entity.status !== "published") return "not_published";
  if (entity.indexable === false) return "flag_noindex";
  if (entity.id === "cat_all") return "synthetic_nav_category";
  return null;
}

/**
 * Final public SEO decision for detail pages.
 * Robots metadata and sitemap eligibility must both use this.
 */
export function evaluatePublicIndexability(
  entity: AnyEntity,
): PublicIndexability {
  const base = evaluateIndexability(entity);
  const baseIndexable = base.indexable;
  const baseReasons = base.reasons;

  const hard = hardGateSource(entity);
  if (hard) {
    return {
      indexable: false,
      source: hard,
      baseIndexable,
      baseReasons,
    };
  }

  if (baseIndexable) {
    return {
      indexable: true,
      source: "base",
      baseIndexable,
      baseReasons,
    };
  }

  if (entity.type === "organization") {
    if (hasOrganizationEditorialIndexOverride(entity.slug)) {
      return {
        indexable: true,
        source: "organization_editorial_override",
        baseIndexable,
        baseReasons,
      };
    }
    return {
      indexable: false,
      source: "base_quality_fail",
      baseIndexable,
      baseReasons,
    };
  }

  if (entity.type === "brand") {
    if (hasBrandEditorialIndexOverride(entity.slug)) {
      return {
        indexable: true,
        source: "brand_editorial_override",
        baseIndexable,
        baseReasons,
      };
    }
    const portfolio = getBrandPortfolio(entity.id);
    if (portfolio && isBrandPortfolioSubstantive(portfolio)) {
      return {
        indexable: true,
        source: "brand_substantive_portfolio",
        baseIndexable,
        baseReasons,
      };
    }
    return {
      indexable: false,
      source: "base_quality_fail",
      baseIndexable,
      baseReasons,
    };
  }

  // ProductFamily / Product / Surface / Technology / Category / Knowledge / …
  return {
    indexable: false,
    source: "base_quality_fail",
    baseIndexable,
    baseReasons,
  };
}

export function isPubliclyIndexable(entity: AnyEntity): boolean {
  return evaluatePublicIndexability(entity).indexable;
}

/** Test helper: public decision for a Brand-shaped fixture without mutating data. */
export function evaluatePublicIndexabilityForBrandFixture(
  brand: Brand,
): PublicIndexability {
  return evaluatePublicIndexability(brand);
}
