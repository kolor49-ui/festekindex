"""Düfa / Meffert Hungária (dufa-hungary.hu) official-source adapter."""

from __future__ import annotations

import re
from html import unescape
from typing import Any
from urllib.parse import urljoin

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://dufa-hungary.hu/"
CATEGORIES = (
    "alapozok",
    "belteri-festek",
    "favedelem",
    "femvedelem",
    "garazs-es-padlo",
    "homlokzatfestek",
    "kiegeszito-termekek",
    "kreativ-termekek",
    "lakkok",
    "profi-tec-termekek",
    "szinezo-termekek",
    "vakolat",
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
    return f"prod_dufa_{clean}"[:90]


def _brand_from_slug_name(slug: str, name: str) -> str:
    t = _fold(f"{slug} {name}")
    if "profi" in t and "tec" in t:
        return "Profi Tec"
    if "profitec" in t or "profi-tec" in t:
        return "Profi Tec"
    return "Düfa"


def _type_hint(name: str, slug: str, category: str) -> str:
    t = _fold(f"{name} {slug} {category}")
    rules = [
        ("belteri", "falfesték"),
        ("falfest", "falfesték"),
        ("latex", "falfesték"),
        ("homlokzat", "homlokzatfesték"),
        ("fassade", "homlokzatfesték"),
        ("vakolat", "vakolat"),
        ("putz", "vakolat"),
        ("alapozo", "alapozó"),
        ("grund", "alapozó"),
        ("lazur", "lazúr"),
        ("holzschutz", "lazúr"),
        ("faved", "lazúr"),
        ("lack", "lakk"),
        ("lakk", "lakk"),
        ("zomanc", "zománc"),
        ("heizkorper", "zománc"),
        ("radiator", "zománc"),
        ("higito", "hígító"),
        ("padlo", "egyéb"),
        ("boden", "egyéb"),
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


def _extract_pdf_docs(html: str, slug: str) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    for href, label in re.findall(
        r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.I | re.S
    ):
        lab = _strip_tags(label).lower()
        url = urljoin(BASE, href)
        fname = href.split("/")[-1].lower()
        kind = None
        if (
            "biztonsági" in lab
            or "biztonsagi" in lab
            or lab.startswith("sds")
            or "sdb_" in fname
            or "safety" in lab
        ):
            kind = "sds"
        elif (
            "műszaki" in lab
            or "muszaki" in lab
            or lab.startswith("tds")
            or fname.startswith("tm_")
            or "_tm_" in fname
        ):
            kind = "tds"
        if not kind:
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_dufa_{slug}_{kind}",
                "url": url,
                "filename": f"src_dufa_{slug}_{kind}.pdf",
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
    # WooCommerce short description
    m = re.search(
        r'class="[^"]*woocommerce-product-details__short-description[^"]*"[^>]*>([\s\S]*?)</div>',
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
    # Tab / accordion sections common on Woo product pages
    for title, key in (
        ("Alkalmazási terület", "application_area"),
        ("Alkalmazás", "application_area"),
        ("Felhasználás", "application_steps"),
        ("Előkészítés", "preparation"),
        ("Tulajdonságok", "properties"),
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


class DufaAdapter:
    manufacturer_id = "dufa"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}
        for cat in CATEGORIES:
            page = 1
            while True:
                path = f"termekkategoria/{cat}/" if page == 1 else f"termekkategoria/{cat}/page/{page}/"
                url = urljoin(BASE, path)
                res = http.get(url)
                if not res.ok:
                    break
                html = res.body.decode("utf-8", "replace")
                slugs = re.findall(
                    r"https://dufa-hungary\.hu/termek/([a-zA-Z0-9-]+)/", html
                )
                slugs += re.findall(r'href="/termek/([a-zA-Z0-9-]+)/"', html)
                new_on_page = 0
                for slug in slugs:
                    if slug in found:
                        continue
                    name_guess = slug.replace("-", " ").strip()
                    brand = _brand_from_slug_name(slug, name_guess)
                    found[slug] = DiscoveredProduct(
                        product_id=_slugify_id(slug),
                        product_name=name_guess,
                        brand=brand,
                        manufacturer="dufa",
                        product_page_url=urljoin(BASE, f"termek/{slug}/"),
                        product_code=slug,
                        product_type_hint=_type_hint(name_guess, slug, cat),
                        extra={"slug": slug, "category": cat},
                    )
                    new_on_page += 1
                    if len(found) >= limit:
                        return list(found.values())
                # pagination
                pages = {
                    int(p)
                    for p in re.findall(
                        rf"/termekkategoria/{re.escape(cat)}/page/(\d+)/", html
                    )
                }
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
            slug = page_url.rstrip("/").split("/")[-1]

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
            docs = _extract_pdf_docs(html, re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_"))
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
