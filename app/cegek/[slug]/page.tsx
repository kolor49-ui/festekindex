import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import {
  getOrganizationBySlug,
  listOrganizations,
} from "@/lib/data/repository";
import { entityMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listOrganizations().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getOrganizationBySlug(slug);
  if (!entity) return {};
  return entityMetadata(entity);
}

export default async function CegPage({ params }: Props) {
  const { slug } = await params;
  const entity = getOrganizationBySlug(slug);
  if (!entity) notFound();
  return (
    <EntityDetailPage entity={entity} listPath="/cegek" listLabel="Cégek" />
  );
}
