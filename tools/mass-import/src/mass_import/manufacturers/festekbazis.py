"""Festék Bázis adapter — wraps existing product_page helpers."""

from __future__ import annotations

from typing import Any

from ..http_client import RateLimitedClient
from ..product_page import parse_product_page
from .base import DiscoveredProduct, ResolvedDocuments


class FestekBazisAdapter:
    manufacturer_id = "festekbazis"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 100
    ) -> list[DiscoveredProduct]:
        # Discovery for Festék Bázis remains separate (invoice probe); not used for Trilak GO.
        return []

    def resolve_documents(
        self,
        product: dict[str, Any],
        http: RateLimitedClient,
        html: str | None = None,
    ) -> ResolvedDocuments:
        page_url = product.get("product_page_url") or product.get("official_url")
        warnings: list[str] = []
        docs: list[dict[str, Any]] = list(product.get("documents") or [])
        if not page_url:
            return ResolvedDocuments(documents=docs, warnings=warnings)
        if html is None:
            res = http.get(str(page_url))
            if not res.ok:
                warnings.append(f"product_page_fetch_failed:{res.error}")
                return ResolvedDocuments(documents=docs, warnings=warnings)
            html = res.body.decode("utf-8", "replace")
        info = parse_product_page(html, str(page_url))
        warnings.extend(info.parse_warnings)
        kinds = {str(d.get("kind")).lower() for d in docs}
        if "tds" not in kinds and info.tds_url:
            docs.append(
                {
                    "kind": "tds",
                    "source_id": f"src_{product['product_id']}_tds",
                    "url": info.tds_url,
                    "invoice_id": info.tds_invoice_id,
                }
            )
        if "sds" not in kinds and info.sds_url:
            docs.append(
                {
                    "kind": "sds",
                    "source_id": f"src_{product['product_id']}_sds",
                    "url": info.sds_url,
                    "invoice_id": info.sds_invoice_id,
                }
            )
        return ResolvedDocuments(
            documents=docs,
            product_name=info.product_name,
            brand=info.brand_hint,
            page_facts={"product_page": info.to_dict()},
            warnings=warnings,
        )
