"""Natural Hungarian enrichment from PPG TDS facts (Editorial Standard aligned)."""

from __future__ import annotations

import re
from typing import Any

from .draft import ProductDraft
from .enrichment import (
    EnrichmentDraft,
    EnrichmentSection,
    _banned_excluding_product_name,
    _evidence,
)
from .extract import ExtractedDoc
from .ppg_tds import extract_ppg_tds


_DISCLAIMER = re.compile(
    r"(?i)(?:jelen dokumentumban szereplő|tájékoztató jelleg|laboratóriumi vizsgálatokon|"
    r"alkalmazási eset(?:ek)?re kiterjed|a\s+gyártó\s+fenntartja)"
)


def _polish_hu(text: str) -> str:
    """Light cleanup of PDF extract → readable HU (no invented facts)."""
    t = re.sub(r"\s+", " ", text).strip()
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    # Drop disclaimer sentences entirely
    sents = re.split(r"(?<=[.!?])\s+", t)
    sents = [s.strip() for s in sents if s.strip() and not _DISCLAIMER.search(s)]
    t = " ".join(sents).strip()
    return t


def _clip_sentences(text: str, max_chars: int = 420) -> str:
    text = _polish_hu(text)
    if len(text) <= max_chars:
        return text
    cut = text[:max_chars]
    for sep in (". ", "! ", "? "):
        idx = cut.rfind(sep)
        if idx >= int(max_chars * 0.55):
            return cut[: idx + 1].strip()
    return cut.rsplit(" ", 1)[0].strip() + "…"


def _fact_sentence(lead: str, body: str) -> str:
    body = _clip_sentences(body, 480)
    if not body:
        return ""
    if body[0].islower():
        body = body[0].upper() + body[1:]
    if not body.endswith((".", "…")):
        body += "."
    return f"{lead} {body}"


def _product_lead(name: str) -> str:
    """Natural article before product name (A / Az)."""
    n = (name or "").strip()
    if not n:
        return "A termék"
    first = n[0].lower()
    art = "Az" if first in "aáeéiíoóöőuúüű" else "A"
    return f"{art} {n}"


def _strip_html(html: str) -> str:
    t = re.sub(r"(?i)<br\s*/?>", "\n", html or "")
    t = re.sub(r"(?i)</p\s*>", "\n", t)
    t = re.sub(r"<[^>]+>", " ", t)
    t = re.sub(r"&nbsp;", " ", t)
    t = re.sub(r"&amp;", "&", t)
    return re.sub(r"\s+", " ", t).strip()


