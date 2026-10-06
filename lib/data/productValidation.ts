/**
 * Product Data Model v2 — product / specification / packaging validation.
 */

import type {
  AnyEntity,
  PackagingUnit,
  Product,
  ProductPackagingOption,
  ProductSpecification,
  Source,
  SpecCondition,
  SpecValue,
  UnitCode,
} from "./types";
import type { GraphIssue } from "./imports/validateGraph";
import {
  getSpecificationDefinition,
  isEnumBearingKind,
  isUnitBearingKind,
  SPECIFICATION_REGISTRY,
  unitFromValue,
} from "./specificationRegistry";

const PACKAGING_UNITS: ReadonlySet<string> = new Set([
  "l",
  "ml",
  "kg",
  "g",
  "pcs",
]);

const ALL_UNIT_CODES: ReadonlySet<string> = new Set([
  "l",
  "ml",
  "kg",
  "g",
  "pcs",
  "m2_per_l",
  "m2_per_kg",
  "g_per_m2",
  "kg_per_m2",
  "ml_per_m2",
  "min",
  "h",
  "day",
  "celsius",
  "percent",
  "bar",
  "mpa",
  "mm",
  "um",
  "l_per_min",
]);

function issue(
  severity: GraphIssue["severity"],
  code: string,
  message: string,
): GraphIssue {
  return { severity, code, message };
}

/** Stable signature for SpecCondition — key order independent. */
export function conditionSignature(condition: SpecCondition | undefined): string {
  if (!condition) return "";
  const parts: string[] = [];
  if (typeof condition.temperatureC === "number") {
    parts.push(`t=${condition.temperatureC}`);
  }
  if (typeof condition.relativeHumidityPct === "number") {
    parts.push(`rh=${condition.relativeHumidityPct}`);
  }
  if (condition.basis) parts.push(`basis=${condition.basis}`);
  if (condition.applicationMethodTechIds?.length) {
    parts.push(
      `tech=${[...condition.applicationMethodTechIds].sort().join(",")}`,
    );
  }
  if (condition.surfaceIds?.length) {
    parts.push(`surf=${[...condition.surfaceIds].sort().join(",")}`);
  }
  if (condition.note?.trim()) {
    parts.push(`note=${condition.note.trim()}`);
  }
  return parts.join("|");
}

export function specificationIdentity(spec: ProductSpecification): string {
  return `${spec.key}::${conditionSignature(spec.condition)}`;
}

function validateRangeBounds(
  productId: string,
  context: string,
  min: number,
  max: number,
): GraphIssue[] {
  if (min > max) {
    return [
      issue(
        "error",
        "spec_invalid_range",
        `Product ${productId}: ${context} min (${min}) > max (${max})`,
      ),
    ];
  }
  return [];
}

function validateSpecValueShape(
  productId: string,
  key: string,
  value: SpecValue,
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const ctx = `spec ${key}`;

  switch (value.kind) {
    case "text":
      if (!value.text.trim()) {
        issues.push(
          issue(
            "error",
            "spec_empty_text",
            `Product ${productId}: ${ctx} empty text`,
          ),
        );
      }
      break;
    case "number":
    case "percentage":
    case "duration":
    case "number_unit":
      if (!Number.isFinite(value.value)) {
        issues.push(
          issue(
            "error",
            "spec_invalid_number",
            `Product ${productId}: ${ctx} non-finite number`,
          ),
        );
      }
      break;
    case "range":
    case "percentage_range":
    case "duration_range":
    case "range_unit":
      if (!Number.isFinite(value.min) || !Number.isFinite(value.max)) {
        issues.push(
          issue(
            "error",
            "spec_invalid_number",
            `Product ${productId}: ${ctx} non-finite range`,
          ),
        );
      } else {
        issues.push(...validateRangeBounds(productId, ctx, value.min, value.max));
      }
      break;
    case "boolean":
      break;
    case "enum":
      if (!value.value.trim()) {
        issues.push(
          issue(
            "error",
            "spec_empty_enum",
            `Product ${productId}: ${ctx} empty enum`,
          ),
        );
      }
      break;
    case "multi_enum":
      if (!value.values.length) {
        issues.push(
          issue(
            "error",
            "spec_empty_multi_enum",
            `Product ${productId}: ${ctx} empty multi_enum`,
          ),
        );
      }
      break;
    default: {
      const _never: never = value;
      void _never;
      issues.push(
        issue(
          "error",
          "spec_unknown_value_kind",
          `Product ${productId}: ${ctx} unknown value kind`,
        ),
      );
    }
  }

  const unit = unitFromValue(value);
  if (unit && !ALL_UNIT_CODES.has(unit)) {
    issues.push(
      issue(
        "error",
        "spec_invalid_unit",
        `Product ${productId}: ${ctx} invalid unit ${unit}`,
      ),
    );
  }

  return issues;
}

