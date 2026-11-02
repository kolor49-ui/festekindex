#!/usr/bin/env python3
"""Generate lib/data/imports/sikaV1 from public hun.sika.com coating pages.

Noindex. Rewrite lead/professional from public page facts only — no invention.
"""
from __future__ import annotations

import json
import re
import time
import urllib.request
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "lib/data/imports/sikaV1"
ACCESSED = "2026-11-02"
ORG_ID = "org_sika_hungaria"
BRAND_ID = "brand_sika"
UA = "FestekindexBot/1.0 (+https://festekindex.hu)"

LISTINGS = [
    "https://hun.sika.com/hu/epitoipar/padlobevonati-rendszerek/termekcsoportok-szerint/bevonatok-fed-bevonatok.html",
    "https://hun.sika.com/hu/epitoipar/betonvedelem-es-felujitas/ved-bevonatok-impregnaloszerek/ved-bevonatok.html",
]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "hu"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")


def strip_tags(chunk: str) -> str:
    text = unescape(chunk or "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</(?:p|li|h\d|div|tr|td)>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def fold(s: str) -> str:
    t = (s or "").lower()
    for a, b in (
        ("á", "a"), ("é", "e"), ("í", "i"), ("ó", "o"), ("ö", "o"),
        ("ő", "o"), ("ú", "u"), ("ü", "u"), ("ű", "u"), ("®", ""),
    ):
        t = t.replace(a, b)
    return t


def sanitize(text: str) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    t = t.replace("&", "+").replace('"', "’").replace("'", "’")
    t = t.replace("<", "(").replace(">", ")")
    return t


def short_desc(text: str, limit: int = 180) -> str:
    t = sanitize(text)
    if len(t) <= limit:
        return t
    cut = t[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def discover_product_urls() -> list[str]:
    found: set[str] = set()
    for listing in LISTINGS:
        html = fetch(listing)
        for href in re.findall(r'href="([^"]+\.html)"', html):
            if href.startswith("/"):
                href = "https://hun.sika.com" + href
            if not href.startswith("https://hun.sika.com/hu/"):
                continue
            low = href.lower()
            if any(
                x in low
                for x in (
                    "sikafloor-",
                    "sikagard-",
                    "sikatop-",
                    "sika-igasol",
                    "sika-igolflex",
                    "sikafloor_garage",
                    "sikafloor-garage",
                )
            ):
                found.add(href.split("?")[0])
        time.sleep(0.4)
    return sorted(found)


def extract_sections(html: str) -> dict[str, str]:
    h1 = None
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if m:
        h1 = strip_tags(m.group(1))
    # lead paragraph after h1
    lead = ""
    if m:
        after = html[m.end() : m.end() + 2500]
        paras = re.findall(r"<p[^>]*>(.*?)</p>", after, re.I | re.S)
        cleaned = [strip_tags(p) for p in paras if len(strip_tags(p)) > 40]
        if cleaned:
            lead = cleaned[0]
        if len(cleaned) > 1 and len(lead) < 80:
            lead = cleaned[0] + " " + cleaned[1]
    # section by h2/h3
    sections: dict[str, str] = {}
    parts = re.split(r"<h[23][^>]*>", html, flags=re.I)
    for part in parts[1:]:
        hm = re.match(r"(.*?)</h[23]>(.*)", part, re.I | re.S)
        if not hm:
            continue
        title = fold(strip_tags(hm.group(1)))
        body = strip_tags(hm.group(2)[:4000])
        if "hasznalat" in title or "alkalmaz" in title:
            sections["use"] = body
        elif "elony" in title:
            sections["benefits"] = body
        elif "csomagolas" in title:
            sections["pack"] = body
        elif "keveres" in title or "feldolgozas" in title or "felhasznalas" in title:
            sections.setdefault("apply", body)
        elif "alapfelulet" in title or "elokeszit" in title:
            sections.setdefault("substrate", body)
    return {"name": h1 or "", "lead": lead, **sections}


def rewrite_editorial(name: str, lead: str, use: str) -> str:
    bits = []
    lead_s = sanitize(lead)
    use_s = sanitize(use)
    if lead_s:
        # Drop marketing fluff words if any; keep facts.
        bits.append(f"{name}: {lead_s}")
    elif use_s:
        bits.append(f"{name} a Sika nyilvános termékoldala szerint.")
    else:
        return ""
    if use_s and use_s not in (bits[0] if bits else ""):
        # First 2 sentences-ish of use
        cut = use_s
        for sep in (". ", "; "):
            if sep in cut[80:]:
                # take up to ~2 clauses
                parts = cut.split(". ")
                cut = ". ".join(parts[:2])
                if not cut.endswith("."):
                    cut += "."
                break
        if cut and cut not in bits[0]:
            bits.append(f"Felhasználás: {cut}")
    text = " ".join(bits)
    text = re.sub(r"\s+", " ", text).strip()
    # Avoid banned fluff
    for bad in ("kimagaslóan", "egyedülálló", "forradalmi", "legjobb a piacon"):
        text = re.sub(bad, "", text, flags=re.I)
    return sanitize(text)


def rewrite_professional(name: str, data: dict[str, str]) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    use = sanitize(data.get("use", ""))
    lead = sanitize(data.get("lead", ""))
    apply_ = sanitize(data.get("apply", ""))
    pack = sanitize(data.get("pack", ""))
    benefits = sanitize(data.get("benefits", ""))
    if use or lead:
        body = use or lead
        out.append(
            (
                "Alkalmazás",
                f"A Sika nyilvános oldalán a(z) {name} alkalmazása: {body}"[:900],
            )
        )
    desc_bits = [x for x in (lead, benefits) if x]
    if desc_bits:
        out.append(
            (
                "Termékleírás",
                f"A gyártó nyilvános leírása szerint a(z) {name} jellemzői: {' '.join(desc_bits)}"[:1100],
            )
        )
    if apply_:
        out.append(("Feldolgozás", f"Feldolgozás a nyilvános adatlap szerint: {apply_}"[:900]))
    if pack:
        out.append(("Csomagolás", f"Csomagolás a nyilvános oldal szerint: {pack}"[:500]))
    return out


def slug_id(url: str) -> str:
    slug = url.rstrip("/").split("/")[-1].replace(".html", "")
    clean = re.sub(r"[^a-z0-9]+", "_", fold(slug)).strip("_")
    return f"prod_sika_{clean}"[:90]


def product_class_cat(name: str, url: str) -> tuple[str, str]:
    t = fold(f"{name} {url}")
    if "primer" in t or "alapozo" in t or "aquaprimer" in t:
        return "primer", "cat_beton"
    if "sikafloor" in t or "garage" in t:
        return "industrial_coating", "cat_padlo"
    if "sikagard" in t or "wallcoat" in t:
        return "architectural_coating", "cat_beton"
    if "igasol" in t or "igolflex" in t or "bitumen" in t or "seal" in t:
        return "other", "cat_epitesi"
    return "industrial_coating", "cat_padlo"


def main() -> None:
    urls = discover_product_urls()
    print(f"discovered {len(urls)} sika product urls")
    products: list[dict] = []
    for i, url in enumerate(urls):
        print(f"[{i+1}/{len(urls)}] {url}")
        try:
            html = fetch(url)
        except Exception as e:
            print("  FAIL", e)
            continue
        data = extract_sections(html)
        name = sanitize(data.get("name") or url.rstrip("/").split("/")[-1])
        if not name or len(name) < 3:
            continue
        editorial = rewrite_editorial(name, data.get("lead", ""), data.get("use", ""))
        if len(editorial) < 40:
            print("  SKIP thin editorial")
            continue
        prof = rewrite_professional(name, data)
        prof_len = sum(len(p) for _, p in prof)
        if prof_len < 120:
            print("  SKIP thin professional", prof_len)
            continue
        pid = slug_id(url)
        pclass, cat = product_class_cat(name, url)
        slug = pid.replace("prod_sika_", "").replace("_", "-")
        products.append(
            {
                "id": pid,
                "slug": slug,
                "name": name,
                "url": url,
                "editorial": editorial,
                "prof": prof,
                "class": pclass,
                "cat": cat,
            }
        )
        time.sleep(0.35)

    print(f"accepted {len(products)}")
    OUT.mkdir(parents=True, exist_ok=True)

    # products.ts
    blocks = []
    for p in products:
        page_src = f"src_prod_{p['id'][5:]}_page" if False else f"src_prod_{p['id'].replace('prod_', '')}_page"
        # src_prod_sika_xxx_page
        page_src = f"src_{p['id']}_page".replace("src_prod_", "src_prod_")
        page_src = f"src_{p['id']}_page"
        short = short_desc(p["editorial"], 180)
        seo = short_desc(p["editorial"], 155)
        blocks.append(
            f"""  {{
    id: {ts_str(p['id'])},
    type: "product",
    slug: {ts_str(p['slug'])},
    name: {ts_str(p['name'])},
    shortDescription: {ts_str(short)},
    officialUrl: {ts_str(p['url'])},
    productClass: {ts_str(p['class'])},
    status: "published",
    indexable: false,
    seoTitle: {ts_str(p['name'] + " | FESTÉKINDEX")},
    seoDescription: {ts_str(seo)},
    sourceIds: [{ts_str(page_src)}],
    updatedAt: {ts_str(ACCESSED)},
    verifiedAt: {ts_str(ACCESSED)},
  }}"""
        )
    (OUT / "products.ts").write_text(
        'import type { Product } from "../../types";\n\n'
        "/** Sika HU coating wave v1. indexable locked false until GO. */\n"
        "export const sikaProducts: Product[] = [\n"
        + ",\n".join(blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    # sources
    src_blocks = []
    for p in products:
        page_src = f"src_{p['id']}_page"
        src_blocks.append(
            f"""  {{
    id: {ts_str(page_src)},
    type: "source",
    title: {ts_str(p['name'] + " — hivatalos termékoldal")},
    url: {ts_str(p['url'])},
    publisher: "Sika Hungária Kft.",
    accessedAt: {ts_str(ACCESSED)},
    kind: "product_page",
  }}"""
        )
    (OUT / "sources.ts").write_text(
        'import type { Source } from "../../types";\n\n'
        "export const sikaSources: Source[] = [\n"
        + ",\n".join(src_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    # descriptions
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
        "export const sikaDescriptions: ProductDescriptionEnrichment[] = [\n"
        + ",\n".join(desc_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    # professional
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
        "export const sikaProfessionalDescriptions: ProductProfessionalDescriptionEnrichment[] = [\n"
        + ",\n".join(prof_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    # relations
    rel_blocks = []
    for p in products:
        page_src = f"src_{p['id']}_page"
        pid = p["id"]
        rel_blocks.extend(
            [
                f"""  {{
    id: {ts_str(f"rel_brand_sika_{pid}")},
    fromEntityId: {ts_str(BRAND_ID)},
    toEntityId: {ts_str(pid)},
    relationType: "hasProduct",
    sourceIds: [{ts_str(page_src)}],
    status: "active",
  }}""",
                f"""  {{
    id: {ts_str(f"rel_org_sika_manufactures_{pid}")},
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
    (OUT / "relations.ts").write_text(
        'import type { Relation } from "../../types";\n\n'
        "export const sikaRelations: Relation[] = [\n"
        + ",\n".join(rel_blocks)
        + "\n];\n",
        encoding="utf-8",
    )

    (OUT / "brands.ts").write_text(
        'import type { Brand } from "../../types";\n\n'
        "/** Sika brand already in lib/data/brands.ts — no new brands this wave. */\n"
        "export const sikaBrands: Brand[] = [];\n",
        encoding="utf-8",
    )

    (OUT / "apply.ts").write_text(
        '''/**
 * Apply Sika HU coating wave. HOLD none. indexable locked false until GO.
 */
import type { Product, Relation, Source } from "../../types";
import {
  applyProductDescriptionEnrichments,
  applyProductProfessionalDescriptionEnrichments,
  mergeSourcesWithEnrichment,
} from "../festekBazisEnrichmentV1/apply";
import { mergeRelationsByCanonicalKey } from "../merge";
import { sikaDescriptions } from "./descriptions";
import { sikaProfessionalDescriptions } from "./professionalDescriptions";
import { sikaRelations } from "./relations";
import { sikaSources } from "./sources";

export function applySikaV1(
  products: Product[],
  sources: Source[],
  relations: Relation[],
): { products: Product[]; sources: Source[]; relations: Relation[] } {
  const productsEnriched = applyProductProfessionalDescriptionEnrichments(
    applyProductDescriptionEnrichments(products, sikaDescriptions),
    sikaProfessionalDescriptions,
  );
  return {
    products: productsEnriched,
    sources: mergeSourcesWithEnrichment(sources, sikaSources),
    relations: mergeRelationsByCanonicalKey(relations, sikaRelations),
  };
}
''',
        encoding="utf-8",
    )

    n = len(products)
    (OUT / "index.ts").write_text(
        f'''export {{ sikaProducts }} from "./products";
export {{ sikaSources }} from "./sources";
export {{ sikaRelations }} from "./relations";
export {{ sikaDescriptions }} from "./descriptions";
export {{ sikaProfessionalDescriptions }} from "./professionalDescriptions";
export {{ sikaBrands }} from "./brands";
export {{ applySikaV1 }} from "./apply";
export const SIKA_V1_COUNT = {n};
''',
        encoding="utf-8",
    )
    print("wrote", OUT, "count", n)


if __name__ == "__main__":
    main()
