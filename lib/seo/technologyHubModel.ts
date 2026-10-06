/**
 * SSR page model for Technology hubs.
 * Direct Technology graph + Product-derived context — kept semantically separate.
 * Public-language firewall: never render structural/architecture copy.
 */

import type { Source, Technology } from "@/lib/data/types";
import {
  getCanonicalUrl,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import {
  getTechnologyPortfolio,
  type TechnologyPortfolio,
} from "@/lib/data/technologyHub";
import {
  getEntityNavigation,
  type NavCrumb,
} from "@/lib/navigation/entityNavigation";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { formatHuVerifiedDate } from "@/lib/seo/organizationHubModel";

export type TechnologyHubModel = {
  technology: Technology;
  kindLabel: string;
  h1: string;
  lead?: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: NavCrumb[];
  indexable: boolean;

  products: TechnologyPortfolio["products"];
  productGroups: TechnologyPortfolio["productGroups"];

  /** Dedupe presentation Families (direct priority). */
  families: TechnologyPortfolio["displayedFamilies"];
  /** Dedupe presentation Brands (direct priority). */
  brands: TechnologyPortfolio["displayedBrands"];

  categories: TechnologyPortfolio["categories"];
  surfaces: TechnologyPortfolio["surfaces"];
  knowledge: TechnologyPortfolio["knowledge"];

  /** Direct Organization context only (e.g. Euroll → Airless). */
  partnerOrganizations?: {
    heading: string;
    organizations: TechnologyPortfolio["directOrganizations"];
  };

  /** Direct Technology.sourceIds only. */
  sources: Source[];
  lastVerifiedAt?: string;
  lastVerifiedLabel?: string;

  /** Internal audit counters — not rendered. */
  _counts: {
    directFamilies: number;
    derivedFamilies: number;
    directBrands: number;
    derivedBrands: number;
    derivedOrganizations: number;
  };
};

const INTERNAL_COPY_MARKERS = [
  "applicabletosurface",
  "belongstocategory",
  "usestechnology",
  "technology entit",
  "technology entity",
  "technology hub",
  "entitás",
  "relation",
  "relations",
  "repository",
  "sourceids",
  "productclass",
  "indexable",
  "noindex",
  "v0.1",
  "v0.2",
  "a festékindex adatbázisában",
  "festék bázis v0.",
  "felhordási mód / technológia a festékindex",
  "relations háló",
  "gráf",
];

function containsInternalLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return INTERNAL_COPY_MARKERS.some((m) => lower.includes(m));
}

/** Public-safe Technology copy — reject structural / architecture / version filler. */
export function publicSafeTechnologyCopy(
  text: string | undefined,
): string | undefined {
  const t = text?.trim() ?? "";
  if (!t) return undefined;
  if (containsInternalLanguage(t)) return undefined;
  return t;
}

function buildTitle(technology: Technology, lead: string | undefined): string {
  const existing = publicSafeTechnologyCopy(technology.seoTitle);
  if (existing) return existing;
  return `${technology.name} | Technológiák | FESTÉKINDEX`;
}

function buildMetaDescription(
  technology: Technology,
  lead: string | undefined,
): string {
  const existing = publicSafeTechnologyCopy(technology.seoDescription);
  if (existing) return existing.slice(0, 160);
  if (lead) return lead.slice(0, 160);
  return `${technology.name} — festékipari technológia a FESTÉKINDEX-en.`.slice(
    0,
    160,
  );
}

/**
 * Partner orgs section — only direct Organization→Technology context.
 * Never Product-derived manufacturer (that would duplicate Brands on coating pages).
 */
function resolvePartnerOrganizations(
  portfolio: TechnologyPortfolio,
): TechnologyHubModel["partnerOrganizations"] {
  if (!portfolio.directOrganizations.length) return undefined;

  // Prefer Forgalmazók if all are distributors; else Szakmai partnerek
  const allDistributors = portfolio.directOrganizations.every(
    (o) => o.label === "Forgalmazó",
  );
  return {
    heading: allDistributors ? "Forgalmazók" : "Szakmai partnerek",
    organizations: portfolio.directOrganizations,
  };
}

export function buildTechnologyHubModel(
  technology: Technology,
): TechnologyHubModel | null {
  if (technology.status !== "published") return null;

  const portfolio = getTechnologyPortfolio(technology.id);
  if (!portfolio) return null;

  const navigation = getEntityNavigation(technology);
  const evaluation = evaluateIndexability(technology);

  const lead =
    publicSafeTechnologyCopy(technology.shortDescription) ??
    publicSafeTechnologyCopy(technology.body);

  const verifiedCandidates = [
    technology.verifiedAt,
    ...portfolio.sources.map((s) => s.accessedAt).filter(Boolean),
  ].filter(Boolean) as string[];
  const lastVerifiedAt = verifiedCandidates.sort().at(-1);

  return {
    technology,
    kindLabel: "Technológia",
    h1: technology.name,
    lead,
    title: buildTitle(technology, lead),
    metaDescription: buildMetaDescription(technology, lead),
    canonicalUrl: getCanonicalUrl(technology),
    breadcrumbs: navigation.breadcrumbs,
    // Keep SEO policy — Hub must NOT flip indexability
    indexable: evaluation.indexable,
    products: portfolio.products,
    productGroups: portfolio.productGroups,
    families: portfolio.displayedFamilies,
    brands: portfolio.displayedBrands,
    categories: portfolio.categories,
    surfaces: portfolio.surfaces,
    knowledge: portfolio.knowledge,
    partnerOrganizations: resolvePartnerOrganizations(portfolio),
    sources: portfolio.sources,
    lastVerifiedAt,
    lastVerifiedLabel: lastVerifiedAt
      ? formatHuVerifiedDate(lastVerifiedAt)
      : undefined,
    _counts: {
      directFamilies: portfolio.directFamilies.length,
      derivedFamilies: portfolio.derivedFamilies.length,
      directBrands: portfolio.directBrands.length,
      derivedBrands: portfolio.derivedBrands.length,
      derivedOrganizations: portfolio.derivedOrganizations.length,
    },
  };
}

export function technologyHubMetadata(model: TechnologyHubModel) {
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

/** Conservative JSON-LD: BreadcrumbList + CollectionPage/WebPage. */
export function buildTechnologyHubJsonLd(model: TechnologyHubModel) {
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
    "@type": model.products.length ? "CollectionPage" : "WebPage",
    name: model.technology.name,
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
