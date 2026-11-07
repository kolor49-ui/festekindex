"""AkzoNobel HU (dulux.hu) — Dulux / Sadolin / Hammerite official-source adapter."""

from __future__ import annotations

import json
import re
from html import unescape
from typing import Any
from urllib.parse import unquote, urljoin, urlsplit

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://www.dulux.hu/"
CATALOGUE = "https://www.dulux.hu/hu/termekek"


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


def _slug_from_path(path: str) -> str:
    raw = unquote(path.rstrip("/").split("/")[-1])
    return raw


def _slugify_id(slug: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")
    return f"prod_akzo_{clean}"[:90]


def _brand_from_slug_name(slug: str, name: str) -> str:
    t = _fold(f"{slug} {name}")
    if "hammerite" in t:
        return "Hammerite"
    if "sadolin" in t:
        return "Sadolin"
    if "dulux" in t:
        return "Dulux"
    return "Dulux"


def _type_hint(name: str, slug: str) -> str:
    t = _fold(f"{name} {slug}")
    rules = [
        ("alapozo", "alapozó"),
        ("primer", "alapozó"),
        ("lazur", "lazúr"),
        ("vastaglazur", "lazúr"),
        ("lakk", "lakk"),
        ("yacht", "lakk"),
        ("parketta", "lakk"),
        ("zomanc", "zománc"),
        ("rozsda", "zománc"),
        ("radiator", "zománc"),
        ("garage", "egyéb"),
        ("garazs", "egyéb"),
        ("falfest", "falfesték"),
        ("easycare", "falfesték"),
        ("diamond", "falfesték"),
        ("latex", "falfesték"),
        ("festek", "falfesték"),
        ("csempe", "egyéb"),
        ("butor", "egyéb"),
        ("spray", "zománc"),
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


def _is_direct_pdf(url: str) -> bool:
    low = (url or "").lower()
    if not low.endswith(".pdf") and ".pdf?" not in low:
        return False
    # Portal index pages are not product-bound PDFs.
    if "shop.akzonobel.hu" in low:
        return False
    return True


def _kind_from_label_url(label: str, url: str) -> str | None:
    lab = _fold(label or "")
    fname = urlsplit(url).path.split("/")[-1].lower()
    if (
        "biztonsag" in lab
        or lab.startswith("sds")
        or lab.startswith("ba ")
        or fname.startswith("ba-")
        or fname.startswith("sds")
        or "-sds-" in fname
        or "safety" in lab
    ):
        return "sds"
    if (
        "muszaki" in lab
        or lab.startswith("tds")
        or fname.startswith("tds-")
        or fname.startswith("tds_")
        or "-tds-" in fname
        or "technical" in lab
    ):
        return "tds"
    return None


def _extract_json_docs(html: str, slug: str) -> list[dict[str, Any]]:
    """Parse embedded {"label","url"} document objects from dulux.hu pages."""
    docs: list[dict[str, Any]] = []
    for label, url in re.findall(
        r'\{"label":"([^"]+)","url":"([^"]+)"\}', html
    ):
        url = unescape(url)
        if not _is_direct_pdf(url):
            continue
        kind = _kind_from_label_url(label, url)
        if not kind:
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_akzo_{slug}_{kind}",
                "url": url,
                "filename": f"src_akzo_{slug}_{kind}.pdf",
                "label": label[:120],
            }
        )
    # Prefer first TDS + first SDS only.
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for d in docs:
        if d["kind"] in seen:
            continue
        seen.add(d["kind"])
        out.append(d)
    return out


def _extract_page_lead(html: str) -> str | None:
    for sel in (
        r'class="[^"]*product-description[^"]*"[^>]*>([\s\S]*?)</div>',
        r'class="[^"]*field--name-body[^"]*"[^>]*>([\s\S]*?)</div>',
        r'property="og:description"\s+content="([^"]+)"',
        r'name="description"\s+content="([^"]+)"',
    ):
        m = re.search(sel, html, re.I)
        if not m:
            continue
        text = _strip_tags(m.group(1))
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


def _extract_structured_page_facts(html: str) -> dict[str, Any]:
    html_u = unescape(html)
    facts: dict[str, Any] = {}
    for title, key in (
        ("Alkalmazási terület", "application_area"),
        ("Alkalmazás", "application_area"),
        ("Felhasználás", "application_steps"),
        ("Előkészítés", "preparation"),
        ("Tulajdonságok", "properties"),
        ("Termékleírás", "properties"),
    ):
        m = re.search(
            rf"(?is)<h[2-4][^>]*>\s*{re.escape(title)}\s*</h[2-4]>\s*([\s\S]{{40,2500}}?)(?=<h[2-4]\b|$)",
            html_u,
        )
        if not m:
            continue
        body = _strip_tags(m.group(1))
        if len(body) >= 40:
            facts[key] = body[:1200]
    if facts:
        facts["official_page_tech"] = True
    return facts


class AkzoAdapter:
    manufacturer_id = "akzo"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}
        res = http.get(CATALOGUE)
        if not res.ok:
            return []
        html = res.body.decode("utf-8", "replace")
        paths = sorted(
            set(
                re.findall(
                    r'href="(/hu/termekek/[^"#?]+)"',
                    html,
                )
            )
        )
        for path in paths:
            slug = _slug_from_path(path)
            if not slug or slug in found:
                continue
            # Skip hub / listing aliases.
            if slug in {"termekek-0", "termekek"}:
                continue
            name_guess = unquote(slug).replace("-", " ").strip()
            brand = _brand_from_slug_name(slug, name_guess)
            page_url = urljoin(BASE, path.lstrip("/"))
            # dulux.hu paths keep unicode; urljoin preserves them.
            page_url = "https://www.dulux.hu" + path
            found[slug] = DiscoveredProduct(
                product_id=_slugify_id(slug),
                product_name=name_guess,
                brand=brand,
                manufacturer="akzo",
                product_page_url=page_url,
                product_code=slug,
                product_type_hint=_type_hint(name_guess, slug),
                extra={"slug": slug},
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
            slug = _slug_from_path(urlsplit(page_url).path)
        slug_id = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand")
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            if h1:
                name = h1
                page_facts["resolved_name"] = name
            brand = _brand_from_slug_name(slug, str(name or ""))
            docs = _extract_json_docs(html, slug_id)
            kinds = {d["kind"] for d in docs}
            if "tds" not in kinds:
                warnings.append("tds_absent_on_product_page")
            if "sds" not in kinds:
                warnings.append("missing_sds_url")

            lead = _extract_page_lead(html)
            if lead:
                page_facts["page_lead"] = lead
                page_facts["short_marketing"] = lead
            structured = _extract_structured_page_facts(html)
            page_facts.update(structured)
            if (
                "application_area" not in page_facts
                and isinstance(lead, str)
                and re.search(
                    r"(?i)(?:alkalmazható|festésére|kül-?\s*és\s*beltér|beltéri|kültéri)",
                    lead,
                )
            ):
                page_facts["application_area"] = lead[:1200]

        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
