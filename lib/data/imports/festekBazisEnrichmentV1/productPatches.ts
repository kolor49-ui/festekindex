/**
 * Enrichment patches — official festekbazis.hu TDS / product page only.
 */

import type { ProductEnrichmentPatch } from "./types";
import { airflowInteriorPatch } from "./patches/airflowInterior";
import { airflowPrimerPatch } from "./patches/airflowPrimer";
import { airflowFacadePatch } from "./patches/airflowFacade";
import { airflowSaltPatch } from "./patches/airflowSalt";
import { valmorXclusivePatch } from "./patches/valmorXclusive";
import { valmorKontrolPatch } from "./patches/valmorKontrol";
import { valmorDeepPrimerPatch } from "./patches/valmorDeepPrimer";
import { valmorFacadePatch } from "./patches/valmorFacade";
import { valmorPlinthPatch } from "./patches/valmorPlinth";
import { valmorTexturedPatch } from "./patches/valmorTextured";
import { valmorGaragePatch } from "./patches/valmorGarage";
import { valmorFloorPatch } from "./patches/valmorFloor";
import { valmorWeatherPatch } from "./patches/valmorWeather";
import { valmorPlasterPatch } from "./patches/valmorPlaster";
import { factorPergolaPatch } from "./patches/factorPergola";
import { factorAquaPrimerPatch } from "./patches/factorAquaPrimer";
import { factorAquaParquetPatch } from "./patches/factorAquaParquet";
import { factorAquaGlazePatch } from "./patches/factorAquaGlaze";
import { factorParquetPatch } from "./patches/factorParquet";
import { factorBoatPatch } from "./patches/factorBoat";
import { cororRapidPrimerPatch } from "./patches/cororRapidPrimer";
import { cororRapidEnamelPatch } from "./patches/cororRapidEnamel";
import { cororRapidAquaEnamelPatch } from "./patches/cororRapidAquaEnamel";
import { cororRapidStripperPatch } from "./patches/cororRapidStripper";
import { cororIndPrimerPatch } from "./patches/cororIndPrimer";
import { cororIndEnamelPatch } from "./patches/cororIndEnamel";
import { cororIndS31Patch } from "./patches/cororIndS31";
import { cororAromaticPatch } from "./patches/cororAromatic";
import { cororSyntheticPatch } from "./patches/cororSynthetic";
import { pf7016WallPatch } from "./patches/pf7016Wall";
import { catalogueClosurePatchesV1 } from "./patches/catalogueClosureV1";

export const productPatchesV1: ProductEnrichmentPatch[] = [
  airflowInteriorPatch,
  airflowPrimerPatch,
  airflowFacadePatch,
  airflowSaltPatch,
  valmorXclusivePatch,
  valmorKontrolPatch,
  valmorDeepPrimerPatch,
  valmorFacadePatch,
  valmorPlinthPatch,
  valmorTexturedPatch,
  valmorGaragePatch,
  valmorFloorPatch,
  valmorWeatherPatch,
  valmorPlasterPatch,
  factorPergolaPatch,
  factorAquaPrimerPatch,
  factorAquaParquetPatch,
  factorAquaGlazePatch,
  factorParquetPatch,
  factorBoatPatch,
  cororRapidPrimerPatch,
  cororRapidEnamelPatch,
  cororRapidAquaEnamelPatch,
  cororRapidStripperPatch,
  cororIndPrimerPatch,
  cororIndEnamelPatch,
  cororIndS31Patch,
  cororAromaticPatch,
  cororSyntheticPatch,
  pf7016WallPatch,
  ...catalogueClosurePatchesV1,
];
