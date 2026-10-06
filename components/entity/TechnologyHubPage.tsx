import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import {
  buildTechnologyHubJsonLd,
  type TechnologyHubModel,
} from "@/lib/seo/technologyHubModel";

/**
 * Technology Hub v1 — SSR HTML.
 * Direct Technology graph + Product-derived context, semantically separated.
 * Never renders internal enums, relation types, readiness grades, or graph jargon.
 */
export function TechnologyHubPage({ model }: { model: TechnologyHubModel }) {
  const jsonLd = buildTechnologyHubJsonLd(model);
  const hasCatSurfaces =
    model.categories.length > 0 || model.surfaces.length > 0;
  const grouped =
    model.productGroups.length > 1 ||
    (model.productGroups.length === 1 &&
      !!model.productGroups[0]?.categoryName);

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub technology-hub">
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

          {model.products.length > 0 ? (
            <section className="seo-section" id="kapcsolodo-termekek">
              <h2 className="seo-heading">Kapcsolódó termékek</h2>
              {grouped
                ? model.productGroups.map((group) => (
                    <div
                      key={group.categoryId ?? "flat"}
                      className="surface-product-group"
                    >
                      {group.categoryName ? (
                        <h3 className="surface-product-group-title">
                          {group.categoryHref ? (
                            <Link href={group.categoryHref}>
                              {group.categoryName}
                            </Link>
                          ) : (
                            group.categoryName
                          )}
                        </h3>
                      ) : null}
                      <ul className="surface-product-list brand-product-grid">
                        {group.products.map((p) => (
                          <li key={p.id} className="brand-product-item">
                            <Link
                              href={p.href}
                              className="brand-product-name"
                            >
                              {p.name}
                            </Link>
                            {p.brandName || p.familyName ? (
                              <div className="brand-product-meta">
                                {p.brandName ? (
                                  p.brandHref ? (
                                    <Link href={p.brandHref}>{p.brandName}</Link>
                                  ) : (
                                    <span>{p.brandName}</span>
                                  )
                                ) : null}
                                {p.brandName && p.familyName ? (
                                  <span aria-hidden="true"> · </span>
                                ) : null}
                                {p.familyName ? (
                                  p.familyHref ? (
                                    <Link href={p.familyHref}>
                                      {p.familyName}
                                    </Link>
                                  ) : (
                                    <span>{p.familyName}</span>
                                  )
                                ) : null}
                              </div>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                : (
                  <ul className="surface-product-list brand-product-grid">
                    {model.products.map((p) => (
                      <li key={p.id} className="brand-product-item">
                        <Link href={p.href} className="brand-product-name">
                          {p.name}
                        </Link>
                        {p.brandName || p.familyName ? (
                          <div className="brand-product-meta">
                            {p.brandName ? (
                              p.brandHref ? (
                                <Link href={p.brandHref}>{p.brandName}</Link>
                              ) : (
                                <span>{p.brandName}</span>
                              )
                            ) : null}
                            {p.brandName && p.familyName ? (
                              <span aria-hidden="true"> · </span>
                            ) : null}
                            {p.familyName ? (
                              p.familyHref ? (
                                <Link href={p.familyHref}>{p.familyName}</Link>
                              ) : (
                                <span>{p.familyName}</span>
                              )
                            ) : null}
                          </div>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
            </section>
          ) : null}

          {model.families.length > 0 ? (
            <section className="seo-section" id="termekcsaladok">
              <h2 className="seo-heading">Termékcsaládok</h2>
              <div className="seo-links org-category-chips">
                {model.families.map((f) => (
                  <Link key={f.id} href={f.href} className="pill pill-link">
                    {f.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {model.brands.length > 0 ? (
            <section className="seo-section" id="markak">
              <h2 className="seo-heading">Márkák</h2>
              <div className="seo-links org-category-chips">
                {model.brands.map((b) => (
                  <Link key={b.id} href={b.href} className="pill pill-link">
                    {b.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {hasCatSurfaces ? (
            <section className="seo-section" id="szakteruletek-feluletek">
              <p className="org-section-note">
                Az ehhez a technológiához kapcsolódó termékek szakmai területei
                és felületei. Az összesítés nem jelenti, hogy a technológia
                közvetlenül minden felsorolt felületre alkalmazható.
              </p>
              <div
                className={
                  model.categories.length > 0 && model.surfaces.length > 0
                    ? "org-tech-surface-grid"
                    : undefined
                }
              >
                {model.categories.length > 0 ? (
                  <div className="org-tech-surface-col">
                    <h2 className="seo-heading">Szakmai területek</h2>
                    <ul className="surface-coverage-list">
                      {model.categories.map((c) => (
                        <li key={c.id} className="surface-coverage-item">
                          <Link href={c.href}>{c.name}</Link>
                          <span className="surface-coverage-count">
                            {c.productCount} termék
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {model.surfaces.length > 0 ? (
                  <div className="org-tech-surface-col">
                    <h2 className="seo-heading">Kapcsolódó felületek</h2>
                    <ul className="surface-coverage-list">
                      {model.surfaces.map((s) => (
                        <li key={s.id} className="surface-coverage-item">
                          <Link href={s.href}>{s.name}</Link>
                          <span className="surface-coverage-count">
                            {s.productCount} termék
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {model.partnerOrganizations ? (
            <section className="seo-section" id="szakmai-partnerek">
              <h2 className="seo-heading">
                {model.partnerOrganizations.heading}
              </h2>
              <div className="product-background">
                {model.partnerOrganizations.organizations.map((o) => (
                  <div key={o.id} className="product-background-block">
                    <div className="product-background-label">{o.label}</div>
                    <Link href={o.href} className="product-background-name">
                      {o.name}
                    </Link>
                  </div>
                ))}
              </div>
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
                  Utolsó ellenőrzés: {model.lastVerifiedLabel}
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
                        <span className="org-source-meta">
                          {" "}
                          — {s.publisher}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </details>
            </section>
          ) : null}
        </article>
      </div>
    </main>
  );
}
