"""Caparol HU (caparol.hu) official-source adapter — sitemap leaf products."""

from __future__ import annotations

import re
from html import unescape
from typing import Any
from urllib.parse import urljoin, urlsplit

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://www.caparol.hu/"
SITEMAP = "https://www.caparol.hu/sitemap.xml"


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
    return f"prod_caparol_{clean}"[:90]


def _type_hint(name: str, path: str) -> str:
    t = _fold(f"{name} {path}")
    rules = [
        ("belteri", "falfesték"),
        ("falfest", "falfesték"),
        ("latex", "falfesték"),
        ("homlokzatfest", "homlokzatfesték"),
        ("homlokzat", "homlokzatfesték"),
        ("vakolat", "vakolat"),
        ("putz", "vakolat"),
        ("alapozo", "alapozó"),
        ("grund", "alapozó"),
        ("primer", "alapozó"),
        ("impregnal", "alapozó"),
        ("lazur", "lazúr"),
        ("faved", "lazúr"),
        ("lakk", "lakk"),
        ("zomanc", "zománc"),
        ("lack", "lakk"),
        ("glett", "glett"),
        ("higito", "hígító"),
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


def _abs_url(href: str) -> str:
    return urljoin(BASE, href)


def _extract_pdf_docs(html: str, slug: str) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    for href, label in re.findall(
        r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.I | re.S
    ):
        lab = _strip_tags(label)
        lab_l = lab.lower()
        url = _abs_url(href)
        path_l = href.lower()
        kind = None
        # Caparol PIM: /products/ti/ = technical info (TDS), /products/sd/ = SDS
        if "/products/sd/" in path_l or "biztonsági" in lab_l or "biztonsagi" in lab_l:
            kind = "sds"
        elif (
            "/products/ti/" in path_l
            or "műszaki" in lab_l
            or "muszaki" in lab_l
            or lab_l.startswith("ti ")
        ):
            # Skip generic prep guides that aren't product TI.
            fname = href.split("/")[-1].lower()
            if "alapfelulet" in fname or "alapfeluelet" in _fold(fname):
                continue
            kind = "tds"
        if not kind:
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_caparol_{slug}_{kind}",
                "url": url,
                "filename": f"src_caparol_{slug}_{kind}.pdf",
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


def _extract_page_lead(html: str) -> str | None:
    m = re.search(
        r'property="og:description"\s+content="([^"]+)"',
        html,
        re.I,
    )
    if m:
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


def _sitemap_leaves(http: RateLimitedClient) -> list[str]:
    res = http.get(SITEMAP)
    if not res.ok:
        return []
    xml = res.body.decode("utf-8", "replace")
    locs = re.findall(r"<loc>([^<]+)</loc>", xml)
    ter = [L for L in locs if L.startswith("https://www.caparol.hu/termekek/")]
    ter_set = set(ter)
    leaves: list[str] = []
    for L in ter:
        if any(o.startswith(L + "/") for o in ter_set if o != L):
            continue
        if urlsplit(L).path.count("/") >= 4:
            leaves.append(L)
    return leaves


class CaparolAdapter:
    manufacturer_id = "caparol"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}
        for url in _sitemap_leaves(http):
            path = urlsplit(url).path
            slug = path.rstrip("/").split("/")[-1]
            if not slug or slug in found:
                continue
            name_guess = slug.replace("-", " ").strip()
            found[slug] = DiscoveredProduct(
                product_id=_slugify_id(slug),
                product_name=name_guess.title() if name_guess.islower() else name_guess,
                brand="Caparol",
                manufacturer="caparol",
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
        brand = product.get("brand") or "Caparol"
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            if h1:
                name = h1
                page_facts["resolved_name"] = name
            docs = _extract_pdf_docs(html, slug_id)
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
