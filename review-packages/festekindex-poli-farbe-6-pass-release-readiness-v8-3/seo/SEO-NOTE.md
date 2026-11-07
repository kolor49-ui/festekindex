# SEO note — Poli-Farbe 6 PASS readiness v8.3

## Policy

- PASS = local draft quality only; **not** a publish or index licence.
- Any future catalogue merge must ship with **`indexable: false`**.
- Public robots meta: **`noindex, follow`** until an explicit product unlock GO (blocked while B1-DOC-01 remains OPEN).
- Do not add Poli product URLs to sitemap while noindex.
- Existing `org_poli_farbe` / `brand_poli_farbe` stay in the locked-maker cohort (noindex) unless separately unlocked.

## Google Ready / wave-1

- First indexing wave targets ~36 non-product hub/org/brand URLs.
- Poli PASS prep must **not** expand wave-1 product indexing.
- Apex canonical host: `https://festekindex.hu` (www → apex 308).

## Design

- No design-system changes in this package.
