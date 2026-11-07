"""Natural Hungarian enrichment from official Poli-Farbe TDS and/or product pages.

Rules:
- Prefer Műszaki adatlap PDF when present and real.
- Else use structured official product-page sections as alt tech source
  (has_official_alt_tech_source) — never invent missing prep/specs.
- SDS never substitutes TDS / technical enrichment.
"""

from __future__ import annotations

import re
from html import unescape
from typing import Any

from .draft import ProductDraft
from .enrichment import (
    EnrichmentDraft,
    EnrichmentSection,
    _banned_excluding_product_name,
    _evidence,
)
from .extract import ExtractedDoc
from .poli_tds import extract_poli_tds


_DISCLAIMER = re.compile(
    r"(?i)(?:jelen dokumentumban szereplő|tájékoztató jelleg|laboratóriumi vizsgálatokon|"
    r"a\s+gyártó\s+fenntartja|right\s+to\s+change)"
)


def _strip_banned_marketing(text: str) -> str:
    t = text
    t = re.sub(r"(?i)\bprémium\b", "", t)
    t = re.sub(r"(?i)\bkiváló\b", "", t)
    t = re.sub(r"(?i)\bkimagasl[oó]\w*\b", "", t)
    t = re.sub(r"(?i)\btökéletes(?:\s+\w+)?\b", "", t)
    t = re.sub(r"(?i)\bpáratlan\b", "", t)
    t = re.sub(r"(?i)\bpraktikus\s+választás\b", "", t)
    t = re.sub(r"(?i)\bideális\s+választás\b", "", t)
    t = re.sub(r"\s{2,}", " ", t)
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    return t.strip(" -–—")


def _polish_hu(text: str) -> str:
    t = unescape(text or "")
    t = re.sub(r"\s+", " ", t).strip()
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


def _section(
    heading: str,
    para: str,
    *,
    source_ids: list[str],
    quote: str,
    name: str,
    doc: ExtractedDoc | None = None,
) -> EnrichmentSection:
    banned = _banned_excluding_product_name(para, name)
    evidence: list[dict[str, Any]]
    if doc is not None:
        evidence = [_evidence(doc, quote)]
    else:
        evidence = [
            {
                "source_id": source_ids[0] if source_ids else "product_page",
                "doc_kind": "product_page",
                "sha256": "",
                "page": None,
                "quote": (quote or "")[:180],
            }
        ]
    return EnrichmentSection(
        heading=heading,
        paragraphs=[para],
        source_ids=source_ids,
        evidence=evidence,
        status="banned_phrase" if banned else "ok",
    )


