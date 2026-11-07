# FESTÉKINDEX — GOOGLE READY v1 JELENTÉS

**Dátum:** 2026-10-30  
**Hatáskör:** helyi nyelvi + SEO javítások (nincs commit / push / deploy / index-megnyitás)  
**Termékszám:** 95 (változatlan)  
**Final Four v7.3 / dirty HOLD enrichment:** érintetlen commit-scope-ban (előzetesen dirty `festekBazisEnrichmentV1/*` nem része ennek a GO-nak)

---

## 1. Nyelvi hibák javítva

**~55 nyilvános szövegjavítás** (központi sablon + adat + OCR), részletezve:

| Csoport | Db (kb.) | Példa |
|--------|----------|--------|
| Központi H2 / meta sablonok | 12 | `Mi a X?` → `X bemutatása`; meta fallback |
| Reláció nyilvános címkék | 4 | „Entitások…” → „Elemek…” |
| UI / kereső szóhasználat | 4 | Cégek; Kiemelt márkák és cégek |
| Organization body | 10 | fejlesztői relation-szöveg kiszedve |
| Brand body / short | 6 | owns / entitás kiszedve |
| Category / surface / tech | ~16 | gépies SEO / entitás |
| Héra OCR (PPG Trilak) | 12 termék × source+editorial | `falfest ékek`, `egyaránt`, `történtő`, `kötőanyagű` stb. |
| Hub SEO filter | 3 | brand/product/technology scrub |

**SEO-hatás:** kevesebb gépies H2, tisztább snippet-jelölt szöveg, kevesebb „entitás/relation” zaj a SERP előnézetben. Design változatlan.

---

## 2. Fejlesztői tartalom eltávolítva a nyilvános megjelenésből

**~22 nyilvános developer-leak** javítva / kiszűrve:

- `entitás` / `Entitások` címkék
- `Organization` / `ProductFamily` / `hasProduct` / `owns relation` mondatok
- „Kapcsolati háló” → „Kapcsolódó elemek”
- Gépies „Mi a …?” címsablon
- Nyers adatbázis-kapcsolat bemondások org/brand body-kban

*(JSON modellben továbbra is van belső `type: "organization"` — ez nem HTML-leak.)*

---

## 3. Termékoldal INDEX READY

**0 / 95**

Minden termék `evaluatePublicIndexability` → **NOINDEX** (meglévő policy; külön GO LIVE-ig változatlan).  
Héra OCR javítások **nem** nyitnak indexelést.

---

## 4. Gyártói és márkaoldal INDEX READY

| Típus | Policy indexable (sitemap) | Megjegyzés |
|-------|----------------------------|------------|
| Organization | **7** | Graco Inc., Euroll, Wagner Group, Akzo Nobel, Sika Hungária, M.L.S., FESTÉK BÁZIS Zrt. |
| Brand | **9** | Graco, Wagner, Dulux, Sikkens, International, Héra, VALMOR*, FACTOR*, COROR* |

\*VALMOR / FACTOR / COROR: body üres, Hub override → policy indexable; tartalom hubból.

**B — FIX BEFORE INDEX (példa):** `org_ppg_trilak` (body 115 &lt; 120), European Aerosols (thin), Mirka/Interpon/Milesi stb.

---

## 5. NOINDEX maradjon

| Csoport | Db |
|---------|-----|
| Product | **95** |
| Organization (blocked) | **9** |
| Brand (blocked) | **13** |
| Surface | **15** (összes) |
| Technology (blocked) | **8** |
| Category (blocked) | **14** |
| ProductFamily (blocked) | **5** |

Összesen: **sitemap kívül maradó entitás-oldalak + mind a 95 termék**.

---

## 6. B1-DOC-01 lezárható-e?

**Nem. OPEN marad.**

`docs/editorial/OPEN-ISSUES.md`: claim-mátrix HU `exactClaim` linkage hiányos.  
→ **termék SEO unlock tilos**, amíg nincs lezárva.  
Az org/brand/hub első hullámot **nem** blokkolja közvetlenül, de termékhullámot igen.

---

## 7. Tesztek és build

| Ellenőrzés | Eredmény |
|------------|----------|
| `validate-graph` | OK (ismert warning-ek) |
| `tsc --noEmit` | OK |
| SEO indexability coherence v1 | OK (M4: Héra kiesett a thin override-ból → 4) |
| Product Hub v2.1 | OK |
| UX A / B / C search | OK |
| Catalogue + missing products closure | OK |
| Search v1 | OK |
| Category / Knowledge / Surface hub | OK |
| `npm run build` | OK |
| Sitemap count | **36** |
| robots.txt | `allow: /` + sitemap host |

