import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KnowledgeHubPage } from "@/components/entity/KnowledgeHubPage";
import { getKnowledgeBySlug, listKnowledge } from "@/lib/data/repository";
import {
  buildKnowledgeHubModel,
  knowledgeHubMetadata,
} from "@/lib/seo/knowledgeHubModel";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listKnowledge().map((k) => ({ slug: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getKnowledgeBySlug(slug);
  if (!entity) return {};
  const hub = buildKnowledgeHubModel(entity);
  if (!hub) return {};
  return knowledgeHubMetadata(hub);
}

export default async function TudastarCikkPage({ params }: Props) {
  const { slug } = await params;
  const entity = getKnowledgeBySlug(slug);
  if (!entity) notFound();
  const hub = buildKnowledgeHubModel(entity);
  if (!hub) notFound();
  return <KnowledgeHubPage model={hub} />;
}
