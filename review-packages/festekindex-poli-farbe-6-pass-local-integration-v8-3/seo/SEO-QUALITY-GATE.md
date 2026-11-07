# SEO quality gate — Poli 6 PASS local integration v8.3

## Locks (unchanged)

| Szabály | Állapot |
|---|---|
| Product `indexable` | mind **false** (köztük a 6 Poli) |
| Sitemap termék URL | **0** local + production |
| Sitemap total | **36** (Google Ready v1) |
| Új Poli sub-brandek | `indexable: false` |
| `org_poli_farbe` / `brand_poli_farbe` | noindex (megőrzött) |
| Design | nem változott |

## Ellenőrzés

- `scripts/test-seo-indexability-coherence-v1.ts` → OK (`regression/03-seo`)  
- Local: `poliInSitemap: 0`, `productInSitemap: 0`, `sitemapCount: 36` (`gates/LOCAL-CATALOGUE.json`)  
- Production sitemap: 36 loc, 0 termék (`gates/PRODUCTION-SITEMAP.json`)  
- Production Poli URL: 404 (`gates/PRODUCTION-LIVE-CHECK.json`)

## Várható SEO-hatás

| Fázis | Hatás |
|---|---|
| Most (local only, no deploy) | **Nincs** public SEO-hatás |
| Deploy + noindex (ha külön GO) | URL-ek elérhetők, robots noindex; sitemap nem nő termékekkel |
| Index unlock (nincs GO) | Tilos ebben a csomagban |

## Fennmaradó hiányok

- Poli (és JUB) **nincs** productionön → nincs élő termékoldal.  
- 65 REVIEW + 2 HOLD továbbra is kívül (szándékos).  
- Termékek Google-láthatósága külön unlock hullámig zárva.  
- Manufacturer contact moratórium: további PASS bővítés csak public forrásból.