function validateConditionRefs(
  productId: string,
  key: string,
  condition: SpecCondition | undefined,
  entityById: Map<string, AnyEntity>,
): GraphIssue[] {
  if (!condition) return [];
  const issues: GraphIssue[] = [];

  for (const techId of condition.applicationMethodTechIds ?? []) {
    const e = entityById.get(techId);
    if (!e || e.type !== "technology") {
      issues.push(
        issue(
          "error",
          "spec_broken_condition_technology",
          `Product ${productId}: spec ${key} condition technology ${techId} not found`,
        ),
      );
    }
  }

  for (const surfaceId of condition.surfaceIds ?? []) {
    const e = entityById.get(surfaceId);
    if (!e || e.type !== "surface") {
      issues.push(
        issue(
          "error",
          "spec_broken_condition_surface",
          `Product ${productId}: spec ${key} condition surface ${surfaceId} not found`,
        ),
      );
    }
  }

  return issues;
}

function validateSourceIds(
  productId: string,
  context: string,
  sourceIds: string[] | undefined,
  sourceIdSet: ReadonlySet<string>,
  requireNonEmpty: boolean,
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const ids = sourceIds ?? [];

  if (requireNonEmpty && ids.length < 1) {
    issues.push(
      issue(
        "error",
        "verified_without_source",
        `Product ${productId}: ${context} verified but sourceIds empty`,
      ),
    );
  }

  for (const sid of ids) {
    if (!sourceIdSet.has(sid)) {
      issues.push(
        issue(
          "error",
          "broken_source_id",
          `Product ${productId}: ${context} broken sourceId ${sid}`,
        ),
      );
    }
  }

  return issues;
}

export function validateProductSpecification(
  product: Product,
  spec: ProductSpecification,
  entityById: Map<string, AnyEntity>,
  sourceIdSet: ReadonlySet<string>,
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const def = getSpecificationDefinition(spec.key);

  if (!def) {
    issues.push(
      issue(
        "error",
        "unknown_specification_key",
        `Product ${product.id}: unknown specification key "${spec.key}"`,
      ),
    );
    return issues;
  }

  if (!def.valueKinds.includes(spec.value.kind)) {
    issues.push(
      issue(
        "error",
        "spec_value_kind_not_allowed",
        `Product ${product.id}: key ${spec.key} does not allow kind ${spec.value.kind}`,
      ),
    );
  }

  issues.push(...validateSpecValueShape(product.id, spec.key, spec.value));

  const unit = unitFromValue(spec.value);
  if (unit && def.allowedUnits && !def.allowedUnits.includes(unit)) {
    issues.push(
      issue(
        "error",
        "spec_invalid_unit",
        `Product ${product.id}: key ${spec.key} unit ${unit} not in allowedUnits`,
      ),
    );
  }

  if (spec.value.kind === "enum" && def.allowedEnums) {
    if (!def.allowedEnums.includes(spec.value.value)) {
      issues.push(
        issue(
          "error",
          "spec_invalid_enum",
          `Product ${product.id}: key ${spec.key} invalid enum "${spec.value.value}"`,
        ),
      );
    }
  }

  if (spec.value.kind === "multi_enum" && def.allowedEnums) {
    for (const v of spec.value.values) {
      if (!def.allowedEnums.includes(v)) {
        issues.push(
          issue(
            "error",
            "spec_invalid_enum",
            `Product ${product.id}: key ${spec.key} invalid multi_enum "${v}"`,
          ),
        );
      }
    }
  }

  issues.push(
    ...validateConditionRefs(product.id, spec.key, spec.condition, entityById),
  );

  const verified = spec.status === "verified";
  issues.push(
    ...validateSourceIds(
      product.id,
      `spec ${spec.key}`,
      spec.sourceIds,
      sourceIdSet,
      verified,
    ),
  );

  if (
    product.productClass &&
    def.applicableClasses &&
    def.applicableClasses.length > 0 &&
    !def.applicableClasses.includes(product.productClass)
  ) {
    issues.push(
      issue(
        "warning",
        "product_class_spec_mismatch",
        `Product ${product.id}: key ${spec.key} not applicable to class ${product.productClass}`,
      ),
    );
  }

  return issues;
}

