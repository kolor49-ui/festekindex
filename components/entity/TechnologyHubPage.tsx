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
  buildTechnologyHubJsonLd,
  type TechnologyHubModel,
} from "@/lib/seo/technologyHubModel";

/**
 * Technology Hub v1 — SSR HTML.
 * Phase B: Products primary → families/brands/partners secondary →
 * categories/surfaces/knowledge supporting → sources.
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
  const hasSecondary =
    model.families.length > 0 ||
    model.brands.length > 0 ||
    !!model.partnerOrganizations;
  const hasSupporting =
    hasCatSurfaces || model.knowledge.length > 0;

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
            <HubPrimarySection id="kapcsolodo-termekek" heading="Termékek">
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
            </HubPrimarySection>
          ) : null}

          {hasSecondary ? (
            <HubSecondaryCluster>
              {model.families.length > 0 ? (
                <HubSecondarySection id="termekcsaladok" heading="Termékcsaládok">
                  <RelatedPillGroup items={model.families} />
                </HubSecondarySection>
              ) : null}

              {model.brands.length > 0 ? (
                <HubSecondarySection id="markak" heading="Márkák">
                  <RelatedPillGroup items={model.brands} />
                </HubSecondarySection>
              ) : null}

              {model.partnerOrganizations ? (
                <HubSecondarySection
                  id="szakmai-partnerek"
                  heading={model.partnerOrganizations.heading}
                >
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
                </HubSecondarySection>
              ) : null}
            </HubSecondaryCluster>
          ) : null}

          {hasSupporting ? (
            <HubSupportingCluster
              note={
                hasCatSurfaces
                  ? "Az ehhez a technológiához kapcsolódó termékek szakmai területei és felületei. Az összesítés nem jelenti, hogy a technológia közvetlenül minden felsorolt felületre alkalmazható."
                  : undefined
              }
            >
              {hasCatSurfaces ? (
                <section
                  className="seo-section hub-supporting-section"
                  id="szakteruletek-feluletek"
                >
                  <div
                    className={
                      model.categories.length > 0 && model.surfaces.length > 0
                        ? "org-tech-surface-grid"
                        : undefined
                    }
                  >
                    {model.categories.length > 0 ? (
                      <div className="org-tech-surface-col">
                        <h2 className="seo-heading hub-supporting-heading">
                          Szakmai területek
                        </h2>
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
