"""PPG Trilak (Héra / Trinát / Lazurán) official-source adapter."""

from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import urlparse

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

SITEMAP = "https://trilak.ppg.com/sitemap.xml"
TARGET_BRANDS = ("hera", "trinat", "lazuran")


def _brand_from_slug(slug: str) -> str | None:
    s = slug.lower()
    if s.startswith("hera"):
        return "Héra"
    if s.startswith("trinat"):
        return "Trinát"
    if s.startswith("lazuran"):
        return "Lazurán"
    return None


def _type_hint(name: str, slug: str) -> str:
    t = f"{name} {slug}".lower()
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
    rules = [
        ("falfestek", "falfesték"),
        ("homlokzat", "homlokzatfesték"),
        ("labazat", "lábazatfesték"),
        ("vakolat", "vakolat"),
        ("zomanc", "zománc"),
        ("lazur", "lazúr"),
        ("alapozo", "alapozó"),
        ("faanyagvedo", "faanyagvédő"),
        ("tapasz", "tapasz"),
        ("radiator", "zománc"),
    ]
    for needle, label in rules:
        if needle in t:
            return label
    return "egyéb"


def _slugify_id(code: str, slug: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", slug.lower()).strip("_")
    return f"prod_trilak_{code.lower()}_{clean}"[:90]


def _extract_ng_product(html: str, code: str) -> dict[str, Any] | None:
    m = re.search(r'<script[^>]*id="ng-state"[^>]*>(.*?)</script>', html, re.S | re.I)
    if not m:
        return None
    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError:
        return None

    found: list[dict[str, Any]] = []

    def walk(o: Any) -> None:
        if isinstance(o, dict):
            if o.get("productNumber") == code:
                found.append(o)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)

    walk(data)
    return found[0] if found else None


def _hu_text(items: list[dict[str, Any]] | None) -> str | None:
    if not items:
        return None
    for it in items:
        if it.get("language") == "hu-HU" and it.get("translation"):
            return str(it["translation"]).strip()
    for it in items:
        if it.get("translation"):
            return str(it["translation"]).strip()
    return None


class PpgTrilakAdapter:
    manufacturer_id = "ppg_trilak"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 100
    ) -> list[DiscoveredProduct]:
        res = http.get(SITEMAP)
        if not res.ok:
            return []
        xml = res.body.decode("utf-8", "replace")
        locs = re.findall(r"<loc>([^<]+)</loc>", xml)
        out: list[DiscoveredProduct] = []
        seen: set[str] = set()
        for loc in locs:
            if "/hu-HU/product/" not in loc:
                continue
            path = loc.split("/hu-HU/product/", 1)[-1]
            parts = path.strip("/").split("/")
            if len(parts) < 2:
                continue
            slug, code = parts[0], parts[1]
            brand = _brand_from_slug(slug)
            if brand is None:
                continue
            if code in seen:
                continue
            seen.add(code)
            termek = f"https://trilak.ppg.com/hu-HU/termek/{slug}/{code}"
            name = slug.replace("-", " ").strip().title()
            out.append(
                DiscoveredProduct(
                    product_id=_slugify_id(code, slug),
                    product_name=name,
                    brand=brand,
                    manufacturer="ppg_trilak",
                    product_page_url=termek,
                    product_code=code,
                    product_type_hint=_type_hint(name, slug),
                    extra={"sitemap_url": loc, "slug": slug},
                )
            )
            if len(out) >= limit:
                break
        return out

    def resolve_documents(
        self,
        product: dict[str, Any],
        http: RateLimitedClient,
        html: str | None = None,
    ) -> ResolvedDocuments:
        warnings: list[str] = []
        page_url = str(product.get("product_page_url") or "")
        code = str(product.get("product_code") or page_url.rstrip("/").split("/")[-1])
        docs: list[dict[str, Any]] = []
        page_facts: dict[str, Any] = {"product_code": code}

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand")
        if html:
            node = _extract_ng_product(html, code)
            if not node:
                warnings.append("ng_state_product_missing")
            else:
                md = node.get("marketingData") or {}
                name = _hu_text(md.get("functionalName")) or name
                short = _hu_text(md.get("shortMarketingText"))
                long = _hu_text(md.get("longMarketingText"))
                page_facts["short_marketing"] = short
                page_facts["long_marketing"] = long
                page_facts["attributes"] = node.get("attributes") or []
                page_facts["technicalData"] = node.get("technicalData") or {}
                page_facts["icons"] = node.get("icons") or []
                page_facts["ehsData"] = {
                    k: v
                    for k, v in (node.get("ehsData") or {}).items()
                    if k != "urlSafetyDataSheet"
                }

                # TDS from DAM asset type Data Sheet — triage missing vs broken vs absent
                tds_url = None
                tds_status = "absent_on_product_page"
                data_sheet_assets = [
                    a
                    for a in (node.get("assets") or [])
                    if str(a.get("type") or "").lower() == "data sheet"
                ]
                if data_sheet_assets:
                    asset = data_sheet_assets[0]
                    raw_url = str(asset.get("url") or "")
                    asset_id = str(asset.get("id") or "")
                    if (
                        not raw_url
                        or "not found" in raw_url.lower()
                        or asset_id.lower() in {"", "not found"}
                    ):
                        tds_status = "listed_but_not_downloadable"
                        warnings.append("tds_listed_but_not_downloadable")
                    else:
                        tds_url = raw_url
                        tds_status = "ok"
                else:
                    # Certificate/Other are not treated as TDS without PDF proof
                    warnings.append("tds_absent_on_product_page")
                page_facts["tds_resolution"] = {
                    "status": tds_status,
                    "data_sheet_asset_count": len(data_sheet_assets),
                }
                if tds_url:
                    docs.append(
                        {
                            "kind": "tds",
                            "source_id": f"src_trilak_{code}_tds",
                            "url": tds_url,
                            "filename": f"src_trilak_{code}_tds.pdf",
                        }
                    )

                sds_url = (node.get("ehsData") or {}).get("urlSafetyDataSheet")
                if sds_url:
                    docs.append(
                        {
                            "kind": "sds",
                            "source_id": f"src_trilak_{code}_sds",
                            "url": sds_url,
                            "filename": f"src_trilak_{code}_sds.pdf",
                        }
                    )
                else:
                    warnings.append("missing_sds_url")

        # Prefer official functional name
        if name:
            brand = brand or _brand_from_slug(str(product.get("slug") or ""))
            page_facts["resolved_name"] = name

        # Avoid inventing: strip absolute empty docs
        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
