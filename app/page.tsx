import type { Metadata } from "next";
import { HomeExplorer } from "@/components/home/HomeExplorer";
import {
  getFeaturedHits,
  getStats,
  searchEntities,
} from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "FESTÉKINDEX — a festékipar szakmai indexe",
  description:
    "Gyártók, márkák, festékek, bevonatok, technológiák, gépek és szakmai kapcsolatok egyetlen kereshető rendszerben.",
  alternates: { canonical: "https://festekindex.hu/" },
};

export default function HomePage() {
  const featured = getFeaturedHits(10);
  const extra = searchEntities("", { limit: 20 });
  const byId = new Map([...featured, ...extra].map((h) => [h.id, h]));
  const hits = [...byId.values()];
  const stats = getStats();

  return (
    <main className="main">
      <div className="headline">
        <div>
          <div className="eyebrow">Szakmai kereső és tudásháló</div>
          <h1>A festékipar egy helyen.</h1>
        </div>
        <p>
          Gyártók, magyar vállalatok, márkák, festékek, bevonatok, technológiák,
          gépek és szakmai kapcsolatok rendszerezve.
        </p>
      </div>
      <HomeExplorer initialHits={hits} stats={stats} />
    </main>
  );
}
