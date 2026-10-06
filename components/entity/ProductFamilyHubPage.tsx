import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import type { ProductFamilyHubModel } from "@/lib/seo/productFamilyHubModel";
import { buildProductFamilyHubJsonLd } from "@/lib/seo/productFamilyHubModel";
import { systemRoleLabel } from "@/lib/seo/productHubModel";

/**
 * ProductFamily hub — SSR HTML, repository-driven.
 * Reference: /termekcsaladok/valmor-air-flow
 */
export function ProductFamilyHubPage({
  model,
}: {
  model: ProductFamilyHubModel;
}) {
  const jsonLd = buildProductFamilyHubJsonLd(model);
  const hasTechSurfaces =
    model.technologies.length > 0 || model.surfaces.length > 0;
  const hasSystem = model.systemPeers.length >= 2;

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub product-family-hub">
        <Breadcrumbs
          items={model.breadcrumbs.map((c, i) => ({
            name: c.name,
            href: i < model.breadcrumbs.length - 1 ? c.path : undefined,
          }))}
        />

        <article className="entity-card entity-seo">
          <div className="entity-meta">{model.kindLabel}</div>
          <h1>{model.h1}</h1>
          {model.lead ? <p className="page-lead">{model.lead}</p> : null}

          {model.headerFacts.length > 0 ? (
            <dl className="org-meta-row product-header-facts">
              {model.headerFacts.map((fact) => (
                <div key={fact.label} className="org-meta-chip">
                  <dt>{fact.label}</dt>
                  <dd>
                    {fact.href ? (
                      <Link href={fact.href}>{fact.value}</Link>
                    ) : (
                      fact.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {model.products.length > 0 ? (
            <section className="seo-section" id="termekek">
              <h2 className="seo-heading">Termékek</h2>
              <div className="brand-product-grid">
                {model.products.map((p) => (
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
                          <Link
                            key={s.id}
                            href={s.href}
                            className="pill pill-link"
                          >
                            {s.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
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
                A termékcsalád termékeihez kapcsolódó alkalmazási technológiák
                és felületek. Az összesítés nem jelenti, hogy minden termék
                minden felsorolt technológiával vagy felülettel kompatibilis.
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

          {model.background ? (
            <section className="seo-section" id="marka-hatter">
              <h2 className="seo-heading">{model.background.heading}</h2>
              <div className="product-background">
                {model.background.brand ? (
                  <div className="product-background-block">
                    <div className="product-background-label">Márka</div>
                    <Link
                      href={model.background.brand.href}
                      className="product-background-name"
                    >
                      {model.background.brand.name}
                    </Link>
                    {model.background.brand.blurb ? (
                      <p className="product-background-blurb">
                        {model.background.brand.blurb}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {model.background.organization ? (
                  <div className="product-background-block">
                    <div className="product-background-label">
                      {model.background.organization.label}
                    </div>
                    <Link
                      href={model.background.organization.href}
                      className="product-background-name"
                    >
                      {model.background.organization.name}
                    </Link>
                    {model.background.organization.blurb ? (
                      <p className="product-background-blurb">
                        {model.background.organization.blurb}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {hasSystem ? (
            <section className="seo-section" id="rendszer">
              <h2 className="seo-heading">
                {model.systemHasSequence
                  ? "Rendszerfelépítés"
                  : "Rendszerkapcsolatok"}
              </h2>
              <ol
                className={
                  model.systemHasSequence
                    ? "product-system-list product-system-sequenced"
                    : "product-system-list"
                }
              >
                {model.systemPeers.map((peer, i) => {
                  const role = systemRoleLabel(peer.role);
                  return (
                    <li key={peer.id} className="product-system-item">
                      {model.systemHasSequence && i > 0 ? (
                        <span
                          className="product-system-arrow"
                          aria-hidden="true"
                        >
                          ↓
                        </span>
                      ) : null}
                      <div className="product-system-body">
                        <Link href={peer.href} className="product-system-name">
                          {peer.name}
                        </Link>
                        {role ? (
                          <span className="product-system-role">{role}</span>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          {model.knowledge.length > 0 ? (
            <section className="seo-section" id="tudastar">
              <h2 className="seo-heading">Kapcsolódó szakmai tartalom</h2>
              <ul className="seo-knowledge-list">
                {model.knowledge.map((k) => (
                  <li key={k.id}>
                    <Link href={k.href}>{k.name}</Link>
                    {k.note ? (
                      <span className="seo-knowledge-note"> — {k.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
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
            <Link href="/termekcsaladok" className="pill pill-link">
              ← Vissza: Termékcsaládok
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
