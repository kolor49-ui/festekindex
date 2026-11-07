"""Baumit HU (baumit.hu) official-source adapter — sitemap leaf products."""

from __future__ import annotations

import json
import re
from html import unescape
from typing import Any
from urllib.parse import urlsplit

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://baumit.hu"
SITEMAP = "https://baumit.hu/sitemap.xml"

# Prefer coating / paint / plaster / primer leaves for P1 fill.
PAINTISH = (
    "festek",
    "vakolat",
    "alapozo",
    "homlokzat",
    "belteri",
    "sanova",
    "creativ",
    "crystal",
    "silikat",
    "szilik",
    "latex",
    "glett",
    "primer",
    "color",
    "top",
    "finish",
    "lasur",
    "nemesvakolat",
    "modellezo",
    "dekor",
    "klima",
)


def _fold(s: str) -> str:
    t = (s or "").lower()
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


def _strip_tags(chunk: str) -> str:
    text = unescape(chunk or "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _slugify_id(slug: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")
    return f"prod_baumit_{clean}"[:90]


def _type_hint(name: str, path: str) -> str:
    t = _fold(f"{name} {path}")
    rules = [
        ("belteri", "falfesték"),
        ("falfest", "falfesték"),
        ("color", "homlokzatfesték"),
        ("homlokzatfest", "homlokzatfesték"),
        ("vakolat", "vakolat"),
        ("top", "vakolat"),
        ("nemesvakolat", "vakolat"),
        ("alapozo", "alapozó"),
        ("primer", "alapozó"),
        ("glett", "glett"),
        ("lasur", "lazúr"),
        ("lazur", "lazúr"),
    ]
    for needle, label in rules:
        if needle in t:
            return label
    return "egyéb"


def _extract_h1(html: str) -> str | None:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if not m:
        return None
    text = _strip_tags(m.group(1))
    return text or None


def _unescape_json_url(url: str) -> str:
    return url.replace("\\/", "/")


def _extract_embedded_pdfs(html: str, slug: str) -> list[dict[str, Any]]:
    """Parse Baumit product-page embedded PDF objects (Műszaki lap / Biztonsági adatlap)."""
    docs: list[dict[str, Any]] = []
    # Objects with URL + type_name
    for m in re.finditer(
        r'\{\s*"id"\s*:\s*\d+\s*,\s*"product_id"\s*:\s*\d+\s*,\s*"type"\s*:\s*\d+\s*,'
        r'[\s\S]*?"URL"\s*:\s*"([^"]+)"\s*,\s*"type_name"\s*:\s*"([^"]+)"\s*\}',
        html,
    ):
        url = _unescape_json_url(m.group(1))
        type_name = unescape(m.group(2).encode("utf-8").decode("unicode_escape"))
        # Fallback if already decoded
        if "\\u" in type_name:
            try:
                type_name = type_name.encode("utf-8").decode("unicode_escape")
            except Exception:
                pass
        tn = _fold(type_name)
        kind = None
        if "biztonsagi" in tn or "safety" in tn:
            kind = "sds"
        elif "muszaki" in tn or "technical" in tn or tn.endswith(" lap"):
            kind = "tds"
        if not kind:
            continue
        if not url.lower().endswith(".pdf"):
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_baumit_{slug}_{kind}",
                "url": url,
                "filename": f"src_baumit_{slug}_{kind}.pdf",
                "label": type_name[:120],
            }
        )
    # Alternate compact JSON form
    if not docs:
        for url, type_name_raw in re.findall(
            r'"URL"\s*:\s*"(https[^"]+\.pdf)"\s*,\s*"type_name"\s*:\s*"([^"]+)"',
            html,
            re.I,
        ):
            url = _unescape_json_url(url)
            try:
                type_name = type_name_raw.encode("utf-8").decode("unicode_escape")
            except Exception:
                type_name = type_name_raw
            tn = _fold(type_name)
            kind = None
            if "biztonsagi" in tn:
                kind = "sds"
            elif "muszaki" in tn:
                kind = "tds"
            if not kind:
                continue
            docs.append(
                {
                    "kind": kind,
                    "source_id": f"src_baumit_{slug}_{kind}",
                    "url": url,
                    "filename": f"src_baumit_{slug}_{kind}.pdf",
                    "label": type_name[:120],
                }
            )
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for d in docs:
        if d["kind"] in seen:
            continue
        seen.add(d["kind"])
        out.append(d)
    return out


