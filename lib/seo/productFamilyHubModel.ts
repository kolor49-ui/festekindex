/**
 * SSR page model for ProductFamily hubs.
 * Uses Entity Navigation Standard v1 + family portfolio aggregation.
 */

import type { Brand, Organization, ProductFamily } from "@/lib/data/types";
import {
  getCanonicalUrl,
  getEntityHref,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import { getBrandForProductFamily } from "@/lib/data/organizationPortfolio";
import {
  getProductFamilyPortfolio,
  type ProductFamilyPortfolio,
} from "@/lib/data/productFamilyHub";
import {
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
  getEntityNavigation,
  type NavCrumb,
} from "@/lib/navigation/entityNavigation";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { formatHuVerifiedDate } from "@/lib/seo/organizationHubModel";

export type FamilyFact = {
  label: string;
  value: string;
  href?: string;
};

export type ProductFamilyHubModel = {
  family: ProductFamily;
  portfolio: ProductFamilyPortfolio;
  kindLabel: string;
  h1: string;
  lead?: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: NavCrumb[];
  indexable: boolean;
  headerFacts: FamilyFact[];
  products: ProductFamilyPortfolio["products"];
  categories: ProductFamilyPortfolio["categories"];
  technologies: ProductFamilyPortfolio["technologies"];
  surfaces: ProductFamilyPortfolio["surfaces"];
  systemPeers: ProductFamilyPortfolio["systemPeers"];
  systemHasSequence: boolean;
  knowledge: ProductFamilyPortfolio["knowledge"];
  background?: {
    heading: string;
    brand?: { name: string; href: string; blurb?: string };
    organization?: {
      name: string;
      href: string;
      label: string;
      blurb?: string;
    };
  };
  sources: ProductFamilyPortfolio["sources"];
  lastVerifiedAt?: string;
  lastVerifiedLabel?: string;
};

function isStructuralCopy(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  const lower = t.toLowerCase();
  if (lower.includes("a festékindex adatbázisában")) return true;
  if (lower.includes("festék bázis v0.")) return true;
  if (lower.includes("productfamily")) return true;
  if (lower.includes("gépcsaládjai productfamily")) return true;
  return false;
}

function usableText(text: string | undefined): string | undefined {
  const t = text?.trim() ?? "";
  if (!t || isStructuralCopy(t)) return undefined;
  return t;
}

function orgLabel(role: "owner" | "manufacturer"): string {
  return role === "manufacturer" ? "Gyártó" : "Tulajdonos";
}

function resolveOrg(brand: Brand | undefined, familyId: string): {
  organization?: Organization;
  role?: "owner" | "manufacturer";
} {
  if (brand) {
    const owner = getCanonicalBrandOwner(brand.id);
    if (owner) return { organization: owner, role: "owner" };
  }
  const mfr = getCanonicalFamilyManufacturer(familyId);
  if (mfr) return { organization: mfr, role: "manufacturer" };
  return {};
}

function buildTitle(
  family: ProductFamily,
  brand: Brand | undefined,
  categories: ProductFamilyPortfolio["categories"],
): string {
  const existing = usableText(family.seoTitle);
  if (existing) return existing;

  const name = family.name.trim();
  const coatingHints = [
    "festék",
    "bevonat",
    "homlokzat",
    "dekor",
    "faipar",
    "padló",
    "korrózió",
  ];
  const suggestsCoatings = categories.some((c) => {
    const n = c.name.toLowerCase();
    return coatingHints.some((h) => n.includes(h));
  });

  if (suggestsCoatings) {
    return `${name} festékek | FESTÉKINDEX`;
  }
  if (brand) {
    const brandName = brand.name.trim();
    if (name.toUpperCase().startsWith(brandName.toUpperCase())) {
      return `${name} termékcsalád | FESTÉKINDEX`;
    }
    return `${name} | ${brandName} | FESTÉKINDEX`;
  }
  return `${name} termékcsalád | FESTÉKINDEX`;
}

function buildMetaDescription(
  family: ProductFamily,
  lead: string | undefined,
  brand: Brand | undefined,
  productCount: number,
  categories: ProductFamilyPortfolio["categories"],
): string {
  const existing = usableText(family.seoDescription);
  if (existing) return existing.slice(0, 160);
  if (lead) return lead.slice(0, 160);

  const parts: string[] = [family.name];
  if (brand) parts.push(brand.name);
  if (productCount) parts.push(`${productCount} termék`);
  if (categories[0]) parts.push(categories[0].name);
  return `${parts.join(" — ")} a FESTÉKINDEX-en.`.slice(0, 160);
}

function deriveLead(
  family: ProductFamily,
  brand: Brand | undefined,
  org: Organization | undefined,
): string | undefined {
  const fromFamily =
    usableText(family.body) ?? usableText(family.shortDescription);
  if (fromFamily) {
    const cut = fromFamily.split(/(?<=\.)\s+/)[0] ?? fromFamily;
    return cut.length > 220 ? `${cut.slice(0, 217).trim()}…` : cut;
  }
  // No invented marketing filler when graph has no usable copy
  void brand;
  void org;
  return undefined;
}

export function buildProductFamilyHubModel(
  family: ProductFamily,
): ProductFamilyHubModel | null {
  const portfolio = getProductFamilyPortfolio(family.id);
  if (!portfolio) return null;

  const navigation = getEntityNavigation(family);
  const evaluation = evaluateIndexability(family);
  const brand = getBrandForProductFamily(family.id);
  const publishedBrand =
    brand?.status === "published" ? brand : undefined;
  const { organization, role } = resolveOrg(publishedBrand, family.id);

  const lead = deriveLead(family, publishedBrand, organization);
  const title = buildTitle(family, publishedBrand, portfolio.categories);
  const metaDescription = buildMetaDescription(
    family,
    lead,
    publishedBrand,
    portfolio.products.length,
    portfolio.categories,
  );

  // Header facts: Márka + canonical Gyártó/Tulajdonos + counts.
  // Organization uses Navigation Standard only (owns / manufactures) — never invent Brand for 7016.
  const headerFacts: FamilyFact[] = [];
  if (publishedBrand) {
    headerFacts.push({
      label: "Márka",
      value: publishedBrand.name,
      href: getEntityHref(publishedBrand),
    });
  }
  if (organization && role) {
    headerFacts.push({
      label: orgLabel(role),
      value: organization.name,
      href: getEntityHref(organization),
    });
  }
  if (portfolio.products.length) {
    headerFacts.push({
      label: "Termékek",
      value: String(portfolio.products.length),
    });
  }
  if (portfolio.categories.length) {
    headerFacts.push({
      label: "Szakmai területek",
      value: String(portfolio.categories.length),
    });
  }
  if (portfolio.surfaces.length) {
    headerFacts.push({
      label: "Felületek",
      value: String(portfolio.surfaces.length),
    });
  }

  const brandBlurb = publishedBrand
    ? usableText(publishedBrand.shortDescription) ??
      usableText(publishedBrand.body)
    : undefined;
  const orgBlurb = organization
    ? usableText(organization.shortDescription) ??
      usableText(organization.body)
    : undefined;

  let background: ProductFamilyHubModel["background"];
  if (publishedBrand || organization) {
    background = {
      heading:
        publishedBrand && organization
          ? "Márka és gyártói háttér"
          : publishedBrand
            ? "Márka"
            : "Gyártói háttér",
      brand: publishedBrand
        ? {
            name: publishedBrand.name,
            href: getEntityHref(publishedBrand),
            blurb: brandBlurb,
          }
        : undefined,
      organization:
        organization && role
          ? {
              name: organization.name,
              href: getEntityHref(organization),
              label: orgLabel(role),
              blurb: orgBlurb,
            }
          : undefined,
    };
  }

  return {
    family,
    portfolio,
    kindLabel: "Termékcsalád",
    h1: family.name,
    lead,
    title,
    metaDescription,
    canonicalUrl: getCanonicalUrl(family),
    breadcrumbs: navigation.breadcrumbs,
    // Keep SEO policy — UI quality ≠ automatic indexing
    indexable: evaluation.indexable,
    headerFacts,
    products: portfolio.products,
    categories: portfolio.categories,
    technologies: portfolio.technologies,
    surfaces: portfolio.surfaces,
    systemPeers: portfolio.systemPeers,
    systemHasSequence: portfolio.systemPeers.some(
      (p) => typeof p.sequence === "number" || Boolean(p.role),
    ),
    knowledge: portfolio.knowledge,
    background,
    sources: portfolio.sources,
    lastVerifiedAt: portfolio.lastVerifiedAt,
    lastVerifiedLabel: portfolio.lastVerifiedAt
      ? formatHuVerifiedDate(portfolio.lastVerifiedAt)
      : undefined,
  };
}

export function productFamilyHubMetadata(model: ProductFamilyHubModel) {
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

export function buildProductFamilyHubJsonLd(model: ProductFamilyHubModel) {
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

  const page: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: model.family.name,
    url: model.canonicalUrl,
  };
  if (model.lead) page.description = model.lead;

  if (model.products.length) {
    page.mainEntity = {
      "@type": "ItemList",
      itemListElement: model.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: p.href.startsWith("http") ? p.href : `${SITE_ORIGIN}${p.href}`,
      })),
    };
  }

  return [breadcrumb, page];
}
