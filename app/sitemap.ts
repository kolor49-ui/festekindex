import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/data/repository";
import { listPublishedForSitemap } from "@/lib/seo/sitemapEntries";

export default function sitemap(): MetadataRoute.Sitemap {
  return listPublishedForSitemap().map((entry) => ({
    url: `${SITE_ORIGIN}${entry.path}`,
    lastModified: entry.lastModified,
    changeFrequency: entry.path === "/" ? "weekly" : "monthly",
    priority: entry.path === "/" ? 1 : 0.7,
  }));
}
