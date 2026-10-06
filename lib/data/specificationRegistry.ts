/**
 * Product Data Model v2 — Specification Registry.
 * Definitions only; no Product fact enrichment.
 */

import type {
  ProductClass,
  SpecificationDefinition,
  SpecValue,
  UnitCode,
} from "./types";

/** Gloss controlled vocabulary (stored enum codes). */
export const GLOSS_ENUMS = [
  "deep_matt",
  "matt",
  "silk_matt",
  "satin",
  "semi_gloss",
  "gloss",
] as const;

export type GlossEnum = (typeof GLOSS_ENUMS)[number];

export const GLOSS_LABEL_HU: Record<GlossEnum, string> = {
  deep_matt: "Mélymatt",
  matt: "Matt",
  silk_matt: "Selyemmatt",
  satin: "Selyemfényű",
  semi_gloss: "Félfényes",
  gloss: "Fényes",
};

export const APPLICATION_ENVIRONMENT_ENUMS = [
  "interior",
  "exterior",
] as const;

export type ApplicationEnvironmentEnum =
  (typeof APPLICATION_ENVIRONMENT_ENUMS)[number];

export const APPLICATION_ENVIRONMENT_LABEL_HU: Record<
  ApplicationEnvironmentEnum,
  string
> = {
  interior: "Beltéri",
  exterior: "Kültéri",
};

const COATING_CLASSES: ProductClass[] = [
  "architectural_coating",
  "industrial_coating",
  "primer",
  "varnish",
  "filler",
];

/**
 * Planned source authority order (policy only — no ranking engine):
 * TDS > official product page > SDS > official catalog >
 * official distributor > secondary.
 */
export const SOURCE_DOCUMENT_KIND_PRIORITY: readonly string[] = [
  "tds",
  "product_page",
  "sds",
  "catalog",
  "distributor",
  "company_registry",
  "other",
] as const;

export const SPECIFICATION_REGISTRY: SpecificationDefinition[] = [
  {
    key: "coverage",
    labelHu: "Kiadósság",
    valueKinds: ["number_unit", "range_unit"],
    allowedUnits: ["m2_per_l", "m2_per_kg"],
    applicableClasses: COATING_CLASSES,
    filterable: true,
    searchable: true,
    displayOrder: 10,
    uiGroup: "performance",
  },
  {
    key: "consumption",
    labelHu: "Anyagfelhasználás",
    valueKinds: ["number_unit", "range_unit"],
    allowedUnits: ["g_per_m2", "ml_per_m2", "kg_per_m2"],
    applicableClasses: COATING_CLASSES,
    filterable: true,
    searchable: true,
    displayOrder: 20,
    uiGroup: "performance",
  },
  {
    key: "dust_dry_time",
    labelHu: "Porszáraz",
    valueKinds: ["duration", "duration_range"],
    allowedUnits: ["min", "h", "day"],
    applicableClasses: COATING_CLASSES,
    filterable: false,
    searchable: true,
    displayOrder: 30,
    uiGroup: "performance",
  },
  {
    key: "touch_dry_time",
    labelHu: "Érintésszáraz",
    valueKinds: ["duration", "duration_range"],
    allowedUnits: ["min", "h", "day"],
    applicableClasses: COATING_CLASSES,
    filterable: false,
    searchable: true,
    displayOrder: 40,
    uiGroup: "performance",
  },
  {
    key: "recoat_time",
    labelHu: "Átvonható",
    valueKinds: ["duration", "duration_range"],
    allowedUnits: ["min", "h", "day"],
    applicableClasses: COATING_CLASSES,
    filterable: true,
    searchable: true,
    displayOrder: 50,
    uiGroup: "performance",
  },
  {
    key: "full_cure_time",
    labelHu: "Teljesen száraz",
    valueKinds: ["duration", "duration_range"],
    allowedUnits: ["min", "h", "day"],
    applicableClasses: COATING_CLASSES,
    filterable: false,
    searchable: true,
    displayOrder: 60,
    uiGroup: "performance",
  },
  {
    key: "dilution",
    labelHu: "Hígítás",
    valueKinds: ["percentage", "percentage_range", "text"],
    applicableClasses: [
      ...COATING_CLASSES,
      "thinner",
      "surface_prep",
      "ancillary",
    ],
    filterable: false,
    searchable: true,
    displayOrder: 70,
    uiGroup: "application",
  },
  {
    key: "coat_count",
    labelHu: "Rétegszám",
    valueKinds: ["number", "range"],
    applicableClasses: COATING_CLASSES,
    filterable: true,
    searchable: true,
    displayOrder: 80,
    uiGroup: "application",
  },
  {
    key: "gloss",
    labelHu: "Fényesség",
    valueKinds: ["enum"],
    allowedEnums: [...GLOSS_ENUMS],
    applicableClasses: ["architectural_coating", "industrial_coating", "varnish"],
    filterable: true,
    searchable: true,
    displayOrder: 90,
    uiGroup: "appearance",
  },
  {
    key: "binder",
    labelHu: "Kötőanyag",
    // Text for now — future controlled chemistry vocabulary without Product redesign
    valueKinds: ["text", "enum"],
    applicableClasses: COATING_CLASSES,
    filterable: true,
    searchable: true,
    displayOrder: 100,
    uiGroup: "chemical",
  },
  {
    key: "application_environment",
    labelHu: "Alkalmazási környezet",
    valueKinds: ["enum", "multi_enum"],
    allowedEnums: [...APPLICATION_ENVIRONMENT_ENUMS],
    applicableClasses: [
      ...COATING_CLASSES,
      "filler",
      "surface_prep",
      "ancillary",
    ],
    filterable: true,
    searchable: true,
    displayOrder: 110,
    uiGroup: "application",
  },
];

const byKey = new Map(
  SPECIFICATION_REGISTRY.map((d) => [d.key, d] as const),
);

export function getSpecificationDefinition(
  key: string,
): SpecificationDefinition | undefined {
  return byKey.get(key);
}

export function listSpecificationDefinitions(): SpecificationDefinition[] {
  return [...SPECIFICATION_REGISTRY].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
}

export function isUnitBearingKind(kind: SpecValue["kind"]): boolean {
  return (
    kind === "number_unit" ||
    kind === "range_unit" ||
    kind === "duration" ||
    kind === "duration_range"
  );
}

export function isEnumBearingKind(kind: SpecValue["kind"]): boolean {
  return kind === "enum" || kind === "multi_enum";
}

export function unitFromValue(value: SpecValue): UnitCode | undefined {
  if (
    value.kind === "number_unit" ||
    value.kind === "range_unit" ||
    value.kind === "duration" ||
    value.kind === "duration_range"
  ) {
    return value.unit;
  }
  return undefined;
}
