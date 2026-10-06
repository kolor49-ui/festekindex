import Link from "next/link";
import type { AnyEntity, RelatedEntity, Source } from "@/lib/data/types";
import {
  aggregateRelatedByTarget,
  getEntityHref,
  KIND_LABEL,
} from "@/lib/data/repository";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

export function Breadcrumbs({
  items,
}: {
  items: { name: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.name}-${i}`} className="breadcrumb-item">
          {i > 0 ? <span className="breadcrumb-sep"> / </span> : null}
          {item.href ? (
            <Link href={item.href}>{item.name}</Link>
          ) : (
            <span className="breadcrumb-current">{item.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/** Compact portfolio context — Entity Navigation Standard v1. */
export function EntityContextNav({
  items,
  heading = "Kapcsolódás",
}: {
  items: { label: string; name: string; href: string }[];
  heading?: string;
}) {
  if (!items.length) return null;

  return (
    <nav className="entity-context-nav" aria-label={heading}>
      <div className="entity-context-heading">{heading}</div>
      <ul className="entity-context-list">
        {items.map((item) => (
          <li key={`${item.label}-${item.href}`} className="entity-context-row">
            <span className="entity-context-label">{item.label}</span>
            <Link href={item.href} className="entity-context-link">
              {item.name}
              <span className="entity-context-arrow" aria-hidden="true">
                {" "}
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** One chip per related entity; multiple relation roles merged into note. */
export function RelationPills({ related }: { related: RelatedEntity[] }) {
  const aggregated = aggregateRelatedByTarget(related);
  if (!aggregated.length) {
    return <p className="empty">Még nincsenek rögzített kapcsolatok.</p>;
  }

  const byKind = new Map<string, typeof aggregated>();
  for (const item of aggregated) {
    const list = byKind.get(item.kindLabel) ?? [];
    list.push(item);
    byKind.set(item.kindLabel, list);
  }

  return (
    <>
      {[...byKind.entries()].map(([kind, items]) => (
        <div className="section" key={kind}>
          <h4>{kind}</h4>
          <div className="agg-links">
            {items.map((agg) => (
              <div key={agg.entity.id} className="agg-link">
                <Link
                  href={agg.href}
                  className="pill pill-link"
                  title={agg.rolesSummary}
                >
                  {agg.entity.name}
                </Link>
                {agg.roles.length > 0 ? (
                  <span className="agg-roles">{agg.rolesSummary}</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

export function SourcesBlock({
  sources,
  lastVerifiedAt,
}: {
  sources: Source[];
  lastVerifiedAt?: string;
}) {
  if (!sources.length && !lastVerifiedAt) return null;

  const verifiedLabel = lastVerifiedAt
    ? formatVerifiedDate(lastVerifiedAt)
    : null;

  return (
    <section className="seo-section sources-footer" id="forrasok">
      <h2 className="seo-heading sources-heading">Források és adatellenőrzés</h2>
      {verifiedLabel ? (
        <p className="sources-meta">Utolsó szakmai ellenőrzés: {verifiedLabel}</p>
      ) : null}
      {sources.length > 0 ? (
        <div className="sources-list">
          {sources.map((s) => (
            <div key={s.id}>
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
              ) : (
                s.title
              )}
              {s.accessedAt ? ` · ${s.accessedAt}` : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function formatVerifiedDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const months = [
    "január",
    "február",
    "március",
    "április",
    "május",
    "június",
    "július",
    "augusztus",
    "szeptember",
    "október",
    "november",
    "december",
  ];
  const month = months[Number(m[2]) - 1] ?? m[2];
  return `${m[1]}. ${month}`;
}

export function EntityHeader({ entity }: { entity: AnyEntity }) {
  return (
    <div className="entity-meta">
      {KIND_LABEL[entity.type]}
      {entity.verifiedAt ? ` · ellenőrizve: ${entity.verifiedAt}` : null}
    </div>
  );
}

export function EntityList({ entities }: { entities: AnyEntity[] }) {
  if (!entities.length) {
    return <p className="empty">Nincs megjeleníthető elem.</p>;
  }

  return (
    <div className="list-grid">
      {entities.map((entity) => (
        <Link key={entity.id} href={getEntityHref(entity)} className="row">
          <div className="icon">{initials(entity.name)}</div>
          <div>
            <b>{entity.name}</b>
            <small>{entity.shortDescription}</small>
          </div>
          <div className="kind">{KIND_LABEL[entity.type]}</div>
        </Link>
      ))}
    </div>
  );
}
