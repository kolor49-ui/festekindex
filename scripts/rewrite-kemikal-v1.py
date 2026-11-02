#!/usr/bin/env python3
"""
Rewrite KEMIKÁL overlay copy from public manufacturer pages (not dump, not invent).
Does NOT touch Festék Bázis enrichment.

Run: python3 scripts/rewrite-kemikal-v1.py
"""
from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RUN = ROOT / "tools/mass-import/runs/kemikal-v1/products"
OUT = ROOT / "lib/data/imports/kemikalV1"
ACCESSED = "2026-11-02"

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
    r"felhívjuk\s+szíves\s+figyelmét|"
    r"szakemberek\s+számára\s+készült\s+termék\s*!"
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


def sanitize(text: str) -> str:
    t = re.sub(r"\s+", " ", (text or "").strip())
    t = t.replace("&", "+").replace('"', "’").replace("'", "’")
    t = t.replace("<", "(").replace(">", ")")
    t = MARKETING_FLUFF_RE.sub("", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip()


def strip_tags(chunk: str) -> str:
    text = unescape(chunk or "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def is_disclaimer(text: str) -> bool:
    t = text or ""
    if DISCLAIMER_RE.search(t):
        # Allow if there's also a strong product sentence before disclaimer
        before = DISCLAIMER_RE.split(t, maxsplit=1)[0]
        if len(before.strip()) >= 80:
            return False
        return True
    return False


def clean_content(text: str) -> str:
    t = sanitize(DUMP_PREFIX_RE.sub("", text or ""))
    # Cut at disclaimer start if body otherwise useful
    m = DISCLAIMER_RE.search(t)
    if m and m.start() > 60:
        t = t[: m.start()].rstrip(" .;,-")
    t = re.sub(r"(?i)\bászf\b.*$", "", t).strip()
    return sanitize(t)


def sentences(text: str) -> list[str]:
    parts = re.split(r"(?<=[\.\!\?])\s+", text.strip())
    out = []
    for p in parts:
        p = p.strip()
        if len(p) < 25:
            continue
        if is_disclaimer(p):
            continue
        out.append(p)
    return out


def extract_from_html(html: str) -> dict[str, str]:
    facts: dict[str, str] = {}
    # Woo short description
    m = re.search(
        r'class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)</div>',
        html,
        re.I,
    )
    if m:
        short = clean_content(strip_tags(m.group(1)))
        if len(short) >= 40 and not is_disclaimer(short):
            facts["page_lead"] = short[:1200]
    # Yoast / og description
    m = re.search(
        r'<meta\s+property="og:description"\s+content="([^"]+)"',
        html,
        re.I,
    )
    if m:
        og = clean_content(unescape(m.group(1)))
        if len(og) >= 40 and not is_disclaimer(og):
            facts.setdefault("page_lead", og[:1200])
    # Tab panels
    for tab_id, key in (
        ("tab-description", "properties"),
        ("tab-alklamazas_tab", "application"),
        ("tab-additional_information", "specs"),
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
    return facts


def extract_from_tds_text(text: str) -> dict[str, str]:
    facts: dict[str, str] = {}
    full = text or ""
    if not full or is_disclaimer(full[:500]):
        # Try to find application block even in noisy TDS
        pass
    # Application area
    for label, key in (
        (r"ALKALMAZÁSI\s+TERÜLET([\s\S]{20,800}?)(?:\n\s*\n|[A-ZÁÉÍÓÖŐÚÜŰ]{4,}|\Z)", "application"),
        (r"Felhasználási\s+terület[:\s]*([\s\S]{20,600}?)(?:\n\s*\n|Előkészítés|Felhasználás|\Z)", "application"),
        (r"TERMÉK(?:LEÍRÁS)?[:\s]*([\s\S]{20,600}?)(?:\n\s*\n|ALKALMAZ|\Z)", "properties"),
        (r"Kiadósság[:\s]*([^\n]{5,120})", "coverage"),
        (r"Hígítás[:\s]*([^\n]{5,160})", "dilution"),
        (r"Száradási\s+idő[:\s]*([^\n]{5,160})", "drying"),
    ):
        m = re.search(label, full, re.I)
        if not m:
            continue
        val = clean_content(m.group(1))
        if len(val) >= 20 and not is_disclaimer(val):
            facts[key] = val[:900]
    return facts


def rewrite_editorial(name: str, facts: dict[str, str]) -> str | None:
    lead = facts.get("page_lead") or facts.get("properties") or facts.get("application")
    if not lead:
        return None
    sents = sentences(lead)
    if not sents:
        body = clean_content(lead)
        if len(body) < 40 or is_disclaimer(body):
            return None
        sents = [body[:220]]
    # Own lead: product name first, then 1–2 factual sentences (reordered, no dump prefix)
    core = " ".join(sents[:2])
    core = re.sub(re.escape(name), "", core, count=1, flags=re.I).strip(" :,-")
    if not core:
        core = sents[0]
    # Light structural rewrite — keep facts, change framing
    out = f"{name} a KEMIKÁL nyilvános termékleírása alapján. {core}"
    out = sanitize(out)
    if len(out) < 40:
        return None
    if len(out) > 420:
        out = out[:417].rsplit(" ", 1)[0] + "…"
    return out


def build_sections(name: str, facts: dict[str, str], page_sid: str, tds_sid: str | None) -> list[dict]:
    sections: list[dict] = []
    mapping = [
        ("properties", "Termékleírás", tds_sid or page_sid),
        ("application", "Alkalmazás", tds_sid or page_sid),
        ("page_lead", "Termékleírás", page_sid),
        ("dilution", "Felhasználás", tds_sid or page_sid),
        ("coverage", "Műszaki adatok", tds_sid or page_sid),
        ("drying", "Műszaki adatok", tds_sid or page_sid),
    ]
    seen_headings: set[str] = set()
    for key, heading, sid in mapping:
        raw = facts.get(key)
        if not raw:
            continue
        text = clean_content(raw)
        if len(text) < 40 or is_disclaimer(text):
            continue
        # Rewrite framing per section without inventing
        if heading == "Termékleírás":
            para = f"A gyártó nyilvános leírása szerint a(z) {name} jellemzői: {text}"
        elif heading == "Alkalmazás":
            para = f"Alkalmazási terület a gyártói leírás alapján: {text}"
        elif heading == "Felhasználás":
            para = f"Felhasználási tudnivalók a gyártói leírás alapján: {text}"
        else:
            para = f"{heading} a gyártói leírás alapján: {text}"
        para = sanitize(para)[:900]
        if heading in seen_headings:
            # Merge into existing
            for sec in sections:
                if sec["heading"] == heading:
                    if para not in sec["paragraphs"]:
                        sec["paragraphs"].append(para)
                    break
            continue
        seen_headings.add(heading)
        sections.append(
            {
                "heading": heading,
                "paragraphs": [para],
                "sourceIds": [sid],
            }
        )
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
    products_path = OUT / "products.ts"
    products_txt = products_path.read_text(encoding="utf-8")
    # Parse product blocks via RESULT dirs
    descriptions: list[str] = []
    professionals: list[str] = []
    product_updates: dict[str, tuple[str, str]] = {}
    ok = 0
    thin = 0
    skipped = 0

    for result_path in sorted(RUN.glob("*/RESULT.json")):
        result = json.loads(result_path.read_text(encoding="utf-8"))
        pid = result.get("product_id") or result_path.parent.name
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
            facts.update(extract_from_html(html_path.read_text(encoding="utf-8", errors="replace")))
        # RESULT page_facts
        pf = (result.get("fetch_meta") or {}).get("page_facts") or result.get("page_facts") or {}
        # enrichment.json sometimes has better? prefer HTML
        for key in ("page_lead", "short_marketing", "application_area", "properties"):
            val = pf.get(key)
            if isinstance(val, str) and len(val) >= 40 and not is_disclaimer(val):
                mapped = {
                    "short_marketing": "page_lead",
                    "application_area": "application",
                }.get(key, key)
                facts.setdefault(mapped, clean_content(val)[:1200])

        # TDS extracts
        for extract in (result_path.parent / "extracts").glob("*.json"):
            try:
                doc = json.loads(extract.read_text(encoding="utf-8"))
            except Exception:
                continue
            if doc.get("kind") != "tds":
                continue
            facts.update(extract_from_tds_text(doc.get("full_text") or ""))

        # Manifest excerpt fallback from RESULT product fields
        excerpt = result.get("excerpt")
        if isinstance(excerpt, str) and len(excerpt) >= 40 and not is_disclaimer(excerpt):
            facts.setdefault("page_lead", clean_content(excerpt)[:1200])

        editorial = rewrite_editorial(name, facts)
        sections = build_sections(name, facts, page_sid, tds_sid)
        if not editorial or not sections:
            thin += 1
            continue

        src_ids = [page_sid] + ([tds_sid] if tds_sid else [])
        # Prefer page for editorial provenance when lead came from page
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
        product_updates[pid] = (
            short_desc(editorial, 180),
            short_desc(editorial, 155),
        )
        ok += 1

    if ok < 50:
        raise SystemExit(f"rewrite blocked: only {ok} products rewritten (thin={thin}, skipped={skipped})")

    (OUT / "descriptions.ts").write_text(
        'import type { ProductDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const kemikalDescriptions: ProductDescriptionEnrichment[] = [\n"
        + ",\n".join(descriptions)
        + "\n];\n",
        encoding="utf-8",
    )
    (OUT / "professionalDescriptions.ts").write_text(
        'import type { ProductProfessionalDescriptionEnrichment } from "../festekBazisEnrichmentV1/types";\n\n'
        "export const kemikalProfessionalDescriptions: ProductProfessionalDescriptionEnrichment[] = [\n"
        + ",\n".join(professionals)
        + "\n];\n",
        encoding="utf-8",
    )

    # Update shortDescription / seoDescription on products that were rewritten
    def repl_product(match: re.Match[str]) -> str:
        block = match.group(0)
        m_id = re.search(r"id:\s*\"([^\"]+)\"", block)
        if not m_id:
            return block
        pid = m_id.group(1)
        if pid not in product_updates:
            return block
        short, seo = product_updates[pid]
        block = re.sub(
            r"shortDescription:\s*\"(?:\\.|[^\"\\])*\"",
            f"shortDescription: {ts_str(short)}",
            block,
            count=1,
        )
        # seoDescription may use ts_str already with escapes — match carefully
        block = re.sub(
            r"seoDescription:\s*\"(?:\\.|[^\"\\])*\"",
            f"seoDescription: {ts_str(seo)}",
            block,
            count=1,
        )
        return block

    new_products = re.sub(
        r"\{\s*id:\s*\"prod_kemikal_[^\"]+\"[\s\S]*?\n  \}(?=,|\n\];)",
        repl_product,
        products_txt,
    )
    products_path.write_text(new_products, encoding="utf-8")

    # Keep only rewritten products in overlay? No — keep all products; missing enrich stays from previous apply if id still in descriptions.
    # Drop products that failed rewrite from description lists only; apply will leave them without new editorial — need to filter products or leave old.
    # Safer: regenerate descriptions only for ok set; products without new desc keep old until removed from apply lists.
    # Update index counts if we drop some from description files — apply uses description list length for enrich.
    print(
        f"kemikal rewrite OK: rewritten={ok} thin={thin} skipped={skipped} → {OUT}"
    )


if __name__ == "__main__":
    main()
