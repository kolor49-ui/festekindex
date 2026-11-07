# FESTÉKINDEX — Poli-Farbe 6 PASS local integration v8.3

**LOCAL ONLY — nincs commit / push / deploy / index unlock / gyártói kapcsolat.**

Generated: 2026-10-30  
Overlay: `lib/data/imports/poli6V1/` (JUB/PPG mintájára)  
Codegen: `scripts/codegen-poli6-v1.py`

---

## Verdict (rövid)

| Döntés | Állapot |
|---|---|
| **LOCAL integráció (6 PASS)** | **GO** — kész, regresszió zöld |
| **Production deploy / publikálás** | **NO-GO** — nem kérve; élőn 404 |
| **JUB 95 éles** | **NEM éles** — production 404; csak local |
| **65 REVIEW + 2 HOLD** | **Kizárva** — leak = 0 |

---

## 1. Integrált termékek (6 PASS)

| ID | Márka | Kategória (rel) |
|---|---|---|
| `prod_poli_farbe_poli_farbe_boroka_vastaglazur` | `brand_poli_boroka` | faipar |
| `prod_poli_farbe_poli_farbe_cellkolor_radiatorzomanc` | `brand_poli_cellkolor` | ipari |
| `prod_poli_farbe_poli_farbe_cellkolor_univerzalis_korroziogatlo_alapozo` | `brand_poli_cellkolor` | ipari |
| `prod_poli_farbe_poli_farbe_inntaler_premium_belteri_falfestek` | `brand_poli_inntaler` | dekor |
| `prod_poli_farbe_poli_farbe_platinum_egyretegu_belteri_falfestek` | `brand_poli_platinum` | dekor |
| `prod_poli_farbe_poli_farbe_platinum_feher_alapozo_festek` | `brand_poli_platinum` | dekor |

- Gyártó: `org_poli_farbe` (manufactures)  
- Umbrella márka: `brand_poli_farbe` (meglévő) + 4 új sub-brand (`boroka`, `cellkolor`, `inntaler`, `platinum`)  
- Minden termék: `status: published`, **`indexable: false`**  
- Források: hivatalos `polifarbe.hu` termékoldal + elérhető TDS/SDS  
- Editorial + professional description: overlay-ből, forrásolt

Roster: `roster/PASS-IDS.txt` · kizárás: `REVIEW-IDS.txt` (65), `HOLD-IDS.txt` (2)  
Bizonyíték: `gates/EXCLUSION-PROOF.json` (leakReview=[], leakHold=[])

---

## 2. Katalógusméret

### Production baseline (ellenőrzött, éles)

| Réteg | Éles? | Bizonyíték |
|---|---|---|
| Festék Bázis + PPG 42 (~**95** termék) | **Igen** (go-live v8.1) | Élő Héra termék HTTP 200 |
| JUB 95 | **Nem** | `…/jub-jupol-gold` → **404** |
| Poli 6 | **Nem** | `…/poli-farbe-boroka-vastaglazur` → **404** |
| Sitemap | 36 URL, **0** `/termekek/` | `gates/PRODUCTION-SITEMAP.json` |

**Éles katalógusméret (production baseline): 95 termék.**  
JUB és Poli **nem** számítanak élesnek.

### Local (ez a csomag után)

| Réteg | Db |
|---:|
| Festék Bázis closure | 53 |
| PPG Trilak PASS | 42 |
| JUB PASS (local only) | 95 |
| Poli-Farbe PASS (local only) | **6** |
| **Összesen local** | **196** |

Forrás: `gates/LOCAL-CATALOGUE.json`

---

## 3. Regresszió / build / SEO

Mind **OK** (`gates/REGRESSION-SUMMARY.json` — 20/20):

validate-graph · tsc · SEO coherence · product-hub · search · UX A/B/C · build · category · professional · description · catalogue/missing closure · color · surface · technology · knowledge (+ content) · color-audit

---

## 4. SEO (változatlan szabályok)

Lásd `seo/SEO-QUALITY-GATE.md`.

- Index/noindex szabályok **nem** változtak.  
- Új Poli termékek + új sub-brandek: **noindex**, **nincs** sitemap.  
- Local sitemap továbbra is **36** (Google Ready v1 megőrizve).  
- Designváltoztatás: **nincs**.

**Várható SEO-hatás deploy nélkül:** nulla.  
**Deploy után (ha külön GO jön):** noindex termékoldalak megjelenhetnek URL-en, de nem kerülnek sitemapbe / nem indexelendők, amíg unlock nincs.

---

## 5. Védett

- Final Four v7.3 — nem módosítva ebben a körben  
- Dirty HOLD tree — nem nyúlva  
- Korábbi jóváhagyott release-ek — érintetlenek  
- 65 REVIEW + 2 HOLD — kívül a katalóguson

---

## 6. Nem történt

- Commit / push / deploy / Vercel publish  
- Index unlock / sitemap bővítés termékekkel  
- Gyártói megkeresés  
- Design / UI redesign
