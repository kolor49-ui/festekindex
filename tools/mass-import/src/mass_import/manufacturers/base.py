"""Manufacturer-agnostic adapter interface."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Protocol

from ..http_client import RateLimitedClient


@dataclass
class DiscoveredProduct:
    product_id: str
    product_name: str
    brand: str | None
    manufacturer: str
    product_page_url: str
    product_code: str | None = None
    product_type_hint: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)

    def to_manifest_row(self) -> dict[str, Any]:
        row = {
            "product_id": self.product_id,
            "product_name": self.product_name,
            "brand": self.brand,
            "manufacturer": self.manufacturer,
            "product_page_url": self.product_page_url,
            "product_type_hint": self.product_type_hint,
            "product_code": self.product_code,
            "documents": [],  # filled by adapter.resolve_documents
        }
        row.update(self.extra)
        return row


@dataclass
class ResolvedDocuments:
    """URLs / metadata for TDS, SDS, and optional product-page HTML source."""

    documents: list[dict[str, Any]]
    product_name: str | None = None
    brand: str | None = None
    page_facts: dict[str, Any] = field(default_factory=dict)
    warnings: list[str] = field(default_factory=list)


class ManufacturerAdapter(Protocol):
    manufacturer_id: str

    def discover_products(self, http: RateLimitedClient, *, limit: int = 100) -> list[DiscoveredProduct]:
        ...

    def resolve_documents(
        self,
        product: dict[str, Any],
        http: RateLimitedClient,
        html: str | None = None,
    ) -> ResolvedDocuments:
        ...


def get_adapter(manufacturer: str) -> Any:
    mid = (manufacturer or "").strip().lower()
    if mid in ("ppg_trilak", "ppg-trilak", "trilak", "ppg trilak"):
        from .ppg_trilak import PpgTrilakAdapter

        return PpgTrilakAdapter()
    if mid in ("poli_farbe", "poli-farbe", "polifarbe", "poli farbe"):
        from .poli_farbe import PoliFarbeAdapter

        return PoliFarbeAdapter()
    if mid in ("remmers", "remmers_hu", "remmers-hu", "remmers ungarn"):
        from .remmers import RemmersAdapter

        return RemmersAdapter()
    if mid in ("dufa", "düfa", "meffert", "meffert_hungaria", "meffert-hungaria"):
        from .dufa import DufaAdapter

        return DufaAdapter()
    if mid in (
        "akzo",
        "akzo_nobel",
        "akzonobel",
        "akzo-nobel",
        "dulux",
        "sadolin",
        "hammerite",
    ):
        from .akzo import AkzoAdapter

        return AkzoAdapter()
    if mid in ("caparol", "daw", "daw_caparol"):
        from .caparol import CaparolAdapter

        return CaparolAdapter()
    if mid in ("baumit", "baumit_hu", "baumit-hu"):
        from .baumit import BaumitAdapter

        return BaumitAdapter()
    if mid in ("egrokorr", "egro", "egrokorr_zrt"):
        from .egrokorr import EgrokorrAdapter

        return EgrokorrAdapter()
    if mid in ("kemikal", "kemikál", "kemikal_zrt", "kemikalrt"):
        from .kemikal import KemikalAdapter

        return KemikalAdapter()
    if mid in ("revco", "saint_gobain_revco", "saint-gobain-revco"):
        from .revco import RevcoAdapter

        return RevcoAdapter()
    if mid in ("jub", "jub_hu", "jub-hu"):
        from .jub import JubAdapter

        return JubAdapter()




    if mid in ("festekbazis", "festékbázis", "festek_bazis", ""):
        from .festekbazis import FestekBazisAdapter

        return FestekBazisAdapter()
    raise KeyError(f"unknown_manufacturer:{manufacturer}")