**SEO-hatás a tesztekben:** Héra brand már base quality-n is átmegy; Sika org indexable; Dulux body ≥120.  
**Index policy:** termékek továbbra is noindex (szándékos).

---

## 8. Ami még akadályozza a Google-indulást

1. **Nincs commit / deploy** ezekre a nyelvi+SEO javításokra (jelen GO korlát).  
2. **Külön GO LIVE döntés** kell az indexelés tényleges megnyitásához.  
3. **95 termék NOINDEX** + **B1-DOC-01 OPEN**.  
4. Vékony / flag_noindex org–márka profilok (PPG TRILAK body thin, Trinát/Lazurán, stb.).  
5. Surface hubok mind noindex.  
6. Dirty HOLD enrichment tree továbbra is külön ág — **ne menjen fel** ezzel a csomaggal.  
7. Search Console / property / első beküldés még nem történt (külön lépés).

---

## 9. Első hullám URL-ek (INDEX READY — sitemap = kanonikus)

Jelenlegi helyi sitemap (**36**). Javasolt döntés: **INDEX** (org/brand/hub/lista), termék **nincs** benne.

### Listák / home
| URL | Típus | Jelenlegi | Javaslat | Indok |
|-----|-------|-----------|----------|-------|
| `/` | Home | sitemap | INDEX | Egyedi brand + kereső |
| `/cegek` | Org lista | sitemap | INDEX | Nav hub |
| `/markak` | Brand lista | sitemap | INDEX | Nav hub |
| `/technologiak` | Tech lista | sitemap | INDEX | Nav hub |
| `/kategoriak` | Cat lista | sitemap | INDEX | Nav hub |
| `/tudastar` | Knowledge lista | sitemap | INDEX | Nav hub |
| `/termekcsaladok` | Family lista | sitemap | INDEX | Nav hub |
| `/termekek` | Product lista | sitemap | INDEX* | Lista; egyedi termékek noindex |
| `/feluletek` | Surface lista | sitemap | INDEX* | Lista; surface detail noindex |

\*Lista indexelhető; részletező oldalak külön szabály szerint noindex.

### Organizations (7)
`/cegek/akzo-nobel-coatings`, `/cegek/euroll-hungaria`, `/cegek/festek-bazis-zrt`, `/cegek/graco-inc`, `/cegek/mls-magyarorszag`, `/cegek/sika-hungaria`, `/cegek/wagner-group`

### Brands (9)
`/markak/coror`, `/markak/dulux`, `/markak/factor`, `/markak/graco`, `/markak/hera`, `/markak/international`, `/markak/sikkens`, `/markak/valmor`, `/markak/wagner`

### Categories (5)
`/kategoriak/dekor-es-falfestek`, `/kategoriak/homlokzat-es-hoszigeteles`, `/kategoriak/ipari-bevonat-es-korroziovedelem`, `/kategoriak/porfestek`, `/kategoriak/szoras-es-alkalmazastechnika`

### Technology (1)
`/technologiak/porfestek-bevonat`

### ProductFamily (3)
`/termekcsaladok/graco-gx`, `/termekcsaladok/graco-mark-vii`, `/termekcsaladok/graco-ultra`

### Knowledge (2)
`/tudastar/airless-festekszoras-alapok`, `/tudastar/porfestek-es-folyadek-bevonat`

### Hiányzó feltételek az élesítéshez
- Deploy a jelenlegi nyelvi diff-fel (HOLD enrichment **nélkül**)
- Külön GO LIVE + opcionális GSC sitemap submit
- Termékek: B1-DOC-01 + claim ellenőrzés után

---

## GO / NO-GO

### **NO-GO** — Google-indexelés első hullámának **élesítése most**

Okok: nincs commit/deploy; index-policy szándékosan változatlan a külön GO LIVE-ig; termékek zárva; B1-DOC-01 open.

### Helyi készenlét

**READY FOR SEPARATE GO LIVE (wave-1 only):** a fenti **36 sitemap URL** nyelvileg és SEO-regresszió szempontjából alkalmas első hullámra, **95 termék nélkül**, a jelenlegi noindex termékpolicy mellett.

**Következő lépés (külön utasításra):** commit scope szűrése → staging/prod deploy → explicit „Google wave-1 OPEN” döntés → GSC.
