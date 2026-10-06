/**
 * Product-centric relation helpers for Product Hub.
 * Reuses navigation/org portfolio resolvers — no parallel hierarchy logic.
 */

import type {
  Category,
  KnowledgeArticle,
  PackagingUnit,
  Product,
  ProductPackagingOption,
  ProductSpecification,
  RelationMetadata,
  Source,
  SpecUiGroup,
  Surface,
  SystemRole,
  Technology,
} from "./types";
import {
  getEntityHref,
  getRelatedEntities,
  getSourcesByIds,
  getProductById,
} from "./repository";
import {
  formatPackagingDisplay,
  formatSpecCondition,
  formatSpecLabel,
  formatSpecUiGroupLabel,
  formatSpecValue,
} from "./specificationFormat";
import { getSpecificationDefinition } from "./specificationRegistry";
export type ProductLink = {
  id: string;
  name: string;
  href: string;
};

export type ProductCategoryLink = ProductLink & { productCount?: number };

export type ProductTechLink = ProductLink & {
  kind: Technology["kind"];
};

export type ProductSurfaceLink = ProductLink;

export type ProductSystemPeer = ProductLink & {
  sequence?: number;
  role?: SystemRole;
  isCurrent: boolean;
};

export type ProductKnowledgeLink = ProductLink & {
  note?: string;
};

/** Public presentation item — no internal relation type strings in UI. */
export type ProductRelatedLink = ProductLink & {
  /** User-facing Hungarian label (Hígító, Kapcsolódó termék, …). */
  label: string;
  /** Internal ranking only — never render. */
  priority: number;
};

export type ProductTechDataItem = {
  key: string;
  label: string;
  value: string;
  condition?: string;
};

export type ProductTechDataGroup = {
  key: SpecUiGroup | "flat";
  label?: string;
  items: ProductTechDataItem[];
};

export type ProductPackagingDisplay = {
  displayValue: string;
  amount: number;
  unit: PackagingUnit;
};

const SYSTEM_ROLE_LABEL: Record<SystemRole, string> = {
  primer: "Alapozó",
  intermediate: "Közbenső réteg",
  topcoat: "Fedőréteg",
  component: "Komponens",
  other: "Egyéb",
};

const PACKAGING_UNIT_ORDER: PackagingUnit[] = ["ml", "l", "g", "kg", "pcs"];

export function systemRoleLabel(role: SystemRole | undefined): string | undefined {
  if (!role || role === "other") return undefined;
  return SYSTEM_ROLE_LABEL[role];
}

export function getCategoriesForProduct(productId: string): ProductCategoryLink[] {
  return getRelatedEntities(productId, {
    relationTypes: ["belongsToCategory"],
    direction: "outgoing",
  })
    .filter(
      (r) =>
        r.entity.type === "category" &&
        r.entity.status === "published" &&
        r.entity.id !== "cat_all",
    )
    .map((r) => {
      const cat = r.entity as Category;
      return {
        id: cat.id,
        name: cat.name,
        href: getEntityHref(cat),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "hu"));
}

export function getTechnologiesForProduct(
  productId: string,
): ProductTechLink[] {
  const map = new Map<string, ProductTechLink>();
  for (const r of getRelatedEntities(productId, {
    relationTypes: ["usesTechnology"],
    direction: "outgoing",
  })) {
    if (r.entity.type !== "technology" || r.entity.status !== "published") {
      continue;
    }
    const t = r.entity as Technology;
    map.set(t.id, {
      id: t.id,
      name: t.name,
      href: getEntityHref(t),
      kind: t.kind,
    });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "hu"));
}

export function getSurfacesForProduct(productId: string): ProductSurfaceLink[] {
  const map = new Map<string, ProductSurfaceLink>();
  for (const r of getRelatedEntities(productId, {
    relationTypes: ["applicableToSurface"],
    direction: "outgoing",
  })) {
    if (r.entity.type !== "surface" || r.entity.status !== "published") {
      continue;
    }
    const s = r.entity as Surface;
    map.set(s.id, {
      id: s.id,
      name: s.name,
      href: getEntityHref(s),
    });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "hu"));
}

/**
 * Coating-system peers via partOfSystem.
 * Metadata.sequence / role apply to the *from* endpoint of the stored edge.
 */
