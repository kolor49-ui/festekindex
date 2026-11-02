#!/usr/bin/env python3
"""
Rewrite a non-FB manufacturer overlay from cached public product pages.
No invention. No Festék Bázis touch.

Example:
  python3 scripts/rewrite-overlay-public-v1.py \
    --prefix prod_egrokorr_ \
    --run-dir tools/mass-import/runs/egrokorr-v1/products \
    --out-dir lib/data/imports/egrokorrV1 \
    --frame "az EGROKORR nyilvános termékleírása alapján" \
    --export-prefix egrokorr
"""
from __future__ import annotations

import argparse
import json
import re
from html import unescape
from pathlib import Path

DISCLAIMER_RE = re.compile(
    r"(?i)("
    r"termékismertetőnk\s+legjobb|"
    r"változtatás\s+jogát|"
    r"vevőszolgálatunk|"
    r"garanciális\s+igény|"
    r"adatkezel|"
    r"ászf|"
    r"cookie|"
    r"jelen\s+kiadvány|"
    r"felhívjuk\s+szíves\s+figyelmét"
    r")"
)
DUMP_PREFIX_RE = re.compile(
    r"(?i)^(a\s+hivatalos\s+termékoldal\s+szerint:\s*|a\s+műszaki\s+adatlap\s+szerint\s*(?:a\(z\))?\s*)"
)


