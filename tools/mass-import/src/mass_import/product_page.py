"""Parse Festék Bázis product pages for identity and TDS/SDS invoice links."""

from __future__ import annotations

import re
from dataclasses import asdict, dataclass
from typing import Any
from urllib.parse import parse_qs, urljoin, urlparse


DATASHEET_BASE = (
    "https://www.festekbazis.hu/tools/packages/etalon_gyartas/print"
)


@dataclass
class ProductPageInfo:
    url: str
    product_name: str | None
    brand_hint: str | None
    tds_invoice_id: str | None
    sds_invoice_id: str | None
    tds_url: str | None
    sds_url: str | None
    parse_warnings: list[str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def datasheet_url(invoice_id: str | int, kind: str) -> str:
    # kind: datasheet | safetydatasheet
    return f"{DATASHEET_BASE}?invoiceId={invoice_id}&type={kind}"


def _extract_invoice(href: str, expect_type: str) -> str | None:
    if "etalon_gyartas/print" not in href and "invoiceId=" not in href:
        return None
    full = href if href.startswith("http") else urljoin("https://www.festekbazis.hu", href)
    q = parse_qs(urlparse(full).query)
    types = q.get("type") or []
    invoices = q.get("invoiceId") or []
    if not invoices:
        return None
    if types and types[0] != expect_type:
        return None
    # If type missing, accept by caller context
    if not types and expect_type:
        return None
    return invoices[0]


def parse_product_page(html: str, page_url: str) -> ProductPageInfo:
    warnings: list[str] = []
    # Title
    product_name = None
    m = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
    if m:
        title = re.sub(r"\s+", " ", m.group(1)).strip()
        title = re.sub(r"\s*\|\s*Festék Bázis.*$", "", title, flags=re.I).strip()
        if title:
            product_name = title

    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if h1:
        h1_text = re.sub(r"<[^>]+>", "", h1.group(1))
        h1_text = re.sub(r"\s+", " ", h1_text).strip()
        if h1_text and len(h1_text) >= 3:
            product_name = h1_text

    hrefs = re.findall(r'href=["\']([^"\']+)["\']', html, re.I)
    tds_id = None
    sds_id = None
    tds_url = None
    sds_url = None
    for href in hrefs:
        low = href.lower()
        if "invoiceid=" not in low and "etalon_gyartas/print" not in low:
            continue
        full = href if href.startswith("http") else urljoin("https://www.festekbazis.hu", href)
        q = parse_qs(urlparse(full).query)
        inv = (q.get("invoiceId") or [None])[0]
        typ = (q.get("type") or [None])[0]
        if not inv:
            continue
        if typ == "datasheet" or (typ is None and "datasheet" in low and "safety" not in low):
            tds_id = inv
            tds_url = datasheet_url(inv, "datasheet")
        if typ == "safetydatasheet" or "safetydatasheet" in low:
            sds_id = inv
            sds_url = datasheet_url(inv, "safetydatasheet")

    if tds_id is None:
        warnings.append("product_page_missing_tds_link")
    if sds_id is None:
        warnings.append("product_page_missing_sds_link")

    brand_hint = None
    if product_name:
        up = product_name.upper()
        for b in ("VALMOR", "COROR", "FACTOR", "7016", "IMMUNETEC"):
            if b in up:
                brand_hint = b
                break

    # Fallback invoice from URL ...-p-345
    if tds_id is None:
        m_p = re.search(r"-p-(\d+)/?$", page_url)
        if m_p:
            tds_id = m_p.group(1)
            tds_url = datasheet_url(tds_id, "datasheet")
            warnings.append("tds_invoice_from_url_fallback")

    return ProductPageInfo(
        url=page_url,
        product_name=product_name,
        brand_hint=brand_hint,
        tds_invoice_id=tds_id,
        sds_invoice_id=sds_id,
        tds_url=tds_url,
        sds_url=sds_url,
        parse_warnings=warnings,
    )
