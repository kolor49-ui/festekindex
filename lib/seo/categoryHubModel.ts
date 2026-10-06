/**
 * SSR page model for Category hubs.
 * Direct Category graph + Product-derived context — kept semantically separate.
 * Public-language firewall: never render structural/architecture copy.
 */

import type { Source, Category } from "@/lib/data/types";
import {
  getCanonicalUrl,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import {
  getCategoryPortfolio,
  type CategoryPortfolio,
} from "@/lib/data/categoryHub";
import {
  getEntityNavigation,
  type NavCrumb,
} from "@/lib/navigation/entityNavigation";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { formatHuVerifiedDate } from "@/lib/seo/organizationHubModel";

export type CategoryHubModel = {
  category: Category;
  kindLabel: string;
  h1: string;
  lead?: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: NavCrumb[];
  indexable: boolean;

  products: CategoryPortfolio["products"];
  productGroups: CategoryPortfolio["productGroups"];

  families: CategoryPortfolio["displayedFamilies"];

  brandPresentation: CategoryPortfolio["brandPresentation"];
  orgPresentation: CategoryPortfolio["orgPresentation"];

  technologies: CategoryPortfolio["displayedTechnologies"];
  surfaces: CategoryPortfolio["surfaces"];
  knowledge: CategoryPortfolio["knowledge"];

  /**
   * Public company navigation (“Cégek”).
   * Product-derived orgs always included when present; never omitted merely
   * because Brands already appear. Direct-only Category orgs stay separated
   * in split mode (additionalOrgs) — not presented as Product manufacturers.
   */
  organizationContext?: {
    mode: "unified" | "split";
    heading: string;
    productHeading?: string;
    additionalHeading?: string;
    productOrgs: CategoryPortfolio["orgPresentation"]["productOrgs"];
    additionalOrgs: CategoryPortfolio["orgPresentation"]["additionalOrgs"];
    unified: CategoryPortfolio["orgPresentation"]["unified"];
  };

  /** Direct Category.sourceIds only. */
  sources: Source[];
  lastVerifiedAt?: string;
  lastVerifiedLabel?: string;

  /** Internal audit counters — not rendered. */
  _counts: {
    directFamilies: number;
    derivedFamilies: number;
    directBrands: number;
    derivedBrands: number;
    directOrganizations: number;
    derivedOrganizations: number;
    directTechnologies: number;
    derivedTechnologies: number;
  };
};

const INTERNAL_COPY_MARKERS = [
  "applicabletosurface",
  "belongstocategory",
  "usestechnology",
  "category entit",
  "category entity",
  "category hub",
  "entitás",
  "entitások",
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
  "festékindex adatbázisában",
  "festék bázis v0.",
  "relations háló",
  "gráf",
  "graph",
  "rawvalue",
  "verifiedat",
  "documentkind",
  "vékony",
  "hiányos",
  "seed",
  "import",
];

function containsInternalLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return INTERNAL_COPY_MARKERS.some((m) => lower.includes(m));
}

/** Public-safe Category copy — reject structural / architecture / version filler. */
export function publicSafeCategoryCopy(
  text: string | undefined,
): string | undefined {
  const t = text?.trim() ?? "";
  if (!t) return undefined;
  if (containsInternalLanguage(t)) return undefined;
  return t;
}

function buildTitle(category: Category, lead: string | undefined): string {
  const existing = publicSafeCategoryCopy(category.seoTitle);
  if (existing) return existing;
  return `${category.name} | Kategóriák | FESTÉKINDEX`;
}

function buildMetaDescription(
  category: Category,
  lead: string | undefined,
): string {
  const existing = publicSafeCategoryCopy(category.seoDescription);
  if (existing) return existing.slice(0, 160);
  if (lead) return lead.slice(0, 160);
  return `${category.name} — festékipari szakmai terület a FESTÉKINDEX-en.`.slice(
    0,
    160,
  );
}

/**
 * Organization section — show whenever safely-derived or direct Category
 * organizations exist. Never omit product-derived companies merely because
 * Brands are already listed (Homlokzat / Faipari navigation gap).
 */
function resolveOrganizationContext(
  portfolio: CategoryPortfolio,
): CategoryHubModel["organizationContext"] {
  const { orgPresentation } = portfolio;
  const hasAny =
    orgPresentation.unified.length > 0 ||
    orgPresentation.productOrgs.length > 0 ||
    orgPresentation.additionalOrgs.length > 0;
  if (!hasAny) return undefined;

  if (orgPresentation.mode === "split") {
    return {
      mode: "split",
      heading: "Cégek",
      productHeading: "Cégek",
      additionalHeading: "További kapcsolódó cégek",
      productOrgs: orgPresentation.productOrgs,
      additionalOrgs: orgPresentation.additionalOrgs,
      unified: orgPresentation.unified,
    };
  }

  return {
    mode: "unified",
    heading: "Cégek",
    productOrgs: orgPresentation.productOrgs,
    additionalOrgs: orgPresentation.additionalOrgs,
    unified: orgPresentation.unified,
  };
}

export function buildCategoryHubModel(
  category: Category,
): CategoryHubModel | null {
  if (category.id === "cat_all") return null;
  if (category.status !== "published") return null;

  const portfolio = getCategoryPortfolio(category.id);
  if (!portfolio) return null;

  const navigation = getEntityNavigation(category);
  const evaluation = evaluateIndexability(category);

  const lead =
    publicSafeCategoryCopy(category.shortDescription) ??
    publicSafeCategoryCopy(category.body);

  const verifiedCandidates = [
    category.verifiedAt,
    ...portfolio.sources.map((s) => s.accessedAt).filter(Boolean),
  ].filter(Boolean) as string[];
  const lastVerifiedAt = verifiedCandidates.sort().at(-1);

  return {
    category,
    kindLabel: "Szakterület",
    h1: category.name,
    lead,
    title: buildTitle(category, lead),
    metaDescription: buildMetaDescription(category, lead),
    canonicalUrl: getCanonicalUrl(category),
    breadcrumbs: navigation.breadcrumbs,
    // Keep SEO policy — Hub must NOT flip indexability
    indexable: evaluation.indexable,
    products: portfolio.products,
    productGroups: portfolio.productGroups,
    families: portfolio.displayedFamilies,
    brandPresentation: portfolio.brandPresentation,
    orgPresentation: portfolio.orgPresentation,
    technologies: portfolio.displayedTechnologies,
    surfaces: portfolio.surfaces,
    knowledge: portfolio.knowledge,
    organizationContext: resolveOrganizationContext(portfolio),
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
      directOrganizations: portfolio.directOrganizations.length,
      derivedOrganizations: portfolio.derivedOrganizations.length,
      directTechnologies: portfolio.directTechnologies.length,
      derivedTechnologies: portfolio.derivedTechnologies.length,
    },
  };
}

export function categoryHubMetadata(model: CategoryHubModel) {
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
export function buildCategoryHubJsonLd(model: CategoryHubModel) {
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
    name: model.category.name,
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
