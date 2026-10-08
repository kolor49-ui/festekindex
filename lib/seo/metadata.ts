import type { Metadata } from "next";
import type { AnyEntity } from "@/lib/data/types";
import { SITE_ORIGIN } from "@/lib/data/repository";
import { buildEntityPageModel } from "@/lib/seo/entityPageModel";

/** Root layout template adds `| FESTÉKINDEX` once — strip duplicates here. */
export function stripBrandTitleSuffix(title: string): string {
  return title.replace(/\s*\|\s*FESTÉKINDEX\s*$/i, "").trim();
}

export function entityMetadata(entity: AnyEntity): Metadata {
  const page = buildEntityPageModel(entity);
  const title = stripBrandTitleSuffix(page.title);

  return {
    title,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl },
    openGraph: {
      title,
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
  const pageTitle = stripBrandTitleSuffix(title);
  return {
    title: pageTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description,
      url,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website",
    },
  };
}
