"""Extract structured fields from official Poli-Farbe Műszaki adatlap PDFs.

Typical layout (HU):
  TITLE (1–3 lines)
  JELLEMZÉS
  VÁLASZTÉK
  ALKALMAZÁSI TERÜLET
  FELHASZNÁLÁS / FELÜLET ELŐKÉSZÍTÉSE / LAKKOZÁS / FESTÉS
  TERMÉK ADATOK / TERMÉK TULAJDONSÁGOK / MÉRHETŐ TULAJDONSÁGOK

Never invent values — only return text present in the PDF extract.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from .extract import ExtractedDoc


@dataclass
class PoliSection:
    key: str
    title: str
    text: str
    quote: str
    page: int = 1


@dataclass
class PoliTdsExtract:
    title: str | None = None
    sections: dict[str, PoliSection] = field(default_factory=dict)
    specs: dict[str, str] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "title": self.title,
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


_HEADING = re.compile(
    r"(?im)^(?:"
    r"JELLEMZÉS|JELLEMZES|"
    r"VÁLASZTÉK|VALASZTEK|"
    r"ALKALMAZÁSI\s+TERÜLET|ALKALMAZASI\s+TERULET|"
    r"FELHASZNÁLÁS|FELHASZNALAS|"
    r"FELÜLET\s+ELŐKÉSZÍTÉSE|FELULET\s+ELOKESZITESE|"
    r"LAKKOZÁS|LAKKOZAS|FESTÉS|FESTES|"
    r"TERMÉK\s+ADATOK|TERMEK\s+ADATOK|"
    r"TERMÉK\s+TULAJDONSÁGOK|TERMEK\s+TULAJDONSAGOK|"
    r"MÉRHETŐ\s+TULAJDONSÁGOK|MERHETO\s+TULAJDONSAGOK|"
    r"BIZTONSÁG|BIZTONSAG|TÁROLÁS|TAROLAS|"
    r"MEGJEGYZÉS|MEGJEGYZES|EGYÉB|EGYEB"
    r")\s*:?\s*$"
)


def _clean(s: str) -> str:
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def _page_of(doc: ExtractedDoc, needle: str) -> int:
    n = (needle or "")[:40]
    if not n:
        return 1
    for pg in doc.pages:
        if n in (pg.text or ""):
            return pg.page
    return 1


def _split_sections(text: str) -> list[tuple[str, str]]:
    """Return [(heading, body), ...] including synthetic TITLE before first heading."""
    matches = list(_HEADING.finditer(text))
    if not matches:
        return [("TITLE", text.strip())] if text.strip() else []
    out: list[tuple[str, str]] = []
    pre = text[: matches[0].start()].strip()
    if pre:
        out.append(("TITLE", pre))
    for i, m in enumerate(matches):
        head = m.group(0).strip().rstrip(":").upper()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[m.end() : end].strip()
        out.append((head, body))
    return out


def _norm_head(h: str) -> str:
    t = h.lower()
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
    return re.sub(r"\s+", " ", t).strip()


def _title_from_preamble(pre: str) -> str | None:
    lines = [ln.strip() for ln in pre.splitlines() if ln.strip()]
    # Drop lonely brand / decorative lines
    keep: list[str] = []
    for ln in lines:
        low = ln.lower()
        if re.fullmatch(r"(?:poli[-\s]?farbe|polifarbe)", low):
            continue
        if len(ln) < 3:
            continue
        if re.fullmatch(r"[\d\s./\-]+", ln):
            continue
        # Stop before body if heading leaked into preamble
        if re.match(
            r"(?i)^(?:jellemz[eé]s|v[aá]laszt[eé]k|alkalmaz[aá]si|felhaszn[aá]l)",
            low,
        ):
            break
        keep.append(ln)
        # Always take up to 3 title lines (Poli wraps product names)
        if len(keep) >= 3:
            break
    if not keep:
        return None
    return " ".join(keep[:3])


def extract_poli_tds(doc: ExtractedDoc) -> PoliTdsExtract:
    text = doc.full_text or ""
    out = PoliTdsExtract()
    if not text.strip():
        return out

    chunks = _split_sections(text)
    for head, body in chunks:
        nh = _norm_head(head)
        body_c = _clean(body)
        if head == "TITLE" or nh == "title":
            title = _title_from_preamble(body)
            if title:
                out.title = title
            continue

        key = None
        if nh.startswith("jellemz"):
            key = "description"
        elif nh.startswith("alkalmazasi"):
            key = "application"
        elif nh.startswith("felulet"):
            key = "surface_prep"
        elif nh.startswith("felhasznal") or nh in {"lakkozas", "festes"}:
            key = "usage"
        elif nh.startswith("valaszt"):
            key = "assortment"
        elif (
            nh.startswith("termek adatok")
            or nh.startswith("termek tulajdons")
            or nh.startswith("merheto")
        ):
            key = "technical"
        elif nh.startswith("biztons") or nh.startswith("tarol"):
            key = "other"

        if key and body_c and len(body_c) >= 20:
            # Merge usage+prep if multiple usage-like heads
            if key in out.sections and key in {"usage", "surface_prep", "technical"}:
                prev = out.sections[key]
                merged = _clean(prev.text + "\n" + body_c)
                out.sections[key] = PoliSection(
                    key=key,
                    title=prev.title,
                    text=merged,
                    quote=prev.quote,
                    page=prev.page,
                )
            else:
                quote = body_c[:180]
                out.sections[key] = PoliSection(
                    key=key,
                    title=head,
                    text=body_c,
                    quote=quote,
                    page=_page_of(doc, quote),
                )

    # Specs from full text (only when present)
    for key, pat in (
        ("coverage", r"Kiadósság\s*:\s*([^\n]{5,120})"),
        ("density", r"Sűrűség[^\n:]{0,40}:\s*([^\n]{3,80})"),
        ("voc", r"VOC[^\n:]{0,40}:\s*([^\n]{5,160})"),
        ("pack_sizes", r"Kiszerelés\s*:\s*([^\n]{3,120})"),
        ("ph", r"pH\s*:\s*([^\n]{2,40})"),
    ):
        m = re.search(pat, text, re.I)
        if m:
            out.specs[key] = _clean(m.group(1))

    # Assortment may hold pack sizes when dedicated label missing
    if "pack_sizes" not in out.specs and "assortment" in out.sections:
        m = re.search(
            r"Kiszerelés\s*:\s*([^\n]{3,120})",
            out.sections["assortment"].text,
            re.I,
        )
        if m:
            out.specs["pack_sizes"] = _clean(m.group(1))

    return out
