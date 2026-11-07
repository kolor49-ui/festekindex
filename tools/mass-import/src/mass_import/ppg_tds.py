"""PPG Trilak TDS section extraction (LOCAL ONLY, no invented content)."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from typing import Any

from .extract import ExtractedDoc, find_quote_page


# Ordered section markers as they typically appear on PPG HU TDS PDFs.
SECTION_MARKERS: list[tuple[str, re.Pattern[str]]] = [
    ("properties", re.compile(r"(?im)^\s*Tulajdonságok\s*:?\s*$")),
    ("application", re.compile(r"(?im)^\s*Alkalmazási\s+terület\s*:?\s*$")),
    ("surface_prep", re.compile(r"(?im)^\s*FELÜLET\s+ELŐKÉSZÍTÉS\s*:?\s*$")),
    ("prep_dilution", re.compile(r"(?im)^\s*Anyagelőkészítés\s*,?\s*hígítás\s*:?\s*$")),
    ("coverage", re.compile(r"(?im)^\s*Anyagszükséglet\s*:?\s*$")),
    ("processing_temp", re.compile(r"(?im)^\s*A\s+feldolgozás\s+hőmérséklete\s*:?\s*$")),
    ("drying", re.compile(r"(?im)^\s*Száradási\s+idő\s*,?\s*átvonhatóság\s*:?\s*$")),
    ("tech_props", re.compile(r"(?im)^\s*Műszaki\s+tulajdonságok\s*\*?\s*:?\s*$")),
    ("storage", re.compile(r"(?im)^\s*Tárolás\s*,?\s*raktározás\s*:?\s*$")),
]


@dataclass
class PpgSection:
    key: str
    text: str
    page: int | None
    quote: str


@dataclass
class PpgTdsExtract:
    title: str | None
    subtitle: str | None
    sections: dict[str, PpgSection] = field(default_factory=dict)
    limitations: list[str] = field(default_factory=list)
    coverage_lines: list[str] = field(default_factory=list)
    drying_lines: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "subtitle": self.subtitle,
            "sections": {k: asdict(v) for k, v in self.sections.items()},
            "limitations": self.limitations,
            "coverage_lines": self.coverage_lines,
            "drying_lines": self.drying_lines,
        }


# Hungarian / Latin single-letter tokens — never join across these
_KEEP_SINGLE = frozenset(
    {
        "a",
        "e",
        "s",
        "i",
        "o",
        "ó",
        "ö",
        "ő",
        "u",
        "ú",
        "ü",
        "ű",
        "á",
        "é",
        "í",
    }
)


def _norm_pdf_text(text: str) -> str:
    """Collapse PDF letter-spacing artefacts without eating HU articles (a, s, …)."""
    t = text.replace("\u00ad", "")
    # Soft hyphen / mid-word splits: "fest ékek" / "tulajdo-nság" → join when BOTH sides
    # look like word fragments (length>=2), not single-letter function words.
    def _join_frag(m: re.Match[str]) -> str:
        left, mid, right = m.group(1), m.group(2), m.group(3)
        if mid.lower() in _KEEP_SINGLE:
            return m.group(0)
        # only collapse spaced single letters that are NOT standalone HU words
        return f"{left}{mid}{right}"

    t = re.sub(r"(\w{2,}) (\w) (\w{2,})", _join_frag, t)
    # Brand mid-caps split: "Thermotek S ilicate" → "Thermotek Silicate"
    # (do not touch "A termék" — requires lowercase letter before the single capital)
    t = re.sub(
        r"([a-záéíóöőúüű]) ([A-ZÁÉÍÓÖŐÚÜŰ]) ([a-záéíóöőúüű]{3,})",
        r"\1 \2\3",
        t,
    )
    t = re.sub(r"[ \t]+", " ", t)
    return t


_DISCLAIMER_RE = re.compile(
    r"(?i)(?:jelen dokumentumban szereplő|tájékoztató jelleg|laboratóriumi vizsgálatokon|"
    r"alkalmazási eset(?:ek)?re kiterjed|PPG\s+Trilak\s+Kft|minden felelősség|"
    r"a\s+gyártó\s+fenntartja|right\s+to\s+change)"
)


def _clean_block(text: str) -> str:
    lines = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if re.match(r"^Érvényes:", line, re.I):
            continue
        if re.match(r"^--- PAGE ", line):
            continue
        lines.append(line)
    body = " ".join(lines)
    body = _norm_pdf_text(body)
    return re.sub(r"\s+", " ", body).strip()


def _guess_title_subtitle(page1: str) -> tuple[str | None, str | None]:
    lines = [ln.strip() for ln in page1.splitlines() if ln.strip()]
    title = None
    subtitle = None
    for i, line in enumerate(lines):
        low = line.lower()
        if low.startswith("--- page") or low.startswith("érvényes") or "műszaki adatlap" in low:
            continue
        # Date-only validity banners: "2024.08.08-tól érvényes"
        if re.match(r"^\d{4}\.\d{2}\.\d{2}", low) and "érvényes" in low:
            continue
        if re.fullmatch(r"\d{4}\.\d{2}\.\d{2}.*?érvényes\.?", low):
            continue
        if _DISCLAIMER_RE.search(line):
            continue
        if len(line) < 4:
            continue
        # Reject titles that are only a validity clause
        if "érvényes" in low and not re.search(r"[a-záéíóöőúüű]{4,}", re.sub(r"érvényes|tól|tol", " ", low)):
            continue
        title = line
        # next non-empty as subtitle if not a section header / disclaimer
        for nxt in lines[i + 1 : i + 6]:
            if nxt.endswith(":") or (nxt.upper() == nxt and len(nxt) > 8):
                break
            if _DISCLAIMER_RE.search(nxt):
                continue
            if any(
                re.match(p, nxt)
                for _, p in SECTION_MARKERS
            ):
                break
            if len(nxt) >= 10:
                subtitle = nxt
                break
        break
    # Strip date prefix from title
    if title:
        m = re.search(r"(?:érvényes[:\s].*?tól\s+)(.+)", title, re.I)
        if m:
            title = m.group(1).strip()
        m2 = re.search(r"^\d{4}\.\d{2}\.\d{2}.*?érvényes\s+(.+)", title, re.I)
        if m2:
            title = m2.group(1).strip()
    if subtitle and _DISCLAIMER_RE.search(subtitle):
        subtitle = None
    return title, subtitle


def extract_ppg_tds(doc: ExtractedDoc) -> PpgTdsExtract:
    full = doc.full_text or ""
    page1 = doc.pages[0].text if doc.pages else full
    title, subtitle = _guess_title_subtitle(page1)
    out = PpgTdsExtract(title=title, subtitle=subtitle)

    # Find marker positions in full text
    hits: list[tuple[int, str, re.Match[str]]] = []
    for key, pat in SECTION_MARKERS:
        for m in pat.finditer(full):
            hits.append((m.start(), key, m))
            break  # first occurrence per key
    hits.sort(key=lambda x: x[0])

    for i, (start, key, m) in enumerate(hits):
        end = hits[i + 1][0] if i + 1 < len(hits) else len(full)
        raw = full[m.end() : end]
        text = _clean_block(raw)
        if len(text) < 20:
            continue
        # Drop leading disclaimer boilerplate that sometimes precedes real section body
        if _DISCLAIMER_RE.search(text[:120]) and key in ("properties", "application"):
            # keep only sentences that are not disclaimer
            sents = re.split(r"(?<=[.!?])\s+", text)
            kept = [s for s in sents if s and not _DISCLAIMER_RE.search(s)]
            text = " ".join(kept).strip()
            if len(text) < 20:
                continue
        quote = text[:160]
        page = find_quote_page(doc, quote[:80]) or find_quote_page(doc, text[:40])
        out.sections[key] = PpgSection(key=key, text=text, page=page, quote=quote)
        if key == "coverage":
            out.coverage_lines = [
                ln.strip()
                for ln in raw.splitlines()
                if re.search(r"(réteg|m2|m²|l/m|kiadós)", ln, re.I)
            ][:8]
        if key == "drying":
            out.drying_lines = [_clean_block(raw)[:300]]

    # Limitations: explicit negatives only
    lim_pats = [
        re.compile(r"(?i)(?:gipszfelületekre|gipszre)\s+nem\s+használható[^.。]*[.]?"),
        re.compile(r"(?i)nem\s+javasolt[^.。\n]{5,120}"),
        re.compile(r"(?i)nem\s+használható[^.。\n]{5,120}"),
        re.compile(r"(?i)tilos[^.。\n]{5,100}"),
        re.compile(r"(?i)ne\s+(?:használjon|fessen|hígítson)[^.。\n]{5,100}"),
    ]
    seen: set[str] = set()
    for pat in lim_pats:
        for m in pat.finditer(full):
            bit = _clean_block(m.group(0))
            if bit and bit.lower() not in seen and len(bit) >= 12:
                seen.add(bit.lower())
                out.limitations.append(bit)
            if len(out.limitations) >= 5:
                break
        if len(out.limitations) >= 5:
            break

    return out
