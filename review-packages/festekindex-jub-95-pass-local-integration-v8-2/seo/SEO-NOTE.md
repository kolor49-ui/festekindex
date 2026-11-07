# SEO impact — JUB 95 PASS local integration v8.2

## Preserved (Google Ready v1)

- Local Google Ready v1 edits left untouched (brands/orgs/SEO hub models remain as dirty local state).
- B1-DOC-01 remains **OPEN**.
- No automatic Google indexing unlock.
- No design / UI layout changes.

## New JUB entities

| Entity | Count | `indexable` | Sitemap |
|---|---:|---|---|
| Products (`prod_jub_*`) | 95 | **false** (`noindex, follow`) | excluded |
| Sub-brands (JUPOL…Takril) | 8 | **false** | excluded |
| Umbrella `brand_jub` | existing | false | excluded |
| Org `org_jub_hu` | existing | false | excluded |

## Side-effect (documented, no design change)

`cat_epitesi` (Építési vegyipar) previously had **0 products** and failed public indexability quality → noindex.
After JUB adhesives/waterproofing/glett products (+40) it now passes base public indexability.

| Metric | Before | After |
|---|---:|---:|
| Sitemap total | 36 | **37** |
| Indexable category hubs | 5 | **6** (+ `/kategoriak/epitesi-vegyipar`) |

**Benefit:** category hub becomes a real, product-backed landing URL instead of an empty shell.
**Compromise:** +1 sitemap URL without unlocking any JUB product/brand/org pages.
If production prefers to keep `cat_epitesi` locked noindex until editorial review, that would require an explicit `indexable: false` flag on the category (not applied in this local wave).

## Unchanged index rules

- Existing 95 products keep prior indexability.
- PPG Trilak 42 remain noindex.
- Manufacturer orgs/brands introduced as noindex in v8.1 stay noindex.
