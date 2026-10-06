import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityDetailPage } from "@/components/entity/EntityDetailPage";
import { OrganizationHubPage } from "@/components/entity/OrganizationHubPage";
import {
  getOrganizationBySlug,
  listOrganizations,
} from "@/lib/data/repository";
import { organizationHasManufacturerHub } from "@/lib/data/organizationPortfolio";
import { entityMetadata } from "@/lib/seo/metadata";
import {
  buildOrganizationHubModel,
  organizationHubMetadata,
} from "@/lib/seo/organizationHubModel";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return listOrganizations().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = getOrganizationBySlug(slug);
  if (!entity) return {};

  if (organizationHasManufacturerHub(entity.id)) {
    const hub = buildOrganizationHubModel(entity);
    if (hub) return organizationHubMetadata(hub);
  }

  return entityMetadata(entity);
}

export default async function CegPage({ params }: Props) {
  const { slug } = await params;
  const entity = getOrganizationBySlug(slug);
  if (!entity) notFound();

  if (organizationHasManufacturerHub(entity.id)) {
    const hub = buildOrganizationHubModel(entity);
    if (hub) return <OrganizationHubPage model={hub} />;
  }

  return <EntityDetailPage entity={entity} />;
}
