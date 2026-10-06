import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import {
  buildCategoryHubJsonLd,
  type CategoryHubModel,
} from "@/lib/seo/categoryHubModel";

/**
 * Category Hub v1 — SSR HTML.
 * Direct Category graph + Product-derived context, semantically separated.
 * Never renders internal enums, relation types, readiness grades, or graph jargon.
 */
export function CategoryHubPage({ model }: { model: CategoryHubModel }) {
  const jsonLd = buildCategoryHubJsonLd(model);
  const hasTechSurfaces =
    model.technologies.length > 0 || model.surfaces.length > 0;
  const grouped =
    model.productGroups.length > 1 ||
    (model.productGroups.length === 1 &&
      !!model.productGroups[0]?.familyName);

  const brands = model.brandPresentation;
  const hasBrands =
    brands.mode === "split"
      ? brands.productBrands.length > 0 || brands.additionalBrands.length > 0
      : brands.unified.length > 0;

  const orgCtx = model.organizationContext;

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub category-hub">
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
                      key={group.familyId ?? group.familyName ?? "flat"}
                      className="surface-product-group"
                    >
                      {group.familyName ? (
                        <h3 className="surface-product-group-title">
                          {group.familyHref ? (
                            <Link href={group.familyHref}>
                              {group.familyName}
                            </Link>
                          ) : (
                            group.familyName
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

          {hasBrands ? (
            <section className="seo-section" id="markak">
              {brands.mode === "split" ? (
                <>
                  {brands.productBrands.length > 0 ? (
                    <div className="category-brand-block">
                      <h2 className="seo-heading">
                        Márkák a kapcsolódó termékek között
                      </h2>
                      <div className="seo-links org-category-chips">
                        {brands.productBrands.map((b) => (
                          <Link
                            key={b.id}
                            href={b.href}
                            className="pill pill-link"
                          >
                            {b.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {brands.additionalBrands.length > 0 ? (
                    <div className="category-brand-block">
                      <h2 className="seo-heading">
                        További kapcsolódó márkák
                      </h2>
                      <div className="seo-links org-category-chips">
                        {brands.additionalBrands.map((b) => (
                          <Link
                            key={b.id}
                            href={b.href}
                            className="pill pill-link"
                          >
                            {b.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <h2 className="seo-heading">Márkák</h2>
                  <div className="seo-links org-category-chips">
                    {brands.unified.map((b) => (
                      <Link key={b.id} href={b.href} className="pill pill-link">
                        {b.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </section>
          ) : null}

          {orgCtx ? (
            <section className="seo-section" id="cegek">
              {orgCtx.mode === "split" ? (
                <>
                  {orgCtx.productOrgs.length > 0 ? (
                    <div className="category-org-block">
                      <h2 className="seo-heading">{orgCtx.productHeading}</h2>
                      <div className="seo-links org-category-chips">
                        {orgCtx.productOrgs.map((o) => (
                          <Link
                            key={o.id}
                            href={o.href}
                            className="pill pill-link"
                          >
                            {o.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {orgCtx.additionalOrgs.length > 0 ? (
                    <div className="category-org-block">
                      <h2 className="seo-heading">
                        {orgCtx.additionalHeading}
                      </h2>
                      <div className="seo-links org-category-chips">
                        {orgCtx.additionalOrgs.map((o) => (
                          <Link
                            key={o.id}
                            href={o.href}
                            className="pill pill-link"
                          >
                            {o.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : (
                <>
                  <h2 className="seo-heading">{orgCtx.heading}</h2>
                  <div className="seo-links org-category-chips">
                    {orgCtx.unified.map((o) => (
                      <Link
                        key={o.id}
                        href={o.href}
                        className="pill pill-link"
                      >
                        {o.name}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </section>
          ) : null}

          {hasTechSurfaces ? (
            <section className="seo-section" id="technologiak-feluletek">
              {model.surfaces.length > 0 ? (
                <p className="org-section-note">
                  A kapcsolódó felületek a kategóriához rendelt termékek alapján
                  jelennek meg. Ez nem jelenti, hogy a szakterület minden
                  felsorolt felületre általánosan vonatkozik.
                </p>
              ) : null}
              <div
                className={
                  model.technologies.length > 0 && model.surfaces.length > 0
                    ? "org-tech-surface-grid"
                    : undefined
                }
              >
                {model.technologies.length > 0 ? (
                  <div className="org-tech-surface-col">
                    <h2 className="seo-heading">Kapcsolódó technológiák</h2>
                    <ul className="surface-coverage-list">
                      {model.technologies.map((t) => (
                        <li key={t.id} className="surface-coverage-item">
                          <Link href={t.href}>{t.name}</Link>
                          {t.productCount != null && t.productCount > 0 ? (
                            <span className="surface-coverage-count">
                              {t.productCount} termék
                            </span>
                          ) : null}
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
