import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Breadcrumbs,
  EntityHeader,
  RelationPills,
  SourcesBlock,
} from "@/components/entity/EntityUI";
import type { AnyEntity } from "@/lib/data/types";
import {
  getRelatedEntities,
  getSourcesByIds,
  KIND_LABEL,
} from "@/lib/data/repository";
import {
  brandJsonLd,
  breadcrumbJsonLd,
  JsonLdScript,
  organizationJsonLd,
} from "@/lib/seo/jsonld";

export function EntityDetailPage({
  entity,
  listPath,
  listLabel,
}: {
  entity: AnyEntity;
  listPath: string;
  listLabel: string;
}) {
  if (!entity || entity.status !== "published") notFound();

  const related = getRelatedEntities(entity.id);
  const sources = getSourcesByIds([
    ...entity.sourceIds,
    ...related.flatMap((r) => r.relation.sourceIds),
  ]);

  const breadcrumbs = [
    { name: "FESTÉKINDEX", path: "/" },
    { name: listLabel, path: listPath },
    { name: entity.name, path: `${listPath}/${entity.slug}` },
  ];

  const jsonLd = [
    breadcrumbJsonLd(breadcrumbs),
    entity.type === "organization"
      ? organizationJsonLd(entity)
      : entity.type === "brand"
        ? brandJsonLd(entity)
        : null,
  ].filter(Boolean);

  return (
    <main className="main">
      <JsonLdScript data={jsonLd as Record<string, unknown>[]} />
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: listLabel, href: listPath },
            { name: entity.name },
          ]}
        />

        <div className="entity-card">
          <EntityHeader entity={entity} />
          <h1>{entity.name}</h1>
          <p className="page-lead">{entity.shortDescription}</p>
          {entity.body ? <div className="entity-body">{entity.body}</div> : null}

          <div className="section">
            <h4>Kapcsolati háló</h4>
            <div className="route">
              <b>{entity.name}</b> ({KIND_LABEL[entity.type]}) → kapcsolódó
              entitások ID-alapú relation graph alapján
            </div>
          </div>

          <RelationPills related={related} />
          <SourcesBlock sources={sources} />

          <div className="section">
            <Link href={listPath} className="pill pill-link">
              ← Vissza: {listLabel}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
