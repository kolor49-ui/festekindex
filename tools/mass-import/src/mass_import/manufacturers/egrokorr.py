"""EGROKORR Zrt. (egrokorr.hu) WooCommerce official-source adapter."""

from __future__ import annotations

import re
from html import unescape
from typing import Any
from urllib.parse import urljoin

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://egrokorr.hu/"


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


def _base_slug(slug: str) -> str:
    """Collapse color/size SKU variants to a base product key."""
    b = slug
    b = re.sub(r"-(?:\d+)?0?25-\d*-?l$", "", b)
    b = re.sub(r"-\d+(?:-\d+)?-l$", "", b)
    b = re.sub(r"-\d+-kg$", "", b)
    b = re.sub(r"-\d+-ml$", "", b)
    # strip trailing RAL codes often embedded
    b = re.sub(r"-ral-\d{3,4}$", "", b)
    return b or slug


def _slugify_id(slug: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")
    return f"prod_egrokorr_{clean}"[:90]


def _brand_from_slug_name(slug: str, name: str) -> str:
    t = _fold(f"{slug} {name}")
    for brand in (
        "dunaplaszt",
        "alvikorr",
        "izofix",
        "renova",
        "sziloplaszt",
        "thermokorr",
        "egrokorr",
    ):
        if brand in t:
            return brand.title() if brand != "dunaplaszt" else "Dunaplaszt"
    return "Egrokorr"


def _type_hint(name: str, slug: str) -> str:
    t = _fold(f"{name} {slug}")
    rules = [
        ("alapozo", "alapozó"),
        ("korrozi", "alapozó"),
        ("zomanc", "zománc"),
        ("garazs", "egyéb"),
        ("padlo", "egyéb"),
        ("lakk", "lakk"),
        ("higito", "hígító"),
        ("falfest", "falfesték"),
        ("lazur", "lazúr"),
        ("festek", "falfesték"),
    ]
    for needle, label in rules:
        if needle in t:
            return label
    return "egyéb"


def _extract_h1(html: str) -> str | None:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if not m:
        return None
    return _strip_tags(m.group(1)) or None


def _extract_pdf_docs(html: str, slug: str) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    for href, label in re.findall(
        r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.I | re.S
    ):
        lab = _strip_tags(label).lower()
        url = urljoin(BASE, href)
        fname = href.split("/")[-1].lower()
        # Skip impresszum / policy PDFs
        if "impresszum" in fname or "visszaeles" in fname or "panasz" in fname:
            continue
        kind = None
        if (
            "biztonsági" in lab
            or "biztonsagi" in lab
            or fname.startswith("ba-")
            or "_ba_" in fname
            or lab.startswith("sds")
        ):
            kind = "sds"
        elif (
            "műszaki" in lab
            or "muszaki" in lab
            or fname.startswith("ma-")
            or fname.startswith("tds")
            or lab.startswith("tds")
        ):
            kind = "tds"
        if not kind:
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_egrokorr_{slug}_{kind}",
                "url": url,
                "filename": f"src_egrokorr_{slug}_{kind}.pdf",
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
    # Woo short description
    m = re.search(
        r'class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)</div>',
        html,
        re.I,
    )
    if m:
        text = _strip_tags(m.group(1))
        if len(text) >= 40:
            return text[:900]
    # Tab description with MŰSZAKI ADATOK
    m = re.search(
        r'id="tab-description"[^>]*>([\s\S]*?)</div>\s*</div>',
        html,
        re.I,
    )
    if m:
        text = _strip_tags(m.group(1))
        if len(text) >= 60:
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
    # Description tab often starts with MŰSZAKI ADATOK
    m = re.search(
        r'id="tab-description"[^>]*>[\s\S]*?<h2[^>]*>.*?</h2>([\s\S]*?)(?:</div>\s*</div>|id="tab-)',
        html_u,
        re.I,
    )
    if m:
        body = _strip_tags(m.group(1))
        if len(body) >= 40:
            facts["properties"] = body[:1200]
            facts["official_page_tech"] = True
    m = re.search(
        r'id="tab-alklamazas_tab"[^>]*>[\s\S]*?<h2[^>]*>.*?</h2>([\s\S]*?)(?:</div>\s*</div>|id="tab-)',
        html_u,
        re.I,
    )
    if m:
        body = _strip_tags(m.group(1))
        if len(body) >= 40:
            facts["application_area"] = body[:1200]
            facts["official_page_tech"] = True
    return facts


class EgrokorrAdapter:
    manufacturer_id = "egrokorr"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}
        page = 1
        while True:
            path = "termekek/" if page == 1 else f"termekek/page/{page}/"
            url = urljoin(BASE, path)
            res = http.get(url)
            if not res.ok:
                break
            html = res.body.decode("utf-8", "replace")
            slugs = set(re.findall(r"/termek/([a-z0-9\-]+)/", html))
            if not slugs:
                break
            new_on_page = 0
            for slug in sorted(slugs):
                base = _base_slug(slug)
                if base in found:
                    continue
                name_guess = base.replace("-", " ").strip()
                brand = _brand_from_slug_name(base, name_guess)
                found[base] = DiscoveredProduct(
                    product_id=_slugify_id(base),
                    product_name=name_guess.upper()
                    if len(name_guess) < 40
                    else name_guess,
                    brand=brand,
                    manufacturer="egrokorr",
                    # Prefer first seen SKU URL as canonical page
                    product_page_url=urljoin(BASE, f"termek/{slug}/"),
                    product_code=base,
                    product_type_hint=_type_hint(name_guess, base),
                    extra={"slug": base, "sample_sku": slug},
                )
                new_on_page += 1
                if len(found) >= limit:
                    return list(found.values())
            pages = {int(p) for p in re.findall(r"/termekek/page/(\d+)/", html)}
            if page + 1 in pages:
                page += 1
                continue
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
            slug = _base_slug(page_url.rstrip("/").split("/")[-1])
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
                # Prefer product family name without pack size when present
                name = re.sub(
                    r"\s+\d+(?:[.,]\d+)?\s*(?:L|l|kg|ml|ML)\s*$",
                    "",
                    h1,
                ).strip() or h1
                page_facts["resolved_name"] = name
            brand = _brand_from_slug_name(slug, str(name or ""))
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
                    r"(?i)(?:alkalmazható|festésére|kül-?\s*és\s*beltér|beltéri|kültéri|felépítés)",
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
