import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurfaceHubPage } from "@/components/entity/SurfaceHubPage";
import { getSurfaceBySlug, listSurfaces } from "@/lib/data/repository";
import {
  buildSurfaceHubModel,
  surfaceHubMetadata,
} from "@/lib/seo/surfaceHubModel";

type Props = { params: Promise<{ slug: string }> };

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

export default async function FeluletPage({ params }: Props) {
  const { slug } = await params;
  const entity = getSurfaceBySlug(slug);
  if (!entity) notFound();
  const hub = buildSurfaceHubModel(entity);
  if (!hub) notFound();
  return <SurfaceHubPage model={hub} />;
}
