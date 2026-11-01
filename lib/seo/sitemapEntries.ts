/**
 * Sitemap eligibility — uses final public indexability (robots ↔ sitemap).
 * Lives in SEO layer to avoid repository ↔ Hub circular imports.
 */

import type { SitemapEntry } from "@/lib/data/types";
import {
  getEntityHref,
  listAllEntities,
} from "@/lib/data/repository";
import { isPubliclyIndexable } from "@/lib/seo/publicIndexability";

export function listPublishedForSitemap(): SitemapEntry[] {
  // /termekek and /feluletek stay out of the sitemap while all child detail
  // pages are noindex (list hubs themselves are also noindex).
  const entries: SitemapEntry[] = [
    { path: "/", lastModified: "2026-10-05" },
    { path: "/cegek", lastModified: "2026-10-05" },
    { path: "/markak", lastModified: "2026-10-05" },
    { path: "/technologiak", lastModified: "2026-10-05" },
    { path: "/kategoriak", lastModified: "2026-10-05" },
    { path: "/tudastar", lastModified: "2026-10-05" },
    { path: "/termekcsaladok", lastModified: "2026-10-05" },
  ];

  for (const entity of listAllEntities()) {
    if (entity.id === "cat_all") continue;
    if (!isPubliclyIndexable(entity)) continue;
    entries.push({
      path: getEntityHref(entity),
      lastModified: entity.updatedAt,
    });
  }

  return entries;
}
