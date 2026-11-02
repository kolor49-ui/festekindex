# FB-parity gate v1

**Purpose:** Autonomous quality bar so product Google unlock does not need manual page-by-page review.

**Run:** `npx tsx scripts/test-fb-parity-v1.ts`

## PASS_PARITY means

| Check | Rule |
|---|---|
| Published | `status === published` |
| Sources | ≥1 `sourceIds` |
| Editorial | `editorialSummary` ≥ 40 chars |
| Professional | sections present; body ≥ 120 chars |
| SEO text | same thresholds via `productSeoText` |
| Marketing ban | Editorial Standard fluff phrases absent |
| Identity | incoming `hasProduct` (brand or family) |
| Category | `belongsToCategory` edge (3 legacy FB primers/glett excepted; no new exceptions) |

## Unlock policy

1. **Fill** manufacturer overlays **noindex** (existing mass-import path).
2. Enrich to FB depth from official page/TDS only — no invention.
3. Run **FB-parity gate** — FAIL stays noindex.
4. Operator **GO** only on PASS_PARITY cohort (allowlist + flag).
5. Currently unlocked: Festék Bázis 53 + PPG Trilak 42 + JUB 95 + KEMIKÁL 107 + Baumit 165 + Caparol 119 — must remain parity PASS.
   Other overlays stay noindex until a separate cohort GO.

## Operator time

You do not review copy. Green gate + one-line GO is enough.
