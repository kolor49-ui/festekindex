import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurfaceHubPage } from "@/components/entity/SurfaceHubPage";
import {
  filterSurfaceProductsByManufacturer,
} from "@/lib/data/surfaceHub";
import { getSurfaceBySlug, listSurfaces } from "@/lib/data/repository";
import {
  buildSurfaceHubModel,
  surfaceHubMetadata,
} from "@/lib/seo/surfaceHubModel";
import { buildSearchCatalog, type SearchDocument } from "@/lib/search";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ gyarto?: string }>;
};

export async function generateStaticParams() {
  return listSurfaces().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getSurfaceBySlug(slug);
  if (!entity) return {};
  const hub = buildSurfaceHubModel(entity);
  if (!hub) return {};
  return surfaceHubMetadata(hub);
}

function buildSurfaceDiscoveryCatalog(
  orgIds: string[],
  brandIds: string[],
  productIds: string[],
  familyIds: string[],
): SearchDocument[] {
  const allow = new Set([...orgIds, ...brandIds, ...productIds, ...familyIds]);
  if (allow.size === 0) return [];
  return buildSearchCatalog().filter((d) => allow.has(d.id));
}

export default async function FeluletPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { gyarto } = await searchParams;
  const entity = getSurfaceBySlug(slug);
  if (!entity) notFound();
  const hub = buildSurfaceHubModel(entity);
  if (!hub) notFound();

  const gyartoSlug = gyarto?.trim() || undefined;
  const activeOrg = gyartoSlug
    ? hub.organizations.find((o) => o.slug === gyartoSlug)
    : undefined;
  const activeManufacturerSlug = activeOrg?.slug;

  const filtered = filterSurfaceProductsByManufacturer(
    hub.products,
    activeManufacturerSlug,
  );

  const model = {
    ...hub,
    products: filtered.products,
    productGroups: filtered.productGroups,
  };

  const discoveryCatalog = buildSurfaceDiscoveryCatalog(
    hub.organizations.map((o) => o.id),
    hub.brands.map((b) => b.id),
    hub.products.map((p) => p.id),
    hub.families.map((f) => f.id),
  );

  return (
    <SurfaceHubPage
      model={model}
      discoveryCatalog={discoveryCatalog}
      manufacturers={hub.organizations.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        hitCount: o.productCount,
      }))}
      activeManufacturerSlug={activeManufacturerSlug}
      surfacePath={`/feluletek/${hub.surface.slug}`}
    />
  );
}
