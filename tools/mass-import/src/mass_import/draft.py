"""Conservative fact extraction from TDS (never invent missing values)."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass, field
from typing import Any

from .extract import ExtractedDoc


@dataclass
class ExtractedFact:
    key: str
    value: str
    source_id: str
    page: int | None
    quote: str
    doc_kind: str


@dataclass
class ProductDraft:
    product_id: str
    product_name: str
    brand: str | None
    identity_from_tds: str | None
    identity_from_sds: str | None
    facts: list[ExtractedFact] = field(default_factory=list)
    gaps: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "brand": self.brand,
            "identity_from_tds": self.identity_from_tds,
            "identity_from_sds": self.identity_from_sds,
            "facts": [asdict(f) for f in self.facts],
            "gaps": self.gaps,
            "warnings": self.warnings,
            "invented_values": False,
        }


_LABEL_PATTERNS: list[tuple[str, list[re.Pattern[str]]]] = [
    ("color_range", [re.compile(r"Színválaszték:\s*(.+)", re.I)]),
    (
        "pack_sizes",
        [
            re.compile(r"Kiszerelés:\s*(.+)", re.I),
            # JUB table: label row then value row later — capture first litre list nearby.
            re.compile(
                r"Csomagolás[\s\S]{0,120}?(\d+(?:[.,]\d+)?\s*l(?:\s*,\s*\d+(?:[.,]\d+)?\s*l)+)",
                re.I,
            ),
        ],
    ),
    ("gloss", [re.compile(r"Fényesség:\s*(.+)", re.I)]),
    (
        "coverage",
        [
            re.compile(r"Kiadósság:\s*(.+)", re.I),
            re.compile(
                r"Anyagszükséglet[\s\S]{0,800}?((?:\d+(?:[.,]\d+)?\s*m²\s*/\s*l)|(?:\d+(?:[.,]\d+)?\s*ml\s*/\s*m²))",
                re.I,
            ),
            re.compile(r"(\d+(?:[.,]\d+)?\s*m²\s*/\s*l)", re.I),
        ],
    ),
]


def _first_nonempty_lines(text: str, n: int = 8) -> list[str]:
    lines = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        lines.append(line)
        if len(lines) >= n:
            break
    return lines


_TDS_DISCLAIMER = re.compile(
    r"(?i)(?:jelen dokumentumban szereplő|tájékoztató jelleg|laboratóriumi vizsgálatokon|"
    r"alkalmazási eset(?:ek)?re kiterjed|a\s+gyártó\s+fenntartja|right\s+to\s+change)"
)


def _looks_like_tds_banner(title: str) -> bool:
    """Reject date/domain footers mistaken for product titles (ProfiTec/Meffert)."""
    low = (title or "").lower()
    if "--- page" in low:
        return True
    if low.startswith("állapot:") or low.startswith("allapot:"):
        return True
    if "www.profitec" in low or "www.meffert" in low:
        return True
    if re.fullmatch(r"[\d\s/|.-]+", (title or "").strip()):
        return True
    return False


def _guess_title_from_tds(doc: ExtractedDoc) -> str | None:
    if not doc.pages:
        return None
    # Prefer structured manufacturer extractors when available
    try:
        from .ppg_tds import extract_ppg_tds

        ppg = extract_ppg_tds(doc)
        if (
            ppg.title
            and not _TDS_DISCLAIMER.search(ppg.title)
            and not _looks_like_tds_banner(ppg.title)
        ):
            return ppg.title
    except Exception:
        pass
    try:
        from .jub_tds import extract_jub_tds

        jub = extract_jub_tds(doc)
        if (
            jub.title
            and not _TDS_DISCLAIMER.search(jub.title)
            and not _looks_like_tds_banner(jub.title)
        ):
            return jub.title
    except Exception:
        pass
    try:
        from .poli_tds import extract_poli_tds

        poli = extract_poli_tds(doc)
        if (
            poli.title
            and not _TDS_DISCLAIMER.search(poli.title)
            and not _looks_like_tds_banner(poli.title)
        ):
            return poli.title
    except Exception:
        pass
    page1 = doc.pages[0].text
    lines = _first_nonempty_lines(page1, 24)
    stop_prefixes = (
        "termék:",
        "színválaszték:",
        "kiszerelés:",
        "fényesség:",
        "kiadósság:",
        "alkalmazás:",
        "tulajdonságok:",
        "jellemzés",
        "jellemzes",
        "választék",
        "valasztek",
    )
    title_parts: list[str] = []
    header_only = {
        "termekleiras",
        "termékleírás",
        "alkalmazasi terulet",
        "alkalmazási terület",
        "termektulajdonsagok",
        "terméktulajdonságok",
        "feldolgozas",
        "feldolgozás",
        "muszaki adatok",
        "műszaki adatok",
    }
    for line in lines:
        low = line.lower().strip()
        if low.startswith("--- page"):
            continue
        if "műszaki adatlap" in low or "muszaki adatlap" in low:
            continue
        if _TDS_DISCLAIMER.search(line):
            continue
        # ProfiTec / Meffert HU TDS banners (date + domain, no product name)
        if low.startswith("állapot:") or low.startswith("allapot:"):
            continue
        if "www.profitec" in low or "www.meffert" in low or "www.dufa" in low:
            continue
        folded = re.sub(r"[^a-z0-9áéíóöőúüű]+", " ", low)
        folded = " ".join(folded.split())
        if folded in header_only:
            continue
        # ProfiTec TDS often has no product title — first body sentence is not a title.
        if len(line) > 70 and re.match(
            r"(?i)^(?:alkalmas|nem\s+|ez\s+|a\s+termék|víz|diszperzi)",
            line,
        ):
            return None
        if low.startswith("érvényes:") or ("érvényes" in low and "tól" in low):
            # PPG TDS date banner — strip leading date clause if mixed with title
            m = re.search(r"(?:érvényes[:\s].*?tól\s+)(.+)", line, re.I)
            if m and len(m.group(1).strip()) >= 4:
                cand = m.group(1).strip()
                if not _TDS_DISCLAIMER.search(cand) and len(cand) > 3:
                    # avoid orphan "tól Héra" fragments — require a letter brand token
                    if re.search(r"[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]{3,}", cand):
                        title_parts.append(cand)
                        break
            continue
        if re.match(r"^\d{4}\.\d{2}\.\d{2}", low):
            # Skip pure validity banners ("2024.08.08-tól érvényes")
            if re.search(r"érvényes\s*$", low) or re.fullmatch(
                r"\d{4}\.\d{2}\.\d{2}.*?érvényes\.?", low
            ):
                continue
            m = re.search(r"érvényes\s+(.+)", line, re.I)
            if m:
                cand = m.group(1).strip()
                if cand and not _TDS_DISCLAIMER.search(cand) and "érvényes" not in cand.lower():
                    title_parts.append(cand)
                    break
            continue
        if any(low.startswith(p) for p in stop_prefixes):
            break
        if len(line) >= 3:
            title_parts.append(line)
            # Poli titles are often 2 short ALLCAPS lines before JELLEMZÉS
            joined = " ".join(title_parts)
            if len(line) > 48 or len(title_parts) >= 3 or len(joined) >= 28:
                break
    if title_parts:
        return " ".join(title_parts)
    return None


def _guess_title_from_sds(doc: ExtractedDoc) -> str | None:
    if not doc.pages:
        return None
    page1 = doc.pages[0].text
    brand_only = re.compile(
        r"(?i)^(?:poli[-\s]?farbe|polifarbe|jub(?:\s+d\.?\s*o\.?\s*o\.?)?|ppg|trilak|"
        r"festék\s*bázis|festek\s*bazis)\s*$"
    )
    # Explicit product-name fields (JUB / CLP / common HU SDS layouts)
    for pat in (
        r"Kereskedelmi megnevezés:\s*(.+)",
        r"Keverék megnevezése:\s*(.+)",
        r"Termékazonosító\s*[:·\-]?\s*(.+)",
        r"Trade name:\s*(.+)",
        r"Product name:\s*(.+)",
    ):
        m = re.search(pat, page1, re.I)
        if m:
            raw = m.group(1).strip()
            raw = re.sub(r"^[·\-\s]+", "", raw).strip()
            lines = [ln.strip() for ln in raw.splitlines() if ln.strip()]
            val = lines[0] if lines else ""
            # Poli-Farbe SDS: brand (optionally + line) then product name on next line(s).
            poli_brand_line = re.compile(
                r"(?i)^(?:poli[-\s]?farbe|polifarbe)"
                r"(?:\s+(?:platinum|inntaler|bor[oó]ka|cellkolor|prakticolor))?$"
            )
            if val and (brand_only.match(val) or poli_brand_line.match(val)):
                after = page1[m.end() : m.end() + 400]
                collected: list[str] = []
                for ln in after.splitlines():
                    ln = ln.strip()
                    if not ln:
                        if collected:
                            break
                        continue
                    if brand_only.match(ln) or poli_brand_line.match(ln):
                        continue
                    if re.match(
                        r"(?i)^(?:az azonosítás|1\.2|nem releváns|ufi\b|megfelelő alkalmaz)\b",
                        ln,
                    ):
                        break
                    if len(ln) >= 4:
                        collected.append(ln)
                        # Usually one product-name line; allow two short lines
                        if len(" ".join(collected)) >= 8:
                            break
                if collected:
                    # Keep line brand token when present for overlap with TDS titles
                    if poli_brand_line.match(val) and not brand_only.match(val):
                        val = f"{val} {' '.join(collected)}"
                    else:
                        val = " ".join(collected)
            elif len(lines) >= 2 and brand_only.match(val):
                val = lines[1]
            # Skip UFI / empty identifiers that sit under Termékazonosító on Meffert SDS.
            if re.fullmatch(r"[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4,}:?", val or "", re.I):
                continue
            if val and val.lower() not in {":", "-", "nincs", "n/a"} and len(val) >= 3:
                return val
    # Meffert family SDS: "Biztonsági adatlap" → company → product name.
    early = _first_nonempty_lines(page1, 40)
    for i, ln in enumerate(early):
        if "biztonsági adatlap" not in ln.lower():
            continue
        for nxt in early[i + 1 : i + 8]:
            s = nxt.strip()
            if re.match(r"(?i)^meffert\b", s):
                continue
            if re.match(r"(?i)^(?:az\s+)?1907/2006", s):
                continue
            if re.match(r"(?i)^felülvizsgálat\b", s):
                continue
            if re.match(r"(?i)^\d+\.\s*szakasz\b", s):
                break
            if len(s) >= 5 and not re.match(r"(?i)^\d+\.\d+", s):
                return s
        break
    # Meffert / ProfiTec / Düfa: product name often appears before §1 as a standalone line.
    for ln in early:
        s = ln.strip()
        if re.match(r"(?i)^(?:profi\s*tec|profitec|düfa|dufa|correx)\b.{3,100}$", s):
            return s
    lines = early[:30] if early else _first_nonempty_lines(page1, 30)
    skip_pre = re.compile(
        r"(?i)^(?:oldalszám|page|verzió|version|felülvizsgálat|kiadás|"
        r"datum|dátum|rev\.?|1\.\s*szakasz|\d+\.\d+\.)\b"
    )
    # PPG format: product name line(s) BEFORE "BIZTONSÁGI ADATLAP"
    pre: list[str] = []
    for line in lines:
        low = line.lower()
        if "biztonsági adatlap" in low:
            break
        if "1907" in low or "1272" in low:
            continue
        if low.startswith("terméknév"):
            continue
        if skip_pre.search(line):
            continue
        if re.match(r"(?i)^meffert\s+ag\b", line):
            continue
        if re.fullmatch(r"[0-9./:\s\-]+", line):
            continue
        if len(line) >= 3:
            pre.append(line)
        if len(pre) >= 2:
            break
    # Prefer a Düfa/ProfiTec-looking pre line over company+section garbage.
    for cand in pre:
        if re.search(r"(?i)(?:dufa|düfa|profitec|profi\s*tec)", cand):
            return cand
        if len(cand) >= 8 and not re.match(r"(?i)^\d+\.", cand):
            return cand
    if pre and not any(re.match(r"(?i)^\d+\.", p) for p in pre):
        return " ".join(pre)
    for i, line in enumerate(lines):
        if "biztonsági adatlap" in line.lower():
            for nxt in lines[i + 1 : i + 12]:
                low = nxt.lower()
                if low.startswith("terméknév"):
                    continue
                if skip_pre.search(nxt):
                    continue
                if re.fullmatch(r"[0-9;\s./:\-]+", nxt):
                    continue
                if "1907" in nxt or "1272" in nxt or "ek rendelet" in low:
                    continue
                if "szakasz" in low and re.match(r"^[\d·.\s]+", nxt):
                    continue
                if "kereskedelmi megnevezés" in low:
                    tail = re.split(r"megnevezés\s*:", nxt, flags=re.I)
                    if len(tail) > 1 and tail[-1].strip():
                        return tail[-1].strip()
                    continue
                if len(nxt) >= 4 and "festék bázis" not in low:
                    return nxt
    return None


def extract_sds_product_code(doc: ExtractedDoc) -> str | None:
    codes = extract_sds_product_codes(doc)
    return codes[0] if codes else None


def extract_sds_product_codes(doc: ExtractedDoc) -> list[str]:
    """Collect product codes from SDS (primary + family listings)."""
    text = doc.full_text or ""
    codes: list[str] = []
    for m in re.finditer(r"Termék\s*kód\s*:\s*([A-Z0-9]+)", text, re.I):
        c = m.group(1).strip().upper()
        if c not in codes:
            codes.append(c)
    # PPG family SDSs sometimes list SKU numbers only; keep alphanumeric product codes
    for m in re.finditer(r"\b(12[0-9]{2}DHH[A-Z0-9]{2,6})\b", text):
        c = m.group(1).upper()
        if c not in codes:
            codes.append(c)
    return codes


def _add_fact(
    facts: list[ExtractedFact],
    *,
    key: str,
    value: str,
    doc: ExtractedDoc,
    quote: str,
    page: int | None,
) -> None:
    facts.append(
        ExtractedFact(
            key=key,
            value=value.strip(),
            source_id=doc.source_id,
            page=page,
            quote=quote.strip()[:240],
            doc_kind=doc.kind,
        )
    )


def build_draft(
    product_id: str,
    product_name: str,
    brand: str | None,
    docs: list[ExtractedDoc],
    expected_product_code: str | None = None,
) -> ProductDraft:
    tds = next((d for d in docs if d.kind == "tds"), None)
    sds = next((d for d in docs if d.kind == "sds"), None)

    draft = ProductDraft(
        product_id=product_id,
        product_name=product_name,
        brand=brand,
        identity_from_tds=_guess_title_from_tds(tds) if tds else None,
        identity_from_sds=_guess_title_from_sds(sds) if sds else None,
    )
    sds_codes = extract_sds_product_codes(sds) if sds else []
    sds_code = sds_codes[0] if sds_codes else None

    if tds is None:
        draft.gaps.append("missing_tds")
    if sds is None:
        draft.gaps.append("missing_sds")

    if tds:
        page1 = tds.pages[0].text if tds.pages else tds.full_text
        for key, pats in _LABEL_PATTERNS:
            matched = False
            for pat in pats:
                m = pat.search(page1) or pat.search(tds.full_text)
                if not m:
                    continue
                val = m.group(1).strip()
                val = val.split("\n")[0].strip()
                # Expand to a contiguous PDF excerpt so find_quote_page (>=12) can verify.
                quote = val
                idx = (tds.full_text or "").find(val)
                if idx >= 0:
                    left = max(0, idx - 24)
                    right = min(len(tds.full_text), idx + len(val) + 24)
                    quote = " ".join(tds.full_text[left:right].split())
                elif len(quote) < 12:
                    quote = f"{key} {val}"
                _add_fact(
                    draft.facts,
                    key=key,
                    value=val,
                    doc=tds,
                    quote=quote[:180],
                    page=1,
                )
                matched = True
                break
            if not matched:
                draft.gaps.append(f"unextracted:{key}")

        # Application paragraph — only if clearly labelled
        app = re.search(
            r"Alkalmazás:\s*(.{40,400}?)\n(?:Minőségi|Előkészítés|Felhasználás|Tulajdonságok)",
            page1,
            re.I | re.S,
        )
        if app:
            snippet = " ".join(app.group(1).split())
            _add_fact(
                draft.facts,
                key="application_excerpt",
                value=snippet[:400],
                doc=tds,
                quote=snippet[:180],
                page=1,
            )
        else:
            # JUB numbered sections (title may include commas / leading "A ").
            jub_app = re.search(
                r"(?is)(?:^|\n)\s*\d{1,2}\.\s+[^\n]*(?:alkalmazás|felhordása)\s*\n([\s\S]{40,2500}?)(?=(?:^|\n)\s*\d{1,2}\.\s+[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű])",
                tds.full_text,
            )
            if not jub_app:
                # Poli-Farbe style headings
                jub_app = re.search(
                    r"(?is)(?:^|\n)\s*Jellemzés\s*\n([\s\S]{40,800}?)(?=(?:^|\n)\s*(?:Választék|Felhasználási adatok|Biztonság)\b)",
                    tds.full_text,
                )
            if not jub_app:
                jub_app = re.search(
                    r"(?is)(?:^|\n)\s*Felhasználási adatok\s*\n([\s\S]{40,800}?)(?=(?:^|\n)\s*(?:Biztonság|Tárolás|Minőségi)\b)",
                    tds.full_text,
                )
            if jub_app:
                snippet = " ".join(jub_app.group(1).split())
                _add_fact(
                    draft.facts,
                    key="application_excerpt",
                    value=snippet[:400],
                    doc=tds,
                    quote=snippet[:180],
                    page=1,
                )
            else:
                draft.gaps.append("unextracted:application_excerpt")

    if sds:
        # Safety identity / UFI only — never mix into TDS technical facts as paint specs
        ufi = re.search(r"UFI:\s*([A-Z0-9\-]+)", sds.full_text, re.I)
        if ufi:
            ufi_val = ufi.group(1).strip()
            # Placeholder tokens on some Poli SDS pages are not verifiable quotes
            if ufi_val.lower() not in {
                "egyedi",
                "nincs",
                "na",
                "n/a",
                "nem",
                "relevans",
                "releváns",
            } and len(ufi_val) >= 6:
                _add_fact(
                    draft.facts,
                    key="sds_ufi",
                    value=ufi_val,
                    doc=sds,
                    quote=ufi.group(0),
                    page=1,
                )
        sds_text = sds.full_text or ""
        hazard = re.search(
            r"(?<![A-Z0-9])(H[0-9]{3}(?:\+H[0-9]{3})*)(?![A-Z0-9])",
            sds_text,
            re.I,
        )
        if hazard:
            code = hazard.group(1).upper()
            # Prefer contextual quote (≥12 chars) so soft match has real evidence window;
            # find_quote_page also accepts bare H-codes via word-boundary proof.
            start = max(0, hazard.start() - 24)
            end = min(len(sds_text), hazard.end() + 48)
            ctx = " ".join(sds_text[start:end].split())
            quote = ctx if len(ctx) >= 12 else code
            # Page from first page containing the code
            page_no = 1
            code_re = re.compile(rf"(?<![A-Z0-9]){re.escape(code)}(?![A-Z0-9])", re.I)
            for pg in sds.pages:
                if code_re.search(pg.text or ""):
                    page_no = pg.page
                    break
            _add_fact(
                draft.facts,
                key="sds_hazard_code_sample",
                value=code,
                doc=sds,
                quote=quote[:240],
                page=page_no,
            )

    # Identity soft check notes (hard HOLD decided in classify)
    expected = (expected_product_code or "").upper().strip()
    code_ok = bool(expected and expected in {c.upper() for c in sds_codes})
    spray_or_family = bool(
        re.search(r"spray|család|family", f"{product_name} {draft.identity_from_sds or ''}", re.I)
    )

    if draft.identity_from_tds and product_name:
        if not _names_compatible(product_name, draft.identity_from_tds):
            draft.warnings.append("tds_title_name_mismatch")
    if draft.identity_from_sds and product_name:
        if not _names_compatible(product_name, draft.identity_from_sds) and not code_ok:
            draft.warnings.append("sds_title_name_mismatch")
    if draft.identity_from_tds and draft.identity_from_sds:
        if (
            not _names_compatible(draft.identity_from_tds, draft.identity_from_sds)
            and not code_ok
        ):
            draft.warnings.append("tds_sds_identity_mismatch")

    if expected and sds_codes and not code_ok:
        draft.warnings.append("sds_product_code_mismatch")
    elif expected and not sds_codes and spray_or_family:
        # Spray / family SDS without recoverable code → uncertain identity
        draft.warnings.append("sds_identity_uncertain")

    return draft


# Known manufacturer naming aliases (token → canonical token), PPG / Trilak HU
_NAME_ALIASES: dict[str, str] = {
    "pu": "polyurethan",
    "polyurethane": "polyurethan",
    "poliuretan": "polyurethan",
    "csónaklakk": "csonaklakk",
    "csonaklakk": "csonaklakk",
    "rozsdastop": "rozsdastop",
    "rozsda": "rozsdastop",
    "multitop": "multitop",
    "unitop": "unitop",
    "diszperzit": "diszperzit",
    "sol": "sol",
    "silicate": "silicate",
    "szilikat": "silicate",
}


def _norm_name(s: str) -> str:
    s = s.lower()
    s = s.replace("á", "a").replace("é", "e").replace("í", "i")
    s = s.replace("ó", "o").replace("ö", "o").replace("ő", "o")
    s = s.replace("ú", "u").replace("ü", "u").replace("ű", "u")
    s = re.sub(r"[^a-z0-9]+", " ", s)
    tokens = []
    for t in s.split():
        tokens.append(_NAME_ALIASES.get(t, t))
    return " ".join(tokens)


def _names_compatible(a: str, b: str) -> bool:
    na, nb = _norm_name(a), _norm_name(b)
    if not na or not nb:
        return True
    # Disclaimer / garbage titles are never compatible
    if _TDS_DISCLAIMER.search(a) or _TDS_DISCLAIMER.search(b):
        return False
    if na in nb or nb in na:
        return True
    ta, tb = set(na.split()), set(nb.split())
    # Require meaningful overlap of tokens longer than 2 chars
    sig_a = {t for t in ta if len(t) > 2}
    sig_b = {t for t in tb if len(t) > 2}
    if not sig_a or not sig_b:
        return True
    overlap = sig_a & sig_b
    # Brand+line token evidence (e.g. hera+gold, lazurán+polyurethan)
    brandish = overlap & {
        "hera",
        "trinat",
        "lazuran",
        "trilak",
        "coror",
        "valmor",
        "factor",
        "7016",
        "platinum",
        "inntaler",
        "boroka",
        "cellkolor",
        "prakticolor",
        "poli",
        "farbe",
        "dufa",
        "profitec",
        "meffert",
    }
    if brandish and len(overlap) >= 2:
        return True
    # Poli short titles vs page names often share one strong line token + product type
    poli_line = overlap & {
        "platinum",
        "inntaler",
        "boroka",
        "cellkolor",
        "prakticolor",
    }
    if poli_line and overlap & {
        "falfestek",
        "homlokzatfestek",
        "vastaglazur",
        "vekonylazur",
        "alapozo",
        "zomanc",
        "vakolat",
        "lazur",
        "lakk",
        "egyretegu",
        "decor",
        "latex",
    }:
        return True
    # Truncated SDS/TDS titles: "POLI-FARBE PLATINUM" vs "PLATINUM EGYRETEGU …"
    if "platinum" in sig_a and "platinum" in sig_b:
        return True
    if "inntaler" in sig_a and "inntaler" in sig_b:
        return True
    if "boroka" in sig_a and "boroka" in sig_b:
        return True
    if "cellkolor" in sig_a and "cellkolor" in sig_b:
        return True
    # Distinctive single product-line tokens (Düfa/ProfiTec HU marketing vs DE SDS).
    if any(len(t) >= 6 for t in overlap):
        return True
    return len(overlap) >= min(2, len(sig_a), len(sig_b)) or bool(
        overlap & {"coror", "valmor", "7016", "factor", "dufa", "profitec"}
    )
