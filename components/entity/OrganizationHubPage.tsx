import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import {
  buildOrganizationHubJsonLd,
  type OrganizationHubModel,
} from "@/lib/seo/organizationHubModel";
import type { PortfolioProductLink } from "@/lib/data/organizationPortfolio";

/** Visible product links before SSR <details> overflow (crawlable either way). */
const PREVIEW_PRODUCTS = 4;

function ProductLinkList({
  products,
  preview = PREVIEW_PRODUCTS,
}: {
  products: PortfolioProductLink[];
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

/**
 * Manufacturer Organization hub — SSR HTML, repository-driven.
 * Reference template: /cegek/festek-bazis-zrt
 */
export function OrganizationHubPage({
  model,
}: {
  model: OrganizationHubModel;
}) {
  const jsonLd = buildOrganizationHubJsonLd(model);
  const hasPortfolio =
    model.brandGroups.some(
      (g) => g.families.length > 0 || g.directProducts.length > 0,
    ) || model.orphanFamilies.length > 0;
  const hasTechSurfaces =
    model.technologies.length > 0 || model.surfaces.length > 0;

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub">
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

          {model.brands.length > 0 ? (
            <section className="seo-section" id="markak">
              <h2 className="seo-heading">Márkák</h2>
              <div className="org-brand-grid">
                {model.brands.map((b) => (
                  <Link key={b.id} href={b.href} className="org-brand-card">
                    <span className="org-brand-name">{b.name}</span>
                    <span className="org-brand-kind">Márka</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {hasPortfolio ? (
            <section className="seo-section" id="termekportfolio">
              <h2 className="seo-heading">Termékportfólió</h2>
              <div className="org-portfolio">
                {model.brandGroups.map((group) => {
                  const brandProductCount =
                    group.families.reduce((n, f) => n + f.productCount, 0) +
                    group.directProducts.length;
                  if (
                    group.families.length === 0 &&
                    group.directProducts.length === 0
                  ) {
                    return null;
                  }
                  return (
                    <div
                      key={group.brand.id}
                      className="org-portfolio-brand"
                      id={`portfolio-${group.brand.slug}`}
                    >
                      <h3 className="org-portfolio-brand-name">
                        <Link href={group.href}>{group.brand.name}</Link>
                      </h3>

                      {group.families.map((family) => (
                        <div
                          key={family.id}
                          className="org-portfolio-family"
                        >
                          <div className="org-portfolio-family-head">
                            <Link
                              href={family.href}
                              className="org-portfolio-family-name"
                            >
                              {family.name}
                            </Link>
                            <span className="org-portfolio-count">
                              {family.productCount} termék
                            </span>
                          </div>
                          {family.description ? (
                            <p className="org-portfolio-desc">
                              {family.description}
                            </p>
                          ) : null}
                          <ProductLinkList products={family.products} />
                        </div>
                      ))}

                      {group.directProducts.length > 0 ? (
                        <div className="org-portfolio-family">
                          <div className="org-portfolio-family-head">
                            <span className="org-portfolio-family-name org-portfolio-family-name-plain">
                              További {group.brand.name} termékek
                            </span>
                            <span className="org-portfolio-count">
                              {group.directProducts.length} termék
                            </span>
                          </div>
                          <ProductLinkList products={group.directProducts} />
                        </div>
                      ) : null}

                      {brandProductCount > 0 ? (
                        <p className="org-portfolio-brand-all">
                          <Link href={group.href}>
                            Összes {group.brand.name} termék →
                          </Link>
                        </p>
                      ) : null}
                    </div>
                  );
                })}

                {model.orphanFamilies.map((family) => (
                  <div
                    key={family.id}
                    className="org-portfolio-brand org-portfolio-orphan-family"
                    id={`portfolio-family-${family.id}`}
                  >
                    <div className="org-portfolio-family-kind">
                      Termékcsalád
                    </div>
                    <h3 className="org-portfolio-brand-name">
                      <Link href={family.href}>{family.name}</Link>
                    </h3>
                    {family.description ? (
                      <p className="org-portfolio-desc">
                        {family.description}
                      </p>
                    ) : null}
                    <div className="org-portfolio-family-head">
                      <span className="org-portfolio-count">
                        {family.productCount} termék
                      </span>
                    </div>
                    <ProductLinkList products={family.products} />
                    {family.productCount > PREVIEW_PRODUCTS ? (
                      <p className="org-portfolio-brand-all">
                        <Link href={family.href}>
                          Összes {family.name} termék →
                        </Link>
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {model.companyFacts.length > 0 ? (
            <section className="seo-section" id="cegadatok">
              <h2 className="seo-heading">Cégadatok</h2>
              <dl className="org-facts">
                {model.companyFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className={
                      fact.wide ? "org-fact org-fact-wide" : "org-fact"
                    }
                  >
                    <dt>{fact.label}</dt>
                    <dd>
                      {fact.href ? (
                        <a
                          href={fact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {fact.value}
                        </a>
                      ) : (
                        fact.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
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
                A gyártó termékeihez kapcsolódó alkalmazási technológiák és
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
            <Link href="/cegek" className="pill pill-link">
              ← Vissza: Cégek
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
