import type { Metadata } from "next";
import { HomeExplorer } from "@/components/home/HomeExplorer";
import {
  getFeaturedHits,
  getRelationPreviewsMap,
  getStats,
} from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "FESTÉKINDEX — a festékipar szakmai indexe",
  description:
    "Gyártók, márkák és technológiák egyetlen kereshető szakmai rendszerben.",
  alternates: { canonical: "https://festekindex.hu/" },
};

export default function HomePage() {
  const hits = getFeaturedHits(10);
  const relatedByEntityId = getRelationPreviewsMap(hits.map((h) => h.id));
  const stats = getStats();

  return (
    <main className="main">
      <HomeExplorer
        initialHits={hits}
        relatedByEntityId={relatedByEntityId}
        stats={stats}
      />
    </main>
  );
}
