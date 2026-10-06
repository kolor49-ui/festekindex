/**
 * Central relation semantics for FESTÉKINDEX.
 * Stored edges always use the canonical direction; reverse labels are derived in the repository.
 */

import type { EntityType, RelationType } from "./types";

export type RelationTypeDef = {
  type: RelationType;
  /** Canonical source entity types */
  from: EntityType[];
  /** Canonical target entity types */
  to: EntityType[];
  forwardLabel: string;
  reverseLabel: string;
  /** Prefer this over relatedTo when the meaning matches */
  description: string;
};

export const RELATION_TYPE_DEFS: Record<RelationType, RelationTypeDef> = {
  owns: {
    type: "owns",
    from: ["organization"],
    to: ["brand"],
    forwardLabel: "Tulajdonolt márka",
    reverseLabel: "Tulajdonos / gyártói szervezet",
    description: "Organization owns Brand",
  },
  distributes: {
    type: "distributes",
    from: ["organization"],
    to: ["brand"],
    forwardLabel: "Forgalmazott márka",
    reverseLabel: "Magyarországi forgalmazó",
    description: "Organization distributes Brand",
  },
  officialDistributor: {
    type: "officialDistributor",
    from: ["organization"],
    to: ["brand"],
    forwardLabel: "Hivatalosan forgalmazott márka",
    reverseLabel: "Hivatalos magyarországi forgalmazó",
    description: "Organization is official distributor of Brand",
  },
  represents: {
    type: "represents",
    from: ["organization"],
    to: ["brand"],
    forwardLabel: "Képviselt márka",
    reverseLabel: "Magyarországi képviselet",
    description: "Organization represents Brand",
  },
  services: {
    type: "services",
    from: ["organization"],
    to: ["brand"],
    forwardLabel: "Szervizelt márka",
    reverseLabel: "Szervizhálózat",
    description: "Organization services Brand",
  },
  manufactures: {
    type: "manufactures",
    from: ["organization"],
    to: ["productFamily", "product"],
    forwardLabel: "Gyártott termékcsalád / termék",
    reverseLabel: "Gyártó szervezet",
    description:
      "Organization manufactures ProductFamily or Product. Prefer Family when Product is under a family — do not duplicate Org→Product manufactures.",
  },
  hasProductFamily: {
    type: "hasProductFamily",
    from: ["brand"],
    to: ["productFamily"],
    forwardLabel: "Termékcsalád",
    reverseLabel: "Márka",
    description: "Brand has ProductFamily",
  },
  hasProduct: {
    type: "hasProduct",
    from: ["productFamily", "brand"],
    to: ["product"],
    forwardLabel: "Konkrét termék / modell",
    reverseLabel: "Termékcsalád / márka",
    description:
      "ProductFamily or Brand has Product. Use Brand→Product only for orphans (no family). Do not store both Brand→Product and Family→Product for the same product.",
  },
  belongsToCategory: {
    type: "belongsToCategory",
    from: [
      "organization",
      "brand",
      "technology",
      "productFamily",
      "product",
      "knowledge",
      "comparison",
      "surface",
    ],
    to: ["category"],
    forwardLabel: "Kategória",
    reverseLabel: "Entitások ebben a kategóriában",
    description:
      "Entity belongs to Category. Marketing nav labels do not replace professional categories.",
  },
  usesTechnology: {
    type: "usesTechnology",
    from: ["organization", "brand", "productFamily", "product"],
    to: ["technology"],
    forwardLabel: "Technológia",
    reverseLabel: "Kapcsolódó márkák / gépek / cégek",
    description:
      "Entity uses Technology (incl. application_method and spray_process kinds).",
  },
  applicableToSurface: {
    type: "applicableToSurface",
    from: ["product", "productFamily"],
    to: ["surface"],
    forwardLabel: "Alkalmazható felület",
    reverseLabel: "Kapcsolódó termékek / családok",
    description:
      "Product or ProductFamily is applicable to Surface — independent of brand marketing (e.g. FACTOR „A fára”).",
  },
  partOfSystem: {
    type: "partOfSystem",
    from: ["product", "productFamily"],
    to: ["product", "productFamily"],
    forwardLabel: "Rendszerben vele",
    reverseLabel: "Rendszerben vele",
    description:
      "Coating / product system membership. Optional metadata.sequence / metadata.role on the edge; no full system entity yet.",
  },
  documents: {
    type: "documents",
    from: ["knowledge"],
    to: [
      "organization",
      "brand",
      "technology",
      "category",
      "productFamily",
      "product",
      "comparison",
      "surface",
    ],
    forwardLabel: "Dokumentált entitás",
    reverseLabel: "Kapcsolódó tudásanyagok",
    description: "Knowledge documents Entity",
  },
  compatibleWith: {
    type: "compatibleWith",
    from: ["productFamily", "product", "technology", "brand"],
    to: ["productFamily", "product", "technology", "brand"],
    forwardLabel: "Kompatibilis",
    reverseLabel: "Kompatibilis",
    description:
      "Bidirectional compatibility (store one canonical edge). Prefer partOfSystem for intentional layering / rétegrend.",
  },
  relatedTo: {
    type: "relatedTo",
    from: [
      "organization",
      "brand",
      "technology",
      "category",
      "productFamily",
      "product",
      "knowledge",
      "comparison",
      "surface",
    ],
    to: [
      "organization",
      "brand",
      "technology",
      "category",
      "productFamily",
      "product",
      "knowledge",
      "comparison",
      "surface",
    ],
    forwardLabel: "Kapcsolódó",
    reverseLabel: "Kapcsolódó",
    description:
      "Generic fallback only — forbidden when a more specific RelationType fits. Do not use for competitors; use Comparison + compares.",
  },
  compares: {
    type: "compares",
    from: ["comparison"],
    to: [
      "brand",
      "organization",
      "technology",
      "productFamily",
      "product",
      "surface",
    ],
    forwardLabel: "Összehasonlított entitás",
    reverseLabel: "Összehasonlítások",
    description: "Comparison --compares--> Entity (e.g. graco-vs-wagner)",
  },
};

export function getRelationLabel(
  relationType: RelationType,
  direction: "outgoing" | "incoming",
): string {
  const def = RELATION_TYPE_DEFS[relationType];
  return direction === "outgoing" ? def.forwardLabel : def.reverseLabel;
}
