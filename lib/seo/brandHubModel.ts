/**
 * SSR page model for Brand hubs.
 * Editorial SEO overrides are slug-keyed and optional — graph data always from repository.
 */

import type { Brand, Organization, Source } from "@/lib/data/types";
import {
  getCanonicalUrl,
  getEntityHref,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import {
  getBrandPortfolio,
  type BrandOrgLink,
  type BrandPortfolio,
  type BrandFamilyBlock,
  type BrandPortfolioProduct,
} from "@/lib/data/brandPortfolio";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { formatHuVerifiedDate } from "@/lib/seo/organizationHubModel";
import { getEntityBreadcrumb } from "@/lib/navigation/entityNavigation";

export type BrandHubSeoOverride = {
  h1?: string;
  title: string;
  lead?: string;
  metaDescription?: string;
};

/**
 * Verified editorial SEO for reference hubs — copy only, never product lists.
 */
const BRAND_HUB_SEO: Record<string, BrandHubSeoOverride> = {
  valmor: {
    title: "VALMOR festékek és bevonatok | FESTÉKINDEX",
    lead: "Festék- és bevonatmárka a Festék Bázis Zrt. portfóliójában.",
    metaDescription:
      "VALMOR festékek és bevonatok: termékcsaládok, termékek és szakmai kapcsolatok a FESTÉKINDEX-en.",
  },
};

export type BrandHubModel = {
  brand: Brand;
  portfolio: BrandPortfolio;
  kindLabel: string;
  h1: string;
  title: string;
  lead: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: { name: string; path: string }[];
  indexable: boolean;
  metaChips: { label: string; value: string }[];
  families: BrandFamilyBlock[];
  directProducts: BrandPortfolioProduct[];
  allProductCount: number;
  categories: BrandPortfolio["categories"];
  technologies: BrandPortfolio["technologies"];
  surfaces: BrandPortfolio["surfaces"];
  /** Primary owner/manufacturer orgs for the dedicated section. */
  ownerOrgs: BrandOrgLink[];
  ownerSectionHeading: string;
  sources: Source[];
  lastVerifiedAt?: string;
  lastVerifiedLabel?: string;
};

function isStructuralCopy(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  if (t.includes("a FESTÉKINDEX adatbázisában")) return true;
  if (t.includes("Festék Bázis v0.")) return true;
  return false;
}

function usableText(text: string | undefined): string | undefined {
  const t = text?.trim() ?? "";
  if (!t || isStructuralCopy(t)) return undefined;
  return t;
}

function portfolioSuggestsCoatings(portfolio: BrandPortfolio): boolean {
  const coatingHints = [
    "festék",
    "bevonat",
    "homlokzat",
    "faipar",
    "padló",
    "műgyanta",
    "korrózió",
    "dekor",
  ];
  return portfolio.categories.some((c) => {
    const n = c.name.toLowerCase();
    return coatingHints.some((h) => n.includes(h));
  });
}

function deriveLead(
  brand: Brand,
  portfolio: BrandPortfolio,
  seo?: BrandHubSeoOverride,
): string {
  if (seo?.lead?.trim()) return seo.lead.trim();

  const fromBrand =
    usableText(brand.body) ?? usableText(brand.shortDescription);
  if (fromBrand) {
    // Prefer first sentence-ish for lead length
    const cut = fromBrand.split(/(?<=\.)\s+/)[0] ?? fromBrand;
    return cut.length > 220 ? `${cut.slice(0, 217).trim()}…` : cut;
  }

  const owner = portfolio.organizations.find((o) =>
    o.roles.includes("owner"),
  );
  if (owner) {
    return `${brand.name} márka a ${owner.organization.name} portfóliójában.`;
  }

  return `${brand.name} festékipari márka a FESTÉKINDEX-en.`;
}

function deriveTitle(
  brand: Brand,
  portfolio: BrandPortfolio,
  seo?: BrandHubSeoOverride,
): string {
  if (seo?.title) return seo.title;
  const existing = usableText(brand.seoTitle);
  if (existing) return existing;

  if (portfolioSuggestsCoatings(portfolio)) {
    return `${brand.name} festékek és bevonatok | FESTÉKINDEX`;
  }
  if (portfolio.families.length || portfolio.allProducts.length) {
    return `${brand.name} termékek | FESTÉKINDEX`;
  }
  return `${brand.name} | FESTÉKINDEX`;
}

function deriveMetaDescription(
  brand: Brand,
  lead: string,
  portfolio: BrandPortfolio,
  seo?: BrandHubSeoOverride,
): string {
  if (seo?.metaDescription?.trim()) return seo.metaDescription.trim();
  const existing = usableText(brand.seoDescription);
  if (existing) return existing;

  const parts: string[] = [brand.name];
  const owner = portfolio.organizations.find((o) =>
    o.roles.includes("owner"),
  );
  if (owner) parts.push(owner.organization.name);
  if (portfolio.families.length) {
    parts.push(`${portfolio.families.length} termékcsalád`);
  }
  if (portfolio.allProducts.length) {
    parts.push(`${portfolio.allProducts.length} termék`);
  }
  const base = parts.join(" — ");
  if (base.length >= 40) return `${base} a FESTÉKINDEX-en.`;
  return lead.length > 160 ? `${lead.slice(0, 157)}…` : lead;
}

function ownerSectionHeading(orgs: BrandOrgLink[]): string {
  const roles = new Set(orgs.flatMap((o) => o.roles));
  const hasOwner = roles.has("owner");
  const hasMfr = roles.has("manufacturer");
  if (hasOwner && hasMfr) return "Gyártó / tulajdonos";
  if (hasMfr) return "Gyártó";
  if (hasOwner) return "Tulajdonos";
  if (roles.has("distributor") || roles.has("representation")) {
    return "Kapcsolódó szervezet";
  }
  return "Kapcsolódó szervezet";
}

function ownerChipLabel(orgs: BrandOrgLink[]): string {
  const roles = new Set(orgs.flatMap((o) => o.roles));
  if (roles.has("owner") && roles.has("manufacturer")) {
    return "Gyártó / tulajdonos";
  }
  if (roles.has("manufacturer")) return "Gyártó";
  if (roles.has("owner")) return "Tulajdonos";
  return "Szervezet";
}

function orgBlurb(org: Organization): string | undefined {
  return usableText(org.shortDescription) ?? usableText(org.body);
}

export function buildBrandHubModel(brand: Brand): BrandHubModel | null {
  const portfolio = getBrandPortfolio(brand.id);
  if (!portfolio) return null;

  const seo = BRAND_HUB_SEO[brand.slug];
  const evaluation = evaluateIndexability(brand);
  const canonicalUrl = getCanonicalUrl(brand);

  const h1 = seo?.h1 ?? brand.name;
  const lead = deriveLead(brand, portfolio, seo);
  const title = deriveTitle(brand, portfolio, seo);
  const metaDescription = deriveMetaDescription(brand, lead, portfolio, seo);

  const ownerOrgs = portfolio.organizations.filter(
    (o) =>
      o.roles.includes("owner") ||
      o.roles.includes("manufacturer"),
  );
  const displayOrgs =
    ownerOrgs.length > 0
      ? ownerOrgs
      : portfolio.organizations.slice(0, 1);

  const metaChips: { label: string; value: string }[] = [];
  if (displayOrgs.length) {
    metaChips.push({
      label: ownerChipLabel(displayOrgs),
      value: displayOrgs.map((o) => o.organization.name).join(", "),
    });
  }
  if (portfolio.families.length) {
    metaChips.push({
      label: "Termékcsaládok",
      value: String(portfolio.families.length),
    });
  }
  if (portfolio.allProducts.length) {
    metaChips.push({
      label: "Termékek",
      value: String(portfolio.allProducts.length),
    });
  }
  if (portfolio.categories.length) {
    metaChips.push({
      label: "Szakmai területek",
      value: String(portfolio.categories.length),
    });
  }

  const lastVerifiedLabel = portfolio.lastVerifiedAt
    ? formatHuVerifiedDate(portfolio.lastVerifiedAt)
    : undefined;

  // Index when evaluation passes, editorial SEO exists, or portfolio graph is substantive
  const substantive =
    portfolio.allProducts.length + portfolio.families.length >= 1 &&
    portfolio.organizations.length >= 1;

  return {
    brand,
    portfolio,
    kindLabel: "Márka",
    h1,
    title,
    lead,
    metaDescription,
    canonicalUrl,
    breadcrumbs: getEntityBreadcrumb(brand),
    indexable: evaluation.indexable || Boolean(seo) || substantive,
    metaChips,
    families: portfolio.families,
    directProducts: portfolio.directProducts,
    allProductCount: portfolio.allProducts.length,
    categories: portfolio.categories,
    technologies: portfolio.technologies,
    surfaces: portfolio.surfaces,
    ownerOrgs: displayOrgs,
    ownerSectionHeading: ownerSectionHeading(displayOrgs),
    sources: portfolio.sources,
    lastVerifiedAt: portfolio.lastVerifiedAt,
    lastVerifiedLabel,
  };
}

export function brandHubMetadata(model: BrandHubModel) {
  return {
    title: { absolute: model.title },
    description: model.metaDescription,
    alternates: { canonical: model.canonicalUrl },
    openGraph: {
      title: model.title,
      description: model.metaDescription,
      url: model.canonicalUrl,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website" as const,
    },
    robots: model.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export function buildBrandHubJsonLd(model: BrandHubModel) {
  const brand = model.brand;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: model.breadcrumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_ORIGIN}${c.path}`,
    })),
  };

  const brandLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: model.canonicalUrl,
  };

  const desc = usableText(model.lead);
  if (desc) brandLd.description = desc;

  return [breadcrumb, brandLd];
}

/** Safe org blurb for UI — exported for the page component. */
export function brandOwnerBlurb(org: Organization): string | undefined {
  return orgBlurb(org);
}
