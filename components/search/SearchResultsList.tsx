import Link from "next/link";
import {
  clampSearchPreview,
  formatSearchResultMeta,
  type SearchResult,
} from "@/lib/search";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

export type SearchResultRow = SearchResult & {
  /** Optional short preview (e.g. Product editorialSummary). */
  preview?: string;
};

export function SearchResultsList({
  results,
  query,
}: {
  results: SearchResultRow[];
  query: string;
}) {
  if (results.length === 0) {
    return (
      <div className="search-empty">
        <p className="empty">
          Nincs találat erre: „{query}”
        </p>
        <p className="search-empty-hint">
          Próbálj rövidebb kifejezést, gyártót/márkát, terméknevet,
          technológiát vagy felületet.
        </p>
        <nav className="search-empty-nav" aria-label="További böngészés">
          <Link href="/cegek">Cégek</Link>
          <Link href="/markak">Márkák</Link>
          <Link href="/technologiak">Technológiák</Link>
          <Link href="/kategoriak">Szakmai területek</Link>
        </nav>
      </div>
    );
  }

  return (
    <>
      <div className="toolbar search-results-toolbar">
        <h3>
          {results.length} találat: „{query}”
        </h3>
      </div>
      <div className="list-grid search-results-list" role="list">
        {results.map((hit) => {
          const meta = formatSearchResultMeta(hit);
          const preview = clampSearchPreview(hit.preview);
          return (
            <Link
              key={`${hit.type}:${hit.id}`}
              href={hit.href}
              className={`row search-result-row${
                hit.matchKind === "identity"
                  ? " search-result-row--identity"
                  : " search-result-row--context"
              }`}
              role="listitem"
            >
              <div className="icon" aria-hidden>
                {initials(hit.displayName)}
              </div>
              <div className="search-result-body">
                <b>{hit.displayName}</b>
                {meta ? <small className="search-result-meta">{meta}</small> : null}
                {preview ? (
                  <small className="search-result-preview">{preview}</small>
                ) : null}
              </div>
              <div className="kind">{hit.typeLabelHu}</div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
