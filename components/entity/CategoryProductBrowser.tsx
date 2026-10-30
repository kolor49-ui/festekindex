"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatProductCard } from "@/lib/data/categoryHub";

const PAGE_SIZE = 24;

type FacetOption = { id: string; name: string };

function hu(a: string, b: string): number {
  return a.localeCompare(b, "hu");
}

function uniqueFacets(
  products: CatProductCard[],
  idKey: "brandId" | "familyId" | "manufacturerId",
  nameKey: "brandName" | "familyName" | "manufacturerName",
): FacetOption[] {
  const map = new Map<string, string>();
  for (const p of products) {
    const id = p[idKey];
    const name = p[nameKey];
    if (id && name) map.set(id, name);
  }
  return [...map.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => hu(a.name, b.name));
}

function normalizeQuery(q: string): string {
  return q.trim().toLocaleLowerCase("hu");
}

function matchesQuery(p: CatProductCard, qNorm: string): boolean {
  if (!qNorm) return true;
  const hay = [p.name, p.brandName, p.familyName, p.manufacturerName]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("hu");
  return hay.includes(qNorm);
}

function facetName(options: FacetOption[], id: string): string | null {
  if (!id) return null;
  return options.find((o) => o.id === id)?.name ?? null;
}

type Props = {
  products: CatProductCard[];
};

function FacetChip({
  label,
  value,
  selectedName,
  idleValueLabel,
  onChange,
  options,
}: {
  label: string;
  value: string;
  selectedName: string | null;
  idleValueLabel: string;
  onChange: (next: string) => void;
  options: FacetOption[];
}) {
  const active = !!value;
  return (
    <label
      className={
        active
          ? "category-filter-field category-filter-chip is-active"
          : "category-filter-field category-filter-chip"
      }
    >
      <span className="category-filter-label">{label}</span>
      <span className="category-filter-chip-face" aria-hidden="true">
        <span className="category-filter-chip-text">
          {selectedName ?? label}
        </span>
        <span className="category-filter-chip-chevron" />
      </span>
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{idleValueLabel}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Category product browser — search + Brand / Family / Manufacturer filters,
 * flat list with progressive reveal. Brand ≠ manufacturer.
 * Mobile: facet chips open the native picker; desktop keeps labeled selects.
 */
export function CategoryProductBrowser({ products }: Props) {
  const [q, setQ] = useState("");
  const [brandId, setBrandId] = useState("");
  const [familyId, setFamilyId] = useState("");
  const [manufacturerId, setManufacturerId] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const allBrands = useMemo(
    () => uniqueFacets(products, "brandId", "brandName"),
    [products],
  );
  const allManufacturers = useMemo(
    () => uniqueFacets(products, "manufacturerId", "manufacturerName"),
    [products],
  );

  const familyOptions = useMemo(() => {
    const pool = brandId
      ? products.filter((p) => p.brandId === brandId)
      : products;
    return uniqueFacets(pool, "familyId", "familyName");
  }, [products, brandId]);

  const showBrandFilter = allBrands.length >= 2;
  const showFamilyFilter = familyOptions.length >= 2;
  const showManufacturerFilter = allManufacturers.length >= 2;
  const showFacets =
    showBrandFilter || showFamilyFilter || showManufacturerFilter;

  const filtered = useMemo(() => {
    const qNorm = normalizeQuery(q);
    return products.filter((p) => {
      if (brandId && p.brandId !== brandId) return false;
      if (familyId && p.familyId !== familyId) return false;
      if (manufacturerId && p.manufacturerId !== manufacturerId) return false;
      return matchesQuery(p, qNorm);
    });
  }, [products, q, brandId, familyId, manufacturerId]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function resetVisible() {
    setVisibleCount(PAGE_SIZE);
  }

  function onBrandChange(next: string) {
    setBrandId(next);
    setFamilyId("");
    resetVisible();
  }

  function onFamilyChange(next: string) {
    setFamilyId(next);
    resetVisible();
  }

  function onManufacturerChange(next: string) {
    setManufacturerId(next);
    resetVisible();
  }

  function onQueryChange(next: string) {
    setQ(next);
    resetVisible();
  }

  const hasActiveFilters =
    !!normalizeQuery(q) || !!brandId || !!familyId || !!manufacturerId;

  return (
    <div className="category-product-browser">
      <div className="category-product-toolbar">
        <p className="category-product-count" aria-live="polite">
          {filtered.length === products.length
            ? `${filtered.length} termék`
            : `${filtered.length} / ${products.length} termék`}
        </p>

        <div className="category-product-filters">
          <label className="category-filter-field category-filter-search">
            <span className="category-filter-label">Keresés</span>
            <input
              type="search"
              value={q}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Terméknév, márka…"
              autoComplete="off"
            />
          </label>

          {showFacets ? (
            <div className="category-filter-facets">
              {showBrandFilter ? (
                <FacetChip
                  label="Márka"
                  value={brandId}
                  selectedName={facetName(allBrands, brandId)}
                  idleValueLabel="Összes márka"
                  onChange={onBrandChange}
                  options={allBrands}
                />
              ) : null}

              {showFamilyFilter ? (
                <FacetChip
                  label="Termékcsalád"
                  value={familyId}
                  selectedName={facetName(familyOptions, familyId)}
                  idleValueLabel="Összes család"
                  onChange={onFamilyChange}
                  options={familyOptions}
                />
              ) : null}

              {showManufacturerFilter ? (
                <FacetChip
                  label="Gyártó"
                  value={manufacturerId}
                  selectedName={facetName(allManufacturers, manufacturerId)}
                  idleValueLabel="Összes gyártó"
                  onChange={onManufacturerChange}
                  options={allManufacturers}
                />
              ) : null}
            </div>
          ) : null}

          {hasActiveFilters ? (
            <button
              type="button"
              className="category-filter-reset"
              onClick={() => {
                setQ("");
                setBrandId("");
                setFamilyId("");
                setManufacturerId("");
                resetVisible();
              }}
            >
              Szűrők törlése
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="category-product-empty">
          Nincs a szűrésnek megfelelő termék.
        </p>
      ) : (
        <>
          <ul className="surface-product-list brand-product-grid">
            {visible.map((p) => (
              <li key={p.id} className="brand-product-item">
                <Link href={p.href} className="brand-product-name">
                  {p.name}
                </Link>
                {p.brandName || p.manufacturerName ? (
                  <div className="brand-product-meta">
                    {p.brandName ? (
                      p.brandHref ? (
                        <Link href={p.brandHref}>{p.brandName}</Link>
                      ) : (
                        <span>{p.brandName}</span>
                      )
                    ) : null}
                    {p.brandName && p.manufacturerName ? (
                      <span aria-hidden="true"> · </span>
                    ) : null}
                    {p.manufacturerName ? (
                      p.manufacturerHref ? (
                        <Link href={p.manufacturerHref}>
                          {p.manufacturerName}
                        </Link>
                      ) : (
                        <span>{p.manufacturerName}</span>
                      )
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          {hasMore ? (
            <div className="category-product-more">
              <button
                type="button"
                className="category-show-more"
                onClick={() =>
                  setVisibleCount((n) => n + PAGE_SIZE)
                }
              >
                Mutass többet ({filtered.length - visibleCount} hátra)
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
