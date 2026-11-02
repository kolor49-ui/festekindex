#!/usr/bin/env python3
"""Generate lib/data/imports/caparolV1 from caparol-v1 PASS+REVIEW drafts.

HOLD/ERROR excluded. indexable locked false.
org_thenordicmark + brand_dulux reused; Sadolin/Hammerite brands added if needed.
No invented sections — emit only source-backed enrichment.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "tools/mass-import/runs/caparol-v1/products"
OUT = ROOT / "lib/data/imports/caparolV1"
ACCESSED = "2026-11-02"
ORG_ID = "org_thenordicmark"
PUBLISHER = "thenordicmark Kft. / Caparol"
OFFICIAL_SRC = "src_caparol_hu"
EXISTING_BRANDS = {'brand_caparol'}

BRAND_MAP = {"Caparol": ("brand_caparol", "caparol", "Caparol")}

BRAND_SHORT = {"Caparol": "Caparol festék- és vakolatmárka — caparol.hu."}

TYPE_TO_CLASS_CAT = {
    "falfesték": ("architectural_coating", "cat_dekor"),
    "homlokzatfesték": ("architectural_coating", "cat_homlokzat"),
    "alapozó": ("primer", "cat_faipar"),
    "lazúr": ("varnish", "cat_faipar"),
    "lakk": ("varnish", "cat_faipar"),
    "zománc": ("industrial_coating", "cat_ipari"),
    "vakolat": ("architectural_coating", "cat_homlokzat"),
    "hígító": ("thinner", "cat_alapanyag"),
    "glett": ("filler", "cat_epitesi"),
    "egyéb": ("other", "cat_epitesi"),
}


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def sanitize_text(text: str) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    t = t.replace("&", "+").replace('"', "’").replace("'", "’")
    t = t.replace("<", "(").replace(">", ")")
    return t


def short_desc(text: str, limit: int = 180) -> str:
    t = sanitize_text(text)
    if len(t) <= limit:
        return t
    cut = t[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def seo_desc_from_editorial(name: str, editorial: str) -> str:
    body = short_desc(editorial, 155)
    if body:
        return body
    return short_desc(f"{name} — hivatalos Caparol HU termékadat a FESTÉKINDEX-en.", 160)


def slug_from_page_url(url: str, pid: str) -> str:
    if url:
        part = url.rstrip("/").split("?")[0].rstrip("/").split("/")[-1]
        raw = (
            part.lower()
            .replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ö", "o")
            .replace("ő", "o")
            .replace("ú", "u")
            .replace("ü", "u")
            .replace("ű", "u")
        )
        raw = re.sub(r"[^a-z0-9\-]+", "-", raw).strip("-")
        if raw:
            return raw
    raw = pid
    if raw.startswith("prod_caparol_"):
        raw = raw[len("prod_caparol_"):]
    return raw.replace("_", "-")


def remap_source_ids(
    ids: list[str], page_id: str, tds_id: str | None, sds_id: str | None
) -> list[str]:
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
    seen: set[str] = set()
    uniq: list[str] = []
    for s in out:
        if s in seen:
            continue
        seen.add(s)
        uniq.append(s)
    return uniq


def main() -> None:
    products_ts: list[str] = []
    sources_ts: list[str] = []
    relations_ts: list[str] = []
    descriptions_ts: list[str] = []
    prof_ts: list[str] = []
    seen_source_ids: set[str] = set()
    brands_used: set[str] = set()
    skipped: list[str] = []
    status_counts = {"PASS": 0, "REVIEW": 0}
    seen_prof_fp: set[str] = set()

    results = sorted(RUN.glob("*/RESULT.json"))
    for result_path in results:
        result = json.loads(result_path.read_text(encoding="utf-8"))
        pid = result.get("product_id") or result_path.parent.name
        status = result.get("status")
        if status in {"HOLD", "ERROR"} or status not in {"PASS", "REVIEW"}:
            skipped.append(f"{pid}:{status}")
            continue

        enr_path = result_path.parent / "enrichment.json"
        enr = (
            json.loads(enr_path.read_text(encoding="utf-8"))
            if enr_path.exists()
            else (result.get("enrichment") or {})
        )

        editorial = sanitize_text(enr.get("editorialSummary") or "")
        ed_src = list(enr.get("editorialSummarySourceIds") or [])
        prof = enr.get("professionalDescription") or {}
        sections = []
        for sec in prof.get("sections") or []:
            paragraphs = [
                sanitize_text(p)
                for p in (sec.get("paragraphs") or [])
                if p and str(p).strip()
            ]
            paragraphs = [p for p in paragraphs if p]
            if not paragraphs or sec.get("status") == "banned_phrase":
                continue
            sections.append(
                {
                    "heading": sec.get("heading") or "Szakmai tartalom",
                    "paragraphs": paragraphs,
                    "sourceIds": list(sec.get("sourceIds") or ed_src),
                }
            )

        if not editorial or not sections:
            skipped.append(f"{pid}:no_editorial_or_sections")
            continue

        prof_fp = "||".join(
            f"{s['heading']}|{' '.join(s['paragraphs'])}" for s in sections
        )
        if prof_fp in seen_prof_fp:
            skipped.append(f"{pid}:duplicate_professional_fingerprint")
            continue
        seen_prof_fp.add(prof_fp)

        sources = result.get("sources") or []
        page_src = next((s for s in sources if s.get("kind") == "product_page"), None)
        tds_src = next((s for s in sources if s.get("kind") == "tds"), None)
        sds_src = next((s for s in sources if s.get("kind") == "sds"), None)
        if not page_src:
            skipped.append(f"{pid}:missing_page")
            continue

        name = sanitize_text(str(result.get("product_name") or pid))
        brand_label = str(result.get("brand") or "Caparol")
        brand_id, _bslug, _bname = BRAND_MAP.get(
            brand_label, ("brand_caparol", "caparol", "Caparol")
        )
        brands_used.add(brand_label)
        hint = result.get("product_type_hint") or "egyéb"
        product_class, cat_id = TYPE_TO_CLASS_CAT.get(hint, ("other", "cat_epitesi"))

        page_id = page_src["source_id"]
        tds_id = tds_src["source_id"] if tds_src else None
        sds_id = sds_src["source_id"] if sds_src else None
        source_ids = [page_id] + ([tds_id] if tds_id else []) + ([sds_id] if sds_id else [])
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
            f"    seoDescription: {ts_str(seo_desc_from_editorial(name, editorial))},\n"
            f"    sourceIds: {json.dumps(source_ids, ensure_ascii=False)},\n"
            f"    updatedAt: {ts_str(ACCESSED)},\n"
            f"    verifiedAt: {ts_str(ACCESSED)},\n"
            "  }"
        )

        doc_rows = [(page_src, "termékoldal", "product_page")]
        if tds_src:
            doc_rows.append((tds_src, "TDS", "tds"))
        if sds_src:
            doc_rows.append((sds_src, "SDS", "sds"))

        for src, title_suffix, doc_kind in doc_rows:
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
        status_counts[status] = status_counts.get(status, 0) + 1

    if not products_ts:
        raise SystemExit("codegen blocked: no shippable Akzo products")

    OUT.mkdir(parents=True, exist_ok=True)

    def write(name: str, header: str, body_items: list[str], export_name: str, typ: str) -> None:
        (OUT / name).write_text(
            header
            + f"export const {export_name}: {typ}[] = [\n"
            + ",\n".join(body_items)
            + "\n];\n",
            encoding="utf-8",
        )

    write(
        "products.ts",
        'import type { Product } from "../../types";\n\n'
        "/** Caparol HU PASS+REVIEW overlay. indexable locked false. */\n",
        products_ts,
        "caparolProducts",
        "Product",
    )
    write("sources.ts", 'import type { Source } from "../../types";\n\n', sources_ts, "caparolSources", "Source")
    write("relations.ts", 'import type { Relation } from "../../types";\n\n', relations_ts, "caparolRelations", "Relation")
    write(
        "descriptions.ts",
        'import type { ProductDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n',
        descriptions_ts,
        "caparolDescriptions",
        "ProductDescriptionEnrichment",
    )
    write(
        "professionalDescriptions.ts",
        'import type { ProductProfessionalDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n',
        prof_ts,
        "caparolProfessionalDescriptions",
        "ProductProfessionalDescriptionEnrichment",
    )

    brand_entries: list[str] = []
    brand_owns: list[str] = []
    for label in sorted(brands_used):
        bid, bslug, bname = BRAND_MAP.get(label, ("brand_caparol", "caparol", "Caparol"))
        if bid in EXISTING_BRANDS:
            continue
        short = BRAND_SHORT.get(label, f"{bname} márka — Akzo Nobel Coatings.")
        body = (
            f"A {bname} az thenordicmark Kft. / Caparol kapcsolódó portfóliójához tartozó márka. "
            f"Hivatalos forrás: caparol.hu."
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
            f"    seoDescription: {ts_str(short_desc(short, 160))},\n"
            f"    sourceIds: {json.dumps([OFFICIAL_SRC], ensure_ascii=False)},\n"
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
            f"    sourceIds: {json.dumps([OFFICIAL_SRC], ensure_ascii=False)},\n"
            f'    status: "active",\n'
            "  }"
        )
    if brand_owns:
        relations_ts = relations_ts + brand_owns
        (OUT / "relations.ts").write_text(
            'import type { Relation } from "../../types";\n\n'
            "export const caparolRelations: Relation[] = [\n"
            + ",\n".join(relations_ts)
            + "\n];\n",
            encoding="utf-8",
        )

    if brand_entries:
        brands_body = (
            'import type { Brand } from "../../types";\n\n'
            "/** New Akzo-family brands (Dulux/Sikkens already in lib/data/brands.ts). */\n"
            "export const caparolBrands: Brand[] = [\n"
            + ",\n".join(brand_entries)
            + "\n];\n"
        )
    else:
        brands_body = (
            'import type { Brand } from "../../types";\n\n'
            "export const caparolBrands: Brand[] = [];\n"
        )
    (OUT / "brands.ts").write_text(brands_body, encoding="utf-8")

    (OUT / "apply.ts").write_text(
        '/**\n'
        " * Apply Caparol HU PASS+REVIEW overlay. HOLD excluded at codegen.\n"
        " */\n"
        'import type { Product, Relation, Source } from "../../types";\n'
        "import {\n"
        "  applyProductDescriptionEnrichments,\n"
        "  applyProductProfessionalDescriptionEnrichments,\n"
        "  mergeSourcesWithEnrichment,\n"
        '} from "../festekBazisEnrichmentV1/apply";\n'
        'import { mergeRelationsByCanonicalKey } from "../merge";\n'
        'import { caparolDescriptions } from "./descriptions";\n'
        'import { caparolProfessionalDescriptions } from "./professionalDescriptions";\n'
        'import { caparolRelations } from "./relations";\n'
        'import { caparolSources } from "./sources";\n\n'
        "export function applyCaparolV1(\n"
        "  products: Product[],\n"
        "  sources: Source[],\n"
        "  relations: Relation[],\n"
        "): { products: Product[]; sources: Source[]; relations: Relation[] } {\n"
        "  const productsEnriched = applyProductProfessionalDescriptionEnrichments(\n"
        "    applyProductDescriptionEnrichments(products, caparolDescriptions),\n"
        "    caparolProfessionalDescriptions,\n"
        "  );\n"
        "  return {\n"
        "    products: productsEnriched,\n"
        "    sources: mergeSourcesWithEnrichment(sources, caparolSources),\n"
        "    relations: mergeRelationsByCanonicalKey(relations, caparolRelations),\n"
        "  };\n"
        "}\n",
        encoding="utf-8",
    )

    (OUT / "index.ts").write_text(
        'export { caparolProducts } from "./products";\n'
        'export { caparolSources } from "./sources";\n'
        'export { caparolRelations } from "./relations";\n'
        'export { caparolDescriptions } from "./descriptions";\n'
        'export { caparolProfessionalDescriptions } from "./professionalDescriptions";\n'
        'export { caparolBrands } from "./brands";\n'
        'export { applyCaparolV1 } from "./apply";\n'
        f"export const CAPAROL_V1_COUNT = {len(products_ts)};\n"
        f"export const CAPAROL_V1_PASS_COUNT = {status_counts.get('PASS', 0)};\n"
        f"export const CAPAROL_V1_REVIEW_COUNT = {status_counts.get('REVIEW', 0)};\n",
        encoding="utf-8",
    )

    print(
        f"caparolV1: products={len(products_ts)} "
        f"PASS={status_counts.get('PASS', 0)} REVIEW={status_counts.get('REVIEW', 0)} "
        f"skipped={len(skipped)} → {OUT}"
    )


if __name__ == "__main__":
    main()
