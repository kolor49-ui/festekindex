import type { Metadata } from "next";
import Link from "next/link";
import { EntityList, Breadcrumbs } from "@/components/entity/EntityUI";
import { getEntityById, searchEntities } from "@/lib/data/repository";
import { listMetadata } from "@/lib/seo/metadata";
import type { AnyEntity } from "@/lib/data/types";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  if (!term) {
    return listMetadata(
      "Keresés | FESTÉKINDEX",
      "Globális keresés cégek, márkák, technológiák, kategóriák és tudástár között.",
      "/kereses",
    );
  }
  return listMetadata(
    `Keresés: ${term} | FESTÉKINDEX`,
    `Találatok a „${term}” kifejezésre a FESTÉKINDEX adatbázisában.`,
    `/kereses?q=${encodeURIComponent(term)}`,
  );
}

export default async function KeresesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const hits = term ? searchEntities(term, { limit: 40 }) : [];
  const entities = hits
    .map((h) => getEntityById(h.id))
    .filter((e): e is AnyEntity => Boolean(e));

  return (
    <main className="main">
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Keresés" },
          ]}
        />
        <h1>Keresés</h1>
        <p className="page-lead">
          Globális entitáskereső: cégek, márkák, technológiák, kategóriák,
          termékcsaládok és tudástár.
        </p>

        <form
          className="search"
          action="/kereses"
          method="get"
          style={{ marginBottom: 22, maxWidth: 640 }}
        >
          <input
            name="q"
            defaultValue={term}
            placeholder="Keress cégre, márkára, technológiára…"
            aria-label="Keresés"
          />
          <button type="submit">Keresés</button>
        </form>

        {term ? (
          <>
            <div className="toolbar" style={{ marginLeft: 0, marginRight: 0 }}>
              <h3>
                {entities.length} találat: „{term}”
              </h3>
            </div>
            <EntityList entities={entities} />
          </>
        ) : (
          <p className="empty">
            Írj be egy kifejezést, vagy próbáld:{" "}
            <Link href="/kereses?q=Graco" className="pill pill-link">
              Graco
            </Link>{" "}
            <Link href="/kereses?q=Airless" className="pill pill-link">
              Airless
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
