/**
 * Merged active relation list for indexability / validators.
 * Avoids importing the full repository (circular dependency).
 */

import { relations as relationsBase } from "../relations";
import { festekBazisV02Seed } from "./festekBazisV02Map";
import { festekBazisEnrichmentV1 } from "./festekBazisEnrichmentV1";
import { mergeRelationsByCanonicalKey } from "./merge";
import { ppgTrilak42Relations } from "./ppgTrilak42V1/relations";
import { jub95Relations } from "./jub95V1/relations";

export const allRelations = mergeRelationsByCanonicalKey(
  mergeRelationsByCanonicalKey(
    mergeRelationsByCanonicalKey(
      mergeRelationsByCanonicalKey(relationsBase, festekBazisV02Seed.relations),
      festekBazisEnrichmentV1.relations,
    ),
    ppgTrilak42Relations,
  ),
  jub95Relations,
);
