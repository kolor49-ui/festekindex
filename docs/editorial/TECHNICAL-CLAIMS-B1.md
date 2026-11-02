# TECHNICAL-CLAIMS B1 — HU exactClaim linkage

Source: editorial Batch 1 final closure claim matrix (`TECHNICAL-CLAIMS.csv`).

| Metric | Count |
|---|---:|
| Atomic claims | 163 |
| HU `exactClaim` linked from `sourceEvidence` | 163 |
| Still English-only | 0 |

## B1-DOC-01

**Status: CLOSED (2026-11-02)**

Each `exactClaim` now stores the verified Hungarian source fragment from `sourceEvidence` (TDS / official page quote), not the English working summary.

Canonical files:

- [`TECHNICAL-CLAIMS-B1.csv`](TECHNICAL-CLAIMS-B1.csv) — public claim matrix
- [`TECHNICAL-CLAIMS-B1-HU-LINKAGE-AUDIT.csv`](TECHNICAL-CLAIMS-B1-HU-LINKAGE-AUDIT.csv) — before/after + linkage method

## Gate note

Closing B1-DOC-01 unblocks **product SEO unlock preparation**. It does **not** flip any product `indexable` flag. Product Google unlock still requires a separate cohort GO.
