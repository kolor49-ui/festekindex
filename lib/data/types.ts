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
  /** Planned precise thinner semantics: Product --dilutedWith--> Product (thinner). No seed data yet. */
  | "dilutedWith"
  | "relatedTo"
  | "compares";

export type SourceType =
  | "official_website"
  | "manufacturer"
  | "hu_representation"
  | "company_registry"
  | "report"
  | "other";

/** Additive source document classification — does not replace SourceType. */
export type SourceDocumentKind =
  | "tds"
  | "sds"
  | "product_page"
  | "catalog"
  | "distributor"
  | "company_registry"
  | "other";

/**
 * Internal Product technical class for specification registry hints.
 * NOT an EntityType, Category, SEO landing, or breadcrumb node.
 */
export type ProductClass =
  | "architectural_coating"
  | "industrial_coating"
  | "primer"
  | "varnish"
  | "thinner"
  | "filler"
  | "surface_prep"
  | "spray_equipment"
  | "tool"
  | "ancillary"
  | "other";

export type SpecFactStatus = "draft" | "verified" | "conflict";

export type PackagingUnit = "l" | "ml" | "kg" | "g" | "pcs";

export type DurationUnit = "min" | "h" | "day";

/** Controlled unit codes — no conversion engine. */
export type UnitCode =
  | PackagingUnit
  | DurationUnit
  | "m2_per_l"
  | "m2_per_kg"
  | "g_per_m2"
  | "kg_per_m2"
  | "ml_per_m2"
  | "celsius"
  | "percent"
  | "bar"
  | "mpa"
  | "mm"
  | "um"
  | "l_per_min";

export type SpecValue =
  | { kind: "text"; text: string }
  | { kind: "number"; value: number }
  | { kind: "range"; min: number; max: number }
  | { kind: "number_unit"; value: number; unit: UnitCode }
  | { kind: "range_unit"; min: number; max: number; unit: UnitCode }
  | { kind: "duration"; value: number; unit: DurationUnit }
  | { kind: "duration_range"; min: number; max: number; unit: DurationUnit }
  | { kind: "percentage"; value: number }
  | { kind: "percentage_range"; min: number; max: number }
  | { kind: "boolean"; value: boolean }
  | { kind: "enum"; value: string }
  | { kind: "multi_enum"; values: string[] };

export type SpecCondition = {
  temperatureC?: number;
  relativeHumidityPct?: number;
  basis?: "per_coat" | "per_system" | "typical" | "max" | "min";
  /** Existing Technology entity IDs (application methods, etc.). */
  applicationMethodTechIds?: string[];
  /** Existing Surface entity IDs. */
  surfaceIds?: string[];
  note?: string;
};

export type ProductSpecification = {
  key: string;
  value: SpecValue;
  condition?: SpecCondition;
  note?: string;
  /** Internal import audit — never public UI / SEO. */
  rawValue?: string;
  sourceIds?: string[];
  verifiedAt?: string;
  /** Internal only — never public UI. */
  status?: SpecFactStatus;
};

export type ProductPackagingOption = {
  /** Stable Product-local id (not a global EntityType). */
  id: string;
  amount: number;
  unit: PackagingUnit;
  sku?: string;
  gtin?: string;
  sourceIds?: string[];
  verifiedAt?: string;
  /** Internal only — never public UI. */
  status?: SpecFactStatus;
};

export type SpecUiGroup =
  | "performance"
  | "application"
  | "appearance"
  | "chemical"
  | "other";

export type SpecificationDefinition = {
  key: string;
  labelHu: string;
  valueKinds: SpecValue["kind"][];
  allowedUnits?: UnitCode[];
  allowedEnums?: string[];
  applicableClasses?: ProductClass[];
  filterable: boolean;
  searchable: boolean;
  displayOrder: number;
  uiGroup: SpecUiGroup;
};

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
  /** Additive — e.g. type manufacturer + documentKind tds. */
  documentKind?: SourceDocumentKind;
  title: string;
  url?: string;
  publisher?: string;
  /** Manufacturer / document publication or issue date. */
  publishedAt?: string;
  /** When FESTÉKINDEX accessed / checked this source. */
  accessedAt?: string;
  notes?: string;
};

