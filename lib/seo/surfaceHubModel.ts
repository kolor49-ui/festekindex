/**
 * SSR page model for Surface hubs.
 * Graph-derived presentation — no stored surface.products lists.
 * Public-language firewall: never render internal architecture copy.
 */

import type { Surface } from "@/lib/data/types";
import {
  getCanonicalUrl,
  getEntityHref,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import {
  getSurfacePortfolio,
  type SurfacePortfolio,
} from "@/lib/data/surfaceHub";
import {
  getEntityNavigation,
  type NavCrumb,
} from "@/lib/navigation/entityNavigation";
import { evaluateIndexability } from "@/lib/seo/indexability";

export type SurfaceHubModel = {
  surface: Surface;
  kindLabel: string;
  h1: string;
  /** Public-safe short description only — never internal body jargon. */
  lead?: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: NavCrumb[];
  indexable: boolean;
  products: SurfacePortfolio["products"];
  productGroups: SurfacePortfolio["productGroups"];
  families: SurfacePortfolio["families"];
  brands: SurfacePortfolio["brands"];
  organizations: SurfacePortfolio["organizations"];
  categories: SurfacePortfolio["categories"];
  technologies: SurfacePortfolio["technologies"];
  knowledge: SurfacePortfolio["knowledge"];
  /**
   * Manufacturer context — only when meaningful and not a redundant
   * single-org repeat of Brand context.
   */
  manufacturerContext?: {
    heading: string;
    organizations: SurfacePortfolio["organizations"];
  };
};

const INTERNAL_COPY_MARKERS = [
  "applicabletosurface",
  "belongsTocategory",
  "usestechnology",
  "surface entit",
  "surface entity",
  "surface hub",
  "surface háló",
  "entitás",
  "relation",
  "repository",
  "sourceids",
  "productclass",
  "indexable",
  "noindex",
  "v0.1",
  "v0.2",
  "a festékindex adatbázisában",
  "festék bázis v0.",
  "felület / aljzat a festékindex",
];

function containsInternalLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return INTERNAL_COPY_MARKERS.some((m) => lower.includes(m.toLowerCase()));
}

/** Public-safe text only — reject structural / architecture / version filler. */
export function publicSafeSurfaceCopy(
  text: string | undefined,
): string | undefined {
  const t = text?.trim() ?? "";
  if (!t) return undefined;
  if (containsInternalLanguage(t)) return undefined;
  return t;
}

function buildTitle(surface: Surface): string {
  const existing = publicSafeSurfaceCopy(surface.seoTitle);
  if (existing) return existing;
  return `${surface.name} | Felületek | FESTÉKINDEX`;
}

function buildMetaDescription(
  surface: Surface,
  lead: string | undefined,
): string {
  const existing = publicSafeSurfaceCopy(surface.seoDescription);
  if (existing) return existing.slice(0, 160);
  if (lead) return lead.slice(0, 160);
  return `${surface.name} felületekre alkalmazható termékek a FESTÉKINDEX-en.`.slice(
    0,
    160,
  );
}

/**
 * Gyártói háttér only when it adds navigation beyond Brands.
 * Single org with Brands already present → omit (avoid redundant FB on every page).
 * Zero Brands but Org present (e.g. 7016-only surfaces) → show.
 * Multiple Orgs → show.
 */
function resolveManufacturerContext(
  portfolio: SurfacePortfolio,
): SurfaceHubModel["manufacturerContext"] {
  const { organizations, brands } = portfolio;
  if (!organizations.length) return undefined;
  if (organizations.length === 1 && brands.length > 0) return undefined;
  return {
    heading: "Gyártói háttér",
    organizations,
  };
}

export function buildSurfaceHubModel(
  surface: Surface,
): SurfaceHubModel | null {
  if (surface.status !== "published") return null;

  const portfolio = getSurfacePortfolio(surface.id);
  if (!portfolio) return null;

  const navigation = getEntityNavigation(surface);
  const evaluation = evaluateIndexability(surface);

  const lead = publicSafeSurfaceCopy(surface.shortDescription);
  // Never fall back to body — preflight: body contains internal jargon.

  return {
    surface,
    kindLabel: "Felület",
    h1: surface.name,
    lead,
    title: buildTitle(surface),
    metaDescription: buildMetaDescription(surface, lead),
    canonicalUrl: getCanonicalUrl(surface),
    breadcrumbs: navigation.breadcrumbs,
    // Keep SEO policy — Hub UI must NOT flip noindex → index
    indexable: evaluation.indexable,
    products: portfolio.products,
    productGroups: portfolio.productGroups,
    families: portfolio.families,
    brands: portfolio.brands,
    organizations: portfolio.organizations,
    categories: portfolio.categories,
    technologies: portfolio.technologies,
    knowledge: portfolio.knowledge,
    manufacturerContext: resolveManufacturerContext(portfolio),
  };
}

export function surfaceHubMetadata(model: SurfaceHubModel) {
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

/** Conservative JSON-LD: BreadcrumbList + CollectionPage. No Offers/Ratings. */
export function buildSurfaceHubJsonLd(model: SurfaceHubModel) {
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
    name: model.surface.name,
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

export { getEntityHref };