def _extract_page_lead(html: str) -> str | None:
    m = re.search(r'property="og:description"\s+content="([^"]+)"', html, re.I)
    if m:
        text = _strip_tags(m.group(1))
        if len(text) >= 40:
            return text[:900]
    # Prefer product description JSON
    m = re.search(r'"description"\s*:\s*"((?:\\.|[^"\\]){40,1200})"', html)
    if m:
        try:
            text = json.loads(f'"{m.group(1)}"')
        except Exception:
            text = _strip_tags(m.group(1))
        text = _strip_tags(str(text))
        if len(text) >= 40:
            return text[:900]
    for m in re.finditer(r"<p[^>]*>(.*?)</p>", html, re.I | re.S):
        text = _strip_tags(m.group(1))
        if len(text) < 60:
            continue
        low = text.lower()
        if "cookie" in low or "adatvédelmi" in low:
            continue
        return text[:900]
    return None


def _sitemap_leaves(http: RateLimitedClient) -> list[str]:
    res = http.get(SITEMAP)
    if not res.ok:
        return []
    xml = res.body.decode("utf-8", "replace")
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    ter = [L for L in locs if "/termekek/" in L]
    ter_set = set(ter)
    leaves: list[str] = []
    for L in ter:
        if any(o.startswith(L + "/") for o in ter_set if o != L):
            continue
        if urlsplit(L).path.count("/") >= 4:
            leaves.append(L)
    return leaves


class BaumitAdapter:
    manufacturer_id = "baumit"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}
        for url in _sitemap_leaves(http):
            path = urlsplit(url).path
            folded = _fold(path)
            if not any(k in folded for k in PAINTISH):
                continue
            slug = path.rstrip("/").split("/")[-1]
            if not slug or slug in found:
                continue
            name_guess = slug.replace("-", " ").replace("baumit ", "Baumit ").strip()
            if name_guess.lower().startswith("baumit "):
                name_guess = "Baumit " + name_guess[7:]
            elif slug.startswith("baumit-"):
                name_guess = "Baumit " + slug[7:].replace("-", " ")
            found[slug] = DiscoveredProduct(
                product_id=_slugify_id(slug),
                product_name=name_guess,
                brand="Baumit",
                manufacturer="baumit",
                product_page_url=url,
                product_code=slug,
                product_type_hint=_type_hint(name_guess, path),
                extra={"slug": slug, "path": path},
            )
            if len(found) >= limit:
                break
        return list(found.values())

    def resolve_documents(
        self,
        product: dict[str, Any],
        http: RateLimitedClient,
        html: str | None = None,
    ) -> ResolvedDocuments:
        warnings: list[str] = []
        page_url = str(product.get("product_page_url") or "")
        slug = str(product.get("product_code") or product.get("slug") or "")
        if not slug and page_url:
            slug = urlsplit(page_url).path.rstrip("/").split("/")[-1]
        slug_id = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand") or "Baumit"
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            if h1:
                name = h1
                page_facts["resolved_name"] = name
            docs = _extract_embedded_pdfs(html, slug_id)
            kinds = {d["kind"] for d in docs}
            if "tds" not in kinds:
                warnings.append("tds_absent_on_product_page")
            if "sds" not in kinds:
                warnings.append("missing_sds_url")

            lead = _extract_page_lead(html)
            if lead:
                page_facts["page_lead"] = lead
                page_facts["short_marketing"] = lead
            if (
                "application_area" not in page_facts
                and isinstance(lead, str)
                and re.search(
                    r"(?i)(?:alkalmazható|festésére|kül-?\s*és\s*beltér|beltéri|kültéri)",
                    lead,
                )
            ):
                page_facts["application_area"] = lead[:1200]
                page_facts["official_page_tech"] = True

        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
