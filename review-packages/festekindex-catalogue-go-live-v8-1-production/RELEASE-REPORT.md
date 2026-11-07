# FESTÉKINDEX — v8.1 PRODUCTION GO LIVE

**Döntés:** **GO COMPLETE (verified on live)**  
**SEO unlock:** **NEM** — termékek és új profilok noindex maradtak.

## Production deploy

| Mező | Érték |
|---|---|
| Git HEAD / `origin/main` | `b3fd3f6` |
| Catalogue release commit | `c389819` (ancestor of HEAD) |
| Post-release UI commits on prod | `e1aebac`, `b3fd3f6` (csak `HomeExplorer` + `globals.css`) |
| GitHub Deployment ID | `7443854323` |
| Environment | Production |
| State | **success** (`Deployment has completed`) |
| Created | 2026-10-30T16:46:21Z |
| Vercel target | `https://festekindex-56ocggs1y-kolor49-7303s-projects.vercel.app` |
| Public domain | `https://festekindex.hu` |

**Push:** nem volt szükséges ebben a körben — `origin/main` már tartalmazza a release-t (`ahead 0`).  
**Új deploy trigger:** nem volt szükséges — a legfrissebb Production deploy már a release-t tartalmazó SHA-n sikeres.

## Isolation proof (logo / revert / re-isolation)

Net data range `f319091..HEAD` (PPG előtti tiszta pont → éles HEAD):

- Csak a jóváhagyott katalógus/adat + tesztek + `tsconfig` / `validate-graph` változások.
- HOLD 4 fájl: **nincs** a pushed range-ben (`HOLD_ABSENT_IN_PUSHED_RANGE`).
- Logo-commit (`00aee94`) véletlen PPG staging után revert (`8f6a132`), majd tiszta újraizolálás (`c389819`).
- `c389819` után csak UI polish (`e1aebac`, `b3fd3f6`) — **nincs** adat/HOLD/REVIEW.

## Counts (committed HEAD + live)

| Entitás | Szám | Megjegyzés |
|---|---|---|
| Termék | **95** | 53 Festék Bázis + 42 PPG PASS |
| PPG PASS élő URL | **42/42 HTTP 200** | mind `noindex, follow` + H1 |
| REVIEW / HOLD PPG | **0** | nem a katalógusban |
| Márkák (repo) | 22 | Héra indexelhető; Trinát/Lazurán noindex |
| Gyártók/org (repo) | 16 | 7 új maker noindex; PPG indexelhető |
| Sitemap | 36 | **0** termékdetail URL |

Márkakapcsolat (PPG 42): Héra 19 / Trinát 18 / Lazurán 5.

## Ellenőrzések

| Gate | Eredmény |
|---|---|
| Integrity (95, duplikáció, TDS/SDS, brand) | PASS |
| Full regression + production build (HEAD) | PASS |
| Final Four v7.3c SHA | MATCH `27e740ed…0582` |
| Dirty HOLD a commitban | KIZÁRVA |
| Live PPG 42 termékoldal | **42/42 OK** |
| Live Héra / PPG org | 200, `index, follow` |
| Live Trinát / Lazurán / Poli-Farbe / JUB / Egrokorr | 200, `noindex, follow` |
| Live sitemap termékdetail | **0** |

## SEO (változatlan zárás)

- **95/95 termék:** `noindex, follow` + canonical megvan.
- **Trinát, Lazurán, 7 új gyártói profil:** noindex.
- **Korábban indexelhető oldalak** (pl. Héra, PPG TRILAK, meglévő A-kör): indexelhetők maradtak.
- Nincs általános Google-index unlock.
- Nincs SEO miatti designmódosítás.

### Fennmaradó SEO-hiányok (nem blokkolják a katalógus-élesítést)

1. Termékindex unlock külön döntés.
2. Trinát/Lazurán + 7 maker noindex unlock külön döntés / editorial body.
3. B1-DOC-01 claim-mátrix HU `exactClaim` linkage open.
4. Thin legacy brand/org quality fail-ek (Mirka, Interpon, Milesi, Sika, …).

## Hibák / eltérések / blokkolók

- **Nincs élesítési hiba** a kötelező kapukon.
- Worktree-ben továbbra is dirty HOLD 4 fájl + helyi untracked review/tmp/tools — **nem** a production SHA része.
- GitHub Actions run lista üres ebben a repóban; az élesítés Vercel Production deploymenten keresztül ment.

## Rollback

| Opció | SHA | Hatás |
|---|---|---|
| Pre-PPG katalógus | `f319091` | Vissza 53 termékhez (PPG/márka/maker nélkül) |
| Immediate parent of release | `8f6a132` (`c389819^`) | Ugyanaz: PPG előtt, logo-revert után |
| Vercel | Redeploy previous Production deployment | Gyors rollback a Vercel UI/CLI-n |

Rollback parancs (csak külön GO után): előző stabil SHA checkout/revert + push, vagy Vercel previous deployment promote.

## Végső javaslat

| Lépés | Állapot |
|---|---|
| Isolation + checks | **PASS** |
| Push | **már az origin/main-en** |
| Production deploy | **SUCCESS** (`7443854323`) |
| Live 95-termék katalógus | **ELÉRHETŐ** |
| Google index unlock | **NO-GO** (külön lépés) |
