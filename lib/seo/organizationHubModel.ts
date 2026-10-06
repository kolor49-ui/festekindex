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
import { getEntityBreadcrumb } from "@/lib/navigation/entityNavigation";

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
  /** Span full grid width (e.g. long legal name). */
  wide?: boolean;
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

/** Human-readable seat: "9545 Jánosháza, Jókai utca 28." */
export function formatRegisteredOffice(
  org: Organization,
): string | undefined {
  const office = org.registeredOffice;
  if (office) {
    const locality = [office.postalCode?.trim(), office.city?.trim()]
      .filter(Boolean)
      .join(" ");
    const line = office.addressLine?.trim();
    if (locality && line) return `${locality}, ${line}`;
    if (locality) return locality;
    if (line) return line;
  }
  const legacy = org.hqCity?.trim();
  return legacy || undefined;
}

/**
 * Company facts from Organization fields only — never invented.
 * Omit any row whose value is missing.
 * foundedYear only when present on the entity (callers gate provenance at write-time).
 */
export function buildCompanyFacts(org: Organization): CompanyFact[] {
  const facts: CompanyFact[] = [];

  if (org.legalName?.trim()) {
    facts.push({
      label: "Teljes cégnév",
      value: org.legalName.trim(),
      wide: true,
    });
  }

  const seat = formatRegisteredOffice(org);
  if (seat) {
    facts.push({ label: "Székhely", value: seat });
  }

  if (org.companyRegistrationNumber?.trim()) {
    facts.push({
      label: "Cégjegyzékszám",
      value: org.companyRegistrationNumber.trim(),
    });
  }

  if (org.taxNumber?.trim()) {
    facts.push({ label: "Adószám", value: org.taxNumber.trim() });
  }

  if (org.primaryActivity?.trim()) {
    facts.push({ label: "Tevékenység", value: org.primaryActivity.trim() });
  }

  if (
    typeof org.foundedYear === "number" &&
    Number.isFinite(org.foundedYear) &&
    org.foundedYear >= 1800 &&
    org.foundedYear <= 2100
  ) {
    facts.push({ label: "Alapítás éve", value: String(org.foundedYear) });
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
    breadcrumbs: getEntityBreadcrumb(organization),
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
  if (org.website) {
    organizationLd.sameAs = [org.website];
  }

  const office = org.registeredOffice;
  if (office?.addressLine || office?.city || office?.postalCode || org.country) {
    const address: Record<string, string> = {
      "@type": "PostalAddress",
    };
    if (office?.addressLine) address.streetAddress = office.addressLine;
    if (office?.city) address.addressLocality = office.city;
    if (office?.postalCode) address.postalCode = office.postalCode;
    if (org.country) address.addressCountry = org.country;
    organizationLd.address = address;
  } else if (org.hqCity) {
    organizationLd.address = {
      "@type": "PostalAddress",
      addressLocality: org.hqCity,
      ...(org.country ? { addressCountry: org.country } : {}),
    };
  }

  if (org.country) {
    organizationLd.areaServed = {
      "@type": "Country",
      name: org.country === "HU" ? "Hungary" : org.country,
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
