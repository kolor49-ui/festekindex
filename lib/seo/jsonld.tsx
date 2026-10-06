import type { EntityPageModel } from "@/lib/seo/entityPageModel";
import { SITE_ORIGIN } from "@/lib/data/repository";

type JsonLd = Record<string, unknown>;

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_ORIGIN}${item.path}`,
    })),
  };
}

function primaryEntityJsonLd(page: EntityPageModel): JsonLd | null {
  const base = {
    name: page.entity.name,
    description: page.lead,
    url: page.canonicalUrl,
  };

  switch (page.entity.type) {
    case "organization":
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: page.entity.name,
        description: page.lead,
        url: page.canonicalUrl,
        ...(page.entity.website ? { sameAs: [page.entity.website] } : {}),
      };
    case "brand":
      return {
        "@context": "https://schema.org",
        "@type": "Brand",
        ...base,
      };
    case "productFamily":
    case "product":
      return {
        "@context": "https://schema.org",
        "@type": "Product",
        ...base,
        category: page.categories.map((c) => c.name).join(", ") || undefined,
      };
    case "knowledge":
      return {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: page.entity.name,
        description: page.lead,
        url: page.canonicalUrl,
        dateModified: page.entity.updatedAt,
      };
    case "technology":
    case "category":
      return {
        "@context": "https://schema.org",
        "@type": "Thing",
        ...base,
      };
    default:
      return null;
  }
}

/** Full JSON-LD graph for an assembled SEO entity page. */
export function buildEntityJsonLd(page: EntityPageModel): JsonLd[] {
  const blocks: JsonLd[] = [breadcrumbJsonLd(page.breadcrumbs)];
  const primary = primaryEntityJsonLd(page);
  if (primary) blocks.push(primary);

  if (page.contextualLinks.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${page.entity.name} — kapcsolódó szakmai entitások`,
      itemListElement: page.contextualLinks.slice(0, 20).map((link, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: link.name,
        url: link.href.startsWith("http")
          ? link.href
          : `${SITE_ORIGIN}${link.href}`,
      })),
    });
  }

  return blocks;
}

export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
