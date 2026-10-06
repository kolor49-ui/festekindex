/**
 * SSR page model for manufacturer Organization hubs.
 * Editorial SEO overrides are slug-keyed and optional — graph data always from repository.
 */

import type { Organization, Source } from "@/lib/data/types";
import {
  getCanonicalUrl,
  getEntityHref,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import {
  getOrganizationPortfolio,
  type OrganizationPortfolio,
  type PortfolioBrandGroup,
  type PortfolioFamilyCard,
} from "@/lib/data/organizationPortfolio";
import { evaluateIndexability } from "@/lib/seo/indexability";

export type OrgHubSeoOverride = {
  h1: string;
  title: string;
  lead: string;
  metaDescription?: string;
};

/**
 * Verified editorial SEO for reference hubs.
 * Only copy — never product/category lists.
 */
const ORG_HUB_SEO: Record<string, OrgHubSeoOverride> = {
  "festek-bazis-zrt": {
    h1: "Festék Bázis Zrt.",
    title:
      "Festék Bázis Zrt. – VALMOR, FACTOR és COROR festékek | FESTÉKINDEX",
    lead: "Magyar festék- és bevonóanyag-gyártó, VALMOR, FACTOR és COROR termékcsaládokkal. Portfóliója a beltéri és homlokzati festékektől a faipari bevonatokon és padlóbevonatokon át a korrózióvédelmi rendszerekig terjed.",
    metaDescription:
      "Festék Bázis Zrt.: VALMOR, FACTOR és COROR — magyar festékgyártó márkák, termékcsaládok és szakmai kapcsolatok a FESTÉKINDEX-en.",
  },
};

export type CompanyFact = {
  label: string;
  value: string;
  /** External URL when the fact is a website link. */
  href?: string;
};

export type OrganizationHubModel = {
  organization: Organization;
  portfolio: OrganizationPortfolio;
  kindLabel: string;
  h1: string;
  title: string;
  lead: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: { name: string; path: string }[];
  indexable: boolean;
  /** Compact meta chips under the lead */
  metaChips: { label: string; value: string }[];
  brands: { id: string; name: string; href: string }[];
  brandGroups: PortfolioBrandGroup[];
  orphanFamilies: PortfolioFamilyCard[];
  allProductCount: number;
  companyFacts: CompanyFact[];
  categories: OrganizationPortfolio["categories"];
  technologies: OrganizationPortfolio["technologies"];
  surfaces: OrganizationPortfolio["surfaces"];
  sources: Source[];
  lastVerifiedAt?: string;
  /** Human-readable HU date derived from lastVerifiedAt. */
  lastVerifiedLabel?: string;
};

const HU_MONTHS = [
  "január",
  "február",
  "március",
  "április",
  "május",
  "június",
  "július",
  "augusztus",
  "szeptember",
  "október",
  "november",
  "december",
] as const;

/** Format repository ISO date (YYYY-MM-DD…) as "2026. október 5." */
export function formatHuVerifiedDate(iso: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return undefined;
  const year = m[1];
  const monthIdx = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (monthIdx < 0 || monthIdx > 11 || !Number.isFinite(day) || day < 1) {
    return undefined;
  }
  return `${year}. ${HU_MONTHS[monthIdx]} ${day}.`;
}

/**
 * Company facts from Organization fields only — never invented.
 * Omit any row whose value is missing.
 */
export function buildCompanyFacts(org: Organization): CompanyFact[] {
  const facts: CompanyFact[] = [];

  if (org.legalName?.trim()) {
    facts.push({ label: "Teljes cégnév", value: org.legalName.trim() });
  }
  if (org.hqCity?.trim()) {
    facts.push({ label: "Székhely", value: org.hqCity.trim() });
  }
  if (org.country?.trim()) {
    const code = org.country.trim();
    facts.push({
      label: "Ország",
      value: code === "HU" ? "Magyarország" : code,
    });
  }
  if (org.website?.trim()) {
    const url = org.website.trim();
    facts.push({ label: "Hivatalos weboldal", value: url, href: url });
  }

  return facts;
}

export function buildOrganizationHubModel(
  organization: Organization,
): OrganizationHubModel | null {
  const portfolio = getOrganizationPortfolio(organization.id);
  if (!portfolio) return null;

  const seo = ORG_HUB_SEO[organization.slug];
  const evaluation = evaluateIndexability(organization);
  const path = getEntityHref(organization);
  const canonicalUrl = getCanonicalUrl(organization);

  const h1 = seo?.h1 ?? organization.name;
  const title =
    seo?.title ??
    organization.seoTitle ??
    `${organization.name} | FESTÉKINDEX`;
  const lead =
    seo?.lead ??
    organization.shortDescription ??
    `${organization.name} festékipari szervezet a FESTÉKINDEX-en.`;
  const metaDescription =
    seo?.metaDescription ??
    organization.seoDescription ??
    lead;

  const brands = portfolio.ownedBrands.map((b) => ({
    id: b.id,
    name: b.name,
    href: getEntityHref(b),
  }));

  const familyCount =
    portfolio.brandGroups.reduce((n, g) => n + g.families.length, 0) +
    portfolio.orphanFamilies.length;

  const metaChips: { label: string; value: string }[] = [
    { label: "Szerep", value: "Gyártó" },
  ];
  if (organization.country) {
    metaChips.push({ label: "Ország", value: organization.country });
  }
  if (portfolio.ownedBrands.length) {
    metaChips.push({
      label: "Márkák",
      value: String(portfolio.ownedBrands.length),
    });
  }
  if (familyCount) {
    metaChips.push({
      label: "Termékcsaládok",
      value: String(familyCount),
    });
  }
  if (portfolio.allProducts.length) {
    metaChips.push({
      label: "Termékek",
      value: String(portfolio.allProducts.length),
    });
  }

  const lastVerifiedLabel = portfolio.lastVerifiedAt
    ? formatHuVerifiedDate(portfolio.lastVerifiedAt)
    : undefined;

  return {
    organization,
    portfolio,
    kindLabel: "Gyártó",
    h1,
    title,
    lead,
    metaDescription,
    canonicalUrl,
    breadcrumbs: [
      { name: "FESTÉKINDEX", path: "/" },
      { name: "Cégek", path: "/cegek" },
      { name: organization.name, path },
    ],
    // Hub is indexable if org flag allows OR we have a full editorial SEO override
    indexable: evaluation.indexable || Boolean(seo),
    metaChips,
    brands,
    brandGroups: portfolio.brandGroups,
    orphanFamilies: portfolio.orphanFamilies,
    allProductCount: portfolio.allProducts.length,
    companyFacts: buildCompanyFacts(organization),
    categories: portfolio.categories,
    technologies: portfolio.technologies,
    surfaces: portfolio.surfaces,
    sources: portfolio.sources,
    lastVerifiedAt: portfolio.lastVerifiedAt,
    lastVerifiedLabel,
  };
}

export function organizationHubMetadata(model: OrganizationHubModel) {
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

export function buildOrganizationHubJsonLd(model: OrganizationHubModel) {
  const org = model.organization;
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

  const organizationLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: org.name,
    description: model.lead,
    url: model.canonicalUrl,
  };
  if (org.legalName) organizationLd.legalName = org.legalName;
  if (org.website) organizationLd.sameAs = [org.website];
  if (org.country) {
    organizationLd.areaServed = {
      "@type": "Country",
      name: org.country,
    };
  }
  if (model.brands.length) {
    organizationLd.brand = model.brands.map((b) => ({
      "@type": "Brand",
      name: b.name,
      url: b.href.startsWith("http") ? b.href : `${SITE_ORIGIN}${b.href}`,
    }));
  }

  return [breadcrumb, organizationLd];
}
