import type { AnyEntity } from "@/lib/data/types";
import { getCanonicalUrl, SITE_ORIGIN } from "@/lib/data/repository";

type JsonLd = Record<string, unknown>;

export function organizationJsonLd(entity: AnyEntity): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: entity.name,
    description: entity.shortDescription,
    url: getCanonicalUrl(entity),
  };
}

export function brandJsonLd(entity: AnyEntity): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: entity.name,
    description: entity.shortDescription,
    url: getCanonicalUrl(entity),
  };
}

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

export function JsonLdScript({ data }: { data: JsonLd | JsonLd[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
