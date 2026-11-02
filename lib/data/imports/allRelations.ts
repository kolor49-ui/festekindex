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
import { poli6Relations } from "./poli6V1/relations";
import { poli65ReviewRelations } from "./poli65ReviewV1/relations";
import { remmersRelations } from "./remmersV1/relations";
import { dufaRelations } from "./dufaV1/relations";
import { akzoRelations } from "./akzoV1/relations";
import { revcoRelations } from "./revcoV1/relations";
import { egrokorrRelations } from "./egrokorrV1/relations";
import { baumitRelations } from "./baumitV1/relations";
import { caparolRelations } from "./caparolV1/relations";
import { kemikalRelations } from "./kemikalV1/relations";

export const allRelations = mergeRelationsByCanonicalKey(
  mergeRelationsByCanonicalKey(
    mergeRelationsByCanonicalKey(
      mergeRelationsByCanonicalKey(
        mergeRelationsByCanonicalKey(
          mergeRelationsByCanonicalKey(
            mergeRelationsByCanonicalKey(
              mergeRelationsByCanonicalKey(
                mergeRelationsByCanonicalKey(
                  mergeRelationsByCanonicalKey(
                    mergeRelationsByCanonicalKey(
                      mergeRelationsByCanonicalKey(
                        mergeRelationsByCanonicalKey(
                          mergeRelationsByCanonicalKey(
                            relationsBase,
                            festekBazisV02Seed.relations,
                          ),
                          festekBazisEnrichmentV1.relations,
                        ),
                        ppgTrilak42Relations,
                      ),
                      jub95Relations,
                    ),
                    poli6Relations,
                  ),
                  poli65ReviewRelations,
                ),
                remmersRelations,
              ),
              dufaRelations,
            ),
            akzoRelations,
          ),
          revcoRelations,
        ),
        egrokorrRelations,
      ),
      baumitRelations,
    ),
    caparolRelations,
  ),
  kemikalRelations,
);