def _build_from_official_product_page(
    draft: ProductDraft,
    page_facts: dict[str, Any],
    *,
    tds_resolution: str | None,
) -> EnrichmentDraft:
    """
    When TDS PDF is absent/not downloadable, use official trilak.ppg.com page copy
    as source_type product_page — never invent specs. Incomplete sections → gaps.
    """
    gaps: list[str] = ["enrichment:missing_tds"]
    if tds_resolution:
        gaps.append(f"enrichment:tds_resolution:{tds_resolution}")
    sections: list[EnrichmentSection] = []
    specs: list[dict[str, str]] = []
    name = draft.product_name or page_facts.get("resolved_name") or draft.product_id
    short = _polish_hu(page_facts.get("short_marketing") or "")
    long_raw = _strip_html(str(page_facts.get("long_marketing") or ""))
    long = _polish_hu(long_raw)

    if short or long:
        body = short or _clip_sentences(long, 320)
        para = f"{_product_lead(name)} a hivatalos termékoldal szerint {body[0].lower() + body[1:] if body else ''}"
        if not para.endswith((".", "…")):
            para += "."
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Termékleírás",
                paragraphs=[para],
                source_ids=["product_page"],
                evidence=[
                    {
                        "source_id": "product_page",
                        "doc_kind": "product_page",
                        "sha256": "",
                        "page": None,
                        "quote": (short or long)[:180],
                    }
                ],
                status="banned_phrase" if banned else "ok",
            )
        )
        summary = para
        summary_sources = ["product_page"]
    else:
        gaps.append("enrichment:missing_section:Termékleírás")
        summary = None
        summary_sources = []

    # Alkalmazás from long marketing "Alkalmazási terület" block if present
    app_m = re.search(
        r"(?is)alkalmazási\s+terület\s*:?\s*(.+?)(?=(?:felület|előír|szárad|kiadó|műszaki|$))",
        long_raw,
    )
    if app_m:
        app = _clip_sentences(_polish_hu(app_m.group(1)), 400)
        if app:
            para = _fact_sentence("Alkalmazási terület:", app)
            banned = _banned_excluding_product_name(para, name)
            sections.append(
                EnrichmentSection(
                    heading="Alkalmazás",
                    paragraphs=[para],
                    source_ids=["product_page"],
                    evidence=[
                        {
                            "source_id": "product_page",
                            "doc_kind": "product_page",
                            "sha256": "",
                            "page": None,
                            "quote": app[:180],
                        }
                    ],
                    status="banned_phrase" if banned else "ok",
                )
            )
        else:
            gaps.append("enrichment:missing_section:Alkalmazás")
    else:
        gaps.append("enrichment:missing_section:Alkalmazás")

    # Structured technicalData — only non-empty official fields
    td = page_facts.get("technicalData") or {}
    use_bits: list[str] = []
    for label, key in (
        ("Száradási idő", "dryingTime"),
        ("Érintésre száraz", "dryingTimeTouchDry"),
        ("Átfesthető", "overpaintableAfter"),
        ("Kiadósság", "coverageText"),
        ("Felhasználási feltételek", "conditionsForUse"),
    ):
        val = td.get(key)
        if val not in (None, "", [], {}):
            use_bits.append(f"{label}: {val}")
            specs.append(
                {
                    "label": label,
                    "value": str(val),
                    "source_id": "product_page",
                    "page": "",
                }
            )
    for attr in page_facts.get("attributes") or []:
        if isinstance(attr, dict) and attr.get("name") and attr.get("values"):
            specs.append(
                {
                    "label": str(attr["name"]),
                    "value": ", ".join(str(v) for v in attr["values"]),
                    "source_id": "product_page",
                    "page": "",
                }
            )

    if use_bits:
        para = "Felhasználás (hivatalos termékoldal): " + "; ".join(use_bits) + "."
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Felhasználás",
                paragraphs=[para],
                source_ids=["product_page"],
                evidence=[
                    {
                        "source_id": "product_page",
                        "doc_kind": "product_page",
                        "sha256": "",
                        "page": None,
                        "quote": use_bits[0][:180],
                    }
                ],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Felhasználás")

    if specs:
        lines = [f"{s['label']}: {s['value']}" for s in specs[:8]]
        para = "Műszaki adatok a hivatalos termékoldal szerint: " + "; ".join(lines) + "."
        sections.append(
            EnrichmentSection(
                heading="Műszaki adatok",
                paragraphs=[para],
                source_ids=["product_page"],
                evidence=[
                    {
                        "source_id": "product_page",
                        "doc_kind": "product_page",
                        "sha256": "",
                        "page": None,
                        "quote": lines[0][:180],
                    }
                ],
                status="ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Műszaki adatok")

    # Surface prep rarely on product page — honest gap (do not invent)
    gaps.append("enrichment:missing_section:Előkészítés")

    if summary is None:
        gaps.append("enrichment:missing_editorial_summary")

    # Mark that an official alt source was used (classify may skip hard missing_tds)
    gaps.append("enrichment:alt_source:product_page")

    return EnrichmentDraft(
        product_id=draft.product_id,
        editorial_summary=summary,
        editorial_summary_source_ids=summary_sources,
        sections=sections,
        specifications=specs,
        gaps=gaps,
        invented_values=False,
    )


def build_ppg_enrichment(
    draft: ProductDraft,
    docs: list[ExtractedDoc],
    page_facts: dict[str, Any] | None = None,
) -> EnrichmentDraft:
    page_facts = page_facts or {}
    tds = next((d for d in docs if d.kind == "tds"), None)
    gaps: list[str] = []
    sections: list[EnrichmentSection] = []
    specs: list[dict[str, str]] = []

    if tds is None:
        res = (page_facts.get("tds_resolution") or {}).get("status")
        # Official product-page fallback — still may be incomplete → REVIEW, never invent
        if page_facts.get("short_marketing") or page_facts.get("long_marketing"):
            if "has_official_alt_tech_source" not in draft.warnings:
                draft.warnings.append("has_official_alt_tech_source")
            return _build_from_official_product_page(
                draft, page_facts, tds_resolution=res
            )
        gaps.append("enrichment:missing_tds")
        return EnrichmentDraft(
            product_id=draft.product_id,
            editorial_summary=None,
            editorial_summary_source_ids=[],
            sections=[],
            specifications=[],
            gaps=gaps,
            invented_values=False,
        )

    extracted = extract_ppg_tds(tds)
    name = (
        draft.product_name
        or extracted.title
        or page_facts.get("resolved_name")
        or draft.product_id
    )

    # --- Termékleírás ---
    props = extracted.sections.get("properties")
    subtitle = extracted.subtitle
    if props or subtitle:
        bits: list[str] = []
        if subtitle and not _DISCLAIMER.search(subtitle):
            bits.append(_polish_hu(subtitle.rstrip(".")))
        if props:
            bits.append(_clip_sentences(props.text, 320))
        # Deduplicate overlapping subtitle/props
        body_parts: list[str] = []
        for b in bits:
            if not b:
                continue
            if body_parts and b.lower() in body_parts[-1].lower():
                continue
            body_parts.append(b)
        body = ". ".join(body_parts)
        body = _polish_hu(body)
        if body and _DISCLAIMER.search(body):
            body = ""
        if body:
            lead = _product_lead(name)
            # Prefer natural: "{Name} — {subtitle}. {properties…}"
            if body[0].islower():
                body = body[0].upper() + body[1:]
            para = f"{lead} a Műszaki adatlap szerint {body[0].lower() + body[1:]}"
            if not para.endswith((".", "…")):
                para += "."
            para = re.sub(r"\s+", " ", para)
            banned = _banned_excluding_product_name(para, name)
            sections.append(
                EnrichmentSection(
                    heading="Termékleírás",
                    paragraphs=[para],
                    source_ids=[tds.source_id],
                    evidence=[
                        _evidence(tds, (props.quote if props else subtitle or name)[:180])
                    ],
                    status="banned_phrase" if banned else "ok",
                )
            )
            summary = para
            summary_sources = [tds.source_id]
        else:
            gaps.append("enrichment:missing_section:Termékleírás")
            summary = None
            summary_sources = []
    else:
        gaps.append("enrichment:missing_section:Termékleírás")
        summary = None
        summary_sources = []

    # --- Alkalmazás ---
    app = extracted.sections.get("application")
    if app:
        para = _fact_sentence(
            "Alkalmazási terület:",
            app.text,
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Alkalmazás",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, app.quote)],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Alkalmazás")

    # --- Előkészítés ---
    prep = extracted.sections.get("surface_prep")
    if prep:
        para = _fact_sentence(
            "Felület-előkészítés:",
            prep.text,
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Előkészítés",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, prep.quote)],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Előkészítés")

    # --- Felhasználás (dilution + temp + drying) ---
    use_bits: list[str] = []
    evid_quote = None
    for key in ("prep_dilution", "processing_temp", "drying", "coverage"):
        sec = extracted.sections.get(key)
        if not sec:
            continue
        use_bits.append(_clip_sentences(sec.text, 220))
        evid_quote = evid_quote or sec.quote
    if use_bits:
        para = (
            "Felhasználás: "
            + " ".join(b if b.endswith((".", "…")) else b + "." for b in use_bits)
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Felhasználás",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, evid_quote or use_bits[0][:160])],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Felhasználás")

    # --- Korlátozások ---
    if extracted.limitations:
        para = "Korlátozások: " + " ".join(
            lim if lim.endswith(".") else lim + "." for lim in extracted.limitations
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Korlátozások",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, extracted.limitations[0][:180])],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Korlátozások")

    # --- Műszaki adatok ---
    tech = extracted.sections.get("tech_props")
    cov = extracted.sections.get("coverage")
    if tech or cov or extracted.coverage_lines:
        lines: list[str] = []
        if extracted.coverage_lines:
            lines.extend(_clip_sentences(ln, 120) for ln in extracted.coverage_lines[:5])
        elif cov:
            lines.append(_clip_sentences(cov.text, 240))
        if tech:
            lines.append(_clip_sentences(tech.text, 280))
        # page structured attrs as supplement only if TDS thin
        if len(lines) < 2:
            for attr in page_facts.get("attributes") or []:
                if isinstance(attr, dict) and attr.get("name") and attr.get("values"):
                    lines.append(
                        f"{attr['name']}: {', '.join(str(v) for v in attr['values'])}"
                    )
                    specs.append(
                        {
                            "label": str(attr["name"]),
                            "value": ", ".join(str(v) for v in attr["values"]),
                            "source_id": "product_page",
                            "page": "",
                        }
                    )
        para = "Műszaki adatok: " + "; ".join(lines) + "."
        banned = _banned_excluding_product_name(para, name)
        q = (tech.quote if tech else (cov.quote if cov else lines[0]))[:180]
        sections.append(
            EnrichmentSection(
                heading="Műszaki adatok",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, q)],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        # fall back to page attributes only — mark gap if empty
        for attr in page_facts.get("attributes") or []:
            if isinstance(attr, dict) and attr.get("name") and attr.get("values"):
                specs.append(
                    {
                        "label": str(attr["name"]),
                        "value": ", ".join(str(v) for v in attr["values"]),
                        "source_id": "product_page",
                        "page": "",
                    }
                )
        if specs:
            lines = [f"{s['label']}: {s['value']}" for s in specs]
            para = (
                "Műszaki adatok a hivatalos termékoldal strukturált mezői szerint: "
                + "; ".join(lines)
                + "."
            )
            sections.append(
                EnrichmentSection(
                    heading="Műszaki adatok",
                    paragraphs=[para],
                    source_ids=["product_page"],
                    evidence=[
                        {
                            "source_id": "product_page",
                            "doc_kind": "product_page",
                            "sha256": "",
                            "page": None,
                            "quote": lines[0][:180],
                        }
                    ],
                    status="ok",
                )
            )
        else:
            gaps.append("enrichment:missing_section:Műszaki adatok")

    if summary is None:
        gaps.append("enrichment:missing_editorial_summary")

    return EnrichmentDraft(
        product_id=draft.product_id,
        editorial_summary=summary,
        editorial_summary_source_ids=summary_sources,
        sections=sections,
        specifications=specs,
        gaps=gaps,
        invented_values=False,
    )
