# SEO quality note — wave-1 closure

## Canonical host

- Preferred: `https://festekindex.hu`
- `www.festekindex.hu` → 308 to apex (all paths including sitemap/robots)

## Wave-1 quality bar

1. Sitemap fetchable without cross-host failure (fixed).
2. Every `<loc>` uses apex host (verified live).
3. No product detail URLs in sitemap while products are noindex.
4. Public indexability coherence script remains the gate for “what may enter sitemap”.
5. Google Ready v1 copy cleanup preserved; do not reopen purple/design churn.

## Explicit non-goals this wave

- Unlocking Poli/JUB/PPG product pages
- Manufacturer-supplied private PDFs
- Inventing missing technical claims
