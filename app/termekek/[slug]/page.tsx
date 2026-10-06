import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductHubPage } from "@/components/entity/ProductHubPage";
import { productHasHub } from "@/lib/data/productHub";
import { getProductBySlug, listProducts } from "@/lib/data/repository";
import {
  buildProductHubModel,
  productHubMetadata,
} from "@/lib/seo/productHubModel";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getProductBySlug(slug);
  if (!entity) return {};

  if (productHasHub(entity.id)) {
    const hub = buildProductHubModel(entity);
    if (hub) return productHubMetadata(hub);
  }

  return {};
}

export default async function TermekPage({ params }: Props) {
  const { slug } = await params;
  const entity = getProductBySlug(slug);
  if (!entity) notFound();

  if (productHasHub(entity.id)) {
    const hub = buildProductHubModel(entity);
    if (hub) return <ProductHubPage model={hub} />;
  }

  notFound();
}
