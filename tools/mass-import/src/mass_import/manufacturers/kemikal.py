"""KEMIKÁL Építőanyagipari Zrt. (kemikal.hu) WooCommerce official-source adapter."""

from __future__ import annotations

import json
import re
from html import unescape
from typing import Any
from urllib.parse import urljoin

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://kemikal.hu/"
API = "https://kemikal.hu/wp-json/wp/v2/product"
BRAND_API = "https://kemikal.hu/wp-json/wp/v2/product_brand"

SKIP_PDF_MARKERS = (
    "adatkezeles",
    "adatkezel",
    "aszf",
    "impresszum",
    "cookie",
    "visszaeles",
    "panasz",
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
    return f"prod_kemikal_{clean}"[:90]


def _brand_from_slug_name(slug: str, name: str, brand_terms: dict[int, str] | None = None) -> str:
    t = _fold(f"{slug} {name}")
    if "bornit" in t:
        return "Bornit"
    if "tetol" in t:
        return "Tetol"
    return "Kemikál"


def _type_hint(name: str, slug: str, excerpt: str = "") -> str:
    t = _fold(f"{name} {slug} {excerpt}")
    rules = [
        ("alapozo", "alapozó"),
        ("lazur", "lazúr"),
        ("lakk", "lakk"),
        ("vakolat", "vakolat"),
        ("glett", "glett"),
        ("falfest", "falfesték"),
        ("festek", "falfesték"),
        ("zomanc", "zománc"),
        ("higito", "hígító"),
        ("bitumen", "egyéb"),
        ("ragaszt", "egyéb"),
        ("tisztit", "egyéb"),
        ("sziget", "egyéb"),
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


def _classify_pdf(url: str, label: str = "") -> str | None:
    fname = url.split("/")[-1].lower()
    lab = _fold(label)
    blob = _fold(f"{fname} {lab}")
    if any(m in blob for m in SKIP_PDF_MARKERS):
        return None
    if "emi_jegyz" in blob or "jegyzokonyv" in blob:
        return None
    if (
        "termekismerteto" in blob
        or "termekismert" in blob
        or "tds" in blob
        or "muszaki" in blob
        or "műszaki" in lab
    ):
        return "tds"
    if (
        "verzio" in blob
        or "biztons" in blob
        or "sds" in blob
        or re.search(r"\d+\.verzio", blob)
    ):
        return "sds"
    # Prefer first unknown product PDF as TDS, second as SDS — caller handles order.
    return "unknown"


def _extract_pdf_docs(html: str, slug_id: str) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    unknowns: list[tuple[str, str]] = []
    for href, label in re.findall(
        r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.I | re.S
    ):
        lab = _strip_tags(label)
        url = urljoin(BASE, href)
        kind = _classify_pdf(url, lab)
        if kind is None:
            continue
        if kind == "unknown":
            unknowns.append((url, lab))
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_kemikal_{slug_id}_{kind}",
                "url": url,
                "filename": f"src_kemikal_{slug_id}_{kind}.pdf",
                "label": lab[:120] or url.split("/")[-1][:120],
            }
        )
    # Also catch bare href PDFs without useful anchor text
    for href in re.findall(r'href="([^"]+\.pdf)"', html, re.I):
        url = urljoin(BASE, href)
        if any(d["url"] == url for d in docs):
            continue
        kind = _classify_pdf(url, "")
        if kind is None:
            continue
        if kind == "unknown":
            if not any(u == url for u, _ in unknowns):
                unknowns.append((url, ""))
            continue
        if any(d["kind"] == kind for d in docs):
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_kemikal_{slug_id}_{kind}",
                "url": url,
                "filename": f"src_kemikal_{slug_id}_{kind}.pdf",
                "label": url.split("/")[-1][:120],
            }
        )

    kinds = {d["kind"] for d in docs}
    for url, lab in unknowns:
        if "tds" not in kinds:
            docs.append(
                {
                    "kind": "tds",
                    "source_id": f"src_kemikal_{slug_id}_tds",
                    "url": url,
                    "filename": f"src_kemikal_{slug_id}_tds.pdf",
                    "label": (lab or url.split("/")[-1])[:120],
                }
            )
            kinds.add("tds")
            continue
        if "sds" not in kinds:
            docs.append(
                {
                    "kind": "sds",
                    "source_id": f"src_kemikal_{slug_id}_sds",
                    "url": url,
                    "filename": f"src_kemikal_{slug_id}_sds.pdf",
                    "label": (lab or url.split("/")[-1])[:120],
                }
            )
            kinds.add("sds")
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for d in docs:
        if d["kind"] in seen:
            continue
        seen.add(d["kind"])
        out.append(d)
    return out


