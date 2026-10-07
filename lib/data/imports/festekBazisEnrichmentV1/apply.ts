/**
 * Apply Festék Bázis enrichment v1 onto merged v0.2 seed.
 * Identity freeze: never overwrite id, slug, name, status, indexable.
 */

import type { Product, Relation, Source } from "../../types";
import { mergeRelationsByCanonicalKey } from "../merge";
import type {
  FestekBazisEnrichmentV1,
  ProductDescriptionEnrichment,
  ProductEnrichmentPatch,
  ProductProfessionalDescriptionEnrichment,
} from "./types";
import { productDescriptionEnrichmentsV1 } from "./descriptionEnrichment";
import { productProfessionalDescriptionEnrichmentsV1 } from "./professionalDescriptionEnrichment";
import {
  productColorAvailabilityV1,
  type ProductColorAvailabilityPatch,
} from "./colorSystemV1";

function uniqueIds(ids: string[]): string[] {
  return [...new Set(ids.filter(Boolean))];
}

/** Enrichment Source fields overlay existing ids; new ids are appended. */
export function mergeSourcesWithEnrichment(
  base: Source[],
  enrichment: Source[],
): Source[] {
  const map = new Map<string, Source>();
  for (const s of base) map.set(s.id, s);
  for (const s of enrichment) {
    const cur = map.get(s.id);
    if (!cur) {
      map.set(s.id, s);
      continue;
    }
    map.set(s.id, {
      ...cur,
      ...s,
      // Keep earlier title/url if enrichment omits them
      title: s.title || cur.title,
      url: s.url ?? cur.url,
      publisher: s.publisher ?? cur.publisher,
      type: s.type ?? cur.type,
    });
  }
  return [...map.values()];
}

export function applyProductPatch(
  product: Product,
  patch: ProductEnrichmentPatch,
): Product {
  if (patch.productId !== product.id) {
    throw new Error(
      `Enrichment patch productId ${patch.productId} != ${product.id}`,
    );
  }

  return {
    ...product,
    // IDENTITY FREEZE
    id: product.id,
    slug: product.slug,
    name: product.name,
    status: product.status,
    indexable: product.indexable,
    type: "product",
    officialUrl: patch.officialUrl ?? product.officialUrl,
    productClass: patch.productClass ?? product.productClass,
    sourceSummary: patch.sourceSummary ?? product.sourceSummary,
    sourceSummarySourceIds:
      patch.sourceSummarySourceIds ?? product.sourceSummarySourceIds,
    editorialSummary: patch.editorialSummary ?? product.editorialSummary,
    specifications: patch.specifications ?? product.specifications,
    packagingOptions: patch.packagingOptions ?? product.packagingOptions,
    sourceIds: uniqueIds([
      ...product.sourceIds,
      ...(patch.additionalSourceIds ?? []),
      ...(patch.sourceSummarySourceIds ?? []),
      ...(patch.specifications ?? []).flatMap((s) => s.sourceIds ?? []),
      ...(patch.packagingOptions ?? []).flatMap((p) => p.sourceIds ?? []),
    ]),
  };
}

export function applyProductEnrichments(
  products: Product[],
  patches: ProductEnrichmentPatch[],
): Product[] {
  const byId = new Map(patches.map((p) => [p.productId, p]));
  return products.map((product) => {
    const patch = byId.get(product.id);
    return patch ? applyProductPatch(product, patch) : product;
  });
}

export function applyProductDescriptionEnrichments(
  products: Product[],
  descriptions: ProductDescriptionEnrichment[] = productDescriptionEnrichmentsV1,
): Product[] {
  const byId = new Map(descriptions.map((d) => [d.productId, d]));
  return products.map((product) => {
    const d = byId.get(product.id);
    if (!d) return product;
    return {
      ...product,
      id: product.id,
      slug: product.slug,
      name: product.name,
      status: product.status,
      indexable: product.indexable,
      type: "product" as const,
      sourceSummary: d.sourceSummary,
      sourceSummarySourceIds: d.sourceSummarySourceIds,
      editorialSummary: d.editorialSummary,
      sourceIds: uniqueIds([
        ...product.sourceIds,
        ...d.sourceSummarySourceIds,
      ]),
    };
  });
}

export function applyProductProfessionalDescriptionEnrichments(
  products: Product[],
  descriptions: ProductProfessionalDescriptionEnrichment[] = productProfessionalDescriptionEnrichmentsV1,
): Product[] {
  const byId = new Map(descriptions.map((d) => [d.productId, d]));
  return products.map((product) => {
    const d = byId.get(product.id);
    if (!d || d.sections.length === 0) return product;
    return {
      ...product,
      id: product.id,
      slug: product.slug,
      name: product.name,
      status: product.status,
      indexable: product.indexable,
      type: "product" as const,
      professionalDescription: {
        sections: d.sections,
        sourceIds: uniqueIds(d.sourceIds),
      },
      sourceIds: uniqueIds([
        ...product.sourceIds,
        ...d.sourceIds,
        ...d.sections.flatMap((s) => s.sourceIds ?? []),
      ]),
    };
  });
}

export function applyProductColorAvailability(
  products: Product[],
  patches: ProductColorAvailabilityPatch[] = productColorAvailabilityV1,
): Product[] {
  const byId = new Map(patches.map((p) => [p.productId, p]));
  return products.map((product) => {
    const patch = byId.get(product.id);
    if (!patch) return product;
    const { productId: _pid, ...availability } = patch;
    const colorSourceIds = uniqueIds([
      ...(availability.colors ?? []).flatMap((c) => c.sourceIds),
      ...(availability.genericStatements ?? []).flatMap((g) => g.sourceIds),
    ]);
    return {
      ...product,
      id: product.id,
      slug: product.slug,
      name: product.name,
      status: product.status,
      indexable: product.indexable,
      type: "product" as const,
      colorAvailability: {
        status: availability.status,
        colors: availability.colors,
        genericStatements: availability.genericStatements,
      },
      sourceIds: uniqueIds([...product.sourceIds, ...colorSourceIds]),
    };
  });
}

export function applyFestekBazisEnrichmentV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
  enrichment: FestekBazisEnrichmentV1,
): {
  products: Product[];
  sources: Source[];
  relations: Relation[];
} {
  return {
    products: applyProductColorAvailability(
      applyProductProfessionalDescriptionEnrichments(
        applyProductDescriptionEnrichments(
          applyProductEnrichments(products, enrichment.productPatches),
        ),
      ),
    ),
    sources: mergeSourcesWithEnrichment(sources, enrichment.sources),
    relations: mergeRelationsByCanonicalKey(relations, enrichment.relations),
  };
}
