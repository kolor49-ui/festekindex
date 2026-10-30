#!/usr/bin/env python3
"""Generate lib/data/imports/jub95V1 from jub-v3 PASS-only enrichments.

LOCAL ONLY — filters to the approved 95 PASS roster. REVIEW/HOLD excluded.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "tools/mass-import/runs/jub-v3/products"
ROSTER = ROOT / "review-packages/festekindex-jub-95-pass-release-readiness-v8-2/roster/PASS-IDS.txt"
OUT = ROOT / "lib/data/imports/jub95V1"
ACCESSED = "2026-10-30"
ORG_ID = "org_jub_hu"
PUBLISHER = "JUB Kft."

BRAND_MAP = {
    "JUPOL": ("brand_jupol", "jupol", "JUPOL"),
    "JUBIZOL": ("brand_jubizol", "jubizol", "JUBIZOL"),
    "JUBIN": ("brand_jubin", "jubin", "JUBIN"),
    "HYDROSOL": ("brand_hydrosol", "hydrosol", "HYDROSOL"),
    "Jubolin": ("brand_jubolin", "jubolin", "Jubolin"),
    "Akrinol": ("brand_akrinol", "akrinol", "Akrinol"),
    "Takril": ("brand_takril", "takril", "Takril"),
    "Acrylcolor": ("brand_acrylcolor", "acrylcolor", "Acrylcolor"),
    "JUB": ("brand_jub", "jub", "JUB"),
}

BRAND_SHORT = {
    "JUPOL": "Beltéri falfesték-márka — JUB Kft.",
    "JUBIZOL": "Homlokzati és hőszigetelő rendszermárka — JUB Kft.",
    "JUBIN": "Beltéri és speciális bevonati márka — JUB Kft.",
    "HYDROSOL": "Vízszigetelő és padlóvédelmi márka — JUB Kft.",
    "Jubolin": "Glett- és felületkiegyenlítő márka — JUB Kft.",
    "Akrinol": "Építési ragasztó- és alapozómárka — JUB Kft.",
    "Takril": "Homlokzati bevonati márka — JUB Kft.",
    "Acrylcolor": "Homlokzati akril festékmárka — JUB Kft.",
}

TYPE_TO_CLASS_CAT = {
    "falfesték": ("architectural_coating", "cat_dekor"),
    "homlokzatfesték": ("architectural_coating", "cat_homlokzat"),
    "alapozó": ("primer", "cat_dekor"),
    "glett": ("filler", "cat_epitesi"),
    "vízszigetelés": ("surface_prep", "cat_epitesi"),
    "lazúr": ("varnish", "cat_faipar"),
    "egyéb": ("other", "cat_epitesi"),
}


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def slug_from_product_id(pid: str) -> str:
    # prod_jub_<slug_with_underscores> → kebab
    raw = pid
    if raw.startswith("prod_jub_"):
        raw = raw[len("prod_jub_") :]
    return raw.replace("_", "-")


def short_desc(text: str, limit: int = 180) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    if len(t) <= limit:
        return t
    cut = t[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def seo_desc(name: str, brand: str) -> str:
    base = f"{name} — {PUBLISHER} / {brand}. Hivatalos forrásokkal ellenőrzött termékadat a FESTÉKINDEX adatbázisában."
    return short_desc(base, 160)


def load_pass_ids() -> list[str]:
    return [l.strip() for l in ROSTER.read_text(encoding="utf-8").splitlines() if l.strip()]


def main() -> None:
    pass_ids = load_pass_ids()
    assert len(pass_ids) == 95, f"expected 95 PASS ids, got {len(pass_ids)}"

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
        # Release-gate: PASS only. No REVIEW/HOLD admission, no weak_quotes bypass.
        if status != "PASS":
            wrong_status.append(f"{pid}:{status}:{reasons[:3]}")
            continue

        name = result.get("product_name") or pid
        brand_label = result.get("brand") or "JUB"
        brands_used.add(brand_label)
        brand_id, _brand_slug, brand_name = BRAND_MAP.get(
            brand_label, ("brand_jub", "jub", "JUB")
        )
        hint = result.get("product_type_hint") or "egyéb"
        product_class, cat_id = TYPE_TO_CLASS_CAT.get(hint, ("other", "cat_epitesi"))

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
        if not page_src or not tds_src or not sds_src:
            missing.append(f"{pid}:missing_doc")
            continue

        page_id = page_src["source_id"]
        tds_id = tds_src["source_id"]
        sds_id = sds_src["source_id"]
        source_ids = [page_id, tds_id, sds_id]
        official_url = page_src.get("url") or f"https://www.jub.hu/termekek/{slug_from_product_id(pid)}/"
        slug = slug_from_product_id(pid)

        # Prefer enrichment editorial source ids when present
        desc_src_ids = ed_src or [tds_id]
        prof_src_ids = list(prof.get("sourceIds") or desc_src_ids)

        products_ts.append(
            "  {\n"
            f'    id: {ts_str(pid)},\n'
            f'    type: "product",\n'
            f'    slug: {ts_str(slug)},\n'
            f'    name: {ts_str(name)},\n'
            f'    shortDescription: {ts_str(short_desc(editorial))},\n'
            f'    officialUrl: {ts_str(official_url)},\n'
            f'    productClass: {ts_str(product_class)},\n'
            f'    status: "published",\n'
            f'    indexable: false,\n'
            f'    seoTitle: {ts_str(f"{name} | FESTÉKINDEX")},\n'
            f'    seoDescription: {ts_str(seo_desc(name, brand_name))},\n'
            f'    sourceIds: {json.dumps(source_ids, ensure_ascii=False)},\n'
            f'    updatedAt: {ts_str(ACCESSED)},\n'
            f'    verifiedAt: {ts_str(ACCESSED)},\n'
            "  }"
        )

        for src, kind, title_suffix, doc_kind in (
            (page_src, "product_page", "termékoldal", "product_page"),
            (tds_src, "tds", "TDS", "tds"),
            (sds_src, "sds", "SDS", "sds"),
        ):
            sid = src["source_id"]
            if sid in seen_source_ids:
                continue
            seen_source_ids.add(sid)
            sources_ts.append(
                "  {\n"
                f'    id: {ts_str(sid)},\n'
                f'    type: "manufacturer",\n'
                f'    documentKind: {ts_str(doc_kind)},\n'
                f'    title: {ts_str(f"{name} — {title_suffix}")},\n'
                f'    url: {ts_str(src.get("url") or "")},\n'
                f'    publisher: {ts_str(PUBLISHER)},\n'
                f'    accessedAt: {ts_str(ACCESSED)},\n'
                "  }"
            )

        page_src_ids = json.dumps([page_id], ensure_ascii=False)
        relations_ts.append(
            "  {\n"
            f'    id: {ts_str(f"rel_{brand_id}_{pid}")},\n'
            f'    fromEntityId: {ts_str(brand_id)},\n'
            f'    toEntityId: {ts_str(pid)},\n'
            f'    relationType: "hasProduct",\n'
            f"    sourceIds: {page_src_ids},\n"
            f'    status: "active",\n'
            "  }"
        )
        relations_ts.append(
            "  {\n"
            f'    id: {ts_str(f"rel_{ORG_ID}_manufactures_{pid}")},\n'
            f'    fromEntityId: {ts_str(ORG_ID)},\n'
            f'    toEntityId: {ts_str(pid)},\n'
            f'    relationType: "manufactures",\n'
            f"    sourceIds: {page_src_ids},\n"
            f'    status: "active",\n'
            "  }"
        )
        relations_ts.append(
            "  {\n"
            f'    id: {ts_str(f"rel_{pid}_cat")},\n'
            f'    fromEntityId: {ts_str(pid)},\n'
            f'    toEntityId: {ts_str(cat_id)},\n'
            f'    relationType: "belongsToCategory",\n'
            f"    sourceIds: {page_src_ids},\n"
            f'    status: "active",\n'
            "  }"
        )

        descriptions_ts.append(
            "  {\n"
            f'    productId: {ts_str(pid)},\n'
            f'    sourceSummary: {ts_str(editorial)},\n'
            f'    sourceSummarySourceIds: {json.dumps(desc_src_ids, ensure_ascii=False)},\n'
            f'    editorialSummary: {ts_str(editorial)},\n'
            "  }"
        )

        sec_blocks = []
        for sec in sections:
            paras = ",\n".join(f"          {ts_str(p)}" for p in sec["paragraphs"])
            sec_blocks.append(
                "      {\n"
                f'        heading: {ts_str(sec["heading"])},\n'
                f"        paragraphs: [\n{paras},\n        ],\n"
                f'        sourceIds: {json.dumps(sec["sourceIds"], ensure_ascii=False)},\n'
                "      }"
            )
        prof_ts.append(
            "  {\n"
            f'    productId: {ts_str(pid)},\n'
            f'    sourceIds: {json.dumps(prof_src_ids, ensure_ascii=False)},\n'
            f"    sections: [\n"
            + ",\n".join(sec_blocks)
            + "\n    ],\n"
            "  }"
        )

    if missing or wrong_status:
        raise SystemExit(
            f"codegen blocked: missing={len(missing)} wrong_status={wrong_status[:10]} "
            f"sample_missing={missing[:10]}"
        )

    # Sub-brands (exclude existing brand_jub — lives in brands.ts)
    brand_entries = []
    brand_owns = []
    for label in sorted(brands_used):
        bid, bslug, bname = BRAND_MAP[label]
        if bid == "brand_jub":
            continue
        short = BRAND_SHORT.get(label, f"{bname} márka — JUB Kft.")
        body = (
            f"A {bname} a JUB Kft. gyártói portfóliójához kapcsolódó márka. "
            f"Hivatalos forrás: jub.hu."
        )
        brand_entries.append(
            "  {\n"
            f'    id: {ts_str(bid)},\n'
            f'    type: "brand",\n'
            f'    slug: {ts_str(bslug)},\n'
            f'    name: {ts_str(bname)},\n'
            f'    shortDescription: {ts_str(short)},\n'
            f'    body: {ts_str(body)},\n'
            f'    status: "published",\n'
            f'    indexable: false,\n'
            f'    seoTitle: {ts_str(f"{bname} | FESTÉKINDEX")},\n'
            f'    seoDescription: {ts_str(f"{bname} márka — JUB Kft. kapcsolat.")},\n'
            f'    sourceIds: ["src_jub_hu"],\n'
            f'    updatedAt: {ts_str(ACCESSED)},\n'
            f'    verifiedAt: {ts_str(ACCESSED)},\n'
            "  }"
        )
        brand_owns.append(
            "  {\n"
            f'    id: {ts_str(f"rel_{ORG_ID}_owns_{bid}")},\n'
            f'    fromEntityId: {ts_str(ORG_ID)},\n'
            f'    toEntityId: {ts_str(bid)},\n'
            f'    relationType: "owns",\n'
            f'    sourceIds: ["src_jub_hu"],\n'
            f'    status: "active",\n'
            "  }"
        )

    OUT.mkdir(parents=True, exist_ok=True)

    (OUT / "products.ts").write_text(
        'import type { Product } from "../../types";\n\n'
        "/** JUB 95 PASS catalogue identities (v8.2). indexable locked false. */\n"
        "export const jub95Products: Product[] = [\n"
        + ",\n".join(products_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "sources.ts").write_text(
        'import type { Source } from "../../types";\n\n'
        "export const jub95Sources: Source[] = [\n"
        + ",\n".join(sources_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "relations.ts").write_text(
        'import type { Relation } from "../../types";\n\n'
        "export const jub95Relations: Relation[] = [\n"
        + ",\n".join(brand_owns + relations_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "descriptions.ts").write_text(
        'import type { ProductDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const jub95Descriptions: ProductDescriptionEnrichment[] = [\n"
        + ",\n".join(descriptions_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "professionalDescriptions.ts").write_text(
        'import type { ProductProfessionalDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const jub95ProfessionalDescriptions: ProductProfessionalDescriptionEnrichment[] = [\n"
        + ",\n".join(prof_ts)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "brands.ts").write_text(
        'import type { Brand } from "../../types";\n\n'
        "/** JUB sub-brands for 95 PASS (umbrella brand_jub already in brands.ts). */\n"
        "export const jub95Brands: Brand[] = [\n"
        + (",\n".join(brand_entries) if brand_entries else "")
        + ("\n" if brand_entries else "")
        + "];\n",
        encoding="utf-8",
    )
    (OUT / "apply.ts").write_text(
        '/**\n'
        " * Apply JUB 95 PASS overlay without touching Festék Bázis HOLD or PPG42 files.\n"
        " */\n"
        'import type { Product, Relation, Source } from "../../types";\n'
        "import {\n"
        "  applyProductDescriptionEnrichments,\n"
        "  applyProductProfessionalDescriptionEnrichments,\n"
        "  mergeSourcesWithEnrichment,\n"
        '} from "../festekBazisEnrichmentV1/apply";\n'
        'import { mergeRelationsByCanonicalKey } from "../merge";\n'
        'import { jub95Descriptions } from "./descriptions";\n'
        'import { jub95ProfessionalDescriptions } from "./professionalDescriptions";\n'
        'import { jub95Relations } from "./relations";\n'
        'import { jub95Sources } from "./sources";\n'
        "\n"
        "export function applyJub95V1(\n"
        "  products: Product[],\n"
        "  sources: Source[],\n"
        "  relations: Relation[],\n"
        "): { products: Product[]; sources: Source[]; relations: Relation[] } {\n"
        "  const productsEnriched = applyProductProfessionalDescriptionEnrichments(\n"
        "    applyProductDescriptionEnrichments(products, jub95Descriptions),\n"
        "    jub95ProfessionalDescriptions,\n"
        "  );\n"
        "  return {\n"
        "    products: productsEnriched,\n"
        "    sources: mergeSourcesWithEnrichment(sources, jub95Sources),\n"
        "    relations: mergeRelationsByCanonicalKey(relations, jub95Relations),\n"
        "  };\n"
        "}\n",
        encoding="utf-8",
    )
    (OUT / "index.ts").write_text(
        'export { jub95Products } from "./products";\n'
        'export { jub95Sources } from "./sources";\n'
        'export { jub95Relations } from "./relations";\n'
        'export { jub95Descriptions } from "./descriptions";\n'
        'export { jub95ProfessionalDescriptions } from "./professionalDescriptions";\n'
        'export { jub95Brands } from "./brands";\n'
        'export { applyJub95V1 } from "./apply";\n'
        "export const JUB_95_PASS_COUNT = 95;\n",
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
