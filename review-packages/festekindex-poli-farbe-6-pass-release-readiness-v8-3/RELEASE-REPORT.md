# FESTÉKINDEX — Poli-Farbe 6 PASS release readiness v8.3

**LOCAL ONLY — no commit / push / deploy / catalogue merge / manufacturer contact.**

Generated: 2026-10-30  
Source run: `tools/mass-import/runs/poli-farbe-v5/`

## Verdict

**Poli-Farbe quality recovery produced 6 local PASS drafts.** Ready for a **separate** integrate decision (codegen + `indexable: false`). This package does **not** publish.

| Status | Count |
|---|---:|
| PASS | **6** |
| REVIEW | 65 |
| HOLD | 2 |
| ERROR | 0 |
| **Total** | **73** |

Pipeline policy: `NEVER_AUTO_PUBLISH` / `publishable: false`.

## PASS roster (release candidates)

| product_id | name | Official tech source |
|---|---|---|
| `prod_poli_farbe_poli_farbe_platinum_egyretegu_belteri_falfestek` | Poli-Farbe Platinum egyrétegű beltéri falfesték | TDS PDF |
| `prod_poli_farbe_poli_farbe_platinum_feher_alapozo_festek` | Poli-Farbe Platinum Fehér Alapozó Festék | TDS PDF |
| `prod_poli_farbe_poli_farbe_boroka_vastaglazur` | Poli-Farbe Boróka vastaglazúr | TDS PDF |
| `prod_poli_farbe_poli_farbe_inntaler_premium_belteri_falfestek` | Poli-Farbe Inntaler Premium beltéri falfesték | Official product page |
| `prod_poli_farbe_poli_farbe_cellkolor_radiatorzomanc` | Poli-Farbe Cellkolor radiátorzománc | Official product page |
| `prod_poli_farbe_poli_farbe_cellkolor_univerzalis_korroziogatlo_alapozo` | Poli-Farbe Cellkolor univerzális korróziógátló alapozó | Official product page |

Full IDs: `roster/PASS-IDS.txt`, `roster/PASS-LIST.md`.

## What improved vs v3 (0 PASS)

- Manufacturer adapter + `poli_tds.py` / `enrichment_poli.py` (local mass-import only).
- Official product-page HTML sections used as **documented alt tech** where structured (not invented).
- SDS/TDS identity parsing fixed for Poli line brands; placeholder `UFI: egyedi` no longer weak-quotes PASS away.
- Quality gates **not** relaxed.

## HOLD / REVIEW (excluded)

- **HOLD (2)** — real identity mismatches; see `roster/HOLD-IDS.txt` + `notes/HOLD-REVIEW-REGISTRY.md`.
- **REVIEW (65)** — mostly missing Előkészítés and/or dedicated TDS PDF; stay in registry.
- Manufacturer contact **moratorium**: no email / doc request. Further recovery = public sources only.

## SEO / locks

- No indexability unlock in this package.
- If later integrated: products + any new brands remain **`indexable: false` / noindex, follow** until explicit unlock.
- Google Ready v1 / Final Four / dirty HOLD tree: not modified by this package.
- Org/brand shells `org_poli_farbe` / `brand_poli_farbe` already noindex.

## Not done here

- No `lib/data/imports/poli6V1/` codegen
- No `repository.ts` wiring
- No commit, push, deploy
- No manufacturer outreach

## Next decision (separate GO)

1. Optional: `codegen-poli6-v1.py` → overlay with `indexable: false` (JUB pattern).  
2. Local regression + integrity.  
3. Explicit publish/deploy approval (still noindex until Google wave unlock policy allows).
