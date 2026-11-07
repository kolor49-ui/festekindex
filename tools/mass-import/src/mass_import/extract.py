"""PDF text extraction with page numbers and SHA binding."""

from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from pathlib import Path

from pypdf import PdfReader

from .fetch import SourceFile, sha256_file


@dataclass
class PageText:
    page: int
    text: str


@dataclass
class ExtractedDoc:
    source_id: str
    kind: str
    sha256: str
    page_count: int
    pages: list[PageText]
    full_text: str


def extract_pdf(source: SourceFile) -> ExtractedDoc:
    digest = sha256_file(source.path)
    if digest != source.sha256:
        raise ValueError(f"sha_mismatch:{source.source_id}")

    reader = PdfReader(str(source.path))
    if getattr(reader, "is_encrypted", False):
        # Many manufacturer SDSs use empty-password AES; try unlock, else raise.
        unlocked = False
        try:
            unlocked = bool(reader.decrypt(""))  # type: ignore[attr-defined]
        except Exception as e:  # noqa: BLE001
            raise RuntimeError(f"pdf_encrypted_unlock_failed:{e}") from e
        if not unlocked and getattr(reader, "is_encrypted", False):
            raise RuntimeError("pdf_encrypted_password_required")
    pages: list[PageText] = []
    chunks: list[str] = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages.append(PageText(page=i + 1, text=text))
        chunks.append(f"--- PAGE {i + 1} ---\n{text}")

    return ExtractedDoc(
        source_id=source.source_id,
        kind=source.kind,
        sha256=digest,
        page_count=len(reader.pages),
        pages=pages,
        full_text="\n".join(chunks),
    )


def write_extract(doc: ExtractedDoc, out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    txt_path = out_dir / f"{doc.source_id}_extract.txt"
    txt_path.write_text(doc.full_text, encoding="utf-8")
    meta = {
        "source_id": doc.source_id,
        "kind": doc.kind,
        "sha256": doc.sha256,
        "page_count": doc.page_count,
    }
    (out_dir / f"{doc.source_id}_meta.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return txt_path


def _collapse_for_match(text: str) -> str:
    """Normalize whitespace and PDF letter-spacing artefacts for quote matching."""
    t = (text or "").replace("\u00ad", "")
    t = " ".join(t.split())
    # Soft: also provide a letters+digits only form
    return t


def _alnum_fold(text: str) -> str:
    return "".join(ch.lower() for ch in text if ch.isalnum())


_HAZARD_CODE_RE = re.compile(r"^H[0-9]{3}(?:\+H[0-9]{3})*$", re.I)


_PAGE_MARKER_RE = re.compile(r"---\s*PAGE\s+\d+\s*---", re.I)


def find_quote_page(doc: ExtractedDoc, quote: str) -> int | None:
    """Locate quote in extracted pages. Short H-codes use word-boundary proof only."""
    # Extract full_text injects "--- PAGE N ---" separators; strip them from quotes
    # so cross-page windows can still prove against real page text (not a gate bypass).
    needle = _collapse_for_match(_PAGE_MARKER_RE.sub(" ", quote or ""))
    if not needle:
        return None

    # Hazard sample codes are short but still require a real textual hit in the SDS.
    if _HAZARD_CODE_RE.match(needle.replace(" ", "")):
        code = needle.replace(" ", "").upper()
        code_re = re.compile(rf"(?<![A-Z0-9]){re.escape(code)}(?![A-Z0-9])", re.I)
        for page in doc.pages:
            if code_re.search(page.text or ""):
                return page.page
        # Cross-page join (rare for H-codes, but keep parity)
        for i in range(len(doc.pages) - 1):
            combo = (doc.pages[i].text or "") + " " + (doc.pages[i + 1].text or "")
            if code_re.search(combo):
                return doc.pages[i].page
        return None

    if len(needle) < 12:
        return None
    soft = needle[:48]
    soft_alnum = _alnum_fold(soft)
    # Also try de-hyphenated form: "fest-\nek" artefacts already collapsed via whitespace;
    # alnum fold covers mid-word spaces / hyphen leftovers.
    for page in doc.pages:
        hay = _collapse_for_match(page.text)
        if needle in hay or (soft and soft in hay):
            return page.page
        if soft_alnum and len(soft_alnum) >= 12:
            hay_alnum = _alnum_fold(hay)
            if soft_alnum in hay_alnum:
                return page.page
    # Cross-page: join adjacent pages (PDF wrap across page break)
    for i in range(len(doc.pages) - 1):
        combo = _collapse_for_match(doc.pages[i].text + " " + doc.pages[i + 1].text)
        if needle in combo or (soft and soft in combo):
            return doc.pages[i].page
        if soft_alnum and soft_alnum in _alnum_fold(combo):
            return doc.pages[i].page
    return None


def docs_to_dict(docs: list[ExtractedDoc]) -> list[dict]:
    out = []
    for d in docs:
        out.append(
            {
                "source_id": d.source_id,
                "kind": d.kind,
                "sha256": d.sha256,
                "page_count": d.page_count,
                "pages": [asdict(p) for p in d.pages],
            }
        )
    return out
