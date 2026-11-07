# FESTÉKINDEX — Google index wave-1 closure v8.3

**LOCAL verification + ops checklist. No product SEO unlock. No manufacturer contact.**

Generated: 2026-10-30

## Verdict

**Host/sitemap technical blocker cleared.** Wave-1 (~36 apex URLs) is fetchable as valid XML on the canonical host. Remaining work is **Search Console ops + keep product/noindex locks**.

| Check | Result |
|---|---|
| `https://festekindex.hu/sitemap.xml` | **200** + `application/xml` |
| `https://www.festekindex.hu/sitemap.xml` | **308** → apex sitemap |
| `robots.txt` Sitemap | `https://festekindex.hu/sitemap.xml` |
| Sitemap URL count | **36** (all `festekindex.hu`) |
| Product detail URLs in sitemap | **0** (policy) |
| B1-DOC-01 | **OPEN** → product index unlock still forbidden |

Evidence: `gates/LIVE-HOST-EVIDENCE.json`, `live/*`.

## Wave-1 scope (unchanged policy)

Public hubs / selected orgs & brands already allowed by `evaluatePublicIndexability` — **not** products, surfaces, locked makers (incl. Poli/JUB), Trinát/Lazurán.

See also: `tmp/GOOGLE-READY-v1-REPORT.md`, go-live SEO gate docs.

## Ops checklist (Search Console)

- [ ] Confirm Domain or URL-prefix property covers `festekindex.hu`
- [ ] Resubmit sitemap: `https://festekindex.hu/sitemap.xml`
- [ ] URL Inspection live test on sitemap URL → Page fetch Successful
- [ ] Spot-check 3–5 wave-1 URLs (home, `/cegek`, one org, one brand hub)
- [ ] Record first impression/click evidence when available (moratorium lift prerequisite)

## Must stay locked

- All product pages (FB + PPG + any future JUB/Poli PASS overlays): **noindex** until B1-DOC-01 closed + explicit unlock GO
- Locked maker/org/brand cohort (Poli-Farbe, JUB, …)
- Final Four / dirty HOLD enrichment untouched by this package
- Google Ready v1 linguistic fixes: preserve; deploy only under separate GO if not already live

## Parallel tracks (do not conflate)

| Track | Status |
|---|---|
| Poli 6 PASS readiness | Package `…-poli-farbe-6-pass-release-readiness-v8-3` — integrate pending |
| JUB 95 PASS | Local integrate exists; production release pending separate DECISION |
| Manufacturer contact | **Moratorium** until GSC-visible presence |

## Not done here

- No commit / push / deploy
- No indexability flag flips
- No product sitemap expansion
