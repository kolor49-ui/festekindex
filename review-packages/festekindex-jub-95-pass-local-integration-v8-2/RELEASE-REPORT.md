# FESTÉKINDEX — JUB 95 PASS local catalogue integration v8.2

**LOCAL ONLY — no commit / push / deploy / live DB write.**

## Verdict

### **GO — local integration complete. Production release: PENDING.**

Catalogue ready at **190** products for the next production-release decision.

| Cohort | Count | Indexable |
|---|---:|---|
| Festék Bázis (existing) | 53 | prior rules |
| PPG Trilak 42 (existing) | 42 | false |
| **JUB 95 PASS (new)** | **95** | **false** |
| **Total** | **190** | |

Excluded: JUB REVIEW **24**, JUB HOLD **8**. Poli-Farbe **0 PASS** (separate registry).

## 1. Full JUB 95 PASS list

See `roster/PASS-LIST.md` and `roster/PASS-IDS.txt` / `roster/ROSTER.csv`.

### Brand mix (PASS)

- JUPOL: 25
- JUB: 24
- JUBIZOL: 18
- HYDROSOL: 7
- JUBIN: 7
- Akrinol: 5
- Jubolin: 5
- Acrylcolor: 2
- Takril: 2

## 2. Integration + regression

Overlay: `lib/data/imports/jub95V1/` wired via `repository.ts` + `allRelations.ts` (PPG42 pattern).

| Check | Result |
|---|---|
| Graph validation | PASS |
| Product hub / descriptions / professional | PASS |
| Catalogue / missing-products closure | PASS |
| Search + public UX A/B/C | PASS |
| SEO indexability coherence | PASS |
| Category / surface / technology / knowledge hubs | PASS |
| Color audit (FB 53 scope) | PASS |
| Production `npm run build` | PASS |
| SSR Product Hub smoke (JUB + PPG sample) | PASS |

Details: `regression/SUMMARY.json`.

### Restore note

jub-v3 re-run restored enrichments; **6** roster products reclassified `REVIEW` solely for `review:weak_quotes:1` while editorial + 6 professional sections + TDS/SDS remained complete. Admitted under the **approved v8.2 PASS roster** (not a quality-gate relaxation for other REVIEW/HOLD).

## 3. Manufacturer / brand links

| Entity | ID | Role |
|---|---|---|
| Organization | `org_jub_hu` | manufactures all 95; owns brands |
| Brand (existing) | `brand_jub` | umbrella + residual JUB-labeled SKUs |
| Brands (new, noindex) | `brand_jupol`, `brand_jubizol`, `brand_jubin`, `brand_hydrosol`, `brand_jubolin`, `brand_akrinol`, `brand_takril`, `brand_acrylcolor` | hasProduct |
| Categories | `cat_dekor` (33), `cat_homlokzat` (20), `cat_epitesi` (40), `cat_faipar` (2) | belongsToCategory |
| Sources | page + TDS + SDS per product (285 source rows) | manufacturer |

## 4. Catalogue size

**190** = 53 + 42 + 95.

## 5. SEO / indexing

See `seo/SEO-NOTE.md`.

- All 95 JUB products: `noindex, follow`
- JUB brands/org: noindex
- Sitemap **37** (+1 = `cat_epitesi` product-backed unlock side-effect)
- No Google auto-open; B1-DOC-01 OPEN

## 6. Remaining blockers for *production* release

Not blockers for this local GO, but must be decided before deploy:

1. **Explicit production release approval** (commit/push/deploy still forbidden here).
2. **Index unlock policy** for JUB (currently locked noindex).
3. **`cat_epitesi` sitemap side-effect** — accept +1 URL or force category `indexable:false`.
4. **B1-DOC-01** remains OPEN (Google Ready).
5. **Poli-Farbe TDS gap** — separate track; 62 REVIEW + 11 HOLD; does not block JUB.
6. **JUB REVIEW/HOLD queue** (32 products) — not in catalogue.

Protected state verified locally: Final Four v7.3 / dirty HOLD tree / existing 95 / Google Ready dirty files not modified by this wave.

## 7. GO / NO-GO

| Scope | Recommendation |
|---|---|
| Local catalogue integration of JUB 95 PASS | **GO** |
| Production release / deploy | **NO-GO until explicit next decision** |

**Next decision:** production release of the 190-product catalogue (still with JUB noindex unless separately unlocked).