export function validateProductPackaging(
  product: Product,
  option: ProductPackagingOption,
  sourceIdSet: ReadonlySet<string>,
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const ctx = `packaging ${option.id}`;

  if (!option.id.trim()) {
    issues.push(
      issue(
        "error",
        "packaging_empty_id",
        `Product ${product.id}: packaging option missing id`,
      ),
    );
  }

  if (!(option.amount > 0) || !Number.isFinite(option.amount)) {
    issues.push(
      issue(
        "error",
        "packaging_invalid_amount",
        `Product ${product.id}: ${ctx} amount must be > 0`,
      ),
    );
  }

  if (!PACKAGING_UNITS.has(option.unit)) {
    issues.push(
      issue(
        "error",
        "packaging_invalid_unit",
        `Product ${product.id}: ${ctx} invalid unit ${option.unit}`,
      ),
    );
  }

  const verified = option.status === "verified";
  issues.push(
    ...validateSourceIds(
      product.id,
      ctx,
      option.sourceIds,
      sourceIdSet,
      verified,
    ),
  );

  return issues;
}

export function validateProductModel(
  product: Product,
  entityById: Map<string, AnyEntity>,
  sourceIdSet: ReadonlySet<string>,
): GraphIssue[] {
  const issues: GraphIssue[] = [];

  if (product.sourceSummarySourceIds?.length) {
    issues.push(
      ...validateSourceIds(
        product.id,
        "sourceSummary",
        product.sourceSummarySourceIds,
        sourceIdSet,
        false,
      ),
    );
  }

  const specs = product.specifications ?? [];
  const seenSpec = new Map<string, number>();
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]!;
    const identity = specificationIdentity(spec);
    const prev = seenSpec.get(identity);
    if (prev !== undefined) {
      issues.push(
        issue(
          "error",
          "duplicate_specification",
          `Product ${product.id}: duplicate specification identity "${identity}" (indexes ${prev}, ${i})`,
        ),
      );
    } else {
      seenSpec.set(identity, i);
    }
    issues.push(
      ...validateProductSpecification(product, spec, entityById, sourceIdSet),
    );
  }

  const packs = product.packagingOptions ?? [];
  const seenPackId = new Map<string, number>();
  const seenAmountUnit = new Map<string, number>();
  for (let i = 0; i < packs.length; i++) {
    const pack = packs[i]!;
    if (pack.id) {
      const prevId = seenPackId.get(pack.id);
      if (prevId !== undefined) {
        issues.push(
          issue(
            "error",
            "duplicate_packaging_id",
            `Product ${product.id}: duplicate packaging id ${pack.id}`,
          ),
        );
      } else {
        seenPackId.set(pack.id, i);
      }
    }
    const au = `${pack.amount}|${pack.unit}`;
    const prevAu = seenAmountUnit.get(au);
    if (prevAu !== undefined) {
      issues.push(
        issue(
          "error",
          "duplicate_packaging_amount_unit",
          `Product ${product.id}: duplicate packaging ${pack.amount} ${pack.unit}`,
        ),
      );
    } else {
      seenAmountUnit.set(au, i);
    }
    issues.push(...validateProductPackaging(product, pack, sourceIdSet));
  }

  return issues;
}

