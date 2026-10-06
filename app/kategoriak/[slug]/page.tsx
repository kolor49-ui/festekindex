import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryHubPage } from "@/components/entity/CategoryHubPage";
import {
  getCategoryBySlug,
  listNavCategories,
} from "@/lib/data/repository";
import {
  buildCategoryHubModel,
  categoryHubMetadata,
} from "@/lib/seo/categoryHubModel";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listNavCategories()
    .filter((c) => c.id !== "cat_all")
    .map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getCategoryBySlug(slug);
  if (!entity || entity.id === "cat_all") return {};
  const hub = buildCategoryHubModel(entity);
  if (!hub) return {};
  return categoryHubMetadata(hub);
}

export default async function KategoriaPage({ params }: Props) {
  const { slug } = await params;
  const entity = getCategoryBySlug(slug);
  if (!entity || entity.id === "cat_all" || entity.status !== "published") {
    notFound();
  }
  const hub = buildCategoryHubModel(entity);
  if (!hub) notFound();
  return <CategoryHubPage model={hub} />;
}
