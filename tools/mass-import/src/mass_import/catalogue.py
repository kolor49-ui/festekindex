"""Read-only catalogue identity index (no enrichment writes)."""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class CatalogueHit:
    product_id: str
    match_kind: str  # id | name_hint
    note: str


def load_existing_product_ids(catalogue_root: Path) -> set[str]:
    ids: set[str] = set()
    enrichment_dir = catalogue_root / "lib/data/imports/festekBazisEnrichmentV1"
    for name in (
        "descriptionEnrichment.ts",
        "catalogueClosureDescriptionsV1.ts",
        "professionalDescriptionEnrichment.ts",
        "catalogueClosureProfessionalDescriptionsV1.ts",
    ):
        path = enrichment_dir / name
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        ids.update(re.findall(r'productId:\s*"(prod_[^"]+)"', text))
        ids.update(re.findall(r'"productId":\s*"(prod_[^"]+)"', text))

    master = catalogue_root / "lib/data/imports/festek_bazis_v02_master.json"
    if master.exists():
        try:
            data = json.loads(master.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            data = None
        if isinstance(data, dict) and isinstance(data.get("products"), list):
            for p in data["products"]:
                if isinstance(p, dict) and isinstance(p.get("id"), str):
                    ids.add(p["id"])
        elif isinstance(data, list):
            for p in data:
                if isinstance(p, dict) and str(p.get("id", "")).startswith("prod_"):
                    ids.add(p["id"])
    return ids


def load_existing_product_names(catalogue_root: Path) -> dict[str, str]:
    """Map normalised name → product_id for soft duplicate detection."""
    out: dict[str, str] = {}
    master = catalogue_root / "lib/data/imports/festek_bazis_v02_master.json"
    if not master.exists():
        return out
    try:
        data = json.loads(master.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return out
    products = data.get("products") if isinstance(data, dict) else None
    if not isinstance(products, list):
        return out
    for p in products:
        if not isinstance(p, dict):
            continue
        pid = p.get("id")
        name = p.get("name")
        if isinstance(pid, str) and isinstance(name, str):
            key = _norm_name(name)
            if key:
                out[key] = pid
    return out


def _norm_name(s: str) -> str:
    s = s.lower()
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
        s = s.replace(a, b)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return " ".join(s.split())


def check_duplicate(
    product_id: str,
    product_name: str,
    existing_ids: set[str],
    existing_names: dict[str, str] | None = None,
) -> CatalogueHit | None:
    if product_id in existing_ids:
        return CatalogueHit(
            product_id=product_id,
            match_kind="id",
            note="product_id already present in live catalogue index",
        )
    if existing_names and product_name:
        key = _norm_name(product_name)
        if key in existing_names:
            return CatalogueHit(
                product_id=existing_names[key],
                match_kind="name",
                note=f"name matches existing catalogue product {existing_names[key]}",
            )
        # soft containment: if normalised names share high overlap
        for ename, epid in existing_names.items():
            if key and ename and (key in ename or ename in key) and min(len(key), len(ename)) >= 12:
                return CatalogueHit(
                    product_id=epid,
                    match_kind="name_fuzzy",
                    note=f"fuzzy name match to {epid}",
                )
    return None


def assert_no_enrichment_writes(catalogue_root: Path, touch_log: list[Path]) -> list[str]:
    """Return violations if any write targeted live enrichment paths."""
    enrichment = (catalogue_root / "lib/data/imports/festekBazisEnrichmentV1").resolve()
    violations: list[str] = []
    for p in touch_log:
        try:
            resolved = p.resolve()
        except OSError:
            continue
        if enrichment in resolved.parents or resolved == enrichment:
            violations.append(str(resolved))
    return violations