export function validateSpecificationRegistry(): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const seenKeys = new Map<string, number>();

  for (let i = 0; i < SPECIFICATION_REGISTRY.length; i++) {
    const def = SPECIFICATION_REGISTRY[i]!;
    const prev = seenKeys.get(def.key);
    if (prev !== undefined) {
      issues.push(
        issue(
          "error",
          "registry_duplicate_key",
          `Specification registry duplicate key "${def.key}"`,
        ),
      );
    } else {
      seenKeys.set(def.key, i);
    }

    if (!def.valueKinds.length) {
      issues.push(
        issue(
          "error",
          "registry_empty_value_kinds",
          `Registry key ${def.key}: valueKinds empty`,
        ),
      );
    }

    if (def.allowedUnits?.length) {
      const needsUnit = def.valueKinds.some(isUnitBearingKind);
      if (!needsUnit) {
        issues.push(
          issue(
            "error",
            "registry_units_without_unit_kind",
            `Registry key ${def.key}: allowedUnits set but no unit-bearing valueKinds`,
          ),
        );
      }
      for (const u of def.allowedUnits) {
        if (!ALL_UNIT_CODES.has(u)) {
          issues.push(
            issue(
              "error",
              "registry_invalid_unit",
              `Registry key ${def.key}: invalid allowedUnit ${u}`,
            ),
          );
        }
      }
    }

    if (def.allowedEnums?.length) {
      const needsEnum = def.valueKinds.some(isEnumBearingKind);
      if (!needsEnum) {
        issues.push(
          issue(
            "error",
            "registry_enums_without_enum_kind",
            `Registry key ${def.key}: allowedEnums set but no enum-bearing valueKinds`,
          ),
        );
      }
    }
  }

  return issues;
}

export function validateAllProducts(
  entities: AnyEntity[],
  sources: Source[],
): GraphIssue[] {
  const entityById = new Map(entities.map((e) => [e.id, e] as const));
  const sourceIdSet = new Set(sources.map((s) => s.id));
  const issues: GraphIssue[] = [...validateSpecificationRegistry()];

  for (const e of entities) {
    if (e.type !== "product") continue;
    issues.push(...validateProductModel(e, entityById, sourceIdSet));
  }

  return issues;
}

/**
 * Internal fixtures — NOT production Festék Bázis data.
 * Returns errors if fixture expectations fail.
 */
