import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import {
  buildProductHubJsonLd,
  systemRoleLabel,
  type ProductHubModel,
} from "@/lib/seo/productHubModel";

/**
 * Product hub v2.1 — SSR HTML, repository-driven.
 * Order: header → short lead → identity → Termékleírás → context → technical → …
 * Never renders internal enums, rawValue, sourceIds, relation type names.
 */
export function ProductHubPage({ model }: { model: ProductHubModel }) {
  const jsonLd = buildProductHubJsonLd(model);
  const hasContext =
    model.categories.length > 0 ||
    model.technologies.length > 0 ||
    model.surfaces.length > 0;
  const hasSystemSequence =
    model.systemHasSequence &&
    (model.systemPeers.length > 1 ||
      (model.systemPeers.length === 1 && !model.systemPeers[0]?.isCurrent));
  const relatedExtras = model.relatedProducts.filter((r) => {
    if (!hasSystemSequence) return true;
    return !model.systemPeers.some((p) => p.id === r.id && !p.isCurrent);
  });
  const hasRelatedSection =
    hasSystemSequence || model.relatedProducts.length > 0;
  const professional = model.professionalDescription;

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub product-hub">
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

          {professional ? (
            <section
              className="seo-section product-description-section hub-primary-section"
              id="termekleiras"
            >
              <h2 className="seo-heading hub-primary-heading">Termékleírás</h2>
              <div className="product-description-body">
                {professional.sections.map((section) => (
                  <div
                    key={section.heading}
                    className="product-description-block"
                  >
                    <h3 className="product-description-heading">
                      {section.heading}
                    </h3>
                    {section.paragraphs.map((paragraph, i) => (
                      <p
                        key={`${section.heading}-${i}`}
                        className="product-description-paragraph"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {hasContext ? (
            <section
              className="seo-section product-context-section hub-secondary-section"
              id="szakmai-kornyezet"
            >
              <h2 className="seo-heading hub-secondary-heading">
                Szakmai környezet
              </h2>
              <div className="product-context-groups">
                {model.categories.length > 0 ? (
                  <div className="product-context-group" id="szakteruletek">
                    <h3 className="product-context-label">Szakmai területek</h3>
                    <div className="seo-links org-category-chips hub-related-pills">
                      {model.categories.map((c) => (
                        <Link
                          key={c.id}
                          href={c.href}
                          className="pill pill-link"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                {model.technologies.length > 0 ? (
                  <div
                    className="product-context-group"
                    id="technologiak"
                  >
                    <h3 className="product-context-label">Technológiák</h3>
                    <div className="seo-links hub-related-pills">
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
                  <div className="product-context-group" id="feluletek">
                    <h3 className="product-context-label">Felületek</h3>
                    <div className="seo-links hub-related-pills">
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

          {model.technicalData.length > 0 ? (
            <section className="seo-section hub-primary-section" id="muszaki-adatok">
              <h2 className="seo-heading hub-primary-heading">Műszaki adatok</h2>
              {model.technicalData.map((group) => (
                <div
                  key={group.key}
                  className={
                    group.label
                      ? "product-tech-group"
                      : "product-tech-group product-tech-group-flat"
                  }
                >
                  {group.label ? (
                    <h3 className="product-tech-group-title">{group.label}</h3>
                  ) : null}
                  <dl className="product-tech-list">
                    {group.items.map((item) => (
                      <div
                        key={`${item.key}-${item.value}`}
                        className="product-tech-row"
                      >
                        <dt>{item.label}</dt>
                        <dd>
                          <span className="product-tech-value">{item.value}</span>
                          {item.condition ? (
                            <span className="product-tech-condition">
                              {item.condition}
                            </span>
                          ) : null}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </section>
          ) : null}

          {model.packaging.length > 0 ? (
            <section className="seo-section" id="kiszerelesek">
              <h2 className="seo-heading">Kiszerelések</h2>
              <ul className="product-packaging-list">
                {model.packaging.map((p) => (
                  <li key={p.displayValue} className="product-packaging-chip">
                    {p.displayValue}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {hasRelatedSection ? (
            <section
              className="seo-section hub-primary-section"
              id="kapcsolodo-termekek"
            >
              <h2 className="seo-heading hub-primary-heading">
                Rendszer és kapcsolódó termékek
              </h2>

              {hasSystemSequence ? (
                <ol className="product-system-list product-system-sequenced">
                  {model.systemPeers.map((peer, i) => {
                    const role = systemRoleLabel(peer.role);
                    return (
                      <li
                        key={peer.id}
                        className={
                          peer.isCurrent
                            ? "product-system-item product-system-current"
                            : "product-system-item"
                        }
                      >
                        {i > 0 ? (
                          <span
                            className="product-system-arrow"
                            aria-hidden="true"
                          >
                            ↓
                          </span>
                        ) : null}
                        <div className="product-system-body">
                          {peer.isCurrent ? (
                            <span className="product-system-name">
                              {peer.name}
                            </span>
                          ) : (
                            <Link
                              href={peer.href}
                              className="product-system-name"
                            >
                              {peer.name}
                            </Link>
                          )}
                          {role ? (
                            <span className="product-system-role">{role}</span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              ) : null}

              {relatedExtras.length > 0 ? (
                <ul
                  className={
                    hasSystemSequence
                      ? "product-related-list product-related-list-extra"
                      : "product-related-list"
                  }
                >
                  {relatedExtras.map((r) => (
                    <li key={r.id} className="product-related-item">
                      <span className="product-related-label">{r.label}</span>
                      <Link href={r.href} className="product-related-name">
                        {r.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {model.background ? (
            <section
              className="seo-section hub-supporting-section"
              id="marka-hatter"
            >
              <h2 className="seo-heading hub-supporting-heading">
                {model.background.heading}
              </h2>
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
                {model.background.family ? (
                  <div className="product-background-block">
                    <div className="product-background-label">
                      Termékcsalád
                    </div>
                    <Link
                      href={model.background.family.href}
                      className="product-background-name"
                    >
                      {model.background.family.name}
                    </Link>
                    {model.background.family.blurb ? (
                      <p className="product-background-blurb">
                        {model.background.family.blurb}
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

          {model.knowledge.length > 0 ? (
            <section
              className="seo-section hub-supporting-section"
              id="tudastar"
            >
              <h2 className="seo-heading hub-supporting-heading">
                Kapcsolódó szakmai tartalom
              </h2>
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
                      {s.publishedAt ? (
                        <span className="org-source-date">
                          {" "}
                          · {s.publishedAt}
                        </span>
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
            <Link href="/termekek" className="pill pill-link">
              ← Vissza: Termékek
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
