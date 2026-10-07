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
  buildSurfaceHubJsonLd,
  type SurfaceHubModel,
} from "@/lib/seo/surfaceHubModel";

/**
 * Surface Hub v1 — SSR HTML, graph-derived.
 * Phase B: Products primary → families/brands secondary →
 * categories/technologies/manufacturers/knowledge supporting.
 * Phase A zero-product recovery preserved.
 * Never renders internal enums, relation types, or readiness grades.
 */
export function SurfaceHubPage({ model }: { model: SurfaceHubModel }) {
  const jsonLd = buildSurfaceHubJsonLd(model);
  const hasCatTech =
    model.categories.length > 0 || model.technologies.length > 0;
  const grouped =
    model.productGroups.length > 1 ||
    (model.productGroups.length === 1 &&
      !!model.productGroups[0]?.categoryName);
  const hasSecondary =
    model.families.length > 0 || model.brands.length > 0;
  const hasSupporting =
    hasCatTech ||
    !!model.manufacturerContext ||
    model.knowledge.length > 0;

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub surface-hub">
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

          {model.products.length === 0 ? (
            <section
              className="seo-section surface-empty-recovery"
              id="felulet-allapot"
            >
              <p className="org-section-note">
                Ehhez a felülethez jelenleg még nincs kapcsolt termék a
                FESTÉKINDEX-ben.
              </p>
              <div className="seo-links org-category-chips surface-recovery-links">
                <Link href="/kategoriak" className="pill pill-link">
                  Szakmai területek
                </Link>
                <Link href="/technologiak" className="pill pill-link">
                  Technológiák
                </Link>
                <Link
                  href={`/kereses?q=${encodeURIComponent(model.surface.name)}`}
                  className="pill pill-link"
                >
                  Keresés: {model.surface.name}
                </Link>
              </div>
            </section>
          ) : null}

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
            </HubSecondaryCluster>
          ) : null}

          {hasSupporting ? (
            <HubSupportingCluster
              note={
                hasCatTech
                  ? "A kapcsolódó termékek szakmai területei és felhordási technológiái. Az összesítés nem jelenti, hogy minden termék minden felsorolt technológiával kompatibilis."
                  : undefined
              }
            >
              {hasCatTech ? (
                <section
                  className="seo-section hub-supporting-section"
                  id="szakteruletek-technologiak"
                >
                  <div
                    className={
                      model.categories.length > 0 &&
                      model.technologies.length > 0
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
                    {model.technologies.length > 0 ? (
                      <div className="org-tech-surface-col">
                        <h2 className="seo-heading hub-supporting-heading">
                          Technológiák
                        </h2>
                        <ul className="surface-coverage-list">
                          {model.technologies.map((t) => (
                            <li key={t.id} className="surface-coverage-item">
                              <Link href={t.href}>{t.name}</Link>
                              <span className="surface-coverage-count">
                                {t.productCount} termék
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {model.manufacturerContext ? (
                <HubSupportingSection
                  id="gyartoi-hatter"
                  heading={model.manufacturerContext.heading}
                >
                  <div className="product-background">
                    {model.manufacturerContext.organizations.map((o) => (
                      <div key={o.id} className="product-background-block">
                        <div className="product-background-label">{o.label}</div>
                        <Link
                          href={o.href}
                          className="product-background-name"
                        >
                          {o.name}
                        </Link>
                      </div>
                    ))}
                  </div>
                </HubSupportingSection>
              ) : null}

              {model.knowledge.length > 0 ? (
                <HubSupportingSection
                  id="tudastar"
                  heading="Kapcsolódó szakmai tartalom"
                >
                  <ul className="seo-link-list">
                    {model.knowledge.map((k) => (
                      <li key={k.id}>
                        <Link href={k.href}>{k.name}</Link>
                        {k.note ? (
                          <p className="seo-link-note">{k.note}</p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </HubSupportingSection>
              ) : null}
            </HubSupportingCluster>
          ) : null}

          {/* Sources omitted by policy: Surface.sourceIds empty;
              relation sources must not be presented as Surface-level provenance. */}
        </article>
      </div>
    </main>
  );
}
