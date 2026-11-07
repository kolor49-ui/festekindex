"""Remmers enrichment — TDS-first, official product-page fallback. No invention."""

from __future__ import annotations

import re
from typing import Any

from .draft import ProductDraft
from .editorial import find_banned_phrases
from .enrichment import EnrichmentDraft, EnrichmentSection, _clean, _evidence
from .extract import ExtractedDoc
from .remmers_tds import extract_remmers_tds


def _polish_hu(text: str) -> str:
    t = _clean(text or "")
    t = re.sub(r"\s+", " ", t).strip()
    # Characters React escapes in text nodes (&quot; / &#x27; / &amp; / &lt;).
    t = t.replace("&", "+").replace('"', "’").replace("'", "’")
    t = t.replace("<", "(").replace(">", ")")
    return t


def _clip_sentences(text: str, limit: int) -> str:
    t = _polish_hu(text)
    if len(t) <= limit:
        return t
    cut = t[: limit - 1]
    if " " in cut:
        cut = cut.rsplit(" ", 1)[0]
    return cut.rstrip(",;:") + "…"


def _banned(text: str, product_name: str | None) -> list[str]:
    hits = find_banned_phrases(text or "")
    if not product_name:
        return hits
    pname = product_name.lower()
    return [h for h in hits if h.lower() not in pname]


def _section(
    heading: str,
    para: str,
    *,
    source_ids: list[str],
    quote: str,
    name: str | None,
    doc: ExtractedDoc | None = None,
) -> EnrichmentSection:
    banned = _banned(para, name)
    evidence = []
    if doc is not None:
        evidence = [_evidence(doc, quote)]
    elif quote:
        evidence = [
            {
                "source_id": source_ids[0] if source_ids else "product_page",
                "doc_kind": "product_page",
                "sha256": "",
                "page": None,
                "quote": quote[:220],
            }
        ]
    return EnrichmentSection(
        heading=heading,
        paragraphs=[para],
        source_ids=source_ids,
        evidence=evidence,
        status="banned_phrase" if banned else "ok",
    )


def _fact_sentence(prefix: str, body: str, limit: int) -> str:
    body = _clip_sentences(body, limit)
    para = f"{prefix} {body}"
    if not para.endswith((".", "…", "!")):
        para += "."
    return para


