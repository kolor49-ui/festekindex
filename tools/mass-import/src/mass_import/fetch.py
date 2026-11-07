"""Resolve, fetch, and stage source PDFs (no live enrichment writes)."""

from __future__ import annotations

import hashlib
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from .http_client import RateLimitedClient
from .manufacturers import get_adapter
from .product_page import datasheet_url, parse_product_page


@dataclass
class SourceFile:
    source_id: str
    kind: str  # tds | sds | product_page
    path: Path
    sha256: str
    page_count: int | None = None
    url: str | None = None
    from_cache: bool = False


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def resolve_local_pdf(entry: dict[str, Any], fixtures_root: Path) -> Path | None:
    rel = entry.get("local_path")
    if not rel:
        return None
    path = Path(rel)
    if not path.is_absolute():
        cand = fixtures_root / rel
        if cand.exists():
            return cand
        if path.exists():
            return path
        return None
    return path if path.exists() else None


def _ensure_pdf_bytes(body: bytes, source_id: str) -> None:
    if not body.startswith(b"%PDF"):
        raise ValueError(f"not_pdf:{source_id}")


def stage_sources(
    product: dict[str, Any],
    product_dir: Path,
    fixtures_root: Path,
    *,
    allow_fetch: bool = False,
    http: RateLimitedClient | None = None,
) -> tuple[list[SourceFile], list[str], dict[str, Any]]:
    """Stage TDS/SDS into product_dir/sources. Optionally fetch + parse product page."""
    errors: list[str] = []
    staged: list[SourceFile] = []
    meta: dict[str, Any] = {"product_page": None, "page_facts": None}
    sources_dir = product_dir / "sources"
    sources_dir.mkdir(parents=True, exist_ok=True)

    documents = list(product.get("documents") or [])
    page_url = product.get("product_page_url") or product.get("official_url")
    manufacturer = str(product.get("manufacturer") or "festekbazis")

    def _resolve_from_html(html: str, *, page_path: Path, from_cache: bool) -> None:
        staged.append(
            SourceFile(
                source_id=f"src_{product['product_id']}_page",
                kind="product_page",
                path=page_path,
                sha256=sha256_file(page_path),
                url=str(page_url) if page_url else None,
                from_cache=from_cache,
            )
        )

        class _NoHttp:
            def get(self, *_a, **_k):  # noqa: ANN001
                raise RuntimeError("http_disabled")

        http_for_resolve: Any = http if http is not None else _NoHttp()
        try:
            adapter = get_adapter(manufacturer)
            resolved = adapter.resolve_documents(product, http_for_resolve, html=html)
            meta["page_facts"] = resolved.page_facts
            meta["adapter_warnings"] = resolved.warnings
            if resolved.product_name:
                product["product_name"] = resolved.product_name
            if resolved.brand:
                product["brand"] = resolved.brand
            kinds_present = {str(d.get("kind")).lower() for d in documents}
            for d in resolved.documents:
                k = str(d.get("kind")).lower()
                if k not in kinds_present:
                    documents.append(d)
                    kinds_present.add(k)
            errors.extend(f"adapter:{w}" for w in resolved.warnings)
            return
        except KeyError:
            pass

        # Festék Bázis / unknown manufacturer fallback.
        info = parse_product_page(html, str(page_url or ""))
        meta["product_page"] = info.to_dict()
        if not product.get("product_name") and info.product_name:
            product["product_name"] = info.product_name
        kinds_present = {str(d.get("kind")).lower() for d in documents}
        if "tds" not in kinds_present and info.tds_url:
            documents.append(
                {
                    "kind": "tds",
                    "source_id": f"src_{product['product_id']}_tds",
                    "url": info.tds_url,
                    "invoice_id": info.tds_invoice_id,
                }
            )
        if "sds" not in kinds_present and info.sds_url:
            documents.append(
                {
                    "kind": "sds",
                    "source_id": f"src_{product['product_id']}_sds",
                    "url": info.sds_url,
                    "invoice_id": info.sds_invoice_id,
                }
            )
        errors.extend(f"page:{w}" for w in info.parse_warnings)

    page_path = sources_dir / "product_page.html"
    if page_url and allow_fetch and http is not None:
        page_res = http.get(str(page_url))
        if page_res.ok:
            page_path.write_bytes(page_res.body)
            _resolve_from_html(
                page_res.body.decode("utf-8", errors="replace"),
                page_path=page_path,
                from_cache=page_res.from_cache,
            )
        else:
            errors.append(f"product_page_fetch_failed:{page_res.error}")
    elif page_path.exists():
        # Resume/offline: parse already-staged official HTML for page_facts.
        _resolve_from_html(
            page_path.read_text(encoding="utf-8", errors="replace"),
            page_path=page_path,
            from_cache=True,
        )

    for doc in documents:
        kind = str(doc.get("kind", "")).lower()
        if kind not in ("tds", "sds"):
            if kind and kind != "product_page":
                errors.append(f"unknown_doc_kind:{kind}")
            continue
        if not doc.get("url") and doc.get("invoice_id"):
            typ = "datasheet" if kind == "tds" else "safetydatasheet"
            doc["url"] = datasheet_url(doc["invoice_id"], typ)

    for doc in documents:
        kind = str(doc.get("kind", "")).lower()
        if kind not in ("tds", "sds"):
            continue
        source_id = str(doc.get("source_id") or f"src_{product['product_id']}_{kind}")
        dest_name = doc.get("filename") or f"{source_id}.pdf"
        dest = sources_dir / dest_name

        local = resolve_local_pdf(doc, fixtures_root)
        if local is not None:
            if not dest.exists() or sha256_file(dest) != sha256_file(local):
                shutil.copy2(local, dest)
            staged.append(
                SourceFile(
                    source_id=source_id,
                    kind=kind,
                    path=dest,
                    sha256=sha256_file(dest),
                    url=doc.get("url"),
                    from_cache=True,
                )
            )
            continue

        # Already staged from a previous allow-fetch run.
        if dest.exists() and dest.stat().st_size > 0:
            staged.append(
                SourceFile(
                    source_id=source_id,
                    kind=kind,
                    path=dest,
                    sha256=sha256_file(dest),
                    url=doc.get("url"),
                    from_cache=True,
                )
            )
            continue

        url = doc.get("url")
        if not url:
            errors.append(f"missing_local_pdf:{source_id}")
            continue
        if not allow_fetch or http is None:
            errors.append(f"fetch_disabled:{source_id}")
            continue

        if dest.exists() and dest.stat().st_size > 100 and dest.read_bytes()[:4] == b"%PDF":
            staged.append(
                SourceFile(
                    source_id=source_id,
                    kind=kind,
                    path=dest,
                    sha256=sha256_file(dest),
                    url=url,
                    from_cache=True,
                )
            )
            continue

        res = http.get(str(url))
        if not res.ok:
            errors.append(f"fetch_failed:{source_id}:{res.error}")
            continue
        try:
            _ensure_pdf_bytes(res.body, source_id)
        except ValueError as e:
            errors.append(str(e))
            continue
        dest.write_bytes(res.body)
        staged.append(
            SourceFile(
                source_id=source_id,
                kind=kind,
                path=dest,
                sha256=hashlib.sha256(res.body).hexdigest(),
                url=url,
                from_cache=res.from_cache,
            )
        )

    return staged, errors, meta
