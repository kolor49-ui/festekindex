/**
 * Graph integrity checks for the merged FESTÉKINDEX seed.
 */

import { RELATION_TYPE_DEFS } from "../relationTypes";
import type { AnyEntity, Relation, RelationType, Source } from "../types";
import {
  runProductModelFixtureTests,
  validateAllProducts,
} from "../productValidation";

export type GraphIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type GraphValidationResult = {
  ok: boolean;
  errors: GraphIssue[];
  warnings: GraphIssue[];
};

function entityTypeMap(entities: AnyEntity[]): Map<string, AnyEntity> {
  return new Map(entities.map((e) => [e.id, e]));
}

export function validateRelations(
  entities: AnyEntity[],
  relations: Relation[],
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const map = entityTypeMap(entities);

  for (const r of relations) {
    const def = RELATION_TYPE_DEFS[r.relationType as RelationType];
    if (!def) {
      issues.push({
        severity: "error",
        code: "unknown_relation_type",
        message: `${r.id}: unknown relationType ${r.relationType}`,
      });
      continue;
    }

    const from = map.get(r.fromEntityId);
    const to = map.get(r.toEntityId);

    if (!from) {
      issues.push({
        severity: "error",
        code: "missing_from_entity",
        message: `${r.id}: fromEntityId ${r.fromEntityId} not found`,
      });
    } else if (!def.from.includes(from.type)) {
      issues.push({
        severity: "error",
        code: "invalid_from_type",
        message: `${r.id}: ${from.type} cannot be source of ${r.relationType}`,
      });
    }

    if (!to) {
      issues.push({
        severity: "error",
        code: "missing_to_entity",
        message: `${r.id}: toEntityId ${r.toEntityId} not found`,
      });
    } else if (!def.to.includes(to.type)) {
      issues.push({
        severity: "error",
        code: "invalid_to_type",
        message: `${r.id}: ${to.type} cannot be target of ${r.relationType}`,
      });
    }
  }

  return issues;
}

export function validateDuplicateRelations(
  relations: Relation[],
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const seen = new Map<string, string>();

  for (const r of relations) {
    const key = `${r.fromEntityId}|${r.relationType}|${r.toEntityId}`;
    const prev = seen.get(key);
    if (prev) {
      issues.push({
        severity: "error",
        code: "duplicate_relation",
        message: `Duplicate ${key} (${prev} and ${r.id})`,
      });
    } else {
      seen.set(key, r.id);
    }
  }

  return issues;
}

/**
 * Orphans / structural gaps:
 * - Hard: Product without incoming hasProduct
 * - Hard: Product with both Brand and Family hasProduct (redundancy)
 * - Warn: published entity with zero relations (except synthetic cat_all)
 */
export function validateOrphans(
  entities: AnyEntity[],
  relations: Relation[],
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const active = relations.filter((r) => r.status === "active");

  const touchCount = new Map<string, number>();
  for (const e of entities) touchCount.set(e.id, 0);
  for (const r of active) {
    touchCount.set(
      r.fromEntityId,
      (touchCount.get(r.fromEntityId) ?? 0) + 1,
    );
    touchCount.set(r.toEntityId, (touchCount.get(r.toEntityId) ?? 0) + 1);
  }

  const hasProductIncoming = new Map<string, Relation[]>();
  for (const r of active) {
    if (r.relationType !== "hasProduct") continue;
    const list = hasProductIncoming.get(r.toEntityId) ?? [];
    list.push(r);
    hasProductIncoming.set(r.toEntityId, list);
  }

  for (const e of entities) {
    if (e.type !== "product") continue;
    const incoming = hasProductIncoming.get(e.id) ?? [];
    if (incoming.length === 0) {
      issues.push({
        severity: "error",
        code: "product_missing_hasProduct",
        message: `Product ${e.id} has no incoming hasProduct relation`,
      });
      continue;
    }

    const fromBrand = incoming.filter((r) =>
      entities.find((x) => x.id === r.fromEntityId)?.type === "brand",
    );
    const fromFamily = incoming.filter((r) =>
      entities.find((x) => x.id === r.fromEntityId)?.type === "productFamily",
    );
    if (fromBrand.length && fromFamily.length) {
      issues.push({
        severity: "error",
        code: "product_dual_hasProduct",
        message: `Product ${e.id} has both Brand and Family hasProduct edges`,
      });
    }
  }

  for (const e of entities) {
    if (e.id === "cat_all") continue;
    // Archived v0.1 Brand candidate — intentionally unlinked; pf_7016 is canonical
    if (e.id === "brand_7016" && e.status === "draft") {
      issues.push({
        severity: "warning",
        code: "archived_brand_7016_unlinked",
        message:
          "brand_7016 is archived draft without relations (canonical: pf_7016)",
      });
      continue;
    }
    if ((touchCount.get(e.id) ?? 0) > 0) continue;
    // Surfaces / categories / some techs may be catalog hubs awaiting links
    if (
      e.type === "surface" ||
      e.type === "category" ||
      e.type === "technology"
    ) {
      issues.push({
        severity: "warning",
        code: "unlinked_catalog_entity",
        message: `${e.type} ${e.id} has no active relations yet`,
      });
      continue;
    }
    issues.push({
      severity: "error",
      code: "orphan_entity",
      message: `${e.type} ${e.id} has no active relations`,
    });
  }

  // 7016 must not have owns
  for (const r of relations) {
    if (
      r.relationType === "owns" &&
      (r.toEntityId === "brand_7016" || r.fromEntityId === "brand_7016")
    ) {
      issues.push({
        severity: "error",
        code: "forbidden_7016_owns",
        message: `Forbidden owns involving brand_7016: ${r.id}`,
      });
    }
  }

  issues.push(...validate7016Migration(entities, relations));

  return issues;
}

