import { Breadcrumbs } from "@/components/entity/EntityUI";
import { RelatedExploreSection } from "@/components/entity/HubHierarchy";
import { JsonLdScript } from "@/lib/seo/jsonld";
import { renderKnowledgeArticleBody } from "@/lib/content/knowledgeArticle";
import {
  buildKnowledgeHubJsonLd,
  knowledgeSectionHeading,
  type KnowledgeHubModel,
} from "@/lib/seo/knowledgeHubModel";
import type { KnowledgeLink } from "@/lib/data/knowledgeHub";

/**
 * Knowledge Hub v1 — SSR HTML.
 * Phase B: article remains primary; related navigation grouped under one
 * supporting explore section (not an equal-weight chip cloud).
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

  const relatedGroups = [
    {
      id: "kapcsolodo-technologiak",
      heading: knowledgeSectionHeading("technologies", d.technologies.length),
      items: d.technologies,
    },
    {
      id: "szakmai-terulet",
      heading: knowledgeSectionHeading("categories", areaLinks.length),
      items: areaLinks,
    },
    {
      id: "kapcsolodo-termekek",
      heading: knowledgeSectionHeading("products", d.products.length),
      items: d.products,
    },
    {
      id: "kapcsolodo-feluletek",
      heading: knowledgeSectionHeading("surfaces", d.surfaces.length),
      items: d.surfaces,
    },
    {
      id: "kapcsolodo-termekcsaladok",
      heading: knowledgeSectionHeading(
        "productFamilies",
        d.productFamilies.length,
      ),
      items: d.productFamilies,
    },
    {
      id: "kapcsolodo-markak",
      heading: knowledgeSectionHeading("brands", d.brands.length),
      items: d.brands,
    },
    {
      id: "kapcsolodo-cegek",
      heading: knowledgeSectionHeading(
        "organizations",
        d.organizations.length,
      ),
      items: d.organizations,
    },
    {
      id: "osszehasonlitasok",
      heading: knowledgeSectionHeading("comparisons", d.comparisons.length),
      items: d.comparisons,
    },
  ];

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

          <RelatedExploreSection groups={relatedGroups} />

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
