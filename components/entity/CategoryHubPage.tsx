import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import {
  HubPrimarySection,
  HubSecondaryCluster,
  HubSecondarySection,
  HubSupportingCluster,
  HubSupportingSection,
  RelatedPillGroup,
} from "@/components/entity/HubHierarchy";
import { JsonLdScript } from "@/lib/seo/jsonld";
import {
  buildCategoryHubJsonLd,
  type CategoryHubModel,
} from "@/lib/seo/categoryHubModel";

/**
 * Category Hub v1 — SSR HTML.
 * Phase B: Products primary → families/brands/companies secondary →
 * tech/surface/knowledge supporting → sources.
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
  const hasSecondary =
    model.families.length > 0 || hasBrands || !!orgCtx;

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
            <HubPrimarySection id="kapcsolodo-termekek" heading="Termékek">
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
            </HubPrimarySection>
          ) : null}

          {hasSecondary ? (
            <HubSecondaryCluster>
              {model.families.length > 0 ? (
                <HubSecondarySection id="termekcsaladok" heading="Termékcsaládok">
                  <RelatedPillGroup items={model.families} />
                </HubSecondarySection>
              ) : null}

              {hasBrands ? (
                <section className="seo-section hub-secondary-section" id="markak">
                  {brands.mode === "split" ? (
                    <>
                      {brands.productBrands.length > 0 ? (
                        <div className="category-brand-block">
                          <h2 className="seo-heading hub-secondary-heading">
                            Márkák
                          </h2>
                          <RelatedPillGroup items={brands.productBrands} />
                        </div>
                      ) : null}
                      {brands.additionalBrands.length > 0 ? (
                        <div className="category-brand-block">
                          <h2 className="seo-heading hub-secondary-heading">
                            Egyéb márkák
                          </h2>
                          <RelatedPillGroup items={brands.additionalBrands} />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <h2 className="seo-heading hub-secondary-heading">
                        Márkák
                      </h2>
                      <RelatedPillGroup items={brands.unified} />
                    </>
                  )}
                </section>
              ) : null}

              {orgCtx ? (
                <section className="seo-section hub-secondary-section" id="cegek">
                  {orgCtx.mode === "split" ? (
                    <>
                      {orgCtx.productOrgs.length > 0 ? (
                        <div className="category-org-block">
                          <h2 className="seo-heading hub-secondary-heading">
                            {orgCtx.productHeading}
                          </h2>
                          <RelatedPillGroup items={orgCtx.productOrgs} />
                        </div>
                      ) : null}
                      {orgCtx.additionalOrgs.length > 0 ? (
                        <div className="category-org-block">
                          <h2 className="seo-heading hub-secondary-heading">
                            {orgCtx.additionalHeading}
                          </h2>
                          <RelatedPillGroup items={orgCtx.additionalOrgs} />
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <h2 className="seo-heading hub-secondary-heading">
                        {orgCtx.heading}
                      </h2>
                      <RelatedPillGroup items={orgCtx.unified} />
                    </>
                  )}
                </section>
              ) : null}
            </HubSecondaryCluster>
          ) : null}

          {hasTechSurfaces || model.knowledge.length > 0 ? (
            <HubSupportingCluster
              note={
                model.surfaces.length > 0
                  ? "A kapcsolódó felületek a kategóriához rendelt termékek alapján jelennek meg. Ez nem jelenti, hogy a szakterület minden felsorolt felületre általánosan vonatkozik."
                  : undefined
              }
            >
              {hasTechSurfaces ? (
                <section
                  className="seo-section hub-supporting-section"
                  id="technologiak-feluletek"
                >
                  <div
                    className={
                      model.technologies.length > 0 && model.surfaces.length > 0
                        ? "org-tech-surface-grid"
                        : undefined
                    }
                  >
                    {model.technologies.length > 0 ? (
                      <div className="org-tech-surface-col">
                        <h2 className="seo-heading hub-supporting-heading">
                          Technológiák
                        </h2>
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
                        <h2 className="seo-heading hub-supporting-heading">
                          Felületek
                        </h2>
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
                <HubSupportingSection
                  id="tudastar"
                  heading="Kapcsolódó szakmai tartalom"
                >
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
                </HubSupportingSection>
              ) : null}
            </HubSupportingCluster>
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
