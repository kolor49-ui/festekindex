"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SearchBox } from "@/components/search/SearchBox";
import type { EntityType, SearchHit } from "@/lib/data/types";
import type { RelationPreview } from "@/lib/data/repository";
import type { SearchDocument } from "@/lib/search";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("")
    .toUpperCase();
}

const FILTERS: { label: string; types?: EntityType[] }[] = [
  { label: "Minden" },
  { label: "Cégek", types: ["organization"] },
  { label: "Márkák", types: ["brand"] },
  { label: "Technológiák", types: ["technology"] },
];

const QUICK = ["Graco", "Dulux", "Airless", "Porfesték", "Csiszolás"];

export function HomeExplorer({
  initialHits,
  relatedByEntityId,
  searchCatalogDocs,
}: {
  initialHits: SearchHit[];
  relatedByEntityId: Record<string, RelationPreview[]>;
  searchCatalogDocs: SearchDocument[];
}) {
  const [filterIdx, setFilterIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialHits[0]?.id ?? null,
  );

  const filtered = useMemo(() => {
    const types = FILTERS[filterIdx]?.types;
    let list = initialHits;
    if (types) {
      list = list.filter((h) => types.includes(h.type));
    }
    return list;
  }, [initialHits, filterIdx]);

  const selected = filtered.find((h) => h.id === selectedId) ?? filtered[0];
  const related = selected ? (relatedByEntityId[selected.id] ?? []) : [];

  return (
    <>
      <section className="hero">
        <div className="heroEyebrow">A magyar festékipar szakmai indexe</div>
        <h1>
          A festékipar.
          <span>Rendszerezve.</span>
        </h1>
        <p>
          Gyártók, márkák és technológiák egyetlen kereshető szakmai rendszerben.
        </p>
        <SearchBox
          catalog={searchCatalogDocs}
          variant="hero"
          placeholder="Keress cégre, márkára, technológiára vagy termékkörre…"
        />
        <div className="quick">
          {QUICK.map((q) => (
            <Link
              key={q}
              href={`/kereses?q=${encodeURIComponent(q)}`}
              className="quick-chip"
            >
              {q}
            </Link>
          ))}
        </div>
      </section>

      <div className="toolbar">
        <div className="filters">
          {FILTERS.map((f, i) => (
            <button
              key={f.label}
              type="button"
              className={`filter${filterIdx === i ? " on" : ""}`}
              onClick={() => setFilterIdx(i)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="layout">
        <div className="results">
          {filtered.length === 0 ? (
            <p className="empty">Nincs találat. Próbálj másik keresőkifejezést.</p>
          ) : (
            filtered.map((hit) => (
              <button
                key={hit.id}
                type="button"
                className={`row${selected?.id === hit.id ? " selected" : ""}`}
                onClick={() => setSelectedId(hit.id)}
              >
                <div className="icon">{initials(hit.name)}</div>
                <div>
                  <b>{hit.name}</b>
                  <small>
                    {hit.categoryNames[0] ?? hit.kindLabel}
                    {hit.shortDescription
                      ? ` · ${hit.shortDescription.slice(0, 80)}${hit.shortDescription.length > 80 ? "…" : ""}`
                      : ""}
                  </small>
                </div>
                <div className="kind">{hit.kindLabel}</div>
              </button>
            ))
          )}
        </div>

        <aside className="detail">
          {selected ? (
            <>
              <div className="dtype">{selected.kindLabel}</div>
              <h2>{selected.name}</h2>
              <p>{selected.shortDescription}</p>
              <div className="section">
                <h4>Kapcsolódó elemek</h4>
                {related.length ? (
                  <div className="agg-links">
                    {related.map((r) => (
                      <div key={r.entityId} className="agg-link">
                        <Link
                          href={r.href}
                          className="pill pill-link"
                          title={r.relationLabel}
                        >
                          {r.name}
                        </Link>
                        {r.relationLabel ? (
                          <span className="agg-roles">{r.relationLabel}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="pill">Nincs rögzített kapcsolat</span>
                )}
              </div>
              <div className="section">
                <h4>Kapcsolati háló</h4>
                <div className="route">
                  <b>{selected.name}</b>
                  {related.length
                    ? related.slice(0, 4).map((r) => (
                        <span key={`${r.entityId}-route`}>
                          {" "}
                          → {r.name}
                        </span>
                      ))
                    : " → kapcsolódó entitások a relations rétegből"}
                </div>
              </div>
              <div className="section">
                <Link href={selected.href} className="pill pill-link">
                  Teljes adatlap →
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="dtype">FESTÉKINDEX ADATLAP</div>
              <h2>Válassz egy találatot</h2>
              <p>
                A részletes adatlap itt mutatja majd a céget vagy márkát és annak
                teljes kapcsolati hálóját.
              </p>
              <div className="section">
                <h4>Kapcsolati logika</h4>
                <div className="route">
                  <b>Cég</b> → márkák → technológiák → termékcsoportok → hazai
                  kapcsolat → szerviz → szakmai tudás
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </>
  );
}