def _build_from_tds(
    draft: ProductDraft,
    tds: ExtractedDoc,
    page_facts: dict[str, Any],
) -> EnrichmentDraft:
    extracted = extract_remmers_tds(tds)
    name = extracted.title or draft.identity_from_tds or draft.product_name
    gaps: list[str] = []
    sections: list[EnrichmentSection] = []
    specs: list[dict[str, str]] = []
    summary: str | None = None
    summary_sources: list[str] = []

    # Termékleírás: subtitle, else properties, else page lead
    desc = extracted.subtitle
    if not desc and "properties" in extracted.sections:
        desc = extracted.sections["properties"].text
    if not (desc and len(_polish_hu(desc)) >= 40):
        lead = page_facts.get("page_lead") or page_facts.get("short_marketing")
        if isinstance(lead, str) and len(_polish_hu(lead)) >= 40:
            desc = lead
            src_ids = ["product_page"]
            doc_for = None
        else:
            desc = None
            src_ids = [tds.source_id]
            doc_for = tds
    else:
        src_ids = [tds.source_id]
        doc_for = tds

    if desc and len(_polish_hu(desc)) >= 40:
        para = _fact_sentence(
            f"A(z) {name} a Műszaki adatlap szerint:",
            desc,
            420,
        )
        # Avoid doubling if desc already starts with product name
        if name and _polish_hu(desc).lower().startswith(_polish_hu(str(name)).lower()):
            para = _fact_sentence("A Műszaki adatlap szerint:", desc, 420)
        sections.append(
            _section(
                "Termékleírás",
                para,
                source_ids=src_ids,
                quote=desc[:180],
                name=str(name) if name else None,
                doc=doc_for,
            )
        )
        summary = para
        summary_sources = list(src_ids)
    else:
        gaps.append("enrichment:missing_section:Termékleírás")

    app_sec = extracted.sections.get("application")
    app = app_sec.text if app_sec else None
    if not (app and len(_polish_hu(app)) >= 40):
        app = page_facts.get("application_area") if isinstance(page_facts.get("application_area"), str) else None
        app_src = ["product_page"]
        app_doc = None
    else:
        app_src = [tds.source_id]
        app_doc = tds
    if app and len(_polish_hu(app)) >= 40:
        para = _fact_sentence("Felhasználási terület:", app, 700)
        sections.append(
            _section(
                "Alkalmazás",
                para,
                source_ids=app_src,
                quote=app[:180],
                name=str(name) if name else None,
                doc=app_doc,
            )
        )
    else:
        gaps.append("enrichment:missing_section:Alkalmazás")

    prep_sec = extracted.sections.get("surface_prep")
    prep = prep_sec.text if prep_sec else None
    if prep and len(_polish_hu(prep)) >= 40:
        para = _fact_sentence("Felület-előkészítés a Műszaki adatlap szerint:", prep, 700)
        sections.append(
            _section(
                "Előkészítés",
                para,
                source_ids=[tds.source_id],
                quote=prep[:180],
                name=str(name) if name else None,
                doc=tds,
            )
        )
    else:
        gaps.append("enrichment:missing_section:Előkészítés")

    use_sec = extracted.sections.get("usage")
    use = use_sec.text if use_sec else None
    if use and len(_polish_hu(use)) >= 40:
        para = _fact_sentence("Feldolgozás a Műszaki adatlap szerint:", use, 700)
        sections.append(
            _section(
                "Felhasználás",
                para,
                source_ids=[tds.source_id],
                quote=use[:180],
                name=str(name) if name else None,
                doc=tds,
            )
        )
    else:
        gaps.append("enrichment:missing_section:Felhasználás")

    # Specs from TDS technical block / parsed specs / page attributes
    for k, v in (extracted.specs or {}).items():
        specs.append(
            {
                "label": k,
                "value": v,
                "source_id": tds.source_id,
                "page": "",
            }
        )
    tech_sec = extracted.sections.get("technical")
    if not specs and tech_sec and len(_polish_hu(tech_sec.text)) >= 40:
        specs.append(
            {
                "label": "Műszaki adatok (TDS)",
                "value": _clip_sentences(tech_sec.text, 500),
                "source_id": tds.source_id,
                "page": "",
            }
        )
    if not specs:
        for attr in page_facts.get("attributes") or []:
            if isinstance(attr, dict) and attr.get("name") and attr.get("values"):
                specs.append(
                    {
                        "label": str(attr["name"]),
                        "value": ", ".join(str(x) for x in attr["values"]),
                        "source_id": "product_page",
                        "page": "",
                    }
                )

    if specs:
        lines = [f"{s['label']}: {s['value']}" for s in specs[:10]]
        src_ids = sorted({s.get("source_id") or tds.source_id for s in specs})
        if all(s.get("source_id") == "product_page" for s in specs):
            para = (
                "Műszaki adatok a hivatalos termékoldal szerint: "
                + "; ".join(lines)
                + "."
            )
            doc_for = None
            quote = lines[0]
            sid = ["product_page"]
        else:
            para = "Műszaki adatok a Műszaki adatlap szerint: " + "; ".join(lines) + "."
            doc_for = tds
            quote = lines[0]
            sid = [tds.source_id]
        sections.append(
            _section(
                "Műszaki adatok",
                para,
                source_ids=sid,
                quote=quote[:180],
                name=str(name) if name else None,
                doc=doc_for,
            )
        )
    else:
        gaps.append("enrichment:missing_section:Műszaki adatok")

    # Korlátozások from notes / application exclusion phrases
    limit_bits: list[str] = []
    search_blobs = [
        extracted.sections[k].text
        for k in ("notes", "application", "usage")
        if k in extracted.sections
    ]
    for blob in search_blobs:
        for pat in [
            re.compile(r"(?i)nem\s+(?:alkalmas|javasolt|ajánlott)[^.。\n]{10,160}"),
            re.compile(r"(?i)tilos[^.。\n]{8,120}"),
            re.compile(r"(?i)kerülni kell[^.。\n]{8,120}"),
        ]:
            for m in pat.finditer(blob):
                bit = _polish_hu(m.group(0))
                if bit and bit not in limit_bits:
                    limit_bits.append(bit)
                if len(limit_bits) >= 3:
                    break
            if len(limit_bits) >= 3:
                break
        if len(limit_bits) >= 3:
            break
    if limit_bits:
        para = "Korlátozások a Műszaki adatlap szövegéből: " + " ".join(
            b if b.endswith(".") else b + "." for b in limit_bits
        )
        sections.append(
            _section(
                "Korlátozások",
                para,
                source_ids=[tds.source_id],
                quote=limit_bits[0][:180],
                name=str(name) if name else None,
                doc=tds,
            )
        )
    else:
        gaps.append("enrichment:missing_section:Korlátozások")

    if not summary:
        for prefer in ("Termékleírás", "Alkalmazás", "Felhasználás", "Műszaki adatok"):
            for s in sections:
                if s.heading == prefer and s.paragraphs and s.status == "ok":
                    summary = s.paragraphs[0]
                    summary_sources = list(s.source_ids)
                    break
            if summary:
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
    if "has_official_alt_tech_source" not in draft.warnings:
        draft.warnings.append("has_official_alt_tech_source")

    name = draft.product_name or page_facts.get("resolved_name") or draft.product_id
    gaps: list[str] = ["enrichment:alt_source:product_page"]
    sections: list[EnrichmentSection] = []
    specs: list[dict[str, str]] = []
    summary: str | None = None
    summary_sources: list[str] = []

    lead = page_facts.get("page_lead") or page_facts.get("short_marketing") or page_facts.get("properties")
    if isinstance(lead, str) and len(_polish_hu(lead)) >= 40:
        para = _fact_sentence(
            f"A(z) {name} a hivatalos termékoldal szerint:",
            lead,
            360,
        )
        sections.append(
            _section(
                "Termékleírás",
                para,
                source_ids=["product_page"],
                quote=lead[:180],
                name=str(name),
            )
        )
        summary = para
        summary_sources = ["product_page"]
    else:
        gaps.append("enrichment:missing_section:Termékleírás")

    app = page_facts.get("application_area")
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

    gaps.append("enrichment:missing_section:Előkészítés")
    gaps.append("enrichment:missing_section:Felhasználás")

    for attr in page_facts.get("attributes") or []:
        if isinstance(attr, dict) and attr.get("name") and attr.get("values"):
            specs.append(
                {
                    "label": str(attr["name"]).rstrip(":"),
                    "value": ", ".join(str(v) for v in attr["values"]),
                    "source_id": "product_page",
                }
            )
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

    return EnrichmentDraft(
        product_id=draft.product_id,
        editorial_summary=summary,
        editorial_summary_source_ids=summary_sources,
        sections=sections,
        specifications=specs,
        gaps=gaps,
        invented_values=False,
    )


def build_remmers_enrichment(
    draft: ProductDraft,
    docs: list[ExtractedDoc],
    page_facts: dict[str, Any] | None = None,
) -> EnrichmentDraft:
    page_facts = page_facts or {}
    tds = next((d for d in docs if d.kind == "tds"), None)
    if tds is not None:
        return _build_from_tds(draft, tds, page_facts)

    has_structured = any(
        isinstance(page_facts.get(k), str) and len(str(page_facts.get(k))) >= 40
        for k in ("application_area", "page_lead", "properties", "short_marketing")
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
