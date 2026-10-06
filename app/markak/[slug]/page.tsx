import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import { getBrandBySlug, listBrands } from "@/lib/data/repository";
import { entityMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listBrands().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getBrandBySlug(slug);
  if (!entity) return {};
  return entityMetadata(entity);
}

export default async function MarkaPage({ params }: Props) {
  const { slug } = await params;
  const entity = getBrandBySlug(slug);
  if (!entity) notFound();
  return <EntityDetailPage entity={entity} />;
}
