import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import { getKnowledgeBySlug, listKnowledge } from "@/lib/data/repository";
import { entityMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listKnowledge().map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getKnowledgeBySlug(slug);
  if (!entity) return {};
  return entityMetadata(entity);
}

export default async function TudastarCikkPage({ params }: Props) {
  const { slug } = await params;
  const entity = getKnowledgeBySlug(slug);
  if (!entity) notFound();
  return <EntityDetailPage entity={entity} />;
}
