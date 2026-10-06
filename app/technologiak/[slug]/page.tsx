import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TechnologyHubPage } from "@/components/entity/TechnologyHubPage";
import {
  getTechnologyBySlug,
  listTechnologies,
} from "@/lib/data/repository";
import {
  buildTechnologyHubModel,
  technologyHubMetadata,
} from "@/lib/seo/technologyHubModel";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listTechnologies().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getTechnologyBySlug(slug);
  if (!entity) return {};
  const hub = buildTechnologyHubModel(entity);
  if (!hub) return {};
  return technologyHubMetadata(hub);
}

export default async function TechnologiaPage({ params }: Props) {
  const { slug } = await params;
  const entity = getTechnologyBySlug(slug);
  if (!entity) notFound();
  const hub = buildTechnologyHubModel(entity);
  if (!hub) notFound();
  return <TechnologyHubPage model={hub} />;
}
