import Link from "next/link";
import type { FeaturedManufacturer } from "@/lib/search";

function keresesHref(query: string, gyartoSlug?: string) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (gyartoSlug) params.set("gyarto", gyartoSlug);
  const qs = params.toString();
  return qs ? `/kereses?${qs}` : "/kereses";
}

export function SearchManufacturerTabs({
  manufacturers,
  query,
  activeSlug,
}: {
  manufacturers: FeaturedManufacturer[];
  query: string;
  activeSlug?: string;
}) {
  if (manufacturers.length === 0) return null;

  return (
    <div className="search-mfr">
      <div className="search-mfr-label">Kiemelt gyártók</div>
      <nav
        className="search-mfr-tabs"
        role="tablist"
        aria-label="Kiemelt gyártók"
      >
        <Link
          href={keresesHref(query)}
          className={`search-mfr-tab${!activeSlug ? " on" : ""}`}
          role="tab"
          aria-selected={!activeSlug}
        >
          Mind
        </Link>
        {manufacturers.map((m) => {
          const on = activeSlug === m.slug;
          return (
            <Link
              key={m.id}
              href={keresesHref(query, m.slug)}
              className={`search-mfr-tab${on ? " on" : ""}`}
              role="tab"
              aria-selected={on}
              title={`${m.name} · ${m.hitCount} kapcsolódó találat`}
            >
              {m.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
