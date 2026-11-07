# FESTÉKINDEX — v8.1 Katalógus GO LIVE — staging validation

**Döntés:** **CONDITIONAL GO — LOCAL RELEASE COMMIT READY**  
**STOP:** production deploy / push **nincs** végrehajtva — külön végső jóváhagyás kell.

Commit (local only): `c389819` — *Ship PPG Trilak 42 PASS catalogue expansion with maker profiles.*

---

## 1. Pontosan mely fájlok kerülnek a kiadásba?

27 fájl a `c389819` commitban (HOLD nélkül):

- `lib/data/imports/ppgTrilak42V1/*` (8 fájl: overlay)
- `lib/data/brands.ts`
- `lib/data/organizations.ts`
- `lib/data/relations.ts`
- `lib/data/sources.ts`
- `lib/data/repository.ts`
- `lib/data/imports/allRelations.ts`
- `lib/data/imports/festekBazisEnrichmentV1/missingProductsClosureV1.ts` (count helpers only)
- `scripts/validate-graph.ts` + 10 regressziós tesztfájl
- `tsconfig.json` (`review-packages`/`tmp`/`tools` exclude)

**Kizárva:** 4 dirty HOLD enrichment fájl; `review-packages/` / `tmp/` / `tools/`; helyi logo `app/globals.css` + `HomeExplorer.tsx` dirty; REVIEW/HOLD termékek.

Bizonyíték: `gates/STAGED-FILES.txt`, `gates/UNSTAGED-HOLD.txt`.

---

## 2. Hány gyártó, márka és termék lesz elérhető?

| Entitás | Darab | Megjegyzés |
|---|---|---|
| Termék | **95** | 53 FB + 42 PPG PASS |
| PPG márkák | Héra + Trinát + Lazurán | Héra indexelhető; Trinát/Lazurán **noindex** |
| Új gyártói profilok | **7** org (+ brand) | Poli-Farbe, JUB, Remmers, Meffert/Düfa, Egrokorr, Caparol/thenordicmark, REVCO — **noindex**, 0 terméklista |
| PPG org | `org_ppg_trilak` | megőrzött, indexelhető |

REVIEW 31 + HOLD 1: **nincs** a katalógusban.

---

## 3. Sikerült-e a dirty HOLD állapotot teljesen kizárni?

**Igen.** HOLD 4 fájl továbbra is dirty/unstaged; a commit diffben nem szerepelnek. Final Four v7.3c SHA **MATCH**.

---

## 4. Minden teszt és build sikeres?

**Igen.** Teljes releváns regresszió + `npm run build` OK (`regression/`).

Local staging (`next start :3010`): minden ellenőrzött path **HTTP 200**, SSR tartalom megvan.

---

## 5. Mely oldalak indexelhetők és melyek noindex?

### Indexelhető (megőrzött / nem romlott)
- Org pl.: PPG TRILAK, FESTÉK BÁZIS, Graco, … (7)
- Brand pl.: Héra, VALMOR, FACTOR, COROR, Graco, … (9)
- Meglévő hub/list/tudás sitemap URL-ek (összesen sitemap **36**, **0** termékdetail)

### noindex, follow (zárva)
- **Mind a 95 termék**
- Trinát, Lazurán
- 7 új gyártói org + brand profil
- Surfaces / alkalmatlan legacy thin profilok

Staging minta: termékek `robots=noindex, follow` + canonical OK; Héra/PPG `index, follow`.

---

## 6. Van-e fennmaradó élesítési akadály?

1. **Push nincs** — local commit only.
2. **Production deploy nincs** — külön GO kell.
3. Google termékindex unlock **szándékosan zárva** (külön SEO döntés).
4. Dirty HOLD tree továbbra is a worktree-ben (nem a release commitban).
5. Helyi nem-release dirty: `app/globals.css`, `HomeExplorer.tsx` (logo) — ne keveredjen a deploy scope-ba.
6. B1-DOC-01 claim-mátrix open (SEO unlock előtt).

---

## 7. Egyértelmű GO / NO-GO javaslat

| Lépés | Javaslat |
|---|---|
| Release isolation + staging validation | **GO** |
| Local release commit `c389819` | **GO (kész)** |
| Push origin | **NO-GO** külön jóváhagyásig |
| Production deploy | **NO-GO** külön jóváhagyásig |
| Google index unlock (termékek) | **NO-GO** |

**Összegzés:** A 95 termékes katalógusbővítés **staging-validált és izolált commitban készen áll**. A következő döntés: push + production deploy.
