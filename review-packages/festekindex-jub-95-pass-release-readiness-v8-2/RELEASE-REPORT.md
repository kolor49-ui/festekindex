# FESTÉKINDEX — JUB 95 PASS release readiness v8.2

**LOCAL ONLY — no commit / push / deploy / live DB write.**

Generated: 2026-10-30T19:01Z
Source run: `tools/mass-import/runs/jub-v3/`

## Verdict

**JUB quality pass succeeded.** Ready for a separate publish decision on the **95 PASS** products.

| Status | Count |
|---|---:|
| PASS | 95 |
| REVIEW | 24 |
| HOLD | 8 |
| ERROR | 0 |
| **Total** | **127** |

Elapsed: ~474s

## Document coverage

| Scope | TDS | SDS | Both |
|---|---:|---:|---:|
| All 127 | 118 | 121 | 116 |
| PASS only | 95 | 95 | 95 |

## PASS brands

- JUPOL: 25
- JUB: 24
- JUBIZOL: 18
- JUBIN: 7
- HYDROSOL: 7
- Jubolin: 5
- Akrinol: 5
- Takril: 2
- Acrylcolor: 2

## Why first pass was 0 PASS

JUB official TDS uses numbered HU sections (`1. Leírás, alkalmazás` …). The generic/PPG extractor did not map these → empty enrichment → REVIEW.

Fix (local mass-import only): `jub_tds.py` + `enrichment_jub.py` wired in `pipeline.py`.

## Poli-Farbe (parallel)

Run: `tools/mass-import/runs/poli-farbe-v3/`

| Status | Count |
|---|---:|
| PASS | 0 |
| REVIEW | 62 |
| HOLD | 11 |
| ERROR | 0 |

**0 PASS** — most product pages expose SDS only; official download “adatlap” library is SDS (not TDS). Quality gates not relaxed.

Poli-Farbe v2 stopped as redundant; artifacts kept under `runs/poli-farbe-v2/` + `STOP-NOTE.md`.

## Catalogue plan (publish decision pending)

- Current live: **95**
- + JUB PASS: **95**
- + Poli PASS: **0**
- **Planned size if only JUB PASS published: 190**

## SEO / locks

- No indexability unlock in this package
- New products remain **noindex** until explicit decision
- Google Ready v1 / Final Four v7.3 / dirty HOLD tree: not modified by this intake
- `auto_published`: false (pipeline)

## Not done here

- No Product Hub / `lib/data` merge
- No commit, push, deploy
- REVIEW/HOLD remain queued (`roster/*-IDS.txt`)
