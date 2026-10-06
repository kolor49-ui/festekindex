import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs, SourcesBlock } from "@/components/entity/EntityUI";
import type { AnyEntity } from "@/lib/data/types";
import { buildEntityPageModel } from "@/lib/seo/entityPageModel";
import { buildEntityJsonLd, JsonLdScript } from "@/lib/seo/jsonld";

/**
 * Server-rendered SEO entity template.
 * Primary content is SSR HTML with crawlable <a href> links.
 */
export function EntityDetailPage({ entity }: { entity: AnyEntity }) {
  if (!entity || entity.status !== "published") notFound();

  const page = buildEntityPageModel(entity);
  const jsonLd = buildEntityJsonLd(page);

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap">
        <Breadcrumbs
          items={page.breadcrumbs.map((c, i) => ({
            name: c.name,
            href: i < page.breadcrumbs.length - 1 ? c.path : undefined,
          }))}
        />

        <article className="entity-card entity-seo">
          <div className="entity-meta">
            {page.kindLabel}
            {!page.indexable ? " · noindex (vékony / hiányos)" : null}
          </div>

          <h1>{page.h1}</h1>
          <p className="page-lead">{page.lead}</p>

          {page.sections.map((section) => {
            const Heading = section.headingLevel === 3 ? "h3" : "h2";
            return (
              <section key={section.id} className="seo-section" id={section.id}>
                <Heading className="seo-heading">{section.heading}</Heading>
                {section.paragraphs.map((p, i) => (
                  <p key={i} className="entity-body">
                    {p}
                  </p>
                ))}
                {section.links.length > 0 ? (
                  <div className="hub-link-list">
                    {section.links.map((link) => (
                      <div key={link.href} className="hub-link-item">
                        <Link
                          href={link.href}
                          className="pill pill-link"
                          title={link.note}
                        >
                          {link.name}
                        </Link>
                        {link.note ? (
                          <span className="agg-roles">{link.note}</span>
                        ) : null}
                        {link.blurb ? (
                          <p className="hub-blurb">{link.blurb}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}

          {page.categories.length > 0 ? (
            <section className="seo-section" id="kategoriak">
              <h2 className="seo-heading">Szakterület</h2>
              <div className="seo-links">
                {page.categories.map((c) => (
                  <Link key={c.href} href={c.href} className="pill pill-link">
                    {c.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {page.relationGroups.length > 0 ? (
            <section className="seo-section" id="kapcsolatok">
              <h2 className="seo-heading">Kapcsolati háló</h2>
              {page.relationGroups.map((group) => (
                <div key={group.label} className="seo-subsection">
                  <h3 className="seo-subheading">{group.label}</h3>
                  <div className="agg-links">
                    {group.items.map((item) => (
                      <div
                        key={`${group.label}-${item.href}`}
                        className="agg-link"
                      >
                        <Link
                          href={item.href}
                          className="pill pill-link"
                          title={item.note}
                        >
                          {item.name}
                        </Link>
                        {item.note ? (
                          <span className="agg-roles">{item.note}</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          ) : null}

          {page.knowledgeLinks.length > 0 ? (
            <section className="seo-section" id="tudastar">
              <h2 className="seo-heading">Kapcsolódó tudásanyagok</h2>
              <ul className="seo-knowledge-list">
                {page.knowledgeLinks.map((k) => (
                  <li key={k.href}>
                    <Link href={k.href}>{k.name}</Link>
                    {k.note ? (
                      <span className="seo-knowledge-note"> — {k.note}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <SourcesBlock
            sources={page.sources}
            lastVerifiedAt={page.lastVerifiedAt}
          />

          {page.contextualLinks.length > 0 ? (
            <section className="seo-section" id="belso-linkek">
              <h2 className="seo-heading">További szakmai kapcsolatok</h2>
              <div className="seo-links">
                {page.contextualLinks.map((l) => (
                  <Link key={l.href} href={l.href} className="pill pill-link">
                    {l.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <div className="section">
            <Link href={page.listPath} className="pill pill-link">
              ← Vissza: {page.listLabel}
            </Link>
          </div>
        </article>
      </div>
    </main>
  );
}
