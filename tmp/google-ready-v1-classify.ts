/**
 * Local one-shot classifier for GOOGLE READY v1 report. Not a permanent test.
 */
import {
  listAllEntities,
  listOrganizations,
  listBrands,
  listProducts,
  getEntityHref,
} from "../lib/data/repository";
import { evaluatePublicIndexability } from "../lib/seo/publicIndexability";
import { listPublishedForSitemap } from "../lib/seo/sitemapEntries";

const all = listAllEntities().filter(
  (e) => e.status === "published" && e.id !== "cat_all",
);

type Bucket = { A: string[]; B: string[]; C: string[] };
const byType: Record<string, Bucket> = {};

function reasonsOf(p: ReturnType<typeof evaluatePublicIndexability>): string {
  const any = p as {
    reasons?: string[];
    blockingReasons?: string[];
    reason?: string;
  };
  if (any.blockingReasons?.length) return any.blockingReasons.join("|");
  if (any.reasons?.length) return any.reasons.join("|");
  if (any.reason) return String(any.reason);
  return p.indexable ? "ok" : "blocked";
}

for (const e of all) {
  const pub = evaluatePublicIndexability(e);
  const t = e.type;
  if (!byType[t]) byType[t] = { A: [], B: [], C: [] };
  if (!pub.indexable) {
    byType[t].C.push(e.id);
    continue;
  }
  const body = (e.body || "").trim();
  if (body.length < 120) byType[t].B.push(e.id);
  else byType[t].A.push(e.id);
}

const sm = listPublishedForSitemap();
console.log("SITEMAP_COUNT", sm.length);
console.log("---SITEMAP---");
for (const e of [...sm].sort((a, b) => a.path.localeCompare(b.path))) {
  console.log(e.path);
}
console.log("---COUNTS---");
for (const [t, b] of Object.entries(byType).sort()) {
  console.log(
    t,
    "A",
    b.A.length,
    "B",
    b.B.length,
    "C",
    b.C.length,
  );
}
console.log("PRODUCT_TOTAL", listProducts().length);
console.log("ORG_DETAIL");
for (const o of listOrganizations()) {
  const p = evaluatePublicIndexability(o);
  console.log(
    o.id,
    getEntityHref(o),
    "idx",
    p.indexable,
    "body",
    (o.body || "").length,
    "rawIndexable",
    o.indexable,
    reasonsOf(p),
  );
}
console.log("BRAND_DETAIL");
for (const b of listBrands()) {
  const p = evaluatePublicIndexability(b);
  console.log(
    b.id,
    getEntityHref(b),
    "idx",
    p.indexable,
    "body",
    (b.body || "").length,
    reasonsOf(p),
  );
}
console.log("PRODUCT_INDEXABLE_COUNT", byType.Product?.A.length ?? 0);
console.log("PRODUCT_NOINDEX_COUNT", byType.Product?.C.length ?? 0);
