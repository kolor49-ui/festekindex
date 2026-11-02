#!/usr/bin/env python3
"""Generate lib/data/imports/mapeiV1 from public mapei.com/hu product pages (WebFetch facts).

Bot-wall blocks raw curl; facts taken from publicly reachable product pages only.
Noindex. Thin pages (insufficient body) excluded — no invention.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "lib/data/imports/mapeiV1"
ACCESSED = "2026-11-02"
ORG_ID = "org_mapei"
BRAND_ID = "brand_mapei"

# Rewritten from public HU product pages (facts only).
PRODUCTS = [
    {
        "slug": "quarzolite-pittura",
        "name": "QUARZOLITE PITTURA",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/quarzolite-pittura",
        "class": "architectural_coating",
        "cat": "cat_homlokzat",
        "editorial": (
            "A QUARZOLITE PITTURA kvarc alapú akrilfesték, egységesítő hatású és tartós kültéri-beltéri "
            "falbevonat. A Mapei nyilvános oldala szerint új és megfelelően előkészített, korábban "
            "bevont homlokzatokra is alkalmas; ellenáll agresszív környezeti hatásoknak és UV-sugárzásnak, "
            "enyhén texturált felületet ad, ColorMap színezéssel."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Homlokzatok és falak festése — új vagy korábban bevont, megfelelően előkészített "
                "aljzatokon. A nyilvános leírás szerint tartós védelmet és egységes felületet ad, "
                "UV-álló, magas fedőképességű, ColorMap rendszerrel színezhető.",
            ),
            (
                "Termékleírás",
                "Kvarc bázisú akril festék. Egységesítő tulajdonság, tartós védelem, tapadás az "
                "alapfelülethez, UV-állóság, időjárás-állóság, magas fedőképesség — a mapei.com HU "
                "termékoldal alapján.",
            ),
        ],
    },
    {
        "slug": "elastocolor-pittura",
        "name": "ELASTOCOLOR PITTURA",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/elastocolor-pittura",
        "class": "architectural_coating",
        "cat": "cat_beton",
        "editorial": (
            "Az ELASTOCOLOR PITTURA elasztomer, repedésáthidaló festék beltéri és kültéri használatra. "
            "A Mapei szerint különösen betonépítmények karbonátosodás elleni védelmére és "
            "mikrorepedéses, penésznek-algának kitett homlokzatokra való; vizes diszperziós "
            "elasztomer akrilgyanta alapú, ColorMap színválasztékkal."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Beltéri és kültéri beton- és vakolt felületek védő és dekoratív festése. "
                "Karbonátosodásgátló, repedésáthidaló; penész és algák elleni védelem a nyilvános "
                "termékleírás szerint. Ideális betonhoz.",
            ),
            (
                "Termékleírás",
                "Egykomponensű, vizes diszperziós elasztomer akrilgyanta festék. Tartós rugalmasság, "
                "kémiai ellenállás, karbonátosodásgátlás, repedésáthidalás — mapei.com HU oldal.",
            ),
        ],
    },
    {
        "slug": "colorite-performance",
        "name": "COLORITE PERFORMANCE",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/colorite-performance",
        "class": "architectural_coating",
        "cat": "cat_homlokzat",
        "editorial": (
            "A COLORITE PERFORMANCE tiszta akrilgyanta bázisú, vizes diszperziós falfesték magas "
            "UV-állósággal kül- és beltérre. A Mapei oldala szerint nem szappanosítható akrildiszperzió; "
            "légköri hatások, szmog, sóoldatok és napsugárzás elleni védelmet ad, selyemfényű "
            "bevonattal; EN 1504-2 PI, MC, IR; anyagszükséglet 0,3–0,4 kg/m² két rétegre; 5 és 20 kg."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Kül- és beltéri falak. Tapad vakolatra és régi, jól kötött festésre; beltérben "
                "téglafalazatra vagy régi festésre Malech előkezelés után — mapei.com szerint. "
                "Anyagszükséglet: 0,3–0,4 kg/m² (két réteg). Kiszerelés: 5 és 20 kg.",
            ),
            (
                "Termékleírás",
                "Tiszta akrildiszperziós festék, selyemfényű egyenletes bevonat, ColorMap színválaszték. "
                "Teljesíti az EN 1504-2 PI, MC és IR elveket betonszerkezet-védelmi bevonatokra.",
            ),
        ],
    },
    {
        "slug": "silancolor-pittura",
        "name": "SILANCOLOR PITTURA",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/silancolor-pittura",
        "class": "architectural_coating",
        "cat": "cat_homlokzat",
        "editorial": (
            "A SILANCOLOR PITTURA szilikon alapú, vizes bázisú gyantafesték: vízlepergető, lélegző, "
            "penész- és algaálló, kül- és beltérre. A Mapei szerint nedvességnek kitett falak "
            "felújítására és penésznek-algának kitett homlokzatokra alkalmas; ColorMap színválaszték."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Kültéri és beltéri falak, különösen nedves vagy penésznek-algának kitett homlokzatok "
                "befejező festése. Vízlepergetés, páraáteresztés, időjárás-állóság, ásványi aljzatokkal "
                "kompatibilis — mapei.com HU.",
            ),
            (
                "Termékleírás",
                "Szilikon alapú vizes gyantafesték. Higiénikus, víztaszító és lélegző tulajdonságok; "
                "ColorMap színezés a nyilvános termékoldal szerint.",
            ),
        ],
    },
    {
        "slug": "silexcolor-pittura",
        "name": "SILEXCOLOR PITTURA",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/silexcolor-pittura",
        "class": "architectural_coating",
        "cat": "cat_homlokzat",
        "editorial": (
            "A SILEXCOLOR PITTURA szilikát bázisú, páraáteresztő védőfesték kül- és beltéri cement- "
            "és mészvakolatokra (DIN 18363). A Mapei szerint eső és fagy elleni védelemhez és nagy "
            "páraáteresztéshez; ajánlott Mape-Antique vakolatokra is; filmréteg nélküli bevonat; "
            "Silexcolor Primer vagy Base Coat után; anyagszükséglet 350–450 g/m² két rétegre; 20 kg."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Függőleges bel- és kültéri porózus felületek, ahol légköri behatás elleni védelem "
                "és nagy páraáteresztés kell. Ecset, henger, szórás vagy airless a megszáradt "
                "Silexcolor Primerre vagy Base Coatra. Anyagszükséglet: 350–450 g/m² két rétegre. "
                "Kiszerelés: 20 kg.",
            ),
            (
                "Termékleírás",
                "Szilikát bázisú védőfesték DIN 18363 szerint. Teljes száradás után filmréteg nélküli, "
                "páraáteresztő bevonat; ColorMap színválaszték — mapei.com HU.",
            ),
        ],
    },
    {
        "slug": "quarzolite-tonachino",
        "name": "QUARZOLITE TONACHINO",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/quarzolite-tonachino",
        "class": "architectural_coating",
        "cat": "cat_homlokzat",
        "editorial": (
            "A QUARZOLITE TONACHINO simítóval felhordható dekoratív és védő bevonat bel- és kültérre. "
            "Diszperziós akrilgyanta, osztályozott töltőanyag, kvarchomok és napsugárzás-álló pigmentek; "
            "víztaszító, páraáteresztő; szemcseméretek 0,7 / 1,2 / 1,5 / 2,0 mm; ColorMap; "
            "anyagszükséglet szemcsénként 2,0–3,5 kg/m²; 25 kg-os vödrök — mapei.com szerint."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Bel- és kültéri falak rusztikus megjelenésű védőbevonata. Tapad vakolatra és jól "
                "kötött festésre; beltérben gipsz vagy régi festés Malech vagy Quarzolite Base Coat "
                "után. Szemcsék: 0,7; 1,2; 1,5; 2,0 mm. Anyagszükséglet: 2,0–3,5 kg/m² szemcsétől függően. "
                "Kiszerelés: 25 kg.",
            ),
            (
                "Termékleírás",
                "Akril diszperziós dekoratív vékonyvakolat-szerű bevonat. Klíma-, szmog-, só- és "
                "napsugárzás-állóság, víztaszítás, páraáteresztés — nyilvános Mapei oldal.",
            ),
        ],
    },
    {
        "slug": "dursilite",
        "name": "DURSILITE",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/dursilite",
        "class": "architectural_coating",
        "cat": "cat_dekor",
        "editorial": (
            "A DURSILITE vizes bázisú beltéri falfesték: mosható, magas fedőképességű, professzionális "
            "felhasználásra. Módosított akrilgyanta és válogatott töltőanyagok; sima, selymes matt "
            "felület, alacsony szennyeződésfelvétel; anyagszükséglet 0,3–0,4 kg/m² két rétegre; "
            "1,4 és 14 literes vödrök — mapei.com HU."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Lakóterek beltéri falainak védelme és díszítése, színtervezéshez. Mosható, dörzsálló, "
                "magas fedőképesség. Anyagszükséglet: 0,3–0,4 kg/m² (két réteg). Kiszerelés: 1,4 és 14 l.",
            ),
            (
                "Termékleírás",
                "Vizes diszperziós módosított akrilgyanta beltéri festék. Sima selymes matt felület, "
                "magas fehérség — a Mapei nyilvános termékleírása szerint.",
            ),
        ],
    },
    {
        "slug": "dursilite-base-coat",
        "name": "DURSILITE BASE COAT",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/dursilite-base-coat",
        "class": "primer",
        "cat": "cat_dekor",
        "editorial": (
            "A DURSILITE BASE COAT pigmentált, színezhető beltéri alapréteg nem homogén aljzatokhoz. "
            "Vizes diszperziós módosított akrilgyanta; egyenletesíti a nedvszívást, javítja a "
            "vizes festékek tapadását, magas fedőképesség — mapei.com szerint."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Sötét korábbi festék elfedése vagy színegyenetlenség kiegyenlítése világos, "
                "korlátozott fedésű színek előtt. Egységesíti a felületet és a tapadást a "
                "felületképzéshez — Mapei nyilvános oldal.",
            ),
            (
                "Termékleírás",
                "Sima, egységesítő pigmentált alapréteg. Magas fedőképesség, homogenizálás, "
                "tapadásfokozás — mapei.com HU termékoldal.",
            ),
        ],
    },
    {
        "slug": "malech",
        "name": "MALECH",
        "url": "https://www.mapei.com/hu/hu/termekek-es-megoldasok/termeklista/termek-reszletei/malech",
        "class": "primer",
        "cat": "cat_dekor",
        "editorial": (
            "A MALECH mikronizált akril diszperziós alapozó falakra (beton, cementhabarcs javítások): "
            "nedvszívás egyenletesítése és tapadásfokozás Elastocolor Pittura vagy Rasante előtt. "
            "Szagtalan, oldószermentes; mélyen hatol; legfeljebb 50 tömeg% vízzel hígítható; "
            "anyagszükséglet 100–150 g/m²; 2 és 10 kg — mapei.com."
        ),
        "prof": [
            (
                "Alkalmazás",
                "Általános falfelületek alapozása Elastocolor Pittura / Rasante előtt; Aquaflex "
                "rendszerben azbesztcementhez is említve. Ecset, henger vagy szórás. "
                "Anyagszükséglet: 100–150 g/m². Kiszerelés: 2 és 10 kg.",
            ),
            (
                "Termékleírás",
                "Mikronizált akrilgyanta diszperziós alapozó. Mélyebb behatolás a hagyományos "
                "vízbázisú alapozóknál; por megkötése; sókivirágzás lassítása — nyilvános Mapei oldal.",
            ),
        ],
    },
]


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def sanitize(text: str) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    t = t.replace("&", "+").replace('"', "’").replace("'", "’")
    return t


def short_desc(text: str, limit: int = 180) -> str:
    t = sanitize(text)
    if len(t) <= limit:
        return t
    cut = t[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    products = []
    for raw in PRODUCTS:
        editorial = sanitize(raw["editorial"])
        assert len(editorial) >= 40, raw["slug"]
        prof_len = sum(len(p) for _, p in raw["prof"])
        assert prof_len >= 120, (raw["slug"], prof_len)
        pid = "prod_mapei_" + raw["slug"].replace("-", "_")
        products.append({**raw, "id": pid, "editorial": editorial})

    blocks = []
    for p in products:
        page_src = f"src_{p['id']}_page"
        blocks.append(
            f"""  {{
    id: {ts_str(p['id'])},
    type: "product",
    slug: {ts_str(p['slug'])},
    name: {ts_str(p['name'])},
    shortDescription: {ts_str(short_desc(p['editorial']))},
    officialUrl: {ts_str(p['url'])},
    productClass: {ts_str(p['class'])},
    status: "published",
    indexable: false,
    seoTitle: {ts_str(p['name'] + " | FESTÉKINDEX")},
    seoDescription: {ts_str(short_desc(p['editorial'], 155))},
    sourceIds: [{ts_str(page_src)}],
    updatedAt: {ts_str(ACCESSED)},
    verifiedAt: {ts_str(ACCESSED)},
  }}"""
        )
    (OUT / "products.ts").write_text(
        'import type { Product } from "../../types";\n\n'
        "/** Mapei HU paint/coating wave v1. indexable locked false until GO. */\n"
        "export const mapeiProducts: Product[] = [\n"
        + ",\n".join(blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    src_blocks = []
    for p in products:
        page_src = f"src_{p['id']}_page"
        src_blocks.append(
            f"""  {{
    id: {ts_str(page_src)},
    type: "manufacturer",
    documentKind: "product_page",
    title: {ts_str(p['name'] + " — termékoldal")},
    url: {ts_str(p['url'])},
    publisher: "Mapei Kereskedelmi Kft.",
    accessedAt: {ts_str(ACCESSED)},
  }}"""
        )
    # org site source
    src_blocks.insert(
        0,
        f"""  {{
    id: "src_mapei_hu",
    type: "official_website",
    title: "Mapei Magyarország — hivatalos weboldal",
    url: "https://www.mapei.com/hu/hu/",
    publisher: "Mapei Kereskedelmi Kft.",
    accessedAt: {ts_str(ACCESSED)},
  }}""",
    )
    (OUT / "sources.ts").write_text(
        'import type { Source } from "../../types";\n\n'
        "export const mapeiSources: Source[] = [\n"
        + ",\n".join(src_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    desc_blocks = []
    for p in products:
        page_src = f"src_{p['id']}_page"
        desc_blocks.append(
            f"""  {{
    productId: {ts_str(p['id'])},
    sourceSummary: {ts_str(p['editorial'])},
    sourceSummarySourceIds: [{ts_str(page_src)}],
    editorialSummary: {ts_str(p['editorial'])},
  }}"""
        )
    (OUT / "descriptions.ts").write_text(
        'import type { ProductDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const mapeiDescriptions: ProductDescriptionEnrichment[] = [\n"
        + ",\n".join(desc_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    prof_blocks = []
    for p in products:
        page_src = f"src_{p['id']}_page"
        secs = []
        for heading, para in p["prof"]:
            secs.append(
                "      {\n"
                f"        heading: {ts_str(heading)},\n"
                "        paragraphs: [\n"
                f"          {ts_str(sanitize(para))},\n"
                "        ],\n"
                f"        sourceIds: [{ts_str(page_src)}],\n"
                "      }"
            )
        prof_blocks.append(
            "  {\n"
            f"    productId: {ts_str(p['id'])},\n"
            f"    sourceIds: [{ts_str(page_src)}],\n"
            "    sections: [\n"
            + ",\n".join(secs)
            + "\n    ],\n"
            "  }"
        )
    (OUT / "professionalDescriptions.ts").write_text(
        'import type { ProductProfessionalDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const mapeiProfessionalDescriptions: ProductProfessionalDescriptionEnrichment[] = [\n"
        + ",\n".join(prof_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    rel_blocks = []
    for p in products:
        page_src = f"src_{p['id']}_page"
        pid = p["id"]
        rel_blocks.extend(
            [
                f"""  {{
    id: {ts_str(f"rel_brand_mapei_{pid}")},
    fromEntityId: {ts_str(BRAND_ID)},
    toEntityId: {ts_str(pid)},
    relationType: "hasProduct",
    sourceIds: [{ts_str(page_src)}],
    status: "active",
  }}""",
                f"""  {{
    id: {ts_str(f"rel_org_mapei_manufactures_{pid}")},
    fromEntityId: {ts_str(ORG_ID)},
    toEntityId: {ts_str(pid)},
    relationType: "manufactures",
    sourceIds: [{ts_str(page_src)}],
    status: "active",
  }}""",
                f"""  {{
    id: {ts_str(f"rel_{pid}_cat")},
    fromEntityId: {ts_str(pid)},
    toEntityId: {ts_str(p['cat'])},
    relationType: "belongsToCategory",
    sourceIds: [{ts_str(page_src)}],
    status: "active",
  }}""",
            ]
        )
    # org owns brand
    rel_blocks.insert(
        0,
        f"""  {{
    id: "rel_mapei_owns_brand",
    fromEntityId: {ts_str(ORG_ID)},
    toEntityId: {ts_str(BRAND_ID)},
    relationType: "owns",
    sourceIds: ["src_mapei_hu"],
    status: "active",
  }}""",
    )
    (OUT / "relations.ts").write_text(
        'import type { Relation } from "../../types";\n\n'
        "export const mapeiRelations: Relation[] = [\n"
        + ",\n".join(rel_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    (OUT / "brands.ts").write_text(
        f'''import type {{ Brand }} from "../../types";

export const mapeiBrands: Brand[] = [
  {{
    id: {ts_str(BRAND_ID)},
    type: "brand",
    slug: "mapei",
    name: "Mapei",
    shortDescription: "Mapei építési kémia és falfesték-bevonat márka Magyarországon.",
    body: "A Mapei a Mapei Kereskedelmi Kft. által forgalmazott építési kémiai és falbevonati márka. Hivatalos forrás: mapei.com/hu.",
    status: "published",
    indexable: false,
    seoTitle: "Mapei | FESTÉKINDEX",
    seoDescription: "Mapei falfestékek és bevonatok a FESTÉKINDEX-en.",
    sourceIds: ["src_mapei_hu"],
    updatedAt: {ts_str(ACCESSED)},
    verifiedAt: {ts_str(ACCESSED)},
  }},
];
''',
        encoding="utf-8",
    )

    (OUT / "organizations.ts").write_text(
        f'''import type {{ Organization }} from "../../types";

export const mapeiOrganizations: Organization[] = [
  {{
    id: {ts_str(ORG_ID)},
    type: "organization",
    slug: "mapei",
    name: "Mapei Kereskedelmi Kft.",
    legalName: "Mapei Kereskedelmi Kft.",
    country: "HU",
    roles: ["manufacturer", "distributor"],
    website: "https://www.mapei.com/hu/hu/",
    shortDescription: "Építési kémia, falfestékek és bevonatok magyarországi forgalmazása.",
    body: "A Mapei Kereskedelmi Kft. a Mapei márka magyarországi szervezete; termékadatok a hivatalos mapei.com/hu oldalakról.",
    status: "published",
    indexable: false,
    seoTitle: "Mapei Kereskedelmi Kft. | FESTÉKINDEX",
    seoDescription: "Mapei Kereskedelmi Kft.: falfestékek és bevonatok a FESTÉKINDEX-en.",
    sourceIds: ["src_mapei_hu"],
    updatedAt: {ts_str(ACCESSED)},
    verifiedAt: {ts_str(ACCESSED)},
  }},
];
''',
        encoding="utf-8",
    )

    (OUT / "apply.ts").write_text(
        '''/**
 * Apply Mapei HU paint/coating wave. indexable locked false until GO.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { mapeiDescriptions } from "./descriptions";
import { mapeiProfessionalDescriptions } from "./professionalDescriptions";
import { mapeiRelations } from "./relations";
import { mapeiSources } from "./sources";

export function applyMapeiV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, mapeiDescriptions),
    mapeiProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, mapeiSources),
    relations: mergeRelationsByCanonicalKey(relations, mapeiRelations),
  };
}
''',
        encoding="utf-8",
    )

    n = len(products)
    (OUT / "index.ts").write_text(
        f'''export {{ mapeiProducts }} from "./products";
export {{ mapeiSources }} from "./sources";
export {{ mapeiRelations }} from "./relations";
export {{ mapeiDescriptions }} from "./descriptions";
export {{ mapeiProfessionalDescriptions }} from "./professionalDescriptions";
export {{ mapeiBrands }} from "./brands";
export {{ mapeiOrganizations }} from "./organizations";
export {{ applyMapeiV1 }} from "./apply";
export const MAPEI_V1_COUNT = {n};
''',
        encoding="utf-8",
    )
    print("wrote", OUT, "count", n)


if __name__ == "__main__":
    main()
