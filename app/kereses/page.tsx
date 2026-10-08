import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { SearchBox } from "@/components/search/SearchBox";
import { SearchResultsList } from "@/components/search/SearchResultsList";
import { getProductById, SITE_ORIGIN } from "@/lib/data/repository";
import { stripBrandTitleSuffix } from "@/lib/seo/metadata";
import {
  buildSearchCatalog,
  normalizeSearchText,
  searchCatalog,
  SEARCH_FULL_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/lib/search";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  const canonical = `${SITE_ORIGIN}/kereses`;

  if (!term) {
    const title = stripBrandTitleSuffix("Keresés | FESTÉKINDEX");
    return {
      title,
      description:
        "Globális keresés cégek, márkák, technológiák, kategóriák és tudástár között.",
      alternates: { canonical },
      openGraph: {
        title,
        description:
          "Globális keresés cégek, márkák, technológiák, kategóriák és tudástár között.",
        url: canonical,
        siteName: "FESTÉKINDEX",
        locale: "hu_HU",
        type: "website",
      },
    };
  }

  const title = stripBrandTitleSuffix(`Keresés: ${term} | FESTÉKINDEX`);
  return {
    title,
    description: `Találatok a „${term}” kifejezésre a FESTÉKINDEX adatbázisában.`,
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description: `Találatok a „${term}” kifejezésre a FESTÉKINDEX adatbázisában.`,
      url: canonical,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website",
    },
  };
}

export default async function KeresesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";
  const normalizedLen = normalizeSearchText(term).length;
  const tooShort = term.length > 0 && normalizedLen < SEARCH_MIN_QUERY_LENGTH;
  const catalog = buildSearchCatalog();
  const results =
    term && !tooShort
      ? searchCatalog(term, { limit: SEARCH_FULL_LIMIT }).map((hit) => {
          if (hit.type !== "product") return hit;
          const p = getProductById(hit.id);
          return {
            ...hit,
            preview: p?.editorialSummary ?? p?.sourceSummary,
          };
        })
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

        <SearchBox
          catalog={catalog}
          initialQuery={term}
          variant="page"
          className="search-box--page-wrap"
        />

        {!term ? (
          <p className="empty">Írj be legalább két karaktert a kereséshez.</p>
        ) : tooShort ? (
          <p className="empty">Írj be legalább 2 karaktert.</p>
        ) : (
          <SearchResultsList results={results} query={term} />
        )}
      </div>
    </main>
  );
}
