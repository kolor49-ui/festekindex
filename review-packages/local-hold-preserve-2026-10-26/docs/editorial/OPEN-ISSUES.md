# FESTÉKINDEX Editorial — Open Issues

Internal register. Not a public Product Hub surface.

## Status snapshot (reconciled)

| Bucket | Count | Notes |
|---|---:|---|
| Independently accepted / pilot / original PASS (pre–Batch 3) | 19+1 | Pilot 3 + Batch 1 (8) + Batch 2 (8) + `ORIGINAL_PASS` (1) — Batch 2 release SHA `c2d010b` |
| Batch 3 **production live**, independent review **pending** | 8 | Release SHA `098be82` — see B3-RECON |
| `REMAINING_FAIL` | 24 | Later editorial batches |
| `REMAINING_REVIEW` | 1 | `prod_coror_aromatic` |
| **Catalogue total** | **53** | All Products `noindex` |

Terminology lock (public labels): Műszaki adatlap / Biztonsági adatlap — SHA `089b02f`.

---

## Active — Batch 1 / pilots

### B1-CLOSURE-01 — COROR Rapid Korróziógátló Alapozó existing-coating ambiguity
**Product:** `prod_coror_rapid_primer`  
**Status:** OPEN — documented source limitation  
TDS Application lists previously painted / enamelled substrates; Prep requires complete removal of dirt, old coatings and loose rust. No official retain criteria. Public description must not invent a retain rule. Manufacturer clarification draft prepared; not sent without approval.

### PILOT-01 — FACTOR Pergola dilution distinction
**Product:** `prod_factor_pergola`  
**Status:** OPEN — publication-readiness note  
Manufacturer distinguishes primer-related dilution (1:2) vs up to 5% water for topcoat application. Preserve clear separation in public text.

### PILOT-02 — COROR Rapid Zománcfesték missing dedicated SDS sourceId
**Product:** `prod_coror_rapid_enamel`  
**Status:** OPEN  
Do not fabricate an SDS source record.

### PILOT-03 — VALMOR AIR FLOW plaster moisture 35%
**Product:** `prod_valmor_airflow_interior` (related AIR FLOW docs)  
**Status:** OPEN — accepted with limitation  
Do not invent measurement method or broaden into an unsupported universal threshold.

### B1-DOC-01 — Claim matrix Hungarian exactClaim linkage
**Status:** OPEN — before later Product SEO Quality Gate  
Batch 1 technical claim matrix still uses English claim summaries in parts of `exactClaim`. Link each claim to exact Hungarian public text before SEO unlock work.

## Catalogue remainder (not in this release)

- Remaining original FAIL Products: continue under Editorial Standard v1 in later batches.
- Remaining REVIEW: `prod_coror_aromatic` (not rewritten in Batch 1).

---

## Batch 2 (production released)

**Release SHA:** `c2d010bc7859d087325342557666020d937feb37`  
**CSV status:** `PASS_BATCH_2` (8 Products)

### B2-NOTE-01 — Hőtükör manufacturer performance claims
**Products:** `prod_valmor_airflow_heat_mirror_paint`, `prod_valmor_airflow_heat_mirror_paste`  
Attributed as manufacturer statements (comfort / heat-loss / mould / savings). Do not convert into independent measured guarantees.

### B2-NOTE-02 — Aqua-Tech durability wording
**Product:** `prod_valmor_aqua_tech`  
TDS mentions >10 years under proper application — kept as manufacturer statement, not warranty.

### B2-NOTE-03 — Xclusive fragrance / antibacterial options
**Product:** `prod_valmor_xclusive`  
Lavender scent and optional antibacterial additive attributed to manufacturer.

### B2-FQ / B2-FC — closed for production release
Final quality / closure notes applied before `c2d010b`. Carry-forward only where product-specific notes above remain relevant.

---

## Batch 3 — documentation reconciliation

