import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumbs,
  EntityHeader,
  EntityList,
  SourcesBlock,
} from "@/components/entity/EntityUI";
import {
  getCategoryBySlug,
  getEntitiesByCategory,
  getSourcesByIds,
  listNavCategories,
} from "@/lib/data/repository";
import { entityMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, JsonLdScript } from "@/lib/seo/jsonld";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listNavCategories()
    .filter((c) => c.id !== "cat_all")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getCategoryBySlug(slug);
  if (!entity) return {};
  return entityMetadata(entity);
}

export default async function KategoriaPage({ params }: Props) {
  const { slug } = await params;
  const entity = getCategoryBySlug(slug);
  if (!entity || entity.id === "cat_all" || entity.status !== "published") {
    notFound();
  }

  const related = getEntitiesByCategory(entity.id);
  const sources = getSourcesByIds(entity.sourceIds);

  return (
    <main className="main">
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "FESTÉKINDEX", path: "/" },
          { name: "Kategóriák", path: "/kategoriak" },
          { name: entity.name, path: `/kategoriak/${entity.slug}` },
        ])}
      />
      <div className="page-wrap">
        <Breadcrumbs
          items={[
            { name: "FESTÉKINDEX", href: "/" },
            { name: "Kategóriák", href: "/kategoriak" },
            { name: entity.name },
          ]}
        />
        <div className="entity-card">
          <EntityHeader entity={entity} />
          <h1>{entity.name}</h1>
          <p className="page-lead">{entity.shortDescription}</p>
          {entity.body ? <div className="entity-body">{entity.body}</div> : null}
          <SourcesBlock sources={sources} />
        </div>

        <h2 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "1px" }}>
          Kapcsolódó entitások
        </h2>
        <EntityList entities={related} />

        <div style={{ marginTop: 16 }}>
          <Link href="/kategoriak" className="pill pill-link">
            ← Összes kategória
          </Link>
        </div>
      </div>
    </main>
  );
}
