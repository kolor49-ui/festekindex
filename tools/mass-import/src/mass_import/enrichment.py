"""Editorial Standard–aligned enrichment drafts from TDS facts (no invention)."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from typing import Any

from .draft import ProductDraft, _norm_name
from .editorial import find_banned_phrases


def _banned_excluding_product_name(text: str, product_name: str | None) -> list[str]:
    hits = find_banned_phrases(text or "")
    if not product_name:
        return hits
    pname = product_name.lower()
    return [h for h in hits if h.lower() not in pname]
from .extract import ExtractedDoc, find_quote_page


SECTION_HEADINGS = (
    "Termékleírás",
    "Alkalmazás",
    "Előkészítés",
    "Felhasználás",
    "Korlátozások",
    "Műszaki adatok",
)


@dataclass
class EnrichmentSection:
    heading: str
    paragraphs: list[str]
    source_ids: list[str]
    evidence: list[dict[str, Any]] = field(default_factory=list)
    status: str = "ok"  # ok | missing_source | banned_phrase


@dataclass
class EnrichmentDraft:
    product_id: str
    editorial_summary: str | None
    editorial_summary_source_ids: list[str]
    sections: list[EnrichmentSection]
    specifications: list[dict[str, str]]
    gaps: list[str] = field(default_factory=list)
    invented_values: bool = False

    def to_dict(self) -> dict[str, Any]:
        return {
            "product_id": self.product_id,
            "editorialSummary": self.editorial_summary,
            "editorialSummarySourceIds": self.editorial_summary_source_ids,
            "professionalDescription": {
                "sourceIds": sorted(
                    {
                        sid
                        for sec in self.sections
                        for sid in sec.source_ids
                    }
                ),
                "sections": [
                    {
                        "heading": s.heading,
                        "paragraphs": s.paragraphs,
                        "sourceIds": s.source_ids,
                        "evidence": s.evidence,
                        "status": s.status,
                    }
                    for s in self.sections
                ],
            },
            "specifications": self.specifications,
            "gaps": self.gaps,
            "invented_values": self.invented_values,
        }


def _clean(s: str) -> str:
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def _extract_labelled_block(text: str, label: str, stop_labels: list[str]) -> str | None:
    # Match label at line start
    pat = re.compile(
        rf"(?im)^[ \t]*{re.escape(label)}\s*[:：]?\s*(.*?)(?=(?:^|\n)[ \t]*(?:{'|'.join(re.escape(s) for s in stop_labels)})\s*[:：]?|\Z)",
        re.S,
    )
    m = pat.search(text)
    if not m:
        return None
    body = _clean(m.group(1))
    return body if len(body) >= 12 else None


def _extract_numbered_jub_block(text: str, *title_needles: str) -> str | None:
    """JUB TDS uses 'N. Title' section headers (HU)."""
    needles = [n.lower() for n in title_needles]
    # Find all numbered headers
    headers = list(
        re.finditer(r"(?im)^[ \t]*(\d{1,2})\.\s+([^\n]{3,80})\s*$", text)
    )
    if not headers:
        return None
    for i, h in enumerate(headers):
        title = h.group(2).strip().lower()
        if not any(n in title for n in needles):
            continue
        start = h.end()
        end = headers[i + 1].start() if i + 1 < len(headers) else len(text)
        body = _clean(text[start:end])
        # Drop trailing page markers like "1/4"
        body = re.sub(r"(?m)^\d+/\d+\s*$", "", body).strip()
        return body if len(body) >= 12 else None
    return None


def _page1(doc: ExtractedDoc) -> str:
    return doc.pages[0].text if doc.pages else doc.full_text


def _evidence(doc: ExtractedDoc, quote: str) -> dict[str, Any]:
    page = find_quote_page(doc, quote[:80]) if quote else None
    return {
        "source_id": doc.source_id,
        "doc_kind": doc.kind,
        "sha256": doc.sha256,
        "page": page or 1,
        "quote": (quote or "")[:220],
    }


def _sentence_from_fact(prefix: str, value: str) -> str:
    value = _clean(value)
    if value.endswith("."):
        return f"{prefix} {value}"
    return f"{prefix} {value}."


def build_enrichment(
    draft: ProductDraft,
    docs: list[ExtractedDoc],
    page_facts: dict[str, Any] | None = None,
) -> EnrichmentDraft:
    tds = next((d for d in docs if d.kind == "tds"), None)
    gaps: list[str] = []
    sections: list[EnrichmentSection] = []
    specs: list[dict[str, str]] = []
    summary: str | None = None
    summary_sources: list[str] = []
    page_facts = page_facts or {}

    if tds is None:
        # Official product-page short text may support a REVIEW-level lead.
        # When the manufacturer page also exposes structured tech blocks
        # (application / properties), emit those as source-backed sections —
        # still never invent content beyond the page facts.
        short = page_facts.get("short_marketing") or page_facts.get("page_lead")
        page_sections: list[EnrichmentSection] = []
        if page_facts.get("official_page_tech"):
            mapping = (
                ("properties", "Termékleírás"),
                ("application_area", "Alkalmazás"),
                ("preparation", "Előkészítés"),
                ("application_steps", "Felhasználás"),
            )
            for key, heading in mapping:
                val = page_facts.get(key)
                if not isinstance(val, str) or len(val.strip()) < 40:
                    continue
                page_sections.append(
                    EnrichmentSection(
                        heading=heading,
                        paragraphs=[_clean(val)[:900]],
                        source_ids=["product_page"],
                        evidence=[],
                        status="ok",
                    )
                )
        if isinstance(short, str) and len(short) >= 40:
            gaps.append("enrichment:missing_tds")
            gaps.append("enrichment:page_only_summary")
            if not page_sections:
                # Single lead section so REVIEW codegen has professional body.
                page_sections.append(
                    EnrichmentSection(
                        heading="Termékleírás",
                        paragraphs=[_clean(short)[:900]],
                        source_ids=["product_page"],
                        evidence=[],
                        status="ok",
                    )
                )
            # Rewrite framing (not dump paste). Facts stay page-sourced.
            cleaned = _clean(short)[:400]
            lead = cleaned if cleaned[:1].isupper() else cleaned[:1].upper() + cleaned[1:]
            if draft.product_name:
                name = _clean(str(draft.product_name))
                if not lead.lower().startswith(name.lower()[:12]):
                    lead = f"{name} — {lead}"
            if not lead.rstrip().endswith((".", "!", "?", "…")):
                lead += "."
            return EnrichmentDraft(
                product_id=draft.product_id,
                editorial_summary=lead[:420],
                editorial_summary_source_ids=["product_page"],
                sections=page_sections,
                specifications=[],
                gaps=gaps,
                invented_values=False,
            )
        if page_sections:
            gaps.append("enrichment:missing_tds")
            gaps.append("enrichment:page_only_sections")
            lead = _clean(page_sections[0].paragraphs[0])[:400]
            if draft.product_name:
                name = _clean(str(draft.product_name))
                if not lead.lower().startswith(name.lower()[:12]):
                    lead = f"{name} — {lead}"
            if not lead.rstrip().endswith((".", "!", "?", "…")):
                lead += "."
            return EnrichmentDraft(
                product_id=draft.product_id,
                editorial_summary=lead[:420],
                editorial_summary_source_ids=["product_page"],
                sections=page_sections,
                specifications=[],
                gaps=gaps,
                invented_values=False,
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

    page1 = _page1(tds)
    full = tds.full_text
    stop = [
        "Termék",
        "Színválaszték",
        "Kiszerelés",
        "Fényesség",
        "Kiadósság",
        "Tulajdonságok",
        "Jellemzés",
        "Alkalmazás",
        "Alkalmazási terület",
        "Felhasználási terület",
        "Felhasználási adatok",
        "Előkészítés",
        "Felület előkészítés",
        "Felület-előkészítés",
        "Felhasználás",
        "Feldolgozás",
        "Anyagszükséglet",
        "Minőségi jellemzők",
        "Műszaki adatok",
        "Választék",
        "Biztonság",
        "Biztonsági",
        "Figyelmeztetés",
        "Tárolás",
        "Festék Bázis",
        "PPG",
    ]

    termek = _extract_labelled_block(page1, "Termék", stop)
    if termek is None:
        termek = _extract_labelled_block(full, "Tulajdonságok", stop)
    if termek is None:
        termek = _extract_labelled_block(full, "Jellemzés", stop)
    if termek is None:
        termek = _extract_numbered_jub_block(full, "leírás", "leiras")
    alkalmazas = _extract_labelled_block(full, "Alkalmazás", stop)
    if alkalmazas is None:
        alkalmazas = _extract_labelled_block(full, "Alkalmazási terület", stop)
    if alkalmazas is None:
        alkalmazas = _extract_labelled_block(full, "Felhasználási terület", stop)
    if alkalmazas is None:
        alkalmazas = _extract_numbered_jub_block(full, "alkalmazás", "alkalmazas")
    # Poli-Farbe: Jellemzés opening often states where the product is recommended.
    if alkalmazas is None and termek:
        first = re.split(r"(?<=[.!?])\s+", termek, maxsplit=1)[0].strip()
        if len(first) >= 24 and re.search(
            r"(?i)ajánl|alkalmaz|beltér|kültér|felület|fa-|fal",
            first,
        ):
            alkalmazas = first
    elokeszites = _extract_labelled_block(full, "Előkészítés", stop)
    if elokeszites is None:
        elokeszites = _extract_labelled_block(full, "Elokeszites", stop)
    if elokeszites is None:
        elokeszites = _extract_labelled_block(full, "Felület előkészítés", stop)
    if elokeszites is None:
        elokeszites = _extract_labelled_block(full, "Felület-előkészítés", stop)
    if elokeszites is None:
        elokeszites = _extract_numbered_jub_block(
            full, "felület előkészítése", "felulet elokeszitese"
        )
    felhasznalas = _extract_labelled_block(full, "Felhasználás", stop)
    if felhasznalas is None:
        felhasznalas = _extract_labelled_block(full, "Felhasznalas", stop)
    if felhasznalas is None:
        felhasznalas = _extract_labelled_block(full, "Feldolgozás", stop)
    if felhasznalas is None:
        felhasznalas = _extract_labelled_block(full, "Anyagszükséglet", stop)
    if felhasznalas is None:
        felhasznalas = _extract_labelled_block(full, "Felhasználási adatok", stop)
    if felhasznalas is None:
        felhasznalas = _extract_numbered_jub_block(
            full, "festék felhordása", "festek felhordasa", "felhordás"
        )
    if felhasznalas is None:
        felhasznalas = _extract_numbered_jub_block(
            full, "festék előkészítése", "festek elokeszitese"
        )

    # Specs from draft facts (already sourced)
    for fact in draft.facts:
        if fact.doc_kind != "tds":
            continue
        if fact.key in ("color_range", "pack_sizes", "gloss", "coverage"):
            label = {
                "color_range": "Színválaszték",
                "pack_sizes": "Kiszerelés",
                "gloss": "Fényesség",
                "coverage": "Kiadósság",
            }[fact.key]
            specs.append(
                {
                    "label": label,
                    "value": fact.value,
                    "source_id": fact.source_id,
                    "page": str(fact.page or ""),
                }
            )

    name = draft.identity_from_tds or draft.product_name

    # --- Termékleírás ---
    if termek:
        para = _sentence_from_fact(
            f"A Műszaki adatlap szerint a(z) {name}",
            termek[:500],
        )
        # Avoid awkward double product name if termek already starts with it
        if _norm_name(name) and _norm_name(name) in _norm_name(termek[:80]):
            para = _sentence_from_fact("A Műszaki adatlap szerint", termek[:500])
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Termékleírás",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, termek[:180])],
                status="banned_phrase" if banned else "ok",
            )
        )
        summary = para
        summary_sources = [tds.source_id]
    else:
        gaps.append("enrichment:missing_section:Termékleírás")

    # --- Alkalmazás ---
    if alkalmazas:
        para = _sentence_from_fact(
            "Felhasználási terület a Műszaki adatlap alapján:",
            alkalmazas[:700],
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Alkalmazás",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, alkalmazas[:180])],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Alkalmazás")

    # --- Előkészítés ---
    if elokeszites:
        para = _sentence_from_fact(
            "Felület-előkészítés a Műszaki adatlap szerint:",
            elokeszites[:700],
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Előkészítés",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, elokeszites[:180])],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Előkészítés")

    # --- Felhasználás ---
    if felhasznalas:
        para = _sentence_from_fact(
            "Alkalmazási tudnivalók a Műszaki adatlap szerint:",
            felhasznalas[:700],
        )
        banned = _banned_excluding_product_name(para, name)
        sections.append(
            EnrichmentSection(
                heading="Felhasználás",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, felhasznalas[:180])],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Felhasználás")

    # --- Korlátozások (only explicit exclusion phrases; never invent) ---
    limit_bits: list[str] = []
    for pat in [
        re.compile(r"(?i)nem\s+(?:alkalmas|javasolt|ajánlott)[^.。\n]{10,160}"),
        re.compile(r"(?i)tilos[^.。\n]{8,120}"),
        re.compile(r"(?i)ne\s+(?:használ|fessen|hígíts)[^.。\n]{8,120}"),
    ]:
        for m in pat.finditer(full):
            bit = _clean(m.group(0))
            if bit and bit not in limit_bits:
                limit_bits.append(bit)
            if len(limit_bits) >= 3:
                break
        if len(limit_bits) >= 3:
            break
    if limit_bits:
        para = "Korlátozások a Műszaki adatlap szövegéből: " + " ".join(
            b if b.endswith(".") else b + "." for b in limit_bits
        )
        banned = find_banned_phrases(para)
        sections.append(
            EnrichmentSection(
                heading="Korlátozások",
                paragraphs=[para],
                source_ids=[tds.source_id],
                evidence=[_evidence(tds, limit_bits[0][:180])],
                status="banned_phrase" if banned else "ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Korlátozások")

    # --- Műszaki adatok ---
    # Supplement from official page structured attributes when TDS table labels differ
    if not specs and page_facts:
        for attr in page_facts.get("attributes") or []:
            if not isinstance(attr, dict):
                continue
            an = attr.get("name")
            vals = attr.get("values") or []
            if an and vals:
                specs.append(
                    {
                        "label": str(an),
                        "value": ", ".join(str(v) for v in vals),
                        "source_id": "product_page",
                        "page": "",
                    }
                )
        td = page_facts.get("technicalData") or {}
        if isinstance(td, dict) and td.get("dryingTime") is not None:
            specs.append(
                {
                    "label": "Száradási idő (óra)",
                    "value": str(td.get("dryingTime")),
                    "source_id": "product_page",
                    "page": "",
                }
            )
        for icon in page_facts.get("icons") or []:
            if isinstance(icon, str) and "m2" in icon.lower():
                specs.append(
                    {
                        "label": "Kiadósság (ikon)",
                        "value": icon,
                        "source_id": "product_page",
                        "page": "",
                    }
                )

    if not specs:
        jub_tech = _extract_numbered_jub_block(full, "műszaki adatok", "muszaki adatok")
        if jub_tech:
            # Keep a compact, sourced excerpt — do not invent values.
            excerpt = jub_tech[:700]
            specs.append(
                {
                    "label": "Műszaki adatok (TDS)",
                    "value": excerpt,
                    "source_id": tds.source_id,
                    "page": "",
                }
            )

    if specs:
        lines = [f"{s['label']}: {s['value']}" for s in specs]
        # Prefer TDS-backed wording when any TDS fact present
        src_ids = sorted({s.get("source_id") or tds.source_id for s in specs})
        if all(s.get("source_id") == "product_page" for s in specs):
            para = (
                "Műszaki adatok a hivatalos termékoldal strukturált mezői szerint: "
                + "; ".join(lines)
                + "."
            )
            evidence = [
                {
                    "source_id": "product_page",
                    "doc_kind": "product_page",
                    "sha256": "",
                    "page": None,
                    "quote": lines[0][:180],
                }
            ]
        else:
            para = "Műszaki adatok a Műszaki adatlap szerint: " + "; ".join(lines) + "."
            evidence = [_evidence(tds, lines[0][:180])]
            src_ids = [tds.source_id]
        sections.append(
            EnrichmentSection(
                heading="Műszaki adatok",
                paragraphs=[para],
                source_ids=src_ids if isinstance(src_ids, list) else [tds.source_id],
                evidence=evidence,
                status="ok",
            )
        )
    else:
        gaps.append("enrichment:missing_section:Műszaki adatok")

    if summary is None and alkalmazas:
        summary = _sentence_from_fact(
            f"A(z) {name} alkalmazása a Műszaki adatlap szerint:",
            alkalmazas[:280],
        )
        summary_sources = [tds.source_id]
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


def enrichment_quality_issues(enrichment: EnrichmentDraft) -> list[str]:
    issues: list[str] = []
    required = {"Termékleírás", "Alkalmazás", "Előkészítés", "Felhasználás", "Műszaki adatok"}
    present = {s.heading for s in enrichment.sections if s.status == "ok" and s.paragraphs}
    for h in sorted(required - present):
        issues.append(f"review:enrichment_missing:{h}")
    for s in enrichment.sections:
        if s.status == "banned_phrase":
            issues.append(f"review:enrichment_banned:{s.heading}")
    if not enrichment.editorial_summary:
        issues.append("review:enrichment_missing:editorialSummary")
    if enrichment.invented_values:
        issues.append("hold:invented_values")
    return issues
