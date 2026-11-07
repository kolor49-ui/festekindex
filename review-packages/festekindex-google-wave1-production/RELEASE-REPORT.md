# FESTÉKINDEX — Google Wave 1 PRODUCTION GO LIVE

**Verdict: GO COMPLETE (verified live)**

Generated: 2026-10-30T21:13Z

## Required answers

| # | Question | Answer |
|---|---|---|
| 1 | URLs opened to INDEX? | **36 / 36** sitemap URLs are live `index, follow` (or default-index hub lists) and passed quality gate |
| 2 | Kept NOINDEX? | **All 190 products** + JUB/Trinát/Lazurán/Poli brands/orgs + `cat_epitesi` |
| 3 | Google Ready v1 live? | **YES** (shipped in `d93bed6`, still on prod; Wave 1 added meta quality on top in `5c4f348`) |
| 4 | 190 products untouched? | **YES** — still 190, all `noindex, follow` |
| 5 | Deploy ID / SHA | **`7448883589`** / **`5c4f348`** (`5c4f348a42546dd98c9d744e93dac3b62fcd0b69`) |
| 6 | Tests / build / SSR / robots / canonical / sitemap | **PASS** — sitemap **36**, product details **0**, robots.txt Allow + Sitemap |
| 7 | GSC next | See `gsc/NEXT-STEPS.md` — no redundant sitemap resubmit; Inspect priority URLs |
| 8 | Remaining SEO gaps | Product unlock later; B1-DOC-01 OPEN; thin no-product Akzo brands still light; maker noindex brands |
| 9 | Rollback | Parent `dc38ca5` or previous Vercel deployment `7448465869` |

## What shipped in Wave 1 commit

- Reject generic `… márka a FESTÉKINDEX-en` brand metas (`brandHubModel`)
- COROR / FACTOR hub SEO overrides (alongside VALMOR)
- Stronger Héra / Dulux / Sikkens / International / porfesték `seoDescription`s
- SEO coherence test update

**Not shipped:** Poli WIP, dirty HOLD enrichment tree, product index unlock, design changes.

## INDEX READY (36)

See `seo/INDEX-READY-URLS.txt`.

Live gate: HTTP 200, title/H1/canonical self, meta ≥50 on entity pages, no developer leaks, no “Mi a …?” / “Kiemelt gyártók”, robots indexable, sitemap coherent.

## KEEP NOINDEX (selected)

- `/termekek/*` (190)
- `/markak/jub`, `/markak/trinat`, JUB sub-brands, Poli-Farbe brand
- `/kategoriak/epitesi-vegyipar` (not in sitemap)

## Isolation

- HOLD 4 enrichment files remain dirty **local only**
- `poli6V1/` untracked — not in commit
- Products catalogue size unchanged at 190

## Rollback

| Option | Target |
|---|---|
| Git | `dc38ca5` (JUB go-live, pre–Wave 1 meta) |
| Vercel | Redeploy deployment `7448465869` |

