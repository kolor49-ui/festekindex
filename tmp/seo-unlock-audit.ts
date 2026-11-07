import { listOrganizations, listBrands, getCategoryById } from "../lib/data/repository";
import { categories } from "../lib/data/categories";
import { evaluateIndexability } from "../lib/seo/indexability";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";
import { getBrandPortfolio } from "../lib/data/brandPortfolio";
import { sources as sourcesBase } from "../lib/data/sources";

console.log("sourcesBase count", sourcesBase.length);
console.log(
  "sitemap now",
  listPublishedForSitemap()
    .map((e) => e.path)
    .sort()
    .join("\n"),
);

for (const o of listOrganizations().filter((x) => x.indexable === false)) {
  const fake = { ...o, indexable: true as const };
  const base = evaluateIndexability(fake);
  console.log("ORG", o.slug, {
    short: (o.shortDescription || "").length,
    body: (o.body || "").length,
    src: o.sourceIds.length,
    baseOK: base.indexable,
    reasons: base.reasons,
  });
}

for (const b of listBrands().filter((x) => x.indexable === false)) {
  const fake = { ...b, indexable: true as const };
  const base = evaluateIndexability(fake);
  const pub = evaluatePublicIndexability(fake);
  const p = getBrandPortfolio(b.id);
  console.log("BRAND", b.id, {
    short: (b.shortDescription || "").length,
    body: (b.body || "").length,
    products: p?.allProducts.length ?? 0,
    orgs: p?.organizations.length ?? 0,
    baseOK: base.indexable,
    pubOK: pub.indexable,
    src: pub.source,
  });
}

for (const c of categories) {
  const live = getCategoryById(c.id) ?? c;
  const pub = evaluatePublicIndexability(live);
  console.log("CAT", c.id, {
    flag: live.indexable,
    short: (live.shortDescription || "").length,
    body: (live.body || "").length,
    pub: pub.indexable,
    src: pub.source,
    reasons: pub.baseReasons,
  });
}