export function getSystemRelationsForProduct(
  productId: string,
): ProductSystemPeer[] {
  const related = getRelatedEntities(productId, {
    relationTypes: ["partOfSystem"],
    direction: "both",
  }).filter(
    (r) => r.entity.type === "product" && r.entity.status === "published",
  );

  if (!related.length) return [];

  const byId = new Map<string, ProductSystemPeer>();

  // Always include current product
  const current = getProductById(productId);
  if (current && current.status === "published") {
    byId.set(current.id, {
      id: current.id,
      name: current.name,
      href: getEntityHref(current),
      isCurrent: true,
    });
  }

  for (const r of related) {
    const other = r.entity as Product;
    const meta: RelationMetadata | undefined = r.relation.metadata;
    const fromIsCurrent = r.direction === "outgoing";

    // Ensure other peer
    if (!byId.has(other.id)) {
      byId.set(other.id, {
        id: other.id,
        name: other.name,
        href: getEntityHref(other),
        isCurrent: false,
      });
    }

    // Metadata belongs to the stored *from* entity
    if (meta) {
      const fromId = fromIsCurrent ? productId : other.id;
      const peer = byId.get(fromId);
      if (peer) {
        if (typeof meta.sequence === "number") peer.sequence = meta.sequence;
        if (meta.role) peer.role = meta.role;
      }
    }
  }

  const peers = [...byId.values()];
  const hasSeq = peers.some((p) => typeof p.sequence === "number");
  if (hasSeq) {
    peers.sort(
      (a, b) =>
        (a.sequence ?? 999) - (b.sequence ?? 999) ||
        a.name.localeCompare(b.name, "hu"),
    );
  } else {
    peers.sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      return a.name.localeCompare(b.name, "hu");
    });
  }
  return peers;
}

