/**
 * SSR page model for Knowledge / Tudástár hubs.
 * DIRECT-FIRST: documents + belongsToCategory only.
 * Public-language firewall: never render structural/architecture copy.
 */

import type { KnowledgeArticle, Source } from "@/lib/data/types";
import {
  getCanonicalUrl,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import {
  getKnowledgePortfolio,
  type KnowledgeLink,
  type KnowledgePortfolio,
} from "@/lib/data/knowledgeHub";
import {
  parseKnowledgeArticleBody,
  type KnowledgeArticleBlock,
} from "@/lib/content/knowledgeArticle";
import {
  getEntityNavigation,
  type NavCrumb,
} from "@/lib/navigation/entityNavigation";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { formatHuVerifiedDate } from "@/lib/seo/organizationHubModel";

export type KnowledgeHubModel = {
  article: KnowledgeArticle;
  kindLabel: string;
  h1: string;
  lead?: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: NavCrumb[];
  indexable: boolean;

  articleBody: KnowledgeArticleBlock[];

  /** belongsToCategory — public: Szakmai terület */
  categories: KnowledgeLink[];

  documented: KnowledgePortfolio["documented"];

  /** Knowledge.sourceIds only. */
  sources: Source[];
  lastVerifiedAt?: string;
  lastVerifiedLabel?: string;
};

const INTERNAL_COPY_MARKERS = [
  "belongstocategory",
  "documents",
  "knowledge entit",
  "knowledge entity",
  "knowledge hub",
  "knowledge →",
  "entitás",
  "entitások",
  "entity",
  "relation",
  "relations",
  "repository",
  "sourceids",
  "productclass",
  "indexable",
  "noindex",
  "v0.1",
  "v0.2",
  "adatbázis entitásaihoz",
  "a festékindex adatbázisában",
  "festék bázis v0.",
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

/** Public-safe Knowledge copy — reject structural / architecture filler. */
export function publicSafeKnowledgeCopy(
  text: string | undefined,
): string | undefined {
  const t = text?.trim() ?? "";
  if (!t) return undefined;
  if (containsInternalLanguage(t)) return undefined;
  return t;
}

function buildTitle(article: KnowledgeArticle, lead: string | undefined): string {
  const existing = publicSafeKnowledgeCopy(article.seoTitle);
  if (existing) return existing;
  return `${article.name} | Tudástár | FESTÉKINDEX`;
}

function buildMetaDescription(
  article: KnowledgeArticle,
  lead: string | undefined,
): string {
  const existing = publicSafeKnowledgeCopy(article.seoDescription);
  if (existing) return existing.slice(0, 160);
  if (lead) return lead.slice(0, 160);
  return `${article.name} — szakmai útmutató a FESTÉKINDEX Tudástárában.`.slice(
    0,
    160,
  );
}

export function buildKnowledgeHubModel(
  article: KnowledgeArticle,
): KnowledgeHubModel | null {
  if (article.status !== "published") return null;

  const portfolio = getKnowledgePortfolio(article.id);
  if (!portfolio) return null;

  const navigation = getEntityNavigation(article);
  const evaluation = evaluateIndexability(article);

  const lead = publicSafeKnowledgeCopy(article.shortDescription);

  const verifiedCandidates = [
    article.verifiedAt,
    ...portfolio.sources.map((s) => s.accessedAt).filter(Boolean),
  ].filter(Boolean) as string[];
  const lastVerifiedAt = verifiedCandidates.sort().at(-1);

  return {
    article,
    kindLabel: "Tudástár",
    h1: article.name,
    lead,
    title: buildTitle(article, lead),
    metaDescription: buildMetaDescription(article, lead),
    canonicalUrl: getCanonicalUrl(article),
    breadcrumbs: navigation.breadcrumbs,
    indexable: evaluation.indexable,
    articleBody: parseKnowledgeArticleBody(article.body),
    categories: portfolio.categories,
    documented: portfolio.documented,
    sources: portfolio.sources,
    lastVerifiedAt,
    lastVerifiedLabel: lastVerifiedAt
      ? formatHuVerifiedDate(lastVerifiedAt)
      : undefined,
  };
}

export function knowledgeHubMetadata(model: KnowledgeHubModel) {
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
      type: "article" as const,
    },
    robots: model.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

/** Conservative JSON-LD: BreadcrumbList + Article (no invented author/date). */
export function buildKnowledgeHubJsonLd(model: KnowledgeHubModel) {
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
    "@type": "Article",
    headline: model.article.name,
    name: model.article.name,
    url: model.canonicalUrl,
  };
  if (model.lead) page.description = model.lead;

  return [breadcrumb, page];
}

/** Hungarian section heading — singular/plural from count. */
export function knowledgeSectionHeading(
  kind:
    | "categories"
    | "technologies"
    | "surfaces"
    | "products"
    | "productFamilies"
    | "brands"
    | "organizations"
    | "comparisons",
  count: number,
): string {
  const singular = count === 1;
  switch (kind) {
    case "categories":
      return singular ? "Szakmai terület" : "Szakmai területek";
    case "technologies":
      return singular ? "Kapcsolódó technológia" : "Kapcsolódó technológiák";
    case "surfaces":
      return singular ? "Kapcsolódó felület" : "Kapcsolódó felületek";
    case "products":
      return singular ? "Kapcsolódó termék" : "Kapcsolódó termékek";
    case "productFamilies":
      return singular
        ? "Kapcsolódó termékcsalád"
        : "Kapcsolódó termékcsaládok";
    case "brands":
      return singular ? "Kapcsolódó márka" : "Kapcsolódó márkák";
    case "organizations":
      return singular ? "Kapcsolódó cég" : "Kapcsolódó cégek";
    case "comparisons":
      return singular ? "Összehasonlítás" : "Összehasonlítások";
  }
}
