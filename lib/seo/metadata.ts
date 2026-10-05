import type { Metadata } from "next";
import type { AnyEntity } from "@/lib/data/types";
import {
  getCanonicalUrl,
  isIndexableEntity,
  SITE_ORIGIN,
} from "@/lib/data/repository";

export function entityMetadata(entity: AnyEntity): Metadata {
  const title = entity.seoTitle ?? `${entity.name} | FESTÉKINDEX`;
  const description =
    entity.seoDescription ?? entity.shortDescription.slice(0, 160);
  const url = getCanonicalUrl(entity);
  const indexable = isIndexableEntity(entity);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website",
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export function listMetadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  const url = `${SITE_ORIGIN}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website",
    },
  };
}
