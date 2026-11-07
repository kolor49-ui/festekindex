"""Remmers (remmers.hu) official-source adapter — wood + construction A–Z."""

from __future__ import annotations

import re
from html import unescape
from typing import Any
from urllib.parse import urljoin, urlparse, unquote

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://www.remmers.hu"
# Coatings / construction chemistry only — tools catalogue excluded.
AZ_PATHS = (
    "/hu/products-a-z/wood",
    "/hu/products-a-z/construction",
)

# Non-coating utility / tool pages (name or URL slug).
EXCLUDE_NEEDLES = (
    "pistole",
    "fliessbecher",
    "fließbecher",
    "spritzpistole",
    "werkzeug",
    "szerszam",
    "szerszám",
    "rolle",
    "pinsel",
    "ecset",
    "spachtel-set",
    "mischer",
    "ruehr",
    "rühr",
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
        ("ä", "a"),
        ("ß", "ss"),
    ):
        t = t.replace(a, b)
    return t


def _strip_tags(chunk: str) -> str:
    text = unescape(chunk or "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"</(?:p|li|h\d|div|tr)>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _slug_from_path(path: str) -> str:
    """Prefer product name slug before /p/<id>; fall back to article id."""
    path = unquote(path or "")
    m = re.search(r"/([^/]+)/p/(\d+)/?$", path)
    if m:
        return m.group(1)
    m = re.search(r"/p/(\d+)/?$", path)
    if m:
        return m.group(1)
    return path.rstrip("/").split("/")[-1] or "unknown"


def _article_id(path: str) -> str | None:
    m = re.search(r"/p/(\d+)/?$", unquote(path or ""))
    return m.group(1) if m else None


def _product_id(slug: str, article: str | None) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")
    if article:
        # Keep trailing significant digits for uniqueness across similar slugs.
        art = article.lstrip("0") or "0"
        return f"prod_remmers_{clean}_{art}"[:90]
    return f"prod_remmers_{clean}"[:90]


def _type_hint(name: str, slug: str, catalog: str) -> str:
    t = _fold(f"{name} {slug} {catalog}")
    rules = [
        ("lasur", "lazúr"),
        ("lazur", "lazúr"),
        ("lack", "lakk"),
        ("lakk", "lakk"),
        ("olaj", "lazúr"),
        ("öl", "lazúr"),
        ("beize", "lazúr"),
        ("impragn", "alapozó"),
        ("impregn", "alapozó"),
        ("grund", "alapozó"),
        ("alapozo", "alapozó"),
        ("primer", "alapozó"),
        ("verdunn", "hígító"),
        ("higito", "hígító"),
        ("thinner", "hígító"),
        ("acryl", "falfesték"),
        ("falfest", "falfesték"),
        ("homlokzat", "homlokzatfesték"),
        ("fassade", "homlokzatfesték"),
        ("vakolat", "vakolat"),
        ("putz", "vakolat"),
        ("dicht", "egyéb"),
        ("abdicht", "egyéb"),
        ("epoxi", "egyéb"),
        ("epoxy", "egyéb"),
        ("boden", "egyéb"),
        ("padlo", "egyéb"),
        ("holzschutz", "lazúr"),
        ("faanyag", "lazúr"),
        ("glett", "glett"),
        ("spachtel", "glett"),
        ("fug", "egyéb"),
        ("mortel", "egyéb"),
        ("habarcs", "egyéb"),
    ]
    for needle, label in rules:
        if needle in t:
            return label
    return "egyéb"


def _is_excluded(name: str, path: str) -> bool:
    blob = _fold(f"{name} {unquote(path)}")
    return any(n in blob for n in EXCLUDE_NEEDLES)


def _extract_h1(html: str) -> str | None:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if not m:
        return None
    text = _strip_tags(m.group(1))
    return text or None


def _extract_list_after_heading(html: str, heading: str) -> str | None:
    """Pull <li> items under an h2/h3 heading (Remmers product tabs)."""
    m = re.search(
        rf"<h[23][^>]*>\s*{re.escape(heading)}\s*</h[23]>([\s\S]{{0,5000}}?)(?=<h[23]\b|$)",
        html,
        re.I,
    )
    if not m:
        return None
    chunk = m.group(1)
    items: list[str] = []
    for li in re.findall(r"<li[^>]*>(.*?)</li>", chunk, re.I | re.S):
        t = _strip_tags(li)
        if not t or len(t) < 3:
            continue
        # Skip empty icon-only list items
        if t.startswith("http") or len(t) < 4:
            continue
        items.append(t)
    if not items:
        # Fall back to stripped prose under the heading
        prose = _strip_tags(chunk)
        prose = re.sub(r"\s+", " ", prose).strip()
        return prose[:1200] if len(prose) >= 40 else None
    return " ".join(f"{it}." if not it.endswith((".", ";", "!")) else it for it in items)[:1200]


def _extract_subtitle_lead(html: str) -> str | None:
    """First substantial paragraph after h1, or meta description if real."""
    h1 = re.search(r"<h1[^>]*>.*?</h1>", html, re.I | re.S)
    start = h1.end() if h1 else 0
    window = html[start : start + 8000]
    for m in re.finditer(r"<p[^>]*>(.*?)</p>", window, re.I | re.S):
        text = _strip_tags(m.group(1))
        if len(text) < 40:
            continue
        low = text.lower()
        if "jump to" in low or "main navigation" in low:
            continue
        if "product.metadescription" in low:
            continue
        return text[:900]
    return None


def _extract_pdf_docs(html: str, slug: str) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    # Prefer labeled download blocks; also accept _TDS_ / _SDS_ filename cues.
    for href in re.findall(
        r'href="(https://media\.remmers\.com/[^"]+\.pdf)"', html, re.I
    ):
        start = max(0, html.lower().rfind("product-downloads", 0, html.find(href)))
        ctx = html[max(0, html.find(href) - 180) : html.find(href) + 80]
        lab = _strip_tags(ctx).lower()
        fname = href.split("/")[-1].lower()
        kind = None
        if (
            "biztonsági" in lab
            or "biztonsagi" in lab
            or "_sds_" in fname
            or "safety" in lab
        ):
            kind = "sds"
        elif (
            "műszaki" in lab
            or "muszaki" in lab
            or "_tds_" in fname
            or "technical" in lab
        ):
            kind = "tds"
        if not kind:
            continue
        # Skip sustainability sheets mis-tagged
        if "fenntarthat" in lab or "_sus_" in fname:
            if kind == "tds" and "_tds_" not in fname:
                continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_remmers_{slug}_{kind}",
                "url": href,
                "filename": f"src_remmers_{slug}_{kind}.pdf",
                "label": lab[:120],
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


def _extract_structured_page_facts(html: str) -> dict[str, Any]:
    html_u = unescape(html)
    facts: dict[str, Any] = {}

    app = _extract_list_after_heading(html_u, "Felhasználási terület")
    if not app:
        app = _extract_list_after_heading(html_u, "Alkalmazási területek")
    if app and len(app) >= 40:
        facts["application_area"] = app[:1200]

    props = _extract_list_after_heading(html_u, "Tulajdonságok")
    if props and len(props) >= 20:
        facts["properties"] = props[:1200]
        facts["page_lead"] = props[:900]

    # Termékjellemzők often has key/value rows — capture as attributes when possible
    m = re.search(
        r"<h[23][^>]*>\s*Termékjellemzők\s*</h[23]>([\s\S]{0,6000}?)(?=<h[23]\b|$)",
        html_u,
        re.I,
    )
    attrs: list[dict[str, Any]] = []
    if m:
        chunk = m.group(1)
        # table rows or dt/dd-like pairs
        for name, val in re.findall(
            r"<tr[^>]*>\s*<t[hd][^>]*>(.*?)</t[hd]>\s*<t[hd][^>]*>(.*?)</t[hd]>",
            chunk,
            re.I | re.S,
        ):
            n = _strip_tags(name).rstrip(":")
            v = _strip_tags(val)
            if n and v and len(v) >= 1 and "általános értékei" not in v.lower():
                attrs.append({"name": n, "values": [v[:240]]})
        if not attrs:
            # label + value in adjacent divs / strong
            for name, val in re.findall(
                r"<strong[^>]*>(.*?)</strong>\s*([^<]{1,120})",
                chunk,
                re.I | re.S,
            ):
                n = _strip_tags(name).rstrip(":")
                v = _strip_tags(val)
                if n and v and len(v) >= 1:
                    attrs.append({"name": n, "values": [v[:240]]})
    if attrs:
        facts["attributes"] = attrs[:20]

    if facts.get("application_area") or facts.get("properties") or facts.get("attributes"):
        facts["official_page_tech"] = True
    return facts


class RemmersAdapter:
    manufacturer_id = "remmers"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}
        for az in AZ_PATHS:
            catalog = az.rstrip("/").split("/")[-1]
            url = urljoin(BASE, az)
            res = http.get(url)
            if not res.ok:
                continue
            html = res.body.decode("utf-8", "replace")
            for path in re.findall(r'href="(/hu/[^"]+/p/\d+)"', html):
                if path in found:
                    continue
                slug = _slug_from_path(path)
                article = _article_id(path)
                name_guess = slug.replace("-", " ").strip()
                if _is_excluded(name_guess, path):
                    continue
                page_url = urljoin(BASE, path)
                found[path] = DiscoveredProduct(
                    product_id=_product_id(slug, article),
                    product_name=name_guess,
                    brand="Remmers",
                    manufacturer="remmers",
                    product_page_url=page_url,
                    product_code=article or slug,
                    product_type_hint=_type_hint(name_guess, slug, catalog),
                    extra={
                        "slug": slug,
                        "article_id": article,
                        "catalog": catalog,
                    },
                )
                if len(found) >= limit:
                    return list(found.values())
        return list(found.values())

    def resolve_documents(
        self,
        product: dict[str, Any],
        http: RateLimitedClient,
        html: str | None = None,
    ) -> ResolvedDocuments:
        warnings: list[str] = []
        page_url = str(product.get("product_page_url") or "")
        slug = str(
            product.get("slug")
            or product.get("product_code")
            or _slug_from_path(urlparse(page_url).path)
        )

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand") or "Remmers"
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            if h1:
                name = h1
                page_facts["resolved_name"] = name
            docs = _extract_pdf_docs(html, re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_"))
            kinds = {d["kind"] for d in docs}
            if "tds" not in kinds:
                warnings.append("tds_absent_on_product_page")
            if "sds" not in kinds:
                warnings.append("missing_sds_url")

            lead = _extract_subtitle_lead(html)
            structured = _extract_structured_page_facts(html)
            page_facts.update(structured)
            if lead:
                page_facts.setdefault("page_lead", lead)
                page_facts["short_marketing"] = lead
            elif isinstance(page_facts.get("properties"), str):
                page_facts["short_marketing"] = page_facts["properties"][:800]

            if page_facts.get("official_page_tech"):
                page_facts["official_page_tech"] = True

        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
