import type { Metadata } from "next";
import type { AnyEntity } from "@/lib/data/types";
import { SITE_ORIGIN } from "@/lib/data/repository";
import { buildEntityPageModel } from "@/lib/seo/entityPageModel";

export function entityMetadata(entity: AnyEntity): Metadata {
  const page = buildEntityPageModel(entity);

  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      url: page.canonicalUrl,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website",
    },
    robots: page.indexable
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
