#!/usr/bin/env python3
"""Generate lib/data/imports/remmersV1 from remmers-v1 PASS+REVIEW drafts.

HOLD excluded. indexable locked false. brand_remmers / org_remmers_ungarn reused.
No invented sections — emit only source-backed enrichment.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "tools/mass-import/runs/remmers-v1/products"
OUT = ROOT / "lib/data/imports/remmersV1"
ACCESSED = "2026-11-01"
ORG_ID = "org_remmers_ungarn"
PUBLISHER = "Remmers Ungarn Kft."
BRAND_ID = "brand_remmers"
OFFICIAL_SRC = "src_remmers_hu"

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
    """Normalize whitespace / entities that React SSR escapes in text nodes."""
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
    return short_desc(f"{name} — hivatalos Remmers termékadat a FESTÉKINDEX-en.", 160)


def slug_from_page_url(url: str, pid: str) -> str:
    if url:
        # …/product-slug/p/000… → product-slug
        m = re.search(r"/([^/]+)/p/\d+", url)
        if m:
            return m.group(1)
        part = url.rstrip("/").split("/")[-1]
        if part and not part.isdigit():
            return part
    raw = pid
    if raw.startswith("prod_remmers_"):
        raw = raw[len("prod_remmers_") :]
    # drop trailing article id
    raw = re.sub(r"_\d+$", "", raw)
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
    skipped: list[str] = []
    status_counts = {"PASS": 0, "REVIEW": 0}

    results = sorted(RUN.glob("*/RESULT.json"))
    for result_path in results:
        result = json.loads(result_path.read_text(encoding="utf-8"))
        pid = result.get("product_id") or result_path.parent.name
        status = result.get("status")
        if status == "HOLD" or status == "ERROR":
            skipped.append(f"{pid}:{status}")
            continue
        if status not in {"PASS", "REVIEW"}:
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
            if not paragraphs:
                continue
            if sec.get("status") == "banned_phrase":
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

        sources = result.get("sources") or []
        page_src = next((s for s in sources if s.get("kind") == "product_page"), None)
        tds_src = next((s for s in sources if s.get("kind") == "tds"), None)
        sds_src = next((s for s in sources if s.get("kind") == "sds"), None)
        if not page_src:
            skipped.append(f"{pid}:missing_page")
            continue

        name = sanitize_text(str(result.get("product_name") or pid))
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
            f"    id: {ts_str(f'rel_{BRAND_ID}_{pid}')},\n"
            f"    fromEntityId: {ts_str(BRAND_ID)},\n"
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
        status_counts[status] = status_counts.get(status, 0) + 1

    if not products_ts:
        raise SystemExit("codegen blocked: no shippable Remmers products")

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
        "/** Remmers wood+construction PASS+REVIEW overlay. indexable locked false. */\n",
        products_ts,
        "remmersProducts",
        "Product",
    )
    write(
        "sources.ts",
        'import type { Source } from "../../types";\n\n',
        sources_ts,
        "remmersSources",
        "Source",
    )
    write(
        "relations.ts",
        'import type { Relation } from "../../types";\n\n',
        relations_ts,
        "remmersRelations",
        "Relation",
    )
    write(
        "descriptions.ts",
        'import type { ProductDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n',
        descriptions_ts,
        "remmersDescriptions",
        "ProductDescriptionEnrichment",
    )
    write(
        "professionalDescriptions.ts",
        'import type { ProductProfessionalDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n',
        prof_ts,
        "remmersProfessionalDescriptions",
        "ProductProfessionalDescriptionEnrichment",
    )

    (OUT / "brands.ts").write_text(
        'import type { Brand } from "../../types";\n\n'
        "/** Remmers umbrella brand already lives in lib/data/brands.ts — no new brand rows. */\n"
        "export const remmersBrands: Brand[] = [];\n",
        encoding="utf-8",
    )

    (OUT / "apply.ts").write_text(
        '/**\n'
        " * Apply Remmers PASS+REVIEW overlay. HOLD excluded at codegen.\n"
        " * Does not touch PPG / JUB / Poli / Festék Bázis files.\n"
        " */\n"
        'import type { Product, Relation, Source } from "../../types";\n'
        "import {\n"
        "  applyProductDescriptionEnrichments,\n"
        "  applyProductProfessionalDescriptionEnrichments,\n"
        "  mergeSourcesWithEnrichment,\n"
        '} from "../festekBazisEnrichmentV1/apply";\n'
        'import { mergeRelationsByCanonicalKey } from "../merge";\n'
        'import { remmersDescriptions } from "./descriptions";\n'
        'import { remmersProfessionalDescriptions } from "./professionalDescriptions";\n'
        'import { remmersRelations } from "./relations";\n'
        'import { remmersSources } from "./sources";\n\n'
        "export function applyRemmersV1(\n"
        "  products: Product[],\n"
        "  sources: Source[],\n"
        "  relations: Relation[],\n"
        "): { products: Product[]; sources: Source[]; relations: Relation[] } {\n"
        "  const productsEnriched = applyProductProfessionalDescriptionEnrichments(\n"
        "    applyProductDescriptionEnrichments(products, remmersDescriptions),\n"
        "    remmersProfessionalDescriptions,\n"
        "  );\n"
        "  return {\n"
        "    products: productsEnriched,\n"
        "    sources: mergeSourcesWithEnrichment(sources, remmersSources),\n"
        "    relations: mergeRelationsByCanonicalKey(relations, remmersRelations),\n"
        "  };\n"
        "}\n",
        encoding="utf-8",
    )

    (OUT / "index.ts").write_text(
        'export { remmersProducts } from "./products";\n'
        'export { remmersSources } from "./sources";\n'
        'export { remmersRelations } from "./relations";\n'
        'export { remmersDescriptions } from "./descriptions";\n'
        'export { remmersProfessionalDescriptions } from "./professionalDescriptions";\n'
        'export { remmersBrands } from "./brands";\n'
        'export { applyRemmersV1 } from "./apply";\n'
        f"export const REMMERS_V1_COUNT = {len(products_ts)};\n"
        f"export const REMMERS_V1_PASS_COUNT = {status_counts.get('PASS', 0)};\n"
        f"export const REMMERS_V1_REVIEW_COUNT = {status_counts.get('REVIEW', 0)};\n",
        encoding="utf-8",
    )

    roster_dir = (
        ROOT
        / "review-packages"
        / "festekindex-remmers-wood-construction-release-readiness-v1"
        / "roster"
    )
    roster_dir.mkdir(parents=True, exist_ok=True)
    pass_ids = []
    review_ids = []
    for result_path in results:
        result = json.loads(result_path.read_text(encoding="utf-8"))
        pid = result.get("product_id") or result_path.parent.name
        # only ids that were actually emitted
        if any(f"id: {ts_str(pid)}" in block for block in products_ts):
            if result.get("status") == "PASS":
                pass_ids.append(pid)
            elif result.get("status") == "REVIEW":
                review_ids.append(pid)
    (roster_dir / "PASS-IDS.txt").write_text("\n".join(pass_ids) + "\n", encoding="utf-8")
    (roster_dir / "REVIEW-IDS.txt").write_text(
        "\n".join(review_ids) + "\n", encoding="utf-8"
    )
    (roster_dir / "SKIPPED.txt").write_text(
        "\n".join(skipped) + "\n", encoding="utf-8"
    )

    print(
        f"remmersV1: products={len(products_ts)} "
        f"PASS={status_counts.get('PASS', 0)} REVIEW={status_counts.get('REVIEW', 0)} "
        f"skipped={len(skipped)} → {OUT}"
    )


if __name__ == "__main__":
    main()