def _build_from_tds(
    draft: ProductDraft,
    tds: ExtractedDoc,
    page_facts: dict[str, Any],
) -> EnrichmentDraft:
    extracted = extract_poli_tds(tds)
    name = (
        draft.product_name
        or extracted.title
        or page_facts.get("resolved_name")
        or draft.product_id
    )
    gaps: list[str] = []
    sections: list[EnrichmentSection] = []
    specs: list[dict[str, str]] = []
    summary: str | None = None
    summary_sources: list[str] = []

    desc = extracted.sections.get("description")
    if desc and desc.text:
        body = _clip_sentences(desc.text, 360)
        lead = _product_lead(str(name))
        if body:
            para = f"{lead} a Műszaki adatlap szerint: {body[0].lower() + body[1:]}"
            para = re.sub(r"\s+", " ", para)
            if not para.endswith((".", "…")):
                para += "."
            sections.append(
                _section(
                    "Termékleírás",
                    para,
                    source_ids=[tds.source_id],
                    quote=desc.quote,
                    name=str(name),
                    doc=tds,
                )
            )
            summary = para
            summary_sources = [tds.source_id]
        else:
            gaps.append("enrichment:missing_section:Termékleírás")
    else:
        # Fallback: page lead if TDS lacks JELLEMZÉS (rare)
        lead_txt = page_facts.get("page_lead") or page_facts.get("short_marketing")
        if isinstance(lead_txt, str) and len(lead_txt) >= 40:
            body = _clip_sentences(lead_txt, 320)
            para = f"{_product_lead(str(name))} a hivatalos termékoldal szerint: {body[0].lower() + body[1:]}"
            para = re.sub(r"\s+", " ", para)
            if not para.endswith((".", "…")):
                para += "."
            sections.append(
                _section(
                    "Termékleírás",
                    para,
                    source_ids=["product_page"],
                    quote=body[:180],
                    name=str(name),
                )
            )
            summary = para
            summary_sources = ["product_page"]
        else:
            gaps.append("enrichment:missing_section:Termékleírás")

    app = extracted.sections.get("application")
    app_text = app.text if app else ""
    # Some Poli TDS fold use-scope into JELLEMZÉS (first sentences with kül-/beltér…)
    if not app_text:
        desc = extracted.sections.get("description")
        if desc and desc.text:
            m_scope = re.search(
                r"(?is)((?:Kül-?\s*és\s*beltéren|Beltéri|Kültéri|Alkalmas|Ajánljuk)[\s\S]{20,400})",
                desc.text,
            )
            if m_scope:
                app_text = m_scope.group(1).strip()
                app = desc
    if app_text:
        para = _fact_sentence("Alkalmazási terület:", app_text, 500)
        sections.append(
            _section(
                "Alkalmazás",
                para,
                source_ids=[tds.source_id],
                quote=(app.quote if app else app_text)[:180],
                name=str(name),
                doc=tds,
            )
        )
    else:
        page_app = page_facts.get("application_area")
        if isinstance(page_app, str) and len(page_app) >= 40:
            para = _fact_sentence("Alkalmazási terület:", page_app, 500)
            sections.append(
                _section(
                    "Alkalmazás",
                    para,
                    source_ids=["product_page"],
                    quote=page_app[:180],
                    name=str(name),
                )
            )
        else:
            # Page lead sometimes IS the application sentence for short pages
            lead = page_facts.get("page_lead")
            if isinstance(lead, str) and re.search(
                r"(?i)(?:kül-?\s*és\s*beltér|beltéri|kültéri|alkalmazható|festésére)",
                lead,
            ):
                para = _fact_sentence("Alkalmazási terület:", lead, 420)
                sections.append(
                    _section(
                        "Alkalmazás",
                        para,
                        source_ids=["product_page"],
                        quote=lead[:180],
                        name=str(name),
                    )
                )
            else:
                gaps.append("enrichment:missing_section:Alkalmazás")

    prep = extracted.sections.get("surface_prep")
    usage = extracted.sections.get("usage")
    prep_text = ""
    usage_text = usage.text if usage else ""
    if prep:
        prep_text = prep.text
    elif usage_text:
        # Split "Előkészítés – …" / "Festés – …" from FELHASZNÁLÁS block
        m_prep = re.search(
            r"(?is)(?:Felület\s+előkészítése|Előkészítés)\s*[:–\-]\s*([\s\S]{40,900}?)(?=(?:Festés|Lakkozás|Felhordás)\s*[:–\-]|$)",
            usage_text,
        )
        if m_prep:
            prep_text = m_prep.group(1).strip()
            usage_text = (usage_text[: m_prep.start()] + usage_text[m_prep.end() :]).strip()

    if prep_text and len(_polish_hu(prep_text)) >= 40:
        para = _fact_sentence("Felület-előkészítés:", prep_text, 560)
        quote = prep.quote if prep else prep_text[:180]
        sections.append(
            _section(
                "Előkészítés",
                para,
                source_ids=[tds.source_id],
                quote=quote,
                name=str(name),
                doc=tds,
            )
        )
    else:
        page_prep = page_facts.get("preparation")
        if isinstance(page_prep, str) and len(page_prep) >= 40:
            para = _fact_sentence("Felület-előkészítés:", page_prep, 560)
            sections.append(
                _section(
                    "Előkészítés",
                    para,
                    source_ids=["product_page"],
                    quote=page_prep[:180],
                    name=str(name),
                )
            )
        else:
            gaps.append("enrichment:missing_section:Előkészítés")

    if usage_text and len(_polish_hu(usage_text)) >= 40:
        para = _fact_sentence("Felhasználás:", usage_text, 560)
        quote = usage.quote if usage else usage_text[:180]
        sections.append(
            _section(
                "Felhasználás",
                para,
                source_ids=[tds.source_id],
                quote=quote,
                name=str(name),
                doc=tds,
            )
        )
    else:
        page_use = page_facts.get("application_steps")
        if isinstance(page_use, str) and len(page_use) >= 40:
            para = _fact_sentence("Felhasználás:", page_use, 560)
            sections.append(
                _section(
                    "Felhasználás",
                    para,
                    source_ids=["product_page"],
                    quote=page_use[:180],
                    name=str(name),
                )
            )
        else:
            gaps.append("enrichment:missing_section:Felhasználás")

    tech = extracted.sections.get("technical")
    tech_parts: list[str] = []
    if tech:
        tech_parts.append(_clip_sentences(tech.text, 420))
    for k, label in (
        ("pack_sizes", "Kiszerelés"),
        ("coverage", "Kiadósság"),
        ("density", "Sűrűség"),
        ("voc", "VOC"),
        ("ph", "pH"),
    ):
        if k in extracted.specs:
            specs.append({"key": k, "label": label, "value": extracted.specs[k]})
    # Supplement from page attribute list
    for attr in page_facts.get("attributes") or []:
        if isinstance(attr, dict) and attr.get("name") and attr.get("values"):
            label = str(attr["name"]).rstrip(":")
            val = ", ".join(str(v) for v in attr["values"])
            if not any(s.get("label") == label for s in specs):
                specs.append(
                    {
                        "key": label,
                        "label": label,
                        "value": val,
                        "source_id": "product_page",
                    }
                )

    if tech_parts or specs:
        if tech_parts:
            para = _fact_sentence("Műszaki jellemzők:", " ".join(tech_parts), 520)
            quote_src = tech.quote if tech else str(name)
            src_ids = [tds.source_id]
            doc = tds
        else:
            bits = [f"{s['label']}: {s['value']}" for s in specs[:6]]
            para = _fact_sentence("Műszaki jellemzők:", "; ".join(bits), 420)
            quote_src = bits[0]
            src_ids = [str(specs[0].get("source_id") or tds.source_id)]
            doc = tds if src_ids[0] == tds.source_id else None
        sections.append(
            _section(
                "Műszaki adatok",
                para,
                source_ids=src_ids,
                quote=quote_src[:180],
                name=str(name),
                doc=doc,
            )
        )
    else:
        gaps.append("enrichment:missing_section:Műszaki adatok")

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


