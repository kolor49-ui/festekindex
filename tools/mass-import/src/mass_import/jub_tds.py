"""Extract structured fields from official JUB HU Műszaki adatlap PDFs.

JUB TDS layout (consistent across coating lines):
  1. Leírás, alkalmazás
  2. Színárnyalatok
  3. Műszaki adatok
  4. Felhordási körülmények
  5. A felület előkészítése
  6–7. előkészítés / felhordás
  …
Never invent values — only return text present in the PDF extract.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from .extract import ExtractedDoc


@dataclass
class JubSection:
    key: str
    title: str
    text: str
    quote: str
    page: int = 1


@dataclass
class JubTdsExtract:
    title: str | None = None
    subtitle: str | None = None
    sections: dict[str, JubSection] = field(default_factory=dict)
    specs: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
            "subtitle": self.subtitle,
            "sections": {
                k: {
                    "title": s.title,
                    "text": s.text,
                    "quote": s.quote,
                    "page": s.page,
                }
                for k, s in self.sections.items()
            },
            "specs": self.specs,
        }


_SECTION_START = re.compile(
    r"(?m)^(\d{1,2})\.\s+("
    r"Leírás(?:,|\s+és)?\s*alkalmazás|"
    r"Színárnyalatok|"
    r"Műszaki adatok|"
    r"Felhordási körülmények|"
    r"A felület előkészítése|"
    r"A festék előkészítése|"
    r"A festék felhordása|"
    r"A ragasztó elkészítése|"
    r"A ragasztó felhordása|"
    r"Használati útmutató|"
    r"A festett felületek[^.\n]{0,60}|"
    r"Tárolás[^.\n]{0,80}|"
    r"Egyéb információk"
    r")\s*$",
    re.I,
)

_KEY_MAP = {
    "leiras": "description_application",
    "szinarnyalatok": "colours",
    "muszaki": "technical",
    "felhordasi": "conditions",
    "felulet": "surface_prep",
    "festek elokeszitese": "product_prep",
    "festek felhordasa": "application",
    "ragaszto elkeszitese": "product_prep",
    "ragaszto felhordasa": "application",
    "hasznalati": "application",
    "festett": "maintenance",
    "tarolas": "storage",
    "egyeb": "other",
}


def _fold(s: str) -> str:
    t = s.lower()
    for a, b in (
        ("á", "a"),
        ("é", "e"),
        ("í", "i"),
        ("ó", "o"),
        ("ö", "o"),
        ("ő", "o"),
        ("ú", "u"),
        ("ü", "u"),
        ("ű", "u"),
    ):
        t = t.replace(a, b)
    return t


def _section_key(title: str) -> str | None:
    f = _fold(title)
    for needle, key in _KEY_MAP.items():
        if needle in f:
            return key
    return None


def _clean(text: str) -> str:
    t = re.sub(r"[ \t]+", " ", text)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def _page_for_offset(doc: ExtractedDoc, abs_offset: int) -> int:
    pos = 0
    for pg in doc.pages:
        nxt = pos + len(pg.text or "") + 1
        if abs_offset < nxt:
            return pg.page
        pos = nxt
    return 1


def _guess_title_subtitle(page1: str) -> tuple[str | None, str | None]:
    lines: list[str] = []
    for raw in page1.splitlines():
        line = raw.strip()
        if not line:
            continue
        low = line.lower()
        if low.startswith("--- page"):
            continue
        if "műszaki adatlap" in low or "muszaki adatlap" in low:
            continue
        if re.match(r"^\d{1,2}\.\d{2}\.\d{2}", line):
            continue
        lines.append(line)
        if len(lines) >= 6:
            break
    title = lines[0] if lines else None
    subtitle = None
    if len(lines) >= 2 and not _SECTION_START.match(lines[1]):
        # Avoid grabbing "1. Leírás…" as subtitle
        if not re.match(r"^\d+\.\s+", lines[1]):
            subtitle = lines[1]
    return title, subtitle


def _parse_specs_block(text: str) -> dict[str, str]:
    """Best-effort label/value pairs from the Műszaki adatok block — no invention."""
    out: dict[str, str] = {}
    # Same-line "Label Value"
    patterns = [
        (r"(?im)^Csomagolás\s+(.+)$", "pack_sizes"),
        (r"(?im)^Sűrűség\s+(.+)$", "density"),
        (r"(?im)^Anyagszükséglet\s+(.+)$", "coverage"),
        (r"(?im)^Ajánlott rétegszám\s+(.+)$", "coats"),
        (r"(?im)^Javasolt rétegszám\s+(.+)$", "coats"),
        (r"(?im)^Fény\s+(.+)$", "gloss"),
        (r"(?im)^Száradási idő\s+(.+)$", "drying"),
        (r"(?im)^Illékony szerves vegyület tartalom \(VOC\)\s+(.+)$", "voc"),
    ]
    for pat, key in patterns:
        m = re.search(pat, text)
        if m:
            val = _clean(m.group(1).split("\n")[0])
            # Reject if value looks like another label (two-column PDF collapse)
            if 1 < len(val) < 120 and not re.match(
                r"(?i)^(sűrűség|anyagszükséglet|fény|száradási|illékony|ajánlott|javasolt|csomagolás)\b",
                val,
            ):
                out[key] = val
    return out


def extract_jub_tds(doc: ExtractedDoc) -> JubTdsExtract:
    full = doc.full_text or ""
    page1 = doc.pages[0].text if doc.pages else full
    title, subtitle = _guess_title_subtitle(page1)
    out = JubTdsExtract(title=title, subtitle=subtitle)

    matches = list(_SECTION_START.finditer(full))
    if not matches:
        return out

    for i, m in enumerate(matches):
        title_raw = m.group(2).strip()
        key = _section_key(title_raw)
        if not key:
            continue
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full)
        body = _clean(full[start:end])
        if len(body) < 20:
            continue
        # Prefer first occurrence of each key (later "1. osztály" noise already filtered)
        if key in out.sections:
            continue
        quote = ""
        for line in body.split("\n"):
            cand = line.strip()
            if len(cand) >= 24 and not re.match(r"^\d+\.\s+", cand):
                quote = cand[:180]
                break
        if not quote:
            # Fall back to first long whitespace-normalized window present in body
            window = re.sub(r"\s+", " ", body)[:120].strip()
            quote = window if len(window) >= 24 else body[:180]
        out.sections[key] = JubSection(
            key=key,
            title=title_raw,
            text=body,
            quote=quote,
            page=_page_for_offset(doc, m.start()),
        )

    tech = out.sections.get("technical")
    if tech:
        out.specs = _parse_specs_block(tech.text)
    return out