export function runProductModelFixtureTests(
  realEntities: AnyEntity[],
  realSources: Source[],
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const entityById = new Map(realEntities.map((e) => [e.id, e] as const));
  const sourceIdSet = new Set(realSources.map((s) => s.id));

  const anySourceId = realSources[0]?.id;
  if (!anySourceId) {
    return [
      issue("error", "fixture_no_sources", "No sources available for fixtures"),
    ];
  }

  const surfaceId =
    realEntities.find((e) => e.type === "surface")?.id ?? "surface_missing";

  const baseProduct = (overrides: Partial<Product>): Product =>
    ({
      id: "fixture_product_pdm_v2",
      type: "product",
      slug: "fixture-product-pdm-v2",
      name: "PDM v2 Fixture Product",
      shortDescription: "Internal validation fixture — not a public product.",
      status: "draft",
      indexable: false,
      sourceIds: [anySourceId],
      updatedAt: "2026-10-06",
      productClass: "architectural_coating",
      ...overrides,
    }) as Product;

  const expectOk = (label: string, product: Product) => {
    const found = validateProductModel(product, entityById, sourceIdSet).filter(
      (i) => i.severity === "error",
    );
    if (found.length) {
      issues.push(
        issue(
          "error",
          "fixture_expected_valid",
          `${label}: expected valid, got ${found.map((f) => f.code).join(", ")}`,
        ),
      );
    }
  };

  const expectError = (label: string, product: Product, code: string) => {
    const found = validateProductModel(product, entityById, sourceIdSet);
    if (!found.some((i) => i.code === code)) {
      issues.push(
        issue(
          "error",
          "fixture_expected_error",
          `${label}: expected error code ${code}, got [${found.map((f) => f.code).join(", ") || "none"}]`,
        ),
      );
    }
  };

  expectOk(
    "valid_coverage",
    baseProduct({
      specifications: [
        {
          key: "coverage",
          value: { kind: "range_unit", min: 10, max: 12, unit: "m2_per_l" },
          status: "verified",
          sourceIds: [anySourceId],
          rawValue: "kb. 10-12 m²/l/réteg",
          condition: { basis: "per_coat" },
        },
      ],
    }),
  );

  expectOk(
    "valid_recoat",
    baseProduct({
      specifications: [
        {
          key: "recoat_time",
          value: { kind: "duration", value: 4, unit: "h" },
          condition: { temperatureC: 20 },
          status: "verified",
          sourceIds: [anySourceId],
        },
      ],
    }),
  );

  expectOk(
    "valid_gloss",
    baseProduct({
      specifications: [
        {
          key: "gloss",
          value: { kind: "enum", value: "matt" },
          status: "draft",
        },
      ],
    }),
  );

  expectOk(
    "valid_coat_and_dilution",
    baseProduct({
      specifications: [
        {
          key: "coat_count",
          value: { kind: "range", min: 2, max: 3 },
          status: "draft",
        },
        {
          key: "dilution",
          value: { kind: "percentage_range", min: 5, max: 10 },
          status: "draft",
        },
      ],
    }),
  );

  if (entityById.get(surfaceId)?.type === "surface") {
    const otherSurface = realEntities.find(
      (e) => e.type === "surface" && e.id !== surfaceId,
    )?.id;
    if (otherSurface) {
      expectOk(
        "valid_coverage_per_surface",
        baseProduct({
          specifications: [
            {
              key: "coverage",
              value: { kind: "range_unit", min: 10, max: 12, unit: "m2_per_l" },
              condition: { surfaceIds: [surfaceId] },
              status: "draft",
            },
            {
              key: "coverage",
              value: { kind: "range_unit", min: 8, max: 10, unit: "m2_per_l" },
              condition: { surfaceIds: [otherSurface] },
              status: "draft",
            },
          ],
        }),
      );
    }
  }

  expectError(
    "invalid_range",
    baseProduct({
      specifications: [
        {
          key: "coverage",
          value: { kind: "range_unit", min: 12, max: 10, unit: "m2_per_l" },
          status: "draft",
        },
      ],
    }),
    "spec_invalid_range",
  );

  expectError(
    "invalid_gloss",
    baseProduct({
      specifications: [
        {
          key: "gloss",
          value: { kind: "enum", value: "super_shiny_unknown" },
          status: "draft",
        },
      ],
    }),
    "spec_invalid_enum",
  );

  expectError(
    "verified_no_source",
    baseProduct({
      specifications: [
        {
          key: "coverage",
          value: { kind: "number_unit", value: 10, unit: "m2_per_l" },
          status: "verified",
          sourceIds: [],
        },
      ],
    }),
    "verified_without_source",
  );

  expectError(
    "broken_surface",
    baseProduct({
      specifications: [
        {
          key: "coverage",
          value: { kind: "number_unit", value: 10, unit: "m2_per_l" },
          condition: { surfaceIds: ["surface_does_not_exist_pdm"] },
          status: "draft",
        },
      ],
    }),
    "spec_broken_condition_surface",
  );

  expectError(
    "broken_tech",
    baseProduct({
      specifications: [
        {
          key: "dilution",
          value: { kind: "percentage", value: 5 },
          condition: {
            applicationMethodTechIds: ["tech_does_not_exist_pdm"],
          },
          status: "draft",
        },
      ],
    }),
    "spec_broken_condition_technology",
  );

  return issues;
}

export type { PackagingUnit, UnitCode };