def _build_from_product_page(
    draft: ProductDraft,
    page_facts: dict[str, Any],
) -> EnrichmentDraft:
    """Official product-page alt tech — cited, no invention."""
    if "has_official_alt_tech_source" not in draft.warnings:
        draft.warnings.append("has_official_alt_tech_source")

    name = (
        draft.product_name
        or page_facts.get("resolved_name")
        or draft.product_id
    )
    gaps: list[str] = ["enrichment:alt_source:product_page"]
    sections: list[EnrichmentSection] = []
    specs: list[dict[str, str]] = []
    summary: str | None = None
    summary_sources: list[str] = []

    lead = page_facts.get("page_lead") or page_facts.get("short_marketing")
    if isinstance(lead, str) and len(_polish_hu(lead)) >= 40:
        body = _clip_sentences(lead, 320)
        para = (
            f"{_product_lead(str(name))} a hivatalos termékoldal szerint: "
            f"{body[0].lower() + body[1:]}"
        )
        para = re.sub(r"\s+", " ", para)
        if not para.endswith((".", "…")):
            para += "."
        sections.append(
            _section(
                "Termékleírás",
                para,
                source_ids=["product_page"],
                quote=body[:180],
                name=str(name),
            )
        )
        summary = para
        summary_sources = ["product_page"]
    else:
        gaps.append("enrichment:missing_section:Termékleírás")

    app = page_facts.get("application_area")
    if not (isinstance(app, str) and len(_polish_hu(app)) >= 40):
        lead = page_facts.get("page_lead")
        if isinstance(lead, str) and re.search(
            r"(?i)(?:kül-?\s*és\s*beltér|beltéri|kültéri|alkalmazható|festésére|impregnál)",
            lead,
        ):
            app = lead
    if isinstance(app, str) and len(_polish_hu(app)) >= 40:
        para = _fact_sentence("Alkalmazási terület:", app, 500)
        sections.append(
            _section(
                "Alkalmazás",
                para,
                source_ids=["product_page"],
                quote=app[:180],
                name=str(name),
            )
        )
    else:
        gaps.append("enrichment:missing_section:Alkalmazás")

    prep = page_facts.get("preparation")
    if isinstance(prep, str) and len(_polish_hu(prep)) >= 40:
        para = _fact_sentence("Felület-előkészítés:", prep, 560)
        sections.append(
            _section(
                "Előkészítés",
                para,
                source_ids=["product_page"],
                quote=prep[:180],
                name=str(name),
            )
        )
    else:
        gaps.append("enrichment:missing_section:Előkészítés")

    steps = page_facts.get("application_steps")
    use_bits: list[str] = []
    if isinstance(steps, str) and len(_polish_hu(steps)) >= 40:
        use_bits.append(_clip_sentences(steps, 360))
    for attr in page_facts.get("attributes") or []:
        if isinstance(attr, dict) and attr.get("name") and attr.get("values"):
            label = str(attr["name"]).rstrip(":")
            val = ", ".join(str(v) for v in attr["values"])
            specs.append(
                {
                    "label": label,
                    "value": val,
                    "source_id": "product_page",
                }
            )
            if label.lower() in {
                "felhordás",
                "javasolt rétegszám",
                "hígítás",
                "száradási idő (20 °c-on)",
                "átfesthetőség (20 °c-on)",
                "kiadósság",
            }:
                use_bits.append(f"{label}: {val}")

    if use_bits:
        para = _fact_sentence("Felhasználás:", " ".join(use_bits), 560)
        sections.append(
            _section(
                "Felhasználás",
                para,
                source_ids=["product_page"],
                quote=use_bits[0][:180],
                name=str(name),
            )
        )
    else:
        gaps.append("enrichment:missing_section:Felhasználás")

    if specs:
        lines = [f"{s['label']}: {s['value']}" for s in specs[:8]]
        para = _fact_sentence(
            "Műszaki adatok a hivatalos termékoldal szerint:",
            "; ".join(lines),
            520,
        )
        sections.append(
            _section(
                "Műszaki adatok",
                para,
                source_ids=["product_page"],
                quote=lines[0][:180],
                name=str(name),
            )
        )
    else:
        gaps.append("enrichment:missing_section:Műszaki adatok")

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


def build_poli_enrichment(
    draft: ProductDraft,
    docs: list[ExtractedDoc],
    page_facts: dict[str, Any] | None = None,
) -> EnrichmentDraft:
    page_facts = page_facts or {}
    tds = next((d for d in docs if d.kind == "tds"), None)

    if tds is not None:
        return _build_from_tds(draft, tds, page_facts)

    # Official product page as alt tech when structured sections exist
    has_structured = any(
        isinstance(page_facts.get(k), str) and len(str(page_facts.get(k))) >= 40
        for k in ("application_area", "preparation", "application_steps", "page_lead")
    )
    if has_structured or page_facts.get("attributes"):
        return _build_from_product_page(draft, page_facts)

    return EnrichmentDraft(
        product_id=draft.product_id,
        editorial_summary=None,
        editorial_summary_source_ids=[],
        sections=[],
        specifications=[],
        gaps=["enrichment:missing_tds"],
        invented_values=False,
    )
