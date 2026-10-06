import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import {
  buildOrganizationHubJsonLd,
  type OrganizationHubModel,
} from "@/lib/seo/organizationHubModel";

const PREVIEW_PRODUCTS_PER_SECTION = 4;

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

          {model.familyCards.length > 0 ? (
            <section className="seo-section" id="termekcsaladok">
              <h2 className="seo-heading">Termékrendszerek / termékcsaládok</h2>
              <div className="org-family-list">
                {model.familyCards.map((f) => (
                  <div key={f.id} className="org-family-card">
                    <div className="org-family-head">
                      <Link href={f.href} className="org-family-name">
                        {f.name}
                      </Link>
                      {f.brandName && f.brandHref ? (
                        <span className="org-family-parent">
                          Márka:{" "}
                          <Link href={f.brandHref}>{f.brandName}</Link>
                        </span>
                      ) : (
                        <span className="org-family-parent">
                          Termékcsalád (márka nélkül)
                        </span>
                      )}
                    </div>
                    {f.description ? (
                      <p className="org-family-desc">{f.description}</p>
                    ) : null}
                    <div className="org-family-meta">
                      {f.productCount} termék
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {model.categories.length > 0 ? (
            <section className="seo-section" id="szakteruletek">
              <h2 className="seo-heading">Portfólió / szakmai területek</h2>
              <p className="org-section-note">
                A cég termékeinek belongsToCategory kapcsolataiból aggregálva.
              </p>
              <div className="seo-links">
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

          {model.productSections.length > 0 ? (
            <section className="seo-section" id="termekek">
              <h2 className="seo-heading">Kiemelt termékek</h2>
              {model.productSections.map((section) => (
                <div key={section.heading} className="org-product-block">
                  <h3 className="seo-subheading">
                    {section.href ? (
                      <Link href={section.href}>{section.heading}</Link>
                    ) : (
                      section.heading
                    )}
                  </h3>
                  <ul className="org-product-list">
                    {section.products
                      .slice(0, PREVIEW_PRODUCTS_PER_SECTION)
                      .map((p) => (
                        <li key={p.id}>
                          <Link href={p.href}>{p.name}</Link>
                        </li>
                      ))}
                  </ul>
                  {section.products.length > PREVIEW_PRODUCTS_PER_SECTION ? (
                    <p className="org-more">
                      +{section.products.length - PREVIEW_PRODUCTS_PER_SECTION}{" "}
                      további ebben a csoportban
                    </p>
                  ) : null}
                </div>
              ))}
              {model.allProductCount > 0 ? (
                <p className="org-all-products">
                  <Link href={model.allProductsHref} className="pill pill-link">
                    Összes termék megtekintése ({model.allProductCount})
                  </Link>
                </p>
              ) : null}
            </section>
          ) : null}

          {model.allProductCount > 0 ? (
            <section className="seo-section" id="osszes-termek">
              <h2 className="seo-heading">
                Összes termék ({model.allProductCount})
              </h2>
              <ul className="org-product-list org-product-list-full">
                {model.portfolio.allProducts.map((p) => (
                  <li key={p.id}>
                    <Link href={p.href}>{p.name}</Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(model.connectionTree.brands.length > 0 ||
            model.connectionTree.orphanFamilies.length > 0) && (
            <section className="seo-section" id="kapcsolatok">
              <h2 className="seo-heading">Kapcsolatok</h2>
              <p className="org-section-note">
                Organization → Brands → ProductFamilies → Products
              </p>
              <ul className="org-tree">
                <li>
                  <strong>{model.organization.name}</strong>
                  <ul>
                    {model.connectionTree.brands.map((b) => (
                      <li key={b.href}>
                        <Link href={b.href}>{b.name}</Link>
                        <ul>
                          {b.families.map((f) => (
                            <li key={f.href}>
                              <Link href={f.href}>{f.name}</Link>
                              {f.productCount > 0
                                ? ` · ${f.productCount} termék`
                                : null}
                            </li>
                          ))}
                          {b.directProductCount > 0 ? (
                            <li>
                              További termékek · {b.directProductCount}
                            </li>
                          ) : null}
                        </ul>
                      </li>
                    ))}
                    {model.connectionTree.orphanFamilies.map((f) => (
                      <li key={f.href}>
                        <Link href={f.href}>{f.name}</Link>
                        {f.productCount > 0
                          ? ` · ${f.productCount} termék`
                          : null}
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </section>
          )}

          {model.technologies.length > 0 ? (
            <section className="seo-section" id="technologiak">
              <h2 className="seo-heading">
                A portfólióban előforduló technológiák
              </h2>
              <div className="seo-links">
                {model.technologies.map((t) => (
                  <Link key={t.id} href={t.href} className="pill pill-link">
                    {t.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {model.surfaces.length > 0 ? (
            <section className="seo-section" id="feluletek">
              <h2 className="seo-heading">
                A portfólióban előforduló felületek
              </h2>
              <div className="seo-links">
                {model.surfaces.map((s) => (
                  <Link key={s.id} href={s.href} className="pill pill-link">
                    {s.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {model.sources.length > 0 ? (
            <section className="seo-section sources-footer" id="forrasok">
              <h2 className="seo-heading sources-heading">
                Források és adatellenőrzés
              </h2>
              {model.lastVerifiedAt ? (
                <p className="sources-meta">
                  Utolsó ellenőrzési dátum a gráfban: {model.lastVerifiedAt}
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
