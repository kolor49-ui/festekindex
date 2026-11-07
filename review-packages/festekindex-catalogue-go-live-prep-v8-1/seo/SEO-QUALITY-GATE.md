# SEO Quality Gate — v8.1 (no index unlock)

## Policy
- Existing SEO machinery preserved (canonical, robots meta, sitemap, publicIndexability, hub metadata, JSON-LD).
- **No design changes** proposed or applied for SEO.
- **Google indexing not opened** for products or new manufacturer/brand profiles.
- New Trinát/Lazurán + 7 maker brands/orgs are `published` for Product Hub / navigation, but `indexable: false` until explicit SEO unlock.

## Checklist

| Check | Result | Notes |
|---|---|---|
| Product/org/brand indexability coherence | PASS | `test-seo-indexability-coherence-v1` |
| Canonical URLs | PASS | Hub metadata `alternates.canonical` |
| Unique title / meta description | PASS (entities with SEO fields) | Products still noindex |
| H1 / content hierarchy | PASS | Existing hub SSR tests |
| SSR HTML | PASS | Product Hub / UX / SEO smoke |
| Internal links | PASS | Hub + search catalog |
| Sitemap | PASS | **36** URLs; **0** products |
| Robots meta + robots.txt | PASS / unchanged | Products `noindex`; new brands locked |
| Structured data | PASS | Existing JSON-LD builders |
| Mobile / performance | Not re-profiled | No design change; build OK |
| Duplicate content | PASS | 0 duplicate product names in 95 |
| B1-DOC-01 claim matrix | **OPEN** | `docs/editorial/OPEN-ISSUES.md` — EN exactClaim linkage still required before SEO unlock of claim-bearing pages |

## A — Already openable to Google (currently sitemap / robots index)

**Organizations (7):** Graco Inc., Euroll Hungária, Wagner Group, Akzo Nobel Coatings, PPG TRILAK, M.L.S. Magyarország, FESTÉK BÁZIS Zrt.

**Brands (9):** Graco, Wagner, Dulux, Sikkens, International, Héra, VALMOR, FACTOR, COROR

**Other sitemap paths (20):** home, list hubs, selected categories/technologies/families/knowledge (see runtime sitemap; products excluded).

> These were already in the pre-v8.1 indexable set (Héra via substantive portfolio). Deploy would expose them — **deploy is forbidden in this package.**

## B — Openable after fix / unlock

1. **Trinát, Lazurán** — body quality OK; locked `indexable:false` intentionally. Unlock = flip flag after GO LIVE SEO approval.
2. **7 prepared makers** (Poli-Farbe, JUB, Remmers, Meffert/Düfa, Egrokorr, Caparol/thenordicmark, REVCO) — sourced org/brand profiles; some also `body_thin` / quality fail. Unlock only after editorial body pass + `indexable:true`.
3. **Pre-existing thin brands/orgs:** Mirka, Interpon, Milesi, Sika (+ Sika Hungária, European Aerosols) — `base_quality_fail`.
4. **B1-DOC-01** — claim matrix HU exactClaim linkage before expanding claim SEO.

## C — Keep noindex

- **All 95 products** (53 Festék Bázis + 42 PPG) — identity freeze `indexable:false`.
- Surfaces (all).
- Synthetic `cat_all`.
- New manufacturer/brand profiles until explicit unlock (see B).
- 31 REVIEW + 1 HOLD PPG products — **not in catalogue**.

## Design compromise note
No visual SEO changes requested or made. If future SEO asks for visible H1/brand hero changes, benefit vs design risk must be approved separately.