/** v0.2: pf_7016 is canonical; brand_7016 must stay draft / non-indexable. */
export function validate7016Migration(
  entities: AnyEntity[],
  relations: Relation[],
): GraphIssue[] {
  const issues: GraphIssue[] = [];
  const brand7016 = entities.find((e) => e.id === "brand_7016");
  const pf7016 = entities.find((e) => e.id === "pf_7016");

  if (!pf7016) {
    issues.push({
      severity: "error",
      code: "missing_pf_7016",
      message: "Canonical pf_7016 ProductFamily is missing",
    });
  } else {
    if (pf7016.type !== "productFamily") {
      issues.push({
        severity: "error",
        code: "pf_7016_wrong_type",
        message: "pf_7016 must be productFamily",
      });
    }
    if (pf7016.status === "published" && pf7016.indexable === true) {
      // allowed published + non-indexable; flag if wrongly indexable
    }
    if (pf7016.indexable === true) {
      issues.push({
        severity: "warning",
        code: "pf_7016_indexable",
        message: "pf_7016 is indexable; v0.2 default expected false until content-ready",
      });
    }
  }

  if (brand7016) {
    if (brand7016.status === "published" || brand7016.indexable === true) {
      issues.push({
        severity: "error",
        code: "brand_7016_published",
        message: "brand_7016 must remain draft and indexable:false (archived candidate)",
      });
    }
  }

  for (const r of relations) {
    if (
      r.relationType === "hasProduct" &&
      r.fromEntityId === "brand_7016"
    ) {
      issues.push({
        severity: "error",
        code: "brand_7016_hasProduct",
        message: `7016 products must hang under pf_7016, not brand_7016: ${r.id}`,
      });
    }
  }

  const wall = entities.find((e) => e.id === "prod_7016_wall");
  if (wall) {
    const linked = relations.some(
      (r) =>
        r.status === "active" &&
        r.relationType === "hasProduct" &&
        r.fromEntityId === "pf_7016" &&
        r.toEntityId === "prod_7016_wall",
    );
    if (!linked) {
      issues.push({
        severity: "error",
        code: "prod_7016_wall_not_under_family",
        message: "prod_7016_wall must have pf_7016 --hasProduct--> edge",
      });
    }
  }

  return issues;
}

export function validateGraph(
  entities: AnyEntity[],
  relations: Relation[],
  sources: Source[] = [],
): GraphValidationResult {
  const all = [
    ...validateRelations(entities, relations),
    ...validateDuplicateRelations(relations),
    ...validateOrphans(entities, relations),
    ...validateAllProducts(entities, sources),
    ...runProductModelFixtureTests(entities, sources),
  ];

  // Duplicate entity ids
  const ids = new Map<string, number>();
  for (const e of entities) {
    ids.set(e.id, (ids.get(e.id) ?? 0) + 1);
  }
  for (const [id, n] of ids) {
    if (n > 1) {
      all.push({
        severity: "error",
        code: "duplicate_entity_id",
        message: `Entity id ${id} appears ${n} times`,
      });
    }
  }

  const errors = all.filter((i) => i.severity === "error");
  const warnings = all.filter((i) => i.severity === "warning");
  return { ok: errors.length === 0, errors, warnings };
}
