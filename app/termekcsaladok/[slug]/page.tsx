import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import {
  getProductFamilyBySlug,
  listProductFamilies,
} from "@/lib/data/repository";
import { entityMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listProductFamilies().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getProductFamilyBySlug(slug);
  if (!entity) return {};
  return entityMetadata(entity);
}

export default async function TermekcsaladPage({ params }: Props) {
  const { slug } = await params;
  const entity = getProductFamilyBySlug(slug);
  if (!entity) notFound();
  return <EntityDetailPage entity={entity} />;
}
