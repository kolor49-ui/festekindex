import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandHubPage } from "@/components/entity/BrandHubPage";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import { brandHasHub } from "@/lib/data/brandPortfolio";
import { getBrandBySlug, listBrands } from "@/lib/data/repository";
import {
  brandHubMetadata,
  buildBrandHubModel,
} from "@/lib/seo/brandHubModel";
import { entityMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getBrandBySlug(slug);
  if (!entity) return {};

  if (brandHasHub(entity.id)) {
    const hub = buildBrandHubModel(entity);
    if (hub) return brandHubMetadata(hub);
  }

  return entityMetadata(entity);
}

export default async function MarkaPage({ params }: Props) {
  const { slug } = await params;
  const entity = getBrandBySlug(slug);
  if (!entity) notFound();

  if (brandHasHub(entity.id)) {
    const hub = buildBrandHubModel(entity);
    if (hub) return <BrandHubPage model={hub} />;
  }

  return <EntityDetailPage entity={entity} />;
}
