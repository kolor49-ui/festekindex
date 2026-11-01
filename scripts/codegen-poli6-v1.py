#!/usr/bin/env python3
"""Generate lib/data/imports/poli6V1 from poli-farbe-v5 PASS-only enrichments.

LOCAL ONLY — filters to the approved 6 PASS roster. REVIEW/HOLD excluded.
PAGE_ALT PASS products may lack TDS PDF; require product_page + SDS at minimum.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "tools/mass-import/runs/poli-farbe-v5/products"
ROSTER = (
    ROOT
    / "review-packages/festekindex-poli-farbe-6-pass-release-readiness-v8-3/roster/PASS-IDS.txt"
)
OUT = ROOT / "lib/data/imports/poli6V1"
ACCESSED = "2026-10-30"
ORG_ID = "org_poli_farbe"
PUBLISHER = "Poli-Farbe Kft."
UMBRELLA_BRAND = "brand_poli_farbe"
OFFICIAL_SRC = "src_poli_farbe_official"

BRAND_MAP = {
    "Platinum": ("brand_poli_platinum", "poli-platinum", "Platinum"),
    "Inntaler": ("brand_poli_inntaler", "poli-inntaler", "Inntaler"),
    "Boróka": ("brand_poli_boroka", "poli-boroka", "Boróka"),
    "Cellkolor": ("brand_poli_cellkolor", "poli-cellkolor", "Cellkolor"),
    "Poli-Farbe": (UMBRELLA_BRAND, "poli-farbe", "Poli-Farbe"),
}

BRAND_SHORT = {
    "Platinum": "Dekoratív beltéri festékmárka — Poli-Farbe Kft.",
    "Inntaler": "Beltéri és homlokzati festékmárka — Poli-Farbe Kft.",
    "Boróka": "Faanyagvédelmi és lazúrmárka — Poli-Farbe Kft.",
    "Cellkolor": "Zománc- és fémbevonati márka — Poli-Farbe Kft.",
}

TYPE_TO_CLASS_CAT = {
    "falfesték": ("architectural_coating", "cat_dekor"),
    "homlokzatfesték": ("architectural_coating", "cat_homlokzat"),
    "alapozó": ("primer", "cat_dekor"),
    "lazúr": ("varnish", "cat_faipar"),
    "zománc": ("industrial_coating", "cat_ipari"),
    "vakolat": ("architectural_coating", "cat_homlokzat"),
    "hígító": ("thinner", "cat_alapanyag"),
    "glett": ("filler", "cat_epitesi"),
    "egyéb": ("other", "cat_dekor"),
}


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def short_desc(text: str, limit: int = 180) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    if len(t) <= limit:
        return t
    cut = t[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def seo_desc(name: str, brand: str) -> str:
    base = (
        f"{name} — {PUBLISHER} / {brand}. "
        "Hivatalos forrásokkal ellenőrzött termékadat a FESTÉKINDEX adatbázisában."
    )
    return short_desc(base, 160)


def slug_from_page_url(url: str, pid: str) -> str:
    if url:
        part = url.rstrip("/").split("/")[-1]
        if part:
            return part
    raw = pid
    if raw.startswith("prod_poli_farbe_"):
        raw = raw[len("prod_poli_farbe_") :]
    return raw.replace("_", "-")


def remap_source_ids(ids: list[str], page_id: str, tds_id: str | None, sds_id: str | None) -> list[str]:
    out: list[str] = []
    for sid in ids:
        if sid in ("product_page", "page"):
            out.append(page_id)
        elif sid == "tds" and tds_id:
            out.append(tds_id)
        elif sid == "sds" and sds_id:
            out.append(sds_id)
        else:
            out.append(sid)
    # de-dupe preserve order
    seen: set[str] = set()
    uniq: list[str] = []
    for s in out:
        if s in seen:
            continue
        seen.add(s)
        uniq.append(s)
    return uniq


def load_pass_ids() -> list[str]:
    return [l.strip() for l in ROSTER.read_text(encoding="utf-8").splitlines() if l.strip()]


def main() -> None:
    pass_ids = load_pass_ids()
    assert len(pass_ids) == 6, f"expected 6 PASS ids, got {len(pass_ids)}"

    products_ts: list[str] = []
    sources_ts: list[str] = []
    relations_ts: list[str] = []
    descriptions_ts: list[str] = []
    prof_ts: list[str] = []
    brands_used: set[str] = set()
    seen_source_ids: set[str] = set()
    missing: list[str] = []
    wrong_status: list[str] = []

    for pid in pass_ids:
        result_path = RUN / pid / "RESULT.json"
        enr_path = RUN / pid / "enrichment.json"
        if not result_path.exists() or not enr_path.exists():
            missing.append(pid)
            continue
        result = json.loads(result_path.read_text(encoding="utf-8"))
        enr = json.loads(enr_path.read_text(encoding="utf-8"))

        editorial = (enr.get("editorialSummary") or "").strip()
        ed_src = list(enr.get("editorialSummarySourceIds") or [])
        prof = enr.get("professionalDescription") or {}
        sections = []
        for sec in prof.get("sections") or []:
            paragraphs = [p for p in (sec.get("paragraphs") or []) if p and str(p).strip()]
            if not paragraphs:
                continue
            sections.append(
                {
                    "heading": sec.get("heading") or "Szakmai tartalom",
                    "paragraphs": paragraphs,
                    "sourceIds": list(sec.get("sourceIds") or ed_src),
                }
            )

        status = result.get("status")
        reasons = list(result.get("reasons") or [])
        if status != "PASS":
            wrong_status.append(f"{pid}:{status}:{reasons[:3]}")
            continue

        name = result.get("product_name") or pid
        brand_label = result.get("brand") or "Poli-Farbe"
        brands_used.add(brand_label)
        brand_id, _brand_slug, brand_name = BRAND_MAP.get(
            brand_label, (UMBRELLA_BRAND, "poli-farbe", "Poli-Farbe")
        )
        hint = result.get("product_type_hint") or "egyéb"
        product_class, cat_id = TYPE_TO_CLASS_CAT.get(hint, ("other", "cat_dekor"))

        if not editorial:
            missing.append(f"{pid}:no_editorial")
            continue
        if not sections:
            missing.append(f"{pid}:no_sections")
            continue

        sources = result.get("sources") or []
        page_src = next((s for s in sources if s.get("kind") == "product_page"), None)
        tds_src = next((s for s in sources if s.get("kind") == "tds"), None)
        sds_src = next((s for s in sources if s.get("kind") == "sds"), None)
        if not page_src or not sds_src:
            missing.append(f"{pid}:missing_page_or_sds")
            continue

        page_id = page_src["source_id"]
        tds_id = tds_src["source_id"] if tds_src else None
        sds_id = sds_src["source_id"]
        source_ids = [page_id] + ([tds_id] if tds_id else []) + [sds_id]
        official_url = page_src.get("url") or ""
        slug = slug_from_page_url(official_url, pid)

        desc_src_ids = remap_source_ids(ed_src or [page_id], page_id, tds_id, sds_id)
        prof_src_ids = remap_source_ids(
            list(prof.get("sourceIds") or desc_src_ids), page_id, tds_id, sds_id
        )

        products_ts.append(
            "  {\n"
            f"    id: {ts_str(pid)},\n"
            f'    type: "product",\n'
            f"    slug: {ts_str(slug)},\n"
            f"    name: {ts_str(name)},\n"
            f"    shortDescription: {ts_str(short_desc(editorial))},\n"
            f"    officialUrl: {ts_str(official_url)},\n"
            f"    productClass: {ts_str(product_class)},\n"
            f'    status: "published",\n'
            f"    indexable: false,\n"
            f"    seoTitle: {ts_str(f'{name} | FESTÉKINDEX')},\n"
            f"    seoDescription: {ts_str(seo_desc(name, brand_name))},\n"
            f"    sourceIds: {json.dumps(source_ids, ensure_ascii=False)},\n"
            f"    updatedAt: {ts_str(ACCESSED)},\n"
            f"    verifiedAt: {ts_str(ACCESSED)},\n"
            "  }"
        )

        doc_rows = [
            (page_src, "product_page", "termékoldal", "product_page"),
            (sds_src, "sds", "SDS", "sds"),
        ]
        if tds_src:
            doc_rows.insert(1, (tds_src, "tds", "TDS", "tds"))

        for src, _kind, title_suffix, doc_kind in doc_rows:
            sid = src["source_id"]
            if sid in seen_source_ids:
                continue
            seen_source_ids.add(sid)
            sources_ts.append(
                "  {\n"
                f"    id: {ts_str(sid)},\n"
                f'    type: "manufacturer",\n'
                f"    documentKind: {ts_str(doc_kind)},\n"
                f"    title: {ts_str(f'{name} — {title_suffix}')},\n"
                f"    url: {ts_str(src.get('url') or '')},\n"
                f"    publisher: {ts_str(PUBLISHER)},\n"
                f"    accessedAt: {ts_str(ACCESSED)},\n"
                "  }"
            )

        page_src_ids = json.dumps([page_id], ensure_ascii=False)
        relations_ts.append(
            "  {\n"
            f"    id: {ts_str(f'rel_{brand_id}_{pid}')},\n"
            f"    fromEntityId: {ts_str(brand_id)},\n"
            f"    toEntityId: {ts_str(pid)},\n"
            f'    relationType: "hasProduct",\n'
            f"    sourceIds: {page_src_ids},\n"
            f'    status: "active",\n'
            "  }"
        )
        relations_ts.append(
            "  {\n"
            f"    id: {ts_str(f'rel_{ORG_ID}_manufactures_{pid}')},\n"
            f"    fromEntityId: {ts_str(ORG_ID)},\n"
            f"    toEntityId: {ts_str(pid)},\n"
            f'    relationType: "manufactures",\n'
            f"    sourceIds: {page_src_ids},\n"
            f'    status: "active",\n'
            "  }"
        )
        relations_ts.append(
            "  {\n"
            f"    id: {ts_str(f'rel_{pid}_cat')},\n"
            f"    fromEntityId: {ts_str(pid)},\n"
            f"    toEntityId: {ts_str(cat_id)},\n"
            f'    relationType: "belongsToCategory",\n'
            f"    sourceIds: {page_src_ids},\n"
            f'    status: "active",\n'
            "  }"
        )

        descriptions_ts.append(
            "  {\n"
            f"    productId: {ts_str(pid)},\n"
            f"    sourceSummary: {ts_str(editorial)},\n"
            f"    sourceSummarySourceIds: {json.dumps(desc_src_ids, ensure_ascii=False)},\n"
            f"    editorialSummary: {ts_str(editorial)},\n"
            "  }"
        )

        sec_blocks = []
        for sec in sections:
            remapped = remap_source_ids(sec["sourceIds"], page_id, tds_id, sds_id)
            paras = ",\n".join(f"          {ts_str(p)}" for p in sec["paragraphs"])
            sec_blocks.append(
                "      {\n"
                f"        heading: {ts_str(sec['heading'])},\n"
                f"        paragraphs: [\n{paras},\n        ],\n"
                f"        sourceIds: {json.dumps(remapped, ensure_ascii=False)},\n"
                "      }"
            )
        prof_ts.append(
            "  {\n"
            f"    productId: {ts_str(pid)},\n"
            f"    sourceIds: {json.dumps(prof_src_ids, ensure_ascii=False)},\n"
            f"    sections: [\n"
            + ",\n".join(sec_blocks)
            + "\n    ],\n"
            "  }"
        )

    if missing or wrong_status:
        raise SystemExit(
            f"codegen blocked: missing={missing} wrong_status={wrong_status}"
        )

    brand_entries = []
    brand_owns = []
    for label in sorted(brands_used):
        bid, bslug, bname = BRAND_MAP[label]
        if bid == UMBRELLA_BRAND:
            continue
        short = BRAND_SHORT.get(label, f"{bname} márka — Poli-Farbe Kft.")
        body = (
            f"A {bname} a Poli-Farbe Kft. gyártói portfóliójához kapcsolódó márka. "
            f"Hivatalos forrás: polifarbe.hu."
        )
        brand_entries.append(
            "  {\n"
            f"    id: {ts_str(bid)},\n"
            f'    type: "brand",\n'
            f"    slug: {ts_str(bslug)},\n"
            f"    name: {ts_str(bname)},\n"
            f"    shortDescription: {ts_str(short)},\n"
            f"    body: {ts_str(body)},\n"
            f'    status: "published",\n'
            f"    indexable: false,\n"
            f"    seoTitle: {ts_str(f'{bname} | FESTÉKINDEX')},\n"
            f"    seoDescription: {ts_str(f'{bname} márka — Poli-Farbe Kft. kapcsolat.')},\n"
            f'    sourceIds: ["{OFFICIAL_SRC}"],\n'
            f"    updatedAt: {ts_str(ACCESSED)},\n"
            f"    verifiedAt: {ts_str(ACCESSED)},\n"
            "  }"
        )
        brand_owns.append(
            "  {\n"
            f"    id: {ts_str(f'rel_{ORG_ID}_owns_{bid}')},\n"
            f"    fromEntityId: {ts_str(ORG_ID)},\n"
            f"    toEntityId: {ts_str(bid)},\n"
            f'    relationType: "owns",\n'
            f'    sourceIds: ["{OFFICIAL_SRC}"],\n'
            f'    status: "active",\n'
            "  }"
        )

    OUT.mkdir(parents=True, exist_ok=True)

    (OUT / "products.ts").write_text(
        'import type { Product } from "../../types";\n\n'
        "/** Poli-Farbe 6 PASS catalogue identities (v8.3). indexable locked false. */\n"
        "export const poli6Products: Product[] = [\n"
        + ",\n".join(products_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "sources.ts").write_text(
        'import type { Source } from "../../types";\n\n'
        "export const poli6Sources: Source[] = [\n"
        + ",\n".join(sources_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "relations.ts").write_text(
        'import type { Relation } from "../../types";\n\n'
        "export const poli6Relations: Relation[] = [\n"
        + ",\n".join(brand_owns + relations_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "descriptions.ts").write_text(
        'import type { ProductDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const poli6Descriptions: ProductDescriptionEnrichment[] = [\n"
        + ",\n".join(descriptions_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "professionalDescriptions.ts").write_text(
        'import type { ProductProfessionalDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const poli6ProfessionalDescriptions: ProductProfessionalDescriptionEnrichment[] = [\n"
        + ",\n".join(prof_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "brands.ts").write_text(
        'import type { Brand } from "../../types";\n\n'
        "/** Poli-Farbe sub-brands for 6 PASS (umbrella brand_poli_farbe already in brands.ts). */\n"
        "export const poli6Brands: Brand[] = [\n"
        + (",\n".join(brand_entries) if brand_entries else "")
        + ("\n" if brand_entries else "")
        + "];\n",
        encoding="utf-8",
    )
    (OUT / "apply.ts").write_text(
        "/**\n"
        " * Apply Poli-Farbe 6 PASS overlay without touching Festék Bázis HOLD, PPG42, or JUB files.\n"
        " */\n"
        'import type { Product, Relation, Source } from "../../types";\n'
        "import {\n"
        "  applyProductDescriptionEnrichments,\n"
        "  applyProductProfessionalDescriptionEnrichments,\n"
        "  mergeSourcesWithEnrichment,\n"
        '} from "../festekBazisEnrichmentV1/apply";\n'
        'import { mergeRelationsByCanonicalKey } from "../merge";\n'
        'import { poli6Descriptions } from "./descriptions";\n'
        'import { poli6ProfessionalDescriptions } from "./professionalDescriptions";\n'
        'import { poli6Relations } from "./relations";\n'
        'import { poli6Sources } from "./sources";\n'
        "\n"
        "export function applyPoli6V1(\n"
        "  products: Product[],\n"
        "  sources: Source[],\n"
        "  relations: Relation[],\n"
        "): { products: Product[]; sources: Source[]; relations: Relation[] } {\n"
        "  const productsEnriched = applyProductProfessionalDescriptionEnrichments(\n"
        "    applyProductDescriptionEnrichments(products, poli6Descriptions),\n"
        "    poli6ProfessionalDescriptions,\n"
        "  );\n"
        "  return {\n"
        "    products: productsEnriched,\n"
        "    sources: mergeSourcesWithEnrichment(sources, poli6Sources),\n"
        "    relations: mergeRelationsByCanonicalKey(relations, poli6Relations),\n"
        "  };\n"
        "}\n",
        encoding="utf-8",
    )
    (OUT / "index.ts").write_text(
        'export { poli6Products } from "./products";\n'
        'export { poli6Sources } from "./sources";\n'
        'export { poli6Relations } from "./relations";\n'
        'export { poli6Descriptions } from "./descriptions";\n'
        'export { poli6ProfessionalDescriptions } from "./professionalDescriptions";\n'
        'export { poli6Brands } from "./brands";\n'
        'export { applyPoli6V1 } from "./apply";\n'
        "export const POLI_6_PASS_COUNT = 6;\n",
        encoding="utf-8",
    )
    print(
        "OK",
        len(products_ts),
        "products",
        len(sources_ts),
        "sources",
        len(brand_entries),
        "new_brands",
        "brands_used",
        sorted(brands_used),
    )


if __name__ == "__main__":
    main()
