import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import {
  getTechnologyBySlug,
  listTechnologies,
} from "@/lib/data/repository";
import { entityMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listTechnologies().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getTechnologyBySlug(slug);
  if (!entity) return {};
  return entityMetadata(entity);
}

export default async function TechnologiaPage({ params }: Props) {
  const { slug } = await params;
  const entity = getTechnologyBySlug(slug);
  if (!entity) notFound();
  return <EntityDetailPage entity={entity} />;
}