### B3-RECON — Production live; independent review still open
**Products:** `prod_7016_pergola`, `prod_valmor_liquid_foil`, `prod_7016_exterior`, `prod_valmor_stone_balm`, `prod_valmor_touchline`, `prod_factor_floor_enamel`, `prod_valmor_mold_paint`, `prod_valmor_airflow_fixative`  
**Git release:** `098be821e45b82bb440c971ff3a744a898f7c58d` (`feat: publish batch 3 descriptions and use Műszaki adatlap wording`)  
**Production check (2026-10-09):** all eight public Product URLs return HTTP 200 with Batch 3 lead text present; robots `noindex, follow`.  
**CSV status:** `PRODUCTION_LIVE_PENDING_INDEPENDENT_REVIEW` / `plannedRewriteBatch=batch_3_released`  
**Independent editorial acceptance:** **NOT documented** in-repo (review package exists as `review-packages/festekindex-editorial-batch-3-review-v1.zip`; no signed acceptance record). Do not treat Batch 3 as independently accepted PASS.

### B3-NOTE-01 — Mold paint claim scope
**Product:** `prod_valmor_mold_paint`  
Manufacturer states the coating inhibits wall-mold formation. Public text must not claim medical benefit, structural moisture cure, or permanent prevention. Existing mold must be cleaned per Műszaki adatlap before painting.

### B3-NOTE-02 — Liquid foil permanent water load
**Product:** `prod_valmor_liquid_foil`  
Not for permanent water load; Műszaki adatlap points to COROR chlorinated rubber or VALMOR Aqua-Tech instead. Under-tile use only.

### B3-NOTE-03 — Floor enamel cure vs walkability
**Product:** `prod_factor_floor_enamel`  
Keep distinct: 16 h recoat/walkable at 25 °C; intensive use after 3 days; non-floor surfaces may recoat within 1 h or after full dry.

### B3-NOTE-04 — 7016 Pergola five-year durability
**Product:** `prod_7016_pergola`  
Manufacturer durability mention retained as attribution, not FESTÉKINDEX warranty. Do not merge with FACTOR Pergola data.


---

## Batch 4 (local — independent review package)

### B4-SCOPE — Eight REMAINING_FAIL Products rewritten locally
**Products:** `prod_7016_plaster`, `prod_7016_enamel`, `prod_valmor_plinth`, `prod_valmor_floor`, `prod_valmor_airflow_facade`, `prod_factor_aqua_parquet`, `prod_valmor_plaster`, `prod_valmor_textured`  
**Status:** `PASS_PENDING_INDEPENDENT_REVIEW` / `plannedRewriteBatch=batch_4_local`  
Selected by highest prior originality coverage among remaining FAIL. Official page + Műszaki adatlap retrieved 2026-10-09. **No commit/push/deploy** until independent acceptance.

### B4-NOTE-01 — Floor coating cure vs walkability vs intensive use
**Product:** `prod_valmor_floor`  
Keep distinct: átfestés/lépésállóság 4 óra (25 °C); esőállóság/teljes száradás 24 óra; intenzív használat 3–5 nap.

### B4-NOTE-02 — 7016 enamel food/child exclusion
**Product:** `prod_7016_enamel`  
Public text must retain exclusion for children’s furniture/toys and food/feed/drinking-water contact surfaces.

### B4-NOTE-03 — Textured coating cleanability limits
**Product:** `prod_valmor_textured`  
Matt textured film has limited cleanability; do not oversell washability vs garage / safe-floor alternatives.


### B4-FQ-01 — 7016 acrylic enamel recoating table vs application timing
**Product:** `prod_7016_enamel`  
**Status:** OPEN — manufacturer-source ambiguity  
Műszaki adatlap page 1 table: átfesthetőség 1–5 óra (25 °C). Application text: 1 óra after first layer, 6 óra after second. Public text reports both; no invented unified interval. Manufacturer not contacted.

### B4-FQ-02 — Safety datasheet wording corrected (Batch 4)
**Products:** all eight Batch 4 Products  
Replaced „Biztonsági adatlap kötelező” with manufacturer-aligned „Használat előtt olvassa el a Műszaki adatlapot és a Biztonsági adatlapot” based on official „töltse le a Műszaki és Biztonsági adatlapokat” instruction.
