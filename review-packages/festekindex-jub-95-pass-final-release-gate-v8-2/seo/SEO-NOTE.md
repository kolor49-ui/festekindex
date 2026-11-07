# SEO — final release gate v8.2

## JUB products
- 95 products: `indexable: false` (noindex, follow)
- 8 JUB sub-brands + `brand_jub` + `org_jub_hu`: noindex
- **No Google index unlock**

## Sitemap decision: **36 URLs**

`/kategoriak/epitesi-vegyipar` evaluated:

| Criterion | Result |
|---|---|
| Local SSG/SSR renders | OK (page builds) |
| Unique valuable professional content | **FAIL** — body/seoDescription are generic boilerplate (~1 sentence); not release-grade category copy |
| Canonical / title / meta | Present but thin |
| Developer / broken HU copy | None found |
| Google Ready | Keep locked until substantive category editorial exists |

**Action:** `cat_epitesi.indexable = false` → excluded from sitemap. Sitemap remains **36**.

B1-DOC-01 remains OPEN.