export type Category = EntityBase & {
  type: "category";
  parentId: string | null;
  sortOrder: number;
  navLabel?: string;
};

/** Seat address parts — country lives on Organization.country (single source). */
export type RegisteredOffice = {
  postalCode?: string;
  city?: string;
  addressLine?: string;
};

export type Organization = EntityBase & {
  type: "organization";
  legalName: string;
  /** ISO-style country code (e.g. HU) — canonical country fact. */
  country: string;
  /** @deprecated Prefer registeredOffice when structured seat is available. */
  hqCity?: string;
  roles: OrganizationRole[];
  website?: string;
  taxNumber?: string;
  companyRegistrationNumber?: string;
  registeredOffice?: RegisteredOffice;
  primaryActivity?: string;
  /** Only publish when organization-level source provenance supports it. */
  foundedYear?: number;
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

/**
 * Concrete commercial product / model — Brand/Family via relations only.
 * Technical facts: specifications[]; packaging: packagingOptions[].
 * Legacy shortDescription/body retained for backward compatibility.
 */
export type Product = EntityBase & {
  type: "product";
  aliases?: string[];
  /** Official product page URL when source-backed. */
  officialUrl?: string;
  /** Internal registry hint — not Category / SEO taxonomy. */
  productClass?: ProductClass;
  /**
   * Factual FESTÉKINDEX summary derived from primary sources.
   * Not verbatim manufacturer marketing; never structural filler.
   */
  sourceSummary?: string;
  /** Provenance for sourceSummary (optional; entity sourceIds remain aggregate). */
  sourceSummarySourceIds?: string[];
  /** FESTÉKINDEX editorial professional summary. */
  editorialSummary?: string;
  /**
   * Structured professional Product description (Termékleírás).
   * Official-source sections only — not the short lead.
   */
  professionalDescription?: ProductProfessionalDescription;
  specifications?: ProductSpecification[];
  packagingOptions?: ProductPackagingOption[];
  /**
   * Verified Product color availability (Color System v1).
   * Specific Color links and/or generic statements — never inferred.
   */
  colorAvailability?: ProductColorAvailability;
};

/** Non-EntityType Color System registry entry (RAL, manufacturer systems, …). */
export type ColorSystem = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Specific Color identity within a ColorSystem.
 * No HEX/RGB / swatch data in v1 (licensing + evidence safety).
 */
export type Color = {
  id: string;
  colorSystemId: string;
  /** System-local code (e.g. RAL "7016", manufacturer slug). */
  code: string;
  /** Optional official name when manufacturer-sourced (not invented). */
  name?: string;
  sourceIds?: string[];
};

/** Product → specific Color availability with provenance. */
export type ProductColorAvailabilityEntry = {
  colorId: string;
  /** Manufacturer listing label when the Color is a RAL (or similar) code. */
  labelOverride?: string;
  sourceIds: string[];
  verifiedAt: string;
  status: "verified" | "draft";
};

/** Generic verified availability without specific Color codes. */
export type ProductColorGenericStatement = {
  id: string;
  /** Public Hungarian statement — source-backed wording. */
  text: string;
  sourceIds: string[];
  verifiedAt: string;
  status: "verified" | "draft";
};

/** Embedded Product color availability — not a graph EntityType. */
export type ProductColorAvailability = {
  status: "verified" | "draft";
  colors?: ProductColorAvailabilityEntry[];
  genericStatements?: ProductColorGenericStatement[];
};

/** One public Termékleírás subsection (heading is user-facing Hungarian). */
export type ProductProfessionalDescriptionSection = {
  heading: string;
  paragraphs: string[];
  /** Provenance — never rendered publicly. */
  sourceIds?: string[];
};

/** Embedded Product professional description — not a separate Entity. */
export type ProductProfessionalDescription = {
  sections: ProductProfessionalDescriptionSection[];
  sourceIds: string[];
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
