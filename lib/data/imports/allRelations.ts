/**
 * Merged active relation list for indexability / validators.
 * Avoids importing the full repository (circular dependency).
 */

import { relations as relationsBase } from "../relations";
import { festekBazisV02Seed } from "./festekBazisV02Map";
import { festekBazisEnrichmentV1 } from "./festekBazisEnrichmentV1";
import { mergeRelationsByCanonicalKey } from "./merge";

export const allRelations = mergeRelationsByCanonicalKey(
  mergeRelationsByCanonicalKey(relationsBase, festekBazisV02Seed.relations),
  festekBazisEnrichmentV1.relations,
);
