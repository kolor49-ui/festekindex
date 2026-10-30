import Link from "next/link";

export type ManufacturerTabItem = {
  id: string;
  name: string;
  slug: string;
  /** Optional count for title tooltip. */
  hitCount?: number;
};

export function SearchManufacturerTabs({
  manufacturers,
  activeSlug,
  buildHref,
  label = "Kiemelt márkák és cégek",
}: {
  manufacturers: ManufacturerTabItem[];
  activeSlug?: string;
  /** Mind → buildHref(); manufacturer → buildHref(slug). */
  buildHref: (gyartoSlug?: string) => string;
  label?: string;
}) {
  if (manufacturers.length === 0) return null;

  return (
    <div className="search-mfr">
      <div className="search-mfr-label">{label}</div>
      <nav
        className="search-mfr-tabs"
        role="tablist"
        aria-label={label}
      >
        <Link
          href={buildHref()}
          className={`search-mfr-tab${!activeSlug ? " on" : ""}`}
          role="tab"
          aria-selected={!activeSlug}
        >
          Mind
        </Link>
        {manufacturers.map((m) => {
          const on = activeSlug === m.slug;
          const title =
            m.hitCount != null
              ? `${m.name} · ${m.hitCount} kapcsolódó találat`
              : m.name;
          return (
            <Link
              key={m.id}
              href={buildHref(m.slug)}
              className={`search-mfr-tab${on ? " on" : ""}`}
              role="tab"
              aria-selected={on}
              title={title}
            >
              {m.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
