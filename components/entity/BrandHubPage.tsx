import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import {
  brandOwnerBlurb,
  buildBrandHubJsonLd,
  type BrandHubModel,
} from "@/lib/seo/brandHubModel";
import type { BrandPortfolioProduct } from "@/lib/data/brandPortfolio";

const PREVIEW_PRODUCTS = 4;

function ProductNameList({
  products,
  preview = PREVIEW_PRODUCTS,
}: {
  products: BrandPortfolioProduct[];
  preview?: number;
}) {
  if (!products.length) return null;
  const visible = products.slice(0, preview);
  const rest = products.slice(preview);

  return (
    <>
      <ul className="org-product-list">
        {visible.map((p) => (
          <li key={p.id}>
            <Link href={p.href}>{p.name}</Link>
          </li>
        ))}
      </ul>
      {rest.length > 0 ? (
        <details className="org-product-more">
          <summary>+{rest.length} további termék</summary>
          <ul className="org-product-list">
            {rest.map((p) => (
              <li key={p.id}>
                <Link href={p.href}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  );
}

function DirectProductGrid({ products }: { products: BrandPortfolioProduct[] }) {
  if (!products.length) return null;

  const preview = products.slice(0, 8);
  const rest = products.slice(8);

  return (
    <>
      <div className="brand-product-grid">
        {preview.map((p) => (
          <div key={p.id} className="brand-product-item">
            <Link href={p.href} className="brand-product-name">
              {p.name}
            </Link>
            {p.categoryName ? (
              <div className="brand-product-meta">
                {p.categoryHref ? (
                  <Link href={p.categoryHref}>{p.categoryName}</Link>
                ) : (
                  p.categoryName
                )}
              </div>
            ) : null}
            {p.surfaces.length > 0 ? (
              <div className="brand-product-surfaces">
                {p.surfaces.slice(0, 4).map((s) => (
                  <Link key={s.id} href={s.href} className="pill pill-link">
                    {s.name}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {rest.length > 0 ? (
        <details className="org-product-more brand-product-more">
          <summary>+{rest.length} további termék</summary>
          <div className="brand-product-grid">
            {rest.map((p) => (
              <div key={p.id} className="brand-product-item">
                <Link href={p.href} className="brand-product-name">
                  {p.name}
                </Link>
                {p.categoryName ? (
                  <div className="brand-product-meta">{p.categoryName}</div>
                ) : null}
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </>
  );
}

/**
 * Brand hub — SSR HTML, repository-driven.
 * Reference template: /markak/valmor
 */
export function BrandHubPage({ model }: { model: BrandHubModel }) {
  const jsonLd = buildBrandHubJsonLd(model);
  const hasPortfolio =
    model.families.length > 0 || model.directProducts.length > 0;
  const hasTechSurfaces =
    model.technologies.length > 0 || model.surfaces.length > 0;

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub brand-hub">
        <Breadcrumbs
          items={model.breadcrumbs.map((c, i) => ({
            name: c.name,
            href: i < model.breadcrumbs.length - 1 ? c.path : undefined,
          }))}
        />

        <article className="entity-card entity-seo">
          <div className="entity-meta">{model.kindLabel}</div>
          <h1>{model.h1}</h1>
          <p className="page-lead">{model.lead}</p>

          {model.metaChips.length > 0 ? (
            <dl className="org-meta-row">
              {model.metaChips.map((chip) => (
                <div key={chip.label} className="org-meta-chip">
                  <dt>{chip.label}</dt>
                  <dd>{chip.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {hasPortfolio ? (
            <section className="seo-section" id="termekportfolio">
              <h2 className="seo-heading">Termékportfólió</h2>
              <div className="org-portfolio">
                {model.families.map((family) => (
                  <div
                    key={family.id}
                    className="org-portfolio-brand"
                    id={`family-${family.id}`}
                  >
                    <div className="org-portfolio-family-head">
                      <Link
                        href={family.href}
                        className="org-portfolio-family-name brand-family-title"
                      >
                        {family.name}
                      </Link>
                      <span className="org-portfolio-count">
                        {family.productCount} termék
                      </span>
                    </div>
                    {family.description ? (
                      <p className="org-portfolio-desc">{family.description}</p>
                    ) : null}
                    <ProductNameList products={family.products} />
                    <p className="org-portfolio-brand-all">
                      <Link href={family.href}>
                        → {family.name} termékcsalád
                      </Link>
                    </p>
                  </div>
                ))}

                {model.directProducts.length > 0 ? (
                  <div
                    className="org-portfolio-brand"
                    id="tovabbi-termekek"
                  >
                    <div className="org-portfolio-family-head">
                      <span className="org-portfolio-family-name org-portfolio-family-name-plain">
                        További {model.brand.name} termékek
                      </span>
                      <span className="org-portfolio-count">
                        {model.directProducts.length} termék
                      </span>
                    </div>
                    <DirectProductGrid products={model.directProducts} />
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {model.categories.length > 0 ? (
            <section className="seo-section" id="szakteruletek">
              <h2 className="seo-heading">Szakmai területek</h2>
              <div className="seo-links org-category-chips">
                {model.categories.map((c) => (
                  <Link
                    key={c.id}
                    href={c.href}
                    className="pill pill-link"
                    title={`${c.productCount} kapcsolódó termék`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {hasTechSurfaces ? (
            <section className="seo-section" id="technologiak-feluletek">
              <p className="org-section-note">
                A márka termékeihez kapcsolódó alkalmazási technológiák és
                felületek.
              </p>
              <div className="org-tech-surface-grid">
                {model.technologies.length > 0 ? (
                  <div className="org-tech-surface-col">
                    <h2 className="seo-heading">Technológiák</h2>
                    <div className="seo-links">
                      {model.technologies.map((t) => (
                        <Link
                          key={t.id}
                          href={t.href}
                          className="pill pill-link"
                        >
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                {model.surfaces.length > 0 ? (
                  <div className="org-tech-surface-col">
                    <h2 className="seo-heading">Felületek</h2>
                    <div className="seo-links">
                      {model.surfaces.map((s) => (
                        <Link
                          key={s.id}
                          href={s.href}
                          className="pill pill-link"
                        >
                          {s.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {model.ownerOrgs.length > 0 ? (
            <section className="seo-section" id="tulajdonos">
              <h2 className="seo-heading">{model.ownerSectionHeading}</h2>
              <div className="brand-owner-list">
                {model.ownerOrgs.map((o) => {
                  const blurb = brandOwnerBlurb(o.organization);
                  return (
                    <div key={o.organization.id} className="brand-owner-card">
                      <Link
                        href={o.href}
                        className="brand-owner-name"
                      >
                        {o.organization.name}
                      </Link>
                      {blurb ? (
                        <p className="brand-owner-blurb">{blurb}</p>
                      ) : null}
                      <p className="org-portfolio-brand-all">
                        <Link href={o.href}>
                          → {o.organization.name} adatlapja
                        </Link>
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {model.sources.length > 0 ? (
            <section className="seo-section sources-footer" id="forrasok">
              <h2 className="seo-heading sources-heading">
                Források és adatellenőrzés
              </h2>
              {model.lastVerifiedLabel ? (
                <p className="sources-meta">
                  Adatok ellenőrizve: {model.lastVerifiedLabel}
                </p>
              ) : null}
              <details className="org-sources-details">
                <summary>
                  Források megjelenítése ({model.sources.length})
                </summary>
                <ul className="org-sources-list">
                  {model.sources.map((s) => (
                    <li key={s.id}>
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.title}
                        </a>
                      ) : (
                        <span>{s.title}</span>
                      )}
                      {s.publisher ? (
                        <span className="org-source-pub"> · {s.publisher}</span>
                      ) : null}
                      {s.accessedAt ? (
                        <span className="org-source-date">
                          {" "}
                          · {s.accessedAt}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          ) : null}

          <div className="section">
            <Link href="/markak" className="pill pill-link">
              ← Vissza: Márkák
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
