"""Natural Hungarian enrichment from official JUB HU TDS (no invented facts)."""

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
from .jub_tds import extract_jub_tds


_DISCLAIMER = re.compile(
    r"(?i)(?:jelen dokumentumban szereplő|tájékoztató jelleg|laboratóriumi vizsgálatokon|"
    r"a\s+gyártó\s+fenntartja|right\s+to\s+change)"
)


def _strip_banned_marketing(text: str) -> str:
    """Drop Editorial-banned marketing tokens from manufacturer wording (no invention)."""
    t = text
    t = re.sub(r"(?i)\bprémium\b", "", t)
    t = re.sub(r"(?i)\bkimagasl[oó]\w*\b", "", t)
    t = re.sub(r"(?i)\btökéletes\s+választás\b", "", t)
    t = re.sub(r"\s{2,}", " ", t)
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    return t.strip(" -–—")


def _polish_hu(text: str) -> str:
    t = re.sub(r"\s+", " ", text).strip()
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    sents = re.split(r"(?<=[.!?])\s+", t)
    sents = [s.strip() for s in sents if s.strip() and not _DISCLAIMER.search(s)]
    return _strip_banned_marketing(" ".join(sents).strip())


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


def _fact_sentence(lead: str, body: str, max_chars: int = 480) -> str:
    body = _clip_sentences(body, max_chars)
    if not body:
        return ""
    if body[0].islower():
        body = body[0].upper() + body[1:]
    if not body.endswith((".", "…")):
        body += "."
    return f"{lead} {body}"


def _product_lead(name: str) -> str:
    n = (name or "").strip()
    if not n:
        return "A termék"
    first = n[0].lower()
    art = "Az" if first in "aáeéiíoóöőuúüű" else "A"
    return f"{art} {n}"


def _split_description_application(text: str) -> tuple[str, str]:
    """Split JUB §1 into product description vs application sentences."""
    text = _polish_hu(text)
    if not text:
        return "", ""
    # Application often starts with Alkalmas / Alkalmazható / Felhasználható
    m = re.search(
        r"(?i)((?:Alkalmas|Alkalmazható|Felhasználható|Használható)\b.*)$",
        text,
    )
    if m and m.start() > 40:
        desc = text[: m.start()].strip()
        app = m.group(1).strip()
        return desc, app
    # Fallback: first 1–2 sentences = description; rest = application
    sents = re.split(r"(?<=[.!?])\s+", text)
    sents = [s for s in sents if s.strip()]
    if len(sents) >= 3:
        return " ".join(sents[:2]).strip(), " ".join(sents[2:]).strip()
    if len(sents) == 2:
        return sents[0], sents[1]
    return text, text


def build_jub_enrichment(
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

    extracted = extract_jub_tds(tds)
    name = (
        draft.product_name
        or extracted.title
        or page_facts.get("resolved_name")
        or draft.product_id
    )
    summary: str | None = None
    summary_sources: list[str] = []

    # --- Termékleírás + Alkalmazás from §1 ---
    desc_sec = extracted.sections.get("description_application")
    if desc_sec:
        desc_body, app_body = _split_description_application(desc_sec.text)
        if extracted.subtitle and not _DISCLAIMER.search(extracted.subtitle):
            sub = _polish_hu(extracted.subtitle.rstrip("."))
            if sub and sub.lower() not in (desc_body or "").lower():
                desc_body = f"{sub}. {desc_body}".strip() if desc_body else sub
        if desc_body:
            lead = _product_lead(name)
            body = _clip_sentences(desc_body, 360)
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
                    evidence=[_evidence(tds, desc_sec.quote)],
                    status="banned_phrase" if banned else "ok",
                )
            )
            summary = para
            summary_sources = [tds.source_id]
        else:
            gaps.append("enrichment:missing_section:Termékleírás")

        if app_body:
            para = _fact_sentence("Alkalmazási terület:", app_body, 500)
            banned = _banned_excluding_product_name(para, name)
            sections.append(
                EnrichmentSection(
                    heading="Alkalmazás",
                    paragraphs=[para],
                    source_ids=[tds.source_id],
                    evidence=[_evidence(tds, app_body[:180])],
                    status="banned_phrase" if banned else "ok",
                )
            )
        else:
            gaps.append("enrichment:missing_section:Alkalmazás")
    else:
        gaps.append("enrichment:missing_section:Termékleírás")
        gaps.append("enrichment:missing_section:Alkalmazás")

    # --- Előkészítés ---
    prep = extracted.sections.get("surface_prep")
    prod_prep = extracted.sections.get("product_prep")
    prep_bits: list[str] = []
    quote = ""
    if prep:
        prep_bits.append(_clip_sentences(prep.text, 380))
        quote = prep.quote
    if prod_prep:
        prep_bits.append(_clip_sentences(prod_prep.text, 280))
        quote = quote or prod_prep.quote
    if prep_bits:
        para = _fact_sentence("Felület-előkészítés:", " ".join(prep_bits), 560)
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Előkészítés",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, quote)],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Előkészítés")

    # --- Felhasználás ---
    app = extracted.sections.get("application")
    cond = extracted.sections.get("conditions")
    use_bits: list[str] = []
    use_quote = ""
    if cond:
        use_bits.append(_clip_sentences(cond.text, 300))
        use_quote = cond.quote
    if app:
        use_bits.append(_clip_sentences(app.text, 360))
        use_quote = use_quote or app.quote
    if use_bits:
        para = _fact_sentence("Felhasználás:", " ".join(use_bits), 560)
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Felhasználás",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, use_quote)],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Felhasználás")

    # --- Műszaki adatok ---
    tech = extracted.sections.get("technical")
    colours = extracted.sections.get("colours")
    tech_parts: list[str] = []
    if tech:
        tech_parts.append(_clip_sentences(tech.text, 420))
    if colours:
        tech_parts.append(
            _clip_sentences(f"Színárnyalatok: {_polish_hu(colours.text)}", 280)
        )
    for k, label in (
        ("pack_sizes", "Kiszerelés"),
        ("coverage", "Anyagszükséglet"),
        ("gloss", "Fény"),
        ("voc", "VOC"),
        ("density", "Sűrűség"),
        ("coats", "Rétegszám"),
        ("drying", "Száradás"),
    ):
        if k in extracted.specs:
            specs.append({"key": k, "label": label, "value": extracted.specs[k]})
    if tech_parts or specs:
        if tech_parts:
            para = _fact_sentence("Műszaki jellemzők:", " ".join(tech_parts), 520)
        else:
            bits = [f"{s['label']}: {s['value']}" for s in specs[:6]]
            para = _fact_sentence("Műszaki jellemzők:", "; ".join(bits), 420)
        quote_src = (
            tech.quote if tech else (colours.quote if colours else name)
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Műszaki adatok",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, quote_src[:180])],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Műszaki adatok")

    # --- Korlátozások (optional) ---
    other = extracted.sections.get("other")
    if other:
        para = _fact_sentence("Egyéb információk:", other.text, 360)
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Korlátozások",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, other.quote)],
                status="banned_phrase" if banned else "ok",
            )
        )

    if not summary:
        for s in sections:
            if s.heading == "Termékleírás" and s.paragraphs:
                summary = s.paragraphs[0]
                summary_sources = list(s.source_ids)
                break

    return EnrichmentDraft(
        product_id=draft.product_id,
        editorial_summary=summary,
        editorial_summary_source_ids=summary_sources,
        sections=sections,
        specifications=specs,
        gaps=gaps,
        invented_values=False,
    )
