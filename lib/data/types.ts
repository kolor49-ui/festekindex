export type EntityType =
  | "organization"
  | "brand"
  | "technology"
  | "category"
  | "productFamily"
  | "product"
  | "knowledge"
  | "comparison"
  | "surface";

export type PublishStatus = "draft" | "published";

export type RelationStatus = "draft" | "active" | "deprecated";

/**
 * Stored relation types only (canonical direction).
 * Reverse views (e.g. ownedBy) are derived in the repository — never stored.
 * `compares`: Comparison --compares--> Brand (etc.). Do not use relatedTo for rivals.
 */
export type RelationType =
  | "owns"
  | "distributes"
  | "officialDistributor"
  | "represents"
  | "services"
  | "manufactures"
  | "hasProductFamily"
  | "hasProduct"
  | "belongsToCategory"
  | "usesTechnology"
  | "applicableToSurface"
  | "partOfSystem"
  | "documents"
  | "compatibleWith"
  | "relatedTo"
  | "compares";

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

/** Technology classification — application methods live here (no separate EntityType). */
export type TechnologyKind =
  | "application_method"
  | "spray_process"
  | "equipment_class"
  | "process"
  | "other";

/** Optional metadata for partOfSystem (and future typed edges). Never required. */
export type SystemRole =
  | "primer"
  | "intermediate"
  | "topcoat"
  | "component"
  | "other";

export type RelationMetadata = {
  /** Layer / step order within a coating system (1-based preferred). */
  sequence?: number;
  /** Functional role of the *from* product in the system edge. */
  role?: SystemRole;
};

export type SeoFields = {
  seoTitle?: string;
  seoDescription?: string;
  canonicalPath?: string;
  indexable: boolean;
};

/** Shared fields — no categoryIds / ownership FKs (those live in relations). */
export type EntityBase = SeoFields & {
  id: string;
  type: EntityType;
  slug: string;
  name: string;
  shortDescription: string;
  body?: string;
  status: PublishStatus;
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
};

export type Technology = EntityBase & {
  type: "technology";
  aliases: string[];
  kind: TechnologyKind;
};

export type ProductFamily = EntityBase & {
  type: "productFamily";
};

/** Concrete commercial product / SKU — Brand/Family via relations only. */
export type Product = EntityBase & {
  type: "product";
  aliases?: string[];
};

export type KnowledgeArticle = EntityBase & {
  type: "knowledge";
};

/** Prepared for /osszehasonlitas/[slug] — empty seed for now. */
export type Comparison = EntityBase & {
  type: "comparison";
};

/** Substrate / surface type for SEO hubs (festék betonra, horganyzott acélra, …). */
export type Surface = EntityBase & {
  type: "surface";
  aliases: string[];
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
  /** Optional; primarily for partOfSystem sequence/role. */
  metadata?: RelationMetadata;
};

export type AnyEntity =
  | Organization
  | Brand
  | Technology
  | Category
  | ProductFamily
  | Product
  | KnowledgeArticle
  | Comparison
  | Surface;

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
  /** Direction-aware label from RELATION_TYPE_DEFS */
  label: string;
};

export type SitemapEntry = {
  path: string;
  lastModified: string;
};