export function getKnowledgeForProduct(
  productId: string,
): ProductKnowledgeLink[] {
  return getRelatedEntities(productId, {
    relationTypes: ["documents"],
    direction: "incoming",
  })
    .filter(
      (r) => r.entity.type === "knowledge" && r.entity.status === "published",
    )
    .map((r) => {
      const k = r.entity as KnowledgeArticle;
      const note = k.shortDescription?.trim();
      return {
        id: k.id,
        name: k.name,
        href: getEntityHref(k),
        note:
          note && !note.includes("a FESTÉKINDEX adatbázisában")
            ? note
            : undefined,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "hu"));
}

/** Product-relevant sources: entity + relations that back displayed facts. */
export function getSourcesForProduct(productId: string): {
  sources: Source[];
  lastVerifiedAt?: string;
} {
  const sourceIds = new Set<string>();
  const verified: string[] = [];
  const product = getProductById(productId);
  if (!product) return { sources: [] };

  for (const id of product.sourceIds) sourceIds.add(id);
  if (product.verifiedAt) verified.push(product.verifiedAt);

  const factRelations = getRelatedEntities(productId, {
    relationTypes: [
      "belongsToCategory",
      "usesTechnology",
      "applicableToSurface",
      "partOfSystem",
      "dilutedWith",
      "compatibleWith",
      "documents",
    ],
    direction: "both",
  });

  for (const r of factRelations) {
    for (const id of r.relation.sourceIds) sourceIds.add(id);
    if (r.relation.verifiedAt) verified.push(r.relation.verifiedAt);
  }

  const sources = getSourcesByIds([...sourceIds]);
  const lastVerifiedAt =
    verified.sort().at(-1) ??
    sources.map((s) => s.accessedAt).filter(Boolean).sort().at(-1);

  return { sources, lastVerifiedAt };
}

function isPublicSpec(spec: ProductSpecification): boolean {
  return spec.status === "verified";
}

function isPublicPackaging(opt: ProductPackagingOption): boolean {
  return opt.status === "verified";
}

/**
 * Public technical data groups from verified Product.specifications only.
 * Adaptive grouping: ≤4 items or single uiGroup → one flat group (no subgroup titles).
 */
export function getTechnicalDataForProduct(
  productId: string,
): ProductTechDataGroup[] {
  const product = getProductById(productId);
  if (!product?.specifications?.length) return [];

  const items: (ProductTechDataItem & { displayOrder: number; uiGroup: SpecUiGroup })[] =
    [];

  for (const spec of product.specifications) {
    if (!isPublicSpec(spec)) continue;
    const def = getSpecificationDefinition(spec.key);
    const value = formatSpecValue(spec.value);
    if (!value.trim()) continue;
    const condition = spec.condition
      ? formatSpecCondition(spec.condition)
      : undefined;
    items.push({
      key: spec.key,
      label: def?.labelHu ?? formatSpecLabel(spec.key),
      value,
      condition,
      displayOrder: def?.displayOrder ?? 999,
      uiGroup: def?.uiGroup ?? "other",
    });
  }

  if (!items.length) return [];

  items.sort(
    (a, b) =>
      a.displayOrder - b.displayOrder ||
      a.label.localeCompare(b.label, "hu"),
  );

  const groupKeys = new Set(items.map((i) => i.uiGroup));
  const useGroups = items.length >= 5 && groupKeys.size >= 2;

  if (!useGroups) {
    return [
      {
        key: "flat",
        items: items.map(({ key, label, value, condition }) => ({
          key,
          label,
          value,
          condition,
        })),
      },
    ];
  }

  const byGroup = new Map<SpecUiGroup, ProductTechDataItem[]>();
  for (const item of items) {
    const list = byGroup.get(item.uiGroup) ?? [];
    list.push({
      key: item.key,
      label: item.label,
      value: item.value,
      condition: item.condition,
    });
    byGroup.set(item.uiGroup, list);
  }

  const order: SpecUiGroup[] = [
    "performance",
    "application",
    "appearance",
    "chemical",
    "other",
  ];

  return order
    .filter((g) => (byGroup.get(g)?.length ?? 0) > 0)
    .map((g) => ({
      key: g,
      label: formatSpecUiGroupLabel(g),
      items: byGroup.get(g)!,
    }));
}

/** Verified packaging options, unit-order then amount ascending. */
export function getPackagingForProduct(
  productId: string,
): ProductPackagingDisplay[] {
  const product = getProductById(productId);
  if (!product?.packagingOptions?.length) return [];

  const opts = product.packagingOptions.filter(isPublicPackaging);
  if (!opts.length) return [];

  opts.sort((a, b) => {
    const ua = PACKAGING_UNIT_ORDER.indexOf(a.unit);
    const ub = PACKAGING_UNIT_ORDER.indexOf(b.unit);
    const oa = ua === -1 ? 99 : ua;
    const ob = ub === -1 ? 99 : ub;
    if (oa !== ob) return oa - ob;
    return a.amount - b.amount;
  });

  return opts.map((o) => ({
    displayValue: formatPackagingDisplay(o.amount, o.unit),
    amount: o.amount,
    unit: o.unit,
  }));
}

/**
 * Related Product links: partOfSystem / dilutedWith / compatibleWith.
 * Display dedupe by target — stronger relation wins. Graph unchanged.
 */
export function getRelatedProductsForHub(
  productId: string,
): ProductRelatedLink[] {
  const byTarget = new Map<string, ProductRelatedLink>();

  const upsert = (link: ProductRelatedLink) => {
    const prev = byTarget.get(link.id);
    if (!prev || link.priority < prev.priority) {
      byTarget.set(link.id, link);
    }
  };

  // partOfSystem peers (exclude current)
  for (const peer of getSystemRelationsForProduct(productId)) {
    if (peer.isCurrent) continue;
    const role = systemRoleLabel(peer.role);
    upsert({
      id: peer.id,
      name: peer.name,
      href: peer.href,
      label: role ?? "Rendszer része",
      priority: 1,
    });
  }

  for (const r of getRelatedEntities(productId, {
    relationTypes: ["dilutedWith"],
    direction: "outgoing",
  })) {
    if (r.entity.type !== "product" || r.entity.status !== "published") continue;
    const p = r.entity as Product;
    upsert({
      id: p.id,
      name: p.name,
      href: getEntityHref(p),
      label: "Hígító",
      priority: 2,
    });
  }

  // Incoming dilutedWith (this product is a thinner for others) — show as kapcsolódó
  for (const r of getRelatedEntities(productId, {
    relationTypes: ["dilutedWith"],
    direction: "incoming",
  })) {
    if (r.entity.type !== "product" || r.entity.status !== "published") continue;
    const p = r.entity as Product;
    upsert({
      id: p.id,
      name: p.name,
      href: getEntityHref(p),
      label: "Kapcsolódó termék",
      priority: 3,
    });
  }

  for (const r of getRelatedEntities(productId, {
    relationTypes: ["compatibleWith"],
    direction: "both",
  })) {
    if (r.entity.type !== "product" || r.entity.status !== "published") continue;
    const p = r.entity as Product;
    if (p.id === productId) continue;
    upsert({
      id: p.id,
      name: p.name,
      href: getEntityHref(p),
      label: "Kapcsolódó termék",
      priority: 4,
    });
  }

  return [...byTarget.values()].sort(
    (a, b) =>
      a.priority - b.priority || a.name.localeCompare(b.name, "hu"),
  );
}

/** Whether published product should use Product Hub (always for published products). */
export function productHasHub(productId: string): boolean {
  const p = getProductById(productId);
  return Boolean(p && p.status === "published");
}
