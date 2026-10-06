import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import { getProductBySlug, listProducts } from "@/lib/data/repository";
import { entityMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getProductBySlug(slug);
  if (!entity) return {};
  return entityMetadata(entity);
}

export default async function TermekPage({ params }: Props) {
  const { slug } = await params;
  const entity = getProductBySlug(slug);
  if (!entity) notFound();
  return <EntityDetailPage entity={entity} />;
}
