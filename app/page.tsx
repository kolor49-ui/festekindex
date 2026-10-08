import type { Metadata } from "next";
import { HomeExplorer } from "@/components/home/HomeExplorer";
import {
  getFeaturedHits,
  getRelationPreviewsMap,
} from "@/lib/data/repository";
import { buildSearchCatalog } from "@/lib/search";

export const metadata: Metadata = {
  title: {
    absolute: "FESTÉKINDEX — a festékipar szakmai indexe",
  },
  description:
    "Gyártók, márkák és technológiák egyetlen kereshető szakmai rendszerben.",
  alternates: { canonical: "https://festekindex.hu/" },
};

export default function HomePage() {
  const hits = getFeaturedHits(10);
  const relatedByEntityId = getRelationPreviewsMap(hits.map((h) => h.id));
  const searchCatalogDocs = buildSearchCatalog();

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
