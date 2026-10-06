import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { SITE_ORIGIN } from "@/lib/data/repository";
import {
  searchCatalog,
  SEARCH_FULL_LIMIT,
} from "@/lib/search";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  const canonical = `${SITE_ORIGIN}/kereses`;

  if (!term) {
    return {
      title: "Keresés | FESTÉKINDEX",
      description:
        "Globális keresés cégek, márkák, technológiák, kategóriák és tudástár között.",
      alternates: { canonical },
      openGraph: {
        title: "Keresés | FESTÉKINDEX",
        description:
          "Globális keresés cégek, márkák, technológiák, kategóriák és tudástár között.",
        url: canonical,
        siteName: "FESTÉKINDEX",
        locale: "hu_HU",
        type: "website",
      },
    };
  }

  return {
    title: `Keresés: ${term} | FESTÉKINDEX`,
    description: `Találatok a „${term}” kifejezésre a FESTÉKINDEX adatbázisában.`,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      title: `Keresés: ${term} | FESTÉKINDEX`,
      description: `Találatok a „${term}” kifejezésre a FESTÉKINDEX adatbázisában.`,
      url: canonical,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website",
    },
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

export default async function KeresesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const results = term
    ? searchCatalog(term, { limit: SEARCH_FULL_LIMIT })
    : [];

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
          Globális keresés: cégek, márkák, termékcsaládok, termékek,
          technológiák, felületek, szakmai területek és tudástár.
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
            placeholder="Keress cégre, márkára, termékre, technológiára…"
            aria-label="Keresés"
            autoComplete="off"
          />
          <button type="submit">Keresés</button>
        </form>

        {!term ? (
          <p className="empty">Írj be legalább két karaktert a kereséshez.</p>
        ) : results.length === 0 ? (
          <p className="empty">Nincs találat a „{term}” kifejezésre.</p>
        ) : (
          <>
            <div className="toolbar" style={{ marginLeft: 0, marginRight: 0 }}>
              <h3>
                {results.length} találat: „{term}”
              </h3>
            </div>
            <div className="list-grid" role="list">
              {results.map((hit) => {
                const subtitle = [hit.typeLabelHu, hit.contextLabel]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <Link
                    key={`${hit.type}:${hit.id}`}
                    href={hit.href}
                    className="row"
                    role="listitem"
                  >
                    <div className="icon" aria-hidden>
                      {initials(hit.displayName)}
                    </div>
                    <div>
                      <b>{hit.displayName}</b>
                      <small>{subtitle}</small>
                    </div>
                    <div className="kind">{hit.typeLabelHu}</div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
