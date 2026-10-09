"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { SearchBox } from "@/components/search/SearchBox";
import type { EntityType, SearchHit } from "@/lib/data/types";
import type { RelationPreview } from "@/lib/data/repository";
import type { SearchDocument } from "@/lib/search";
import { isPublicListFiller } from "@/lib/seo/publicListCopy";

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
  { label: "Termékek", types: ["product"] },
  { label: "Technológiák", types: ["technology"] },
];

/** Diverse professional search intents — not a single-manufacturer promo row. */
const QUICK = ["Airless", "Zománc", "Acél", "Homlokzat", "Hígító"];

function hitDescription(hit: SearchHit): string {
  const raw = hit.shortDescription?.trim() ?? "";
  if (!raw || isPublicListFiller(raw)) return "";
  return raw.length > 80 ? `${raw.slice(0, 80)}…` : raw;
}

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
  const detailRef = useRef<HTMLElement>(null);

  /** On stacked mobile layout the detail sits below the list — scroll it into view on select. */
  function selectHit(id: string) {
    setSelectedId(id);
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 980px)").matches) return;
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const productHitsFromCatalog = useMemo((): SearchHit[] => {
    return searchCatalogDocs
      .filter((d) => d.type === "product")
      .slice(0, 12)
      .map((d) => ({
        id: d.id,
        type: "product" as const,
        slug: d.href.split("/").pop() ?? d.id,
        name: d.displayName || d.name,
        shortDescription: "",
        href: d.href,
        kindLabel: d.typeLabelHu || "Termék",
        categoryNames: d.contextLabel ? [d.contextLabel] : [],
      }));
  }, [searchCatalogDocs]);

  const filtered = useMemo(() => {
    const types = FILTERS[filterIdx]?.types;
    let list = initialHits;
    if (types) {
      list = list.filter((h) => types.includes(h.type));
      // Termékek: supplement from SearchDocuments when featured mix is sparse
      if (types.includes("product") && list.length < 6) {
        const seen = new Set(list.map((h) => h.id));
        for (const extra of productHitsFromCatalog) {
          if (seen.has(extra.id)) continue;
          list = [...list, extra];
          seen.add(extra.id);
          if (list.length >= 10) break;
        }
      }
    }
    return list;
  }, [initialHits, filterIdx, productHitsFromCatalog]);

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
            filtered.map((hit) => {
              const desc = hitDescription(hit);
              return (
                <button
                  key={hit.id}
                  type="button"
                  className={`row${selected?.id === hit.id ? " selected" : ""}`}
                  onClick={() => selectHit(hit.id)}
                >
                  <div className="icon">{initials(hit.name)}</div>
                  <div>
                    <b>{hit.name}</b>
                    <small>
                      {hit.categoryNames[0] ?? hit.kindLabel}
                      {desc ? ` · ${desc}` : ""}
                    </small>
                  </div>
                  <div className="kind">{hit.kindLabel}</div>
                </button>
              );
            })
          )}
        </div>

        <aside className="detail" ref={detailRef} id="home-explorer-detail">
          {selected ? (
            <>
              <div className="dtype">{selected.kindLabel}</div>
              <h2>{selected.name}</h2>
              <p>
                {hitDescription(selected) ||
                  `${selected.kindLabel} a FESTÉKINDEX szakmai indexében.`}
              </p>
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
                <h4>Kapcsolódó szakmai tartalmak</h4>
                <div className="route">
                  <b>{selected.name}</b>
                  {related.length
                    ? related.slice(0, 4).map((r) => (
                        <span key={`${r.entityId}-route`}>
                          {" "}
                          → {r.name}
                        </span>
                      ))
                    : " — kapcsolódó elemek a kiválasztott találat alapján"}
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
                A részletes adatlap itt mutatja a kiválasztott céget, márkát,
                terméket vagy technológiát és a kapcsolódó szakmai tartalmakat.
              </p>
              <div className="section">
                <h4>Felfedezési útvonal</h4>
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
