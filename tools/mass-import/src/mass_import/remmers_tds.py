"""Extract structured fields from official Remmers Műszaki adatlap PDFs (HU).

Typical layout:
  TITLE + subtitle (product description)
  Alkalmazási területek
  Tulajdonságok
  Termékjellemzők
  Előkészítés
  Feldolgozás
  Tudnivalók / Biztonság / Tárolás

Never invent values — only return text present in the PDF extract.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from .extract import ExtractedDoc


@dataclass
class RemmersSection:
    key: str
    title: str
    text: str
    quote: str
    page: int = 1


@dataclass
class RemmersTdsExtract:
    title: str | None = None
    subtitle: str | None = None
    sections: dict[str, RemmersSection] = field(default_factory=dict)
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


_HEADING = re.compile(
    r"(?im)^[ \t]*(?:"
    r"Alkalmaz[aá]si\s+ter[uü]lete?k|"
    r"Felhaszn[aá]l[aá]si\s+ter[uü]let|"
    r"Tulajdons[aá]gok|"
    r"Term[eé]kjellemz[oő]k|"
    r"El[oöő]k[eé]sz[ií]t[eé]s|"
    r"Feldolgoz[aá]s|"
    r"Anyagsz[uü]ks[eé]glet|"
    r"Tudnival[oó]k|"
    r"Biztons[aá]g(?:/el[oő][ií]r[aá]sok)?|"
    r"T[aá]rol[aá]s(?:/eltarthat[oó]s[aá]g)?|"
    r"[AÁ]rtalmatlan[ií]t[aá]s|"
    r"Munkaeszk[oö]z[oö]k(?:\s+és\s+tiszt[ií]t[aá]suk)?"
    r")\s*$"
)


def _clean(s: str) -> str:
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    # Remmers PDF often leaves bullet markers as lone ■
    s = re.sub(r"[■◼▪●]\s*", "", s)
    return s.strip()


def _page_of(doc: ExtractedDoc, needle: str) -> int:
    n = (needle or "")[:40]
    if not n:
        return 1
    for pg in doc.pages:
        if n in (pg.text or ""):
            return pg.page
    return 1


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


def _split_sections(text: str) -> list[tuple[str, str]]:
    matches = list(_HEADING.finditer(text))
    if not matches:
        return [("TITLE", text.strip())] if text.strip() else []
    out: list[tuple[str, str]] = []
    pre = text[: matches[0].start()].strip()
    if pre:
        out.append(("TITLE", pre))
    for i, m in enumerate(matches):
        head = m.group(0).strip()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[m.end() : end].strip()
        out.append((head, body))
    return out


def _title_from_preamble(pre: str) -> tuple[str | None, str | None]:
    # Drop page markers injected by extract_pdf
    pre = re.sub(r"(?m)^---\s*PAGE\s+\d+\s*---\s*$", "", pre)
    lines = [ln.strip() for ln in pre.splitlines() if ln.strip()]
    keep: list[str] = []
    for ln in lines:
        low = ln.lower()
        if re.fullmatch(r"remmers(?:\s+ungarn)?(?:\s+kft\.?)?", low):
            continue
        if len(ln) < 2:
            continue
        if re.fullmatch(r"[\d\s./\-]+", ln):
            continue
        if re.match(
            r"(?i)^(?:sz[ií]n|kiszerel[eé]s|g[oö]ngy[oö]leg|term[eé]ksz|el[eé]rhet[oő]s[eé]g)",
            low,
        ):
            break
        keep.append(ln)
        if len(keep) >= 6:
            break
    if not keep:
        return None, None
    title = keep[0]
    # Subtitle = following prose lines until packaging table noise
    sub_bits: list[str] = []
    for ln in keep[1:]:
        low = ln.lower()
        if re.match(
            r"(?i)^(?:sz[ií]n|kiszerel|g[oö]ngy|term[eé]ksz|mennyis[eé]g|anyagsz)",
            low,
        ):
            break
        sub_bits.append(ln)
    subtitle = _clean(" ".join(sub_bits)) if sub_bits else None
    return title, subtitle or None


def _parse_specs(body: str) -> dict[str, str]:
    specs: dict[str, str] = {}
    # Lines like "Kötőanyag alkidgyanták" or "Sűrűség (20 °C) kb. 0,94 g/cm³"
    for ln in body.splitlines():
        ln = ln.strip()
        if not ln or "általános értékei" in ln.lower():
            continue
        m = re.match(
            r"^([A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű][^:]{2,40}?)\s{2,}(.+)$",
            ln,
        )
        if not m:
            m = re.match(
                r"^([A-ZÁÉÍÓÖŐÚÜŰ][^:]{2,40}?)\s+((?:kb\.\s*)?[\d].+)$",
                ln,
            )
        if not m:
            # Known Remmers labels followed by value on same line
            m = re.match(
                r"^(Kötőanyag|Sűrűség[^\n]*|Kifolyási idő[^\n]*|Szag|Fényességi fok)\s+(.+)$",
                ln,
                re.I,
            )
        if m:
            key = _clean(m.group(1))
            val = _clean(m.group(2))
            if key and val and len(val) >= 1:
                specs[key] = val[:240]
        if len(specs) >= 12:
            break
    return specs


def extract_remmers_tds(doc: ExtractedDoc) -> RemmersTdsExtract:
    text = doc.full_text or ""
    out = RemmersTdsExtract()
    if not text.strip():
        return out

    for head, body in _split_sections(text):
        nh = _norm_head(head)
        body_c = _clean(body)
        if head == "TITLE" or nh == "title":
            title, subtitle = _title_from_preamble(body)
            if title:
                out.title = title
            if subtitle:
                out.subtitle = subtitle
            continue

        key = None
        if nh.startswith("alkalmazasi") or nh.startswith("felhasznalasi ter"):
            key = "application"
        elif nh.startswith("tulajdons"):
            key = "properties"
        elif nh.startswith("termekjellemz"):
            key = "technical"
            out.specs.update(_parse_specs(body))
        elif nh.startswith("elokeszit"):
            key = "surface_prep"
        elif nh.startswith("feldolgoz") or nh.startswith("anyagszukseg"):
            key = "usage"
        elif nh.startswith("tudnival"):
            key = "notes"
        else:
            continue

        if len(body_c) < 12:
            continue
        out.sections[key] = RemmersSection(
            key=key,
            title=head,
            text=body_c[:2500],
            quote=body_c[:200],
            page=_page_of(doc, body_c[:40]),
        )
    return out
