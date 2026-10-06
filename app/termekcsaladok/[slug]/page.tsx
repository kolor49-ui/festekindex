import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductFamilyHubPage } from "@/components/entity/ProductFamilyHubPage";
import { productFamilyHasHub } from "@/lib/data/productFamilyHub";
import {
  getProductFamilyBySlug,
  listProductFamilies,
} from "@/lib/data/repository";
import {
  buildProductFamilyHubModel,
  productFamilyHubMetadata,
} from "@/lib/seo/productFamilyHubModel";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listProductFamilies().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getProductFamilyBySlug(slug);
  if (!entity) return {};

  if (productFamilyHasHub(entity.id)) {
    const hub = buildProductFamilyHubModel(entity);
    if (hub) return productFamilyHubMetadata(hub);
  }

  return {};
}

export default async function TermekcsaladPage({ params }: Props) {
  const { slug } = await params;
  const entity = getProductFamilyBySlug(slug);
  if (!entity) notFound();

  if (productFamilyHasHub(entity.id)) {
    const hub = buildProductFamilyHubModel(entity);
    if (hub) return <ProductFamilyHubPage model={hub} />;
  }

  notFound();
}
