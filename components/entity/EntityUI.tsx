import Link from "next/link";
import type { AnyEntity, RelatedEntity, Source } from "@/lib/data/types";
import {
  getEntityHref,
  getRelationTypeLabel,
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
        <span key={`${item.name}-${i}`}>
          {i > 0 ? " / " : null}
          {item.href ? <Link href={item.href}>{item.name}</Link> : <b>{item.name}</b>}
        </span>
      ))}
    </nav>
  );
}

export function RelationPills({ related }: { related: RelatedEntity[] }) {
  if (!related.length) {
    return <p className="empty">Még nincsenek rögzített kapcsolatok.</p>;
  }

  const grouped = new Map<string, RelatedEntity[]>();
  for (const item of related) {
    const key = getRelationTypeLabel(item.relation.relationType);
    const list = grouped.get(key) ?? [];
    list.push(item);
    grouped.set(key, list);
  }

  return (
    <>
      {[...grouped.entries()].map(([label, items]) => (
        <div className="section" key={label}>
          <h4>{label}</h4>
          {items.map(({ entity, relation }) => (
            <Link
              key={`${relation.id}-${entity.id}`}
              href={getEntityHref(entity)}
              className="pill pill-link"
              title={relation.description}
            >
              {entity.name}
            </Link>
          ))}
        </div>
      ))}
    </>
  );
}

export function SourcesBlock({ sources }: { sources: Source[] }) {
  if (!sources.length) return null;
  return (
    <div className="section">
      <h4>Források</h4>
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
            {s.accessedAt ? ` · ellenőrizve: ${s.accessedAt}` : null}
          </div>
        ))}
      </div>
    </div>
  );
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
