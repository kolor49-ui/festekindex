import type { Metadata } from "next";
import { HomeExplorer } from "@/components/home/HomeExplorer";
import {
  getFeaturedHits,
  getRelationPreviewsMap,
  listBrands,
  listOrganizations,
  listTechnologies,
} from "@/lib/data/repository";
import { buildSearchCatalog } from "@/lib/search";

export const metadata: Metadata = {
  title: {
    absolute: "FESTÉKINDEX — a festékipar szakmai indexe",
  },
  description:
    "Cégek, márkák és technológiák egyetlen kereshető szakmai rendszerben.",
  alternates: { canonical: "https://festekindex.hu/" },
};

export default function HomePage() {
  const hits = getFeaturedHits(10);
  const searchCatalogDocs = buildSearchCatalog();
  // Detail pane for type tabs (Cégek/Márkák/…) must cover the live catalogue,
  // not only the curated "Minden" featured mix.
  const typeTabIds = [
    ...listOrganizations().map((o) => o.id),
    ...listBrands().map((b) => b.id),
    ...listTechnologies().map((t) => t.id),
    ...searchCatalogDocs
      .filter((d) => d.type === "product")
      .slice(0, 12)
      .map((d) => d.id),
  ];
  const relatedIds = [...new Set([...hits.map((h) => h.id), ...typeTabIds])];
  const relatedByEntityId = getRelationPreviewsMap(relatedIds);

  return (
    <main className="main">
      <HomeExplorer
        initialHits={hits}
        relatedByEntityId={relatedByEntityId}
        searchCatalogDocs={searchCatalogDocs}
      />
    </main>
  );
}
