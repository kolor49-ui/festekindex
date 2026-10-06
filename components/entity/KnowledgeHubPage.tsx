import Link from "next/link";
import { Breadcrumbs } from "@/components/entity/EntityUI";
import { JsonLdScript } from "@/lib/seo/jsonld";
import { renderKnowledgeArticleBody } from "@/lib/content/knowledgeArticle";
import {
  buildKnowledgeHubJsonLd,
  knowledgeSectionHeading,
  type KnowledgeHubModel,
} from "@/lib/seo/knowledgeHubModel";
import type { KnowledgeLink } from "@/lib/data/knowledgeHub";

function RelatedChips({
  id,
  heading,
  items,
}: {
  id: string;
  heading: string;
  items: KnowledgeLink[];
}) {
  if (!items.length) return null;
  return (
    <section className="seo-section" id={id}>
      <h2 className="seo-heading">{heading}</h2>
      <div className="seo-links org-category-chips">
        {items.map((item) => (
          <Link key={item.id} href={item.href} className="pill pill-link">
            {item.name}
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Knowledge Hub v1 — SSR HTML.
 * DIRECT-FIRST related context; structured article body; Knowledge sources only.
 * Never renders internal enums, relation types, or graph jargon.
 */
export function KnowledgeHubPage({ model }: { model: KnowledgeHubModel }) {
  const jsonLd = buildKnowledgeHubJsonLd(model);
  const d = model.documented;

  // Szakmai terület: belongsToCategory + any direct documents→Category (deduped)
  const areaLinks: KnowledgeLink[] = [];
  const seenArea = new Set<string>();
  for (const c of [...model.categories, ...d.categories]) {
    if (seenArea.has(c.id)) continue;
    seenArea.add(c.id);
    areaLinks.push(c);
  }

  return (
    <main className="main">
      <JsonLdScript data={jsonLd} />
      <div className="page-wrap org-hub knowledge-hub">
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

          <div className="knowledge-article-body">
            {renderKnowledgeArticleBody(model.article.body)}
          </div>

          <RelatedChips
            id="szakmai-terulet"
            heading={knowledgeSectionHeading("categories", areaLinks.length)}
            items={areaLinks}
          />

          <RelatedChips
            id="kapcsolodo-technologiak"
            heading={knowledgeSectionHeading(
              "technologies",
              d.technologies.length,
            )}
            items={d.technologies}
          />

          <RelatedChips
            id="kapcsolodo-feluletek"
            heading={knowledgeSectionHeading("surfaces", d.surfaces.length)}
            items={d.surfaces}
          />

          <RelatedChips
            id="kapcsolodo-termekek"
            heading={knowledgeSectionHeading("products", d.products.length)}
            items={d.products}
          />

          <RelatedChips
            id="kapcsolodo-termekcsaladok"
            heading={knowledgeSectionHeading(
              "productFamilies",
              d.productFamilies.length,
            )}
            items={d.productFamilies}
          />

          <RelatedChips
            id="kapcsolodo-markak"
            heading={knowledgeSectionHeading("brands", d.brands.length)}
            items={d.brands}
          />

          <RelatedChips
            id="kapcsolodo-cegek"
            heading={knowledgeSectionHeading(
              "organizations",
              d.organizations.length,
            )}
            items={d.organizations}
          />

          <RelatedChips
            id="osszehasonlitasok"
            heading={knowledgeSectionHeading(
              "comparisons",
              d.comparisons.length,
            )}
            items={d.comparisons}
          />

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
