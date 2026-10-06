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
  type PortfolioProductLink,
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
  /** All families: under brands + orphan (7016™ etc.) */
  familyCards: PortfolioFamilyCard[];
  brandGroups: PortfolioBrandGroup[];
  orphanFamilies: PortfolioFamilyCard[];
  productSections: {
    heading: string;
    href?: string;
    products: PortfolioProductLink[];
  }[];
  allProductsHref: string;
  allProductCount: number;
  categories: OrganizationPortfolio["categories"];
  technologies: OrganizationPortfolio["technologies"];
  surfaces: OrganizationPortfolio["surfaces"];
  sources: Source[];
  lastVerifiedAt?: string;
  /** HTML outline: Org → Brands → Families → Products */
  connectionTree: {
    brands: {
      name: string;
      href: string;
      families: { name: string; href: string; productCount: number }[];
      directProductCount: number;
    }[];
    orphanFamilies: { name: string; href: string; productCount: number }[];
  };
};

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

  const familyCards = [
    ...portfolio.brandGroups.flatMap((g) => g.families),
    ...portfolio.orphanFamilies,
  ];

  const productSections: OrganizationHubModel["productSections"] = [];
  for (const group of portfolio.brandGroups) {
    for (const family of group.families) {
      if (!family.products.length) continue;
      productSections.push({
        heading: family.name,
        href: family.href,
        products: family.products,
      });
    }
    if (group.directProducts.length) {
      productSections.push({
        heading: `${group.brand.name} — további termékek`,
        href: group.href,
        products: group.directProducts,
      });
    }
  }
  for (const family of portfolio.orphanFamilies) {
    if (!family.products.length) continue;
    productSections.push({
      heading: family.name,
      href: family.href,
      products: family.products,
    });
  }

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
  if (familyCards.length) {
    metaChips.push({
      label: "Termékcsaládok",
      value: String(familyCards.length),
    });
  }
  if (portfolio.allProducts.length) {
    metaChips.push({
      label: "Termékek",
      value: String(portfolio.allProducts.length),
    });
  }

  const connectionTree = {
    brands: portfolio.brandGroups.map((g) => ({
      name: g.brand.name,
      href: g.href,
      families: g.families.map((f) => ({
        name: f.name,
        href: f.href,
        productCount: f.productCount,
      })),
      directProductCount: g.directProducts.length,
    })),
    orphanFamilies: portfolio.orphanFamilies.map((f) => ({
      name: f.name,
      href: f.href,
      productCount: f.productCount,
    })),
  };

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
    familyCards,
    brandGroups: portfolio.brandGroups,
    orphanFamilies: portfolio.orphanFamilies,
    productSections,
    allProductsHref: `#osszes-termek`,
    allProductCount: portfolio.allProducts.length,
    categories: portfolio.categories,
    technologies: portfolio.technologies,
    surfaces: portfolio.surfaces,
    sources: portfolio.sources,
    lastVerifiedAt: portfolio.lastVerifiedAt,
    connectionTree,
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
