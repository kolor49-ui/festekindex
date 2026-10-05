export type EntityType =
  | "organization"
  | "brand"
  | "technology"
  | "category"
  | "productFamily"
  | "knowledge";

export type PublishStatus = "draft" | "published";

export type RelationStatus = "draft" | "active" | "deprecated";

export type RelationType =
  | "owns"
  | "brandOf"
  | "manufactures"
  | "distributes"
  | "officialDistributor"
  | "represents"
  | "services"
  | "usesTechnology"
  | "belongsToCategory"
  | "compatibleWith"
  | "relatedTo"
  | "productFamilyOf"
  | "documentedBy";

export type SourceType =
  | "official_website"
  | "manufacturer"
  | "hu_representation"
  | "company_registry"
  | "report"
  | "other";

export type OrganizationRole =
  | "manufacturer"
  | "distributor"
  | "representation"
  | "service"
  | "other";

export type SeoFields = {
  seoTitle?: string;
  seoDescription?: string;
  canonicalPath?: string;
  indexable: boolean;
};

export type EntityBase = SeoFields & {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  shortDescription: string;
  body?: string;
  status: PublishStatus;
  categoryIds: string[];
  sourceIds: string[];
  updatedAt: string;
  verifiedAt?: string;
};

export type Source = {
  id: string;
  type: SourceType;
  title: string;
  url?: string;
  publisher?: string;
  accessedAt?: string;
  notes?: string;
};

export type Category = EntityBase & {
  type: "category";
  parentId: string | null;
  sortOrder: number;
  navLabel?: string;
};

export type Organization = EntityBase & {
  type: "organization";
  legalName: string;
  country: string;
  hqCity?: string;
  roles: OrganizationRole[];
  website?: string;
};

export type Brand = EntityBase & {
  type: "brand";
  ownerOrgId?: string;
};

export type Technology = EntityBase & {
  type: "technology";
  aliases: string[];
};

export type ProductFamily = EntityBase & {
  type: "productFamily";
  brandId: string;
};

export type KnowledgeArticle = EntityBase & {
  type: "knowledge";
  topicIds: string[];
};

export type Relation = {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  relationType: RelationType;
  description?: string;
  sourceIds: string[];
  validFrom?: string;
  validTo?: string | null;
  verifiedAt?: string;
  status: RelationStatus;
};

export type AnyEntity =
  | Organization
  | Brand
  | Technology
  | Category
  | ProductFamily
  | KnowledgeArticle;

export type SearchHit = {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  shortDescription: string;
  href: string;
  kindLabel: string;
  categoryNames: string[];
};

export type RelatedEntity = {
  entity: AnyEntity;
  relation: Relation;
  direction: "outgoing" | "incoming";
};

export type SitemapEntry = {
  path: string;
  lastModified: string;
};
