/**
 * CLI: validate merged graph after Festék Bázis v0.2 import.
 * Run: npm run validate:graph
 */

import { brands as brandsBase } from "../lib/data/brands";
import { categories as categoriesBase } from "../lib/data/categories";
import { comparisons } from "../lib/data/comparisons";
import { knowledge } from "../lib/data/knowledge";
import { organizations as organizationsBase } from "../lib/data/organizations";
import { productFamilies as productFamiliesBase } from "../lib/data/productFamilies";
import { products as productsBase } from "../lib/data/products";
import { relations as relationsBase } from "../lib/data/relations";
import { surfaces as surfacesBase } from "../lib/data/surfaces";
import { technologies as technologiesBase } from "../lib/data/technologies";
import { festekBazisV02Seed } from "../lib/data/imports/festekBazisV02Map";
import {
  mergeById,
  mergeRelationsByCanonicalKey,
  mergeSurfaces,
  mergeTechnologies,
} from "../lib/data/imports/merge";
import { validateGraph } from "../lib/data/imports/validateGraph";
import type { AnyEntity, Relation } from "../lib/data/types";
import { Counter } from "./_counter";

const organizations = mergeById(
  organizationsBase,
  festekBazisV02Seed.organizations,
);
const brands = mergeById(
  [...brandsBase, festekBazisV02Seed.archivedBrand7016],
  festekBazisV02Seed.brands,
);
const productFamilies = mergeById(
  productFamiliesBase,
  festekBazisV02Seed.productFamilies,
);
const products = mergeById(productsBase, festekBazisV02Seed.products);
const surfaces = mergeSurfaces(surfacesBase, festekBazisV02Seed.surfaces);
const technologies = mergeTechnologies(
  technologiesBase,
  festekBazisV02Seed.technologies,
);
const categories = mergeById(categoriesBase, festekBazisV02Seed.categories);

const entities: AnyEntity[] = [
  ...organizations,
  ...brands,
  ...technologies,
  ...categories,
  ...productFamilies,
  ...products,
  ...knowledge,
  ...comparisons,
  ...surfaces,
];

const relations: Relation[] = mergeRelationsByCanonicalKey(
  relationsBase,
  festekBazisV02Seed.relations,
);

const result = validateGraph(entities, relations);

const byType = Counter(entities.map((e) => e.type));
const byRel = Counter(relations.map((r) => r.relationType));
const fbByType = Counter(
  [
    ...festekBazisV02Seed.organizations,
    ...festekBazisV02Seed.brands,
    ...festekBazisV02Seed.productFamilies,
    ...festekBazisV02Seed.products,
    ...festekBazisV02Seed.surfaces,
    ...festekBazisV02Seed.technologies,
    ...festekBazisV02Seed.categories,
  ].map((e) => e.type),
);

console.log("=== FESTÉKINDEX graph validation (v0.2) ===");
console.log(
  `merged entities=${entities.length} relations=${relations.length}`,
);
console.log("Festék Bázis v0.2 mapped entities by type:", fbByType);
console.log("Merged entities by type:", byType);
console.log("Merged relations by type:", byRel);
console.log(
  `v0.2 sources=${festekBazisV02Seed.sources.length} relations=${festekBazisV02Seed.relations.length}`,
);

const brand7016 = entities.find((e) => e.id === "brand_7016");
const pf7016 = entities.find((e) => e.id === "pf_7016");
console.log("\n7016 migration:");
console.log(
  `  brand_7016: ${brand7016 ? `${brand7016.status} indexable=${brand7016.indexable}` : "absent"}`,
);
console.log(
  `  pf_7016: ${pf7016 ? `${pf7016.type} ${pf7016.status} indexable=${pf7016.indexable}` : "MISSING"}`,
);

if (result.warnings.length) {
  console.log(`\nWarnings (${result.warnings.length}):`);
  for (const w of result.warnings) {
    console.log(`  [${w.code}] ${w.message}`);
  }
}

if (result.errors.length) {
  console.log(`\nErrors (${result.errors.length}):`);
  for (const e of result.errors) {
    console.log(`  [${e.code}] ${e.message}`);
  }
  console.log("\nVALIDATION FAILED");
  process.exit(1);
}

console.log("\nVALIDATION OK");
process.exit(0);