def _extract_page_lead(html: str, excerpt: str | None = None) -> str | None:
    if excerpt:
        text = _strip_tags(excerpt)
        if len(text) >= 40:
            return text[:900]
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
        if "cookie" in low or "adatvédelmi" in low or "ászf" in low:
            continue
        return text[:900]
    return None


class KemikalAdapter:
    manufacturer_id = "kemikal"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        brand_terms: dict[int, str] = {}
        page = 1
        while True:
            res = http.get(f"{BRAND_API}?per_page=100&page={page}")
            if not res.ok:
                break
            rows = json.loads(res.body.decode("utf-8", "replace"))
            if not isinstance(rows, list) or not rows:
                break
            for row in rows:
                brand_terms[int(row["id"])] = str(row.get("name") or row.get("slug") or "")
            if len(rows) < 100:
                break
            page += 1

        found: list[DiscoveredProduct] = []
        page = 1
        while len(found) < limit:
            res = http.get(f"{API}?per_page=100&page={page}")
            if not res.ok:
                break
            rows = json.loads(res.body.decode("utf-8", "replace"))
            if not isinstance(rows, list) or not rows:
                break
            for row in rows:
                slug = str(row.get("slug") or "")
                if not slug:
                    continue
                title = _strip_tags(str((row.get("title") or {}).get("rendered") or slug))
                excerpt = _strip_tags(str((row.get("excerpt") or {}).get("rendered") or ""))
                link = str(row.get("link") or urljoin(BASE, f"termek/{slug}/"))
                brand_ids = row.get("product_brand") or []
                brand = "Kemikál"
                if isinstance(brand_ids, list) and brand_ids:
                    brand = brand_terms.get(int(brand_ids[0]), brand) or brand
                brand = _brand_from_slug_name(slug, title) if brand == "Kemikál" else brand
                # Normalize known WP terms
                if _fold(brand).startswith("bornit"):
                    brand = "Bornit"
                elif _fold(brand).startswith("tetol"):
                    brand = "Tetol"
                found.append(
                    DiscoveredProduct(
                        product_id=_slugify_id(slug),
                        product_name=title,
                        brand=brand,
                        manufacturer="kemikal",
                        product_page_url=link,
                        product_code=slug,
                        product_type_hint=_type_hint(title, slug, excerpt),
                        extra={
                            "slug": slug,
                            "excerpt": excerpt[:500],
                            "wp_id": row.get("id"),
                        },
                    )
                )
                if len(found) >= limit:
                    break
            if len(rows) < 100:
                break
            page += 1
        return found

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
        slug_id = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand") or _brand_from_slug_name(slug, str(name or ""))
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            if h1:
                name = h1
                page_facts["resolved_name"] = name
            brand = _brand_from_slug_name(slug, str(name or ""))
            docs = _extract_pdf_docs(html, slug_id)
            kinds = {d["kind"] for d in docs}
            if "tds" not in kinds:
                warnings.append("tds_absent_on_product_page")
            if "sds" not in kinds:
                warnings.append("missing_sds_url")

            excerpt = None
            if isinstance(product.get("extra"), dict):
                excerpt = product["extra"].get("excerpt")
            # manifest rows flatten extra onto product
            excerpt = excerpt or product.get("excerpt")
            lead = _extract_page_lead(html, excerpt if isinstance(excerpt, str) else None)
            if lead:
                page_facts["page_lead"] = lead
                page_facts["short_marketing"] = lead
                page_facts["application_area"] = lead[:1200]
                page_facts["official_page_tech"] = True

        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