def ts_str(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


MARKETING_FLUFF_RE = re.compile(
    r"(?i)\b(?:ideális választás|tökéletes választás|legjobb a piacon|"
    r"kimagasl[oó](?:an)?|forradalmi|csúcskategóriás)\b"
)
CTA_FLUFF_RE = re.compile(
    r"(?i)(?:fedezze fel|ismerje meg|válassza|használja)\s+[^!]{0,100}!"
)


def sanitize(text: str) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    t = t.replace("&", "+").replace('"', "’").replace("'", "’")
    t = t.replace("<", "(").replace(">", ")")
    t = MARKETING_FLUFF_RE.sub("", t)
    t = CTA_FLUFF_RE.sub("", t)
    t = re.sub(r"\s{2,}", " ", t)
    t = re.sub(r"\s+([.,;:])", r"\1", t)
    return t.strip()


def strip_tags(chunk: str) -> str:
    text = unescape(chunk or "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def is_disclaimer(text: str) -> bool:
    t = text or ""
    if not DISCLAIMER_RE.search(t):
        return False
    before = DISCLAIMER_RE.split(t, maxsplit=1)[0]
    return len(before.strip()) < 80


def clean_content(text: str) -> str:
    t = sanitize(DUMP_PREFIX_RE.sub("", text or ""))
    m = DISCLAIMER_RE.search(t)
    if m and m.start() > 60:
        t = t[: m.start()].rstrip(" .;,-")
    return sanitize(t)


def sentences(text: str) -> list[str]:
    out = []
    for p in re.split(r"(?<=[\.\!\?])\s+", text.strip()):
        p = p.strip()
        if len(p) < 25 or is_disclaimer(p):
            continue
        out.append(p)
    return out


def extract_from_html(html: str) -> dict[str, str]:
    facts: dict[str, str] = {}
    m = re.search(
        r'class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)</div>',
        html,
        re.I,
    )
    if m:
        short = clean_content(strip_tags(m.group(1)))
        if len(short) >= 40 and not is_disclaimer(short):
            facts["page_lead"] = short[:1200]
    m = re.search(r'<meta\s+property="og:description"\s+content="([^"]+)"', html, re.I)
    if m:
        og = clean_content(unescape(m.group(1)))
        if len(og) >= 40 and not is_disclaimer(og):
            facts.setdefault("page_lead", og[:1200])
    for tab_id, key in (
        ("tab-description", "properties"),
        ("tab-alklamazas_tab", "application"),
    ):
        m = re.search(
            rf'id="{tab_id}"[^>]*>([\s\S]*?)(?:</div>\s*</div>|id="tab-)',
            html,
            re.I,
        )
        if not m:
            continue
        body = clean_content(strip_tags(m.group(1)))
        if len(body) >= 40 and not is_disclaimer(body):
            facts[key] = body[:1200]
    # Generic paragraphs fallback
    if "page_lead" not in facts:
        for m in re.finditer(r"<p[^>]*>(.*?)</p>", html, re.I | re.S):
            t = clean_content(strip_tags(m.group(1)))
            if len(t) < 60 or is_disclaimer(t):
                continue
            if "cookie" in t.lower():
                continue
            facts["page_lead"] = t[:1200]
            break
    return facts


def extract_from_tds_text(text: str) -> dict[str, str]:
    facts: dict[str, str] = {}
    full = text or ""
    for label, key in (
        (r"ALKALMAZÁSI\s+TERÜLET([\s\S]{20,800}?)(?:\n\s*\n|[A-ZÁÉÍÓÖŐÚÜŰ]{4,}|\Z)", "application"),
        (r"Felhasználási\s+terület[:\s]*([\s\S]{20,600}?)(?:\n\s*\n|Előkészítés|Felhasználás|\Z)", "application"),
        (r"Kiadósság[:\s]*([^\n]{5,120})", "coverage"),
        (r"Hígítás[:\s]*([^\n]{5,160})", "dilution"),
    ):
        m = re.search(label, full, re.I)
        if not m:
            continue
        val = clean_content(m.group(1))
        if len(val) >= 20 and not is_disclaimer(val):
            facts[key] = val[:900]
    return facts


def rewrite_editorial(name: str, facts: dict[str, str], frame: str) -> str | None:
    lead = facts.get("page_lead") or facts.get("properties") or facts.get("application")
    if not lead:
        return None
    sents = sentences(lead)
    if not sents:
        body = clean_content(lead)
        if len(body) < 40 or is_disclaimer(body):
            return None
        sents = [body[:220]]
    core = " ".join(sents[:2])
    core = re.sub(re.escape(name), "", core, count=1, flags=re.I).strip(" :,-")
    if not core:
        core = sents[0]
    out = sanitize(f"{name} {frame}. {core}")
    if len(out) < 40:
        return None
    if len(out) > 420:
        out = out[:417].rsplit(" ", 1)[0] + "…"
    return out


def build_sections(name: str, facts: dict[str, str], page_sid: str, tds_sid: str | None) -> list[dict]:
    sections: list[dict] = []
    seen: set[str] = set()
    mapping = [
        ("properties", "Termékleírás", tds_sid or page_sid),
        ("application", "Alkalmazás", tds_sid or page_sid),
        ("page_lead", "Termékleírás", page_sid),
        ("dilution", "Felhasználás", tds_sid or page_sid),
        ("coverage", "Műszaki adatok", tds_sid or page_sid),
    ]
    for key, heading, sid in mapping:
        raw = facts.get(key)
        if not raw:
            continue
        text = clean_content(raw)
        if len(text) < 40 or is_disclaimer(text):
            continue
        if heading == "Termékleírás":
            para = f"A gyártó nyilvános leírása szerint a(z) {name} jellemzői: {text}"
        elif heading == "Alkalmazás":
            para = f"Alkalmazási terület a gyártói leírás alapján: {text}"
        elif heading == "Felhasználás":
            para = f"Felhasználási tudnivalók a gyártói leírás alapján: {text}"
        else:
            para = f"{heading} a gyártói leírás alapján: {text}"
        para = sanitize(para)[:900]
        if heading in seen:
            for sec in sections:
                if sec["heading"] == heading and para not in sec["paragraphs"]:
                    sec["paragraphs"].append(para)
            continue
        seen.add(heading)
        sections.append({"heading": heading, "paragraphs": [para], "sourceIds": [sid]})
    return sections


def short_desc(text: str, limit: int = 180) -> str:
    t = sanitize(text)
    if len(t) <= limit:
        return t
    cut = t[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut + "…"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prefix", required=True)
    ap.add_argument("--run-dir", type=Path, required=True)
    ap.add_argument("--out-dir", type=Path, required=True)
    ap.add_argument("--frame", required=True)
    ap.add_argument("--export-prefix", required=True)
    ap.add_argument("--min-ok", type=int, default=1)
    args = ap.parse_args()

    products_path = args.out_dir / "products.ts"
    products_txt = products_path.read_text(encoding="utf-8")
    pids = set(re.findall(rf'id: "({re.escape(args.prefix)}[^"]+)"', products_txt))
    if not pids:
        raise SystemExit("no products found for prefix")

    descriptions: list[str] = []
    professionals: list[str] = []
    product_updates: dict[str, tuple[str, str]] = {}
    ok = thin = skipped = 0

    for result_path in sorted(args.run_dir.glob("*/RESULT.json")):
        result = json.loads(result_path.read_text(encoding="utf-8"))
        pid = result.get("product_id") or result_path.parent.name
        if pid not in pids:
            continue
        if result.get("status") not in {"PASS", "REVIEW"}:
            skipped += 1
            continue
        name = sanitize(str(result.get("product_name") or pid))
        sources = result.get("sources") or []
        page_src = next((s for s in sources if s.get("kind") == "product_page"), None)
        tds_src = next((s for s in sources if s.get("kind") == "tds"), None)
        if not page_src:
            skipped += 1
            continue
        page_sid = page_src["source_id"]
        tds_sid = tds_src["source_id"] if tds_src else None

        facts: dict[str, str] = {}
        html_path = result_path.parent / "sources" / "product_page.html"
        if html_path.exists():
            facts.update(
                extract_from_html(html_path.read_text(encoding="utf-8", errors="replace"))
            )
        pf = (result.get("fetch_meta") or {}).get("page_facts") or {}
        for key in ("page_lead", "short_marketing", "application_area", "properties"):
            val = pf.get(key)
            if isinstance(val, str) and len(val) >= 40 and not is_disclaimer(val):
                mapped = {
                    "short_marketing": "page_lead",
                    "application_area": "application",
                }.get(key, key)
                facts.setdefault(mapped, clean_content(val)[:1200])
        extracts = result_path.parent / "extracts"
        if extracts.exists():
            for extract in extracts.glob("*.json"):
                try:
                    doc = json.loads(extract.read_text(encoding="utf-8"))
                except Exception:
                    continue
                if doc.get("kind") == "tds":
                    facts.update(extract_from_tds_text(doc.get("full_text") or ""))

        editorial = rewrite_editorial(name, facts, args.frame)
        sections = build_sections(name, facts, page_sid, tds_sid)
        if not editorial or not sections:
            thin += 1
            continue
        src_ids = [page_sid] + ([tds_sid] if tds_sid else [])
        ed_src = [page_sid] if "page_lead" in facts else src_ids[:1]
        descriptions.append(
            "  {\n"
            f"    productId: {ts_str(pid)},\n"
            f"    sourceSummary: {ts_str(editorial)},\n"
            f"    sourceSummarySourceIds: {json.dumps(ed_src, ensure_ascii=False)},\n"
            f"    editorialSummary: {ts_str(editorial)},\n"
            "  }"
        )
        sec_blocks = []
        for sec in sections:
            paras = ",\n".join(f"          {ts_str(p)}" for p in sec["paragraphs"])
            sec_blocks.append(
                "      {\n"
                f"        heading: {ts_str(sec['heading'])},\n"
                f"        paragraphs: [\n{paras},\n        ],\n"
                f"        sourceIds: {json.dumps(sec['sourceIds'], ensure_ascii=False)},\n"
                "      }"
            )
        professionals.append(
            "  {\n"
            f"    productId: {ts_str(pid)},\n"
            f"    sourceIds: {json.dumps(src_ids, ensure_ascii=False)},\n"
            f"    sections: [\n"
            + ",\n".join(sec_blocks)
            + "\n    ],\n"
            "  }"
        )
        product_updates[pid] = (short_desc(editorial, 180), short_desc(editorial, 155))
        ok += 1

    # Preserve existing enrichments for products we could not rewrite.
    existing_desc = (args.out_dir / "descriptions.ts").read_text(encoding="utf-8")
    existing_prof = (args.out_dir / "professionalDescriptions.ts").read_text(
        encoding="utf-8"
    )
    rewritten_ids = set(product_updates)
    for pid in sorted(pids - rewritten_ids):
        m = re.search(
            rf'  {{\n    productId: "{re.escape(pid)}"[\s\S]*?\n  }}(?=,|\n\];)',
            existing_desc,
        )
        if m:
            descriptions.append(m.group(0))
        m = re.search(
            rf'  {{\n    productId: "{re.escape(pid)}"[\s\S]*?\n  }}(?=,|\n\];)',
            existing_prof,
        )
        if m:
            professionals.append(m.group(0))

    if ok < args.min_ok:
        raise SystemExit(f"rewrite blocked: ok={ok} thin={thin} skipped={skipped}")

    ep = args.export_prefix
    (args.out_dir / "descriptions.ts").write_text(
        'import type { ProductDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        f"export const {ep}Descriptions: ProductDescriptionEnrichment[] = [\n"
        + ",\n".join(descriptions)
        + "\n];\n",
        encoding="utf-8",
    )
    (args.out_dir / "professionalDescriptions.ts").write_text(
        'import type { ProductProfessionalDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        f"export const {ep}ProfessionalDescriptions: ProductProfessionalDescriptionEnrichment[] = [\n"
        + ",\n".join(professionals)
        + "\n];\n",
        encoding="utf-8",
    )

    def repl_product(match: re.Match[str]) -> str:
        block = match.group(0)
        m_id = re.search(r'id:\s*"([^"]+)"', block)
        if not m_id or m_id.group(1) not in product_updates:
            return block
        short, seo = product_updates[m_id.group(1)]
        block = re.sub(
            r"shortDescription:\s*\"(?:\\.|[^\"\\])*\"",
            f"shortDescription: {ts_str(short)}",
            block,
            count=1,
        )
        block = re.sub(
            r"seoDescription:\s*\"(?:\\.|[^\"\\])*\"",
            f"seoDescription: {ts_str(seo)}",
            block,
            count=1,
        )
        return block

    new_products = re.sub(
        rf"{{\s*id:\s*\"{re.escape(args.prefix)}[^\"]+\"[\s\S]*?\n  }}(?=,|\n\];)",
        repl_product,
        products_txt,
    )
    products_path.write_text(new_products, encoding="utf-8")
    print(f"{ep} rewrite OK: rewritten={ok}/{len(pids)} thin={thin} skipped={skipped}")


if __name__ == "__main__":
    main()
