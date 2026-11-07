"""Discover Festék Bázis TDS invoiceIds and build a 100-product new-import manifest."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

_SRC = Path(__file__).resolve().parents[1]
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from mass_import.catalogue import (  # noqa: E402
    load_existing_product_ids,
    load_existing_product_names,
    _norm_name,
)
from mass_import.http_client import RateLimitedClient  # noqa: E402
from mass_import.product_page import datasheet_url  # noqa: E402

from pypdf import PdfReader  # noqa: E402
import io  # noqa: E402
import hashlib  # noqa: E402


STUB_MARKERS = ["A felhasználásra vonatkozó előírásaink"]


def load_sitemap_products() -> dict[int, dict]:
    UA = {"User-Agent": "FestekindexMassImport/0.2"}
    req = urllib.request.Request("https://www.festekbazis.hu/sitemap.xml", headers=UA)
    xml = urllib.request.urlopen(req, timeout=60).read().decode("utf-8", "replace")
    out: dict[int, dict] = {}
    for u in re.findall(r"<loc>([^<]+)</loc>", xml):
        m = re.search(r"(?:webaruhaz-|termekeink/)(.+)-p-(\d+)/?$", u)
        if not m:
            continue
        inv = int(m.group(2))
        slug = m.group(1)
        out[inv] = {
            "invoice_id": inv,
            "slug": slug,
            "product_page_url": f"https://www.festekbazis.hu/hu/termekeink/{slug}-p-{inv}",
        }
    return out


def guess_title(p1: str) -> str | None:
    lines = [ln.strip() for ln in p1.splitlines() if ln.strip()]
    title = None
    for ln in lines:
        low = ln.lower()
        if "műszaki adatlap" in low:
            continue
        if any(m.lower() in low for m in STUB_MARKERS):
            continue
        if len(ln) >= 3:
            title = ln
            break
    if title and title in lines:
        idx = lines.index(title)
        if idx + 1 < len(lines):
            nxt = lines[idx + 1]
            if len(nxt) < 40 and not nxt.lower().startswith(
                ("termék", "szín", "kiszerelés", "alkalmazás", "fényesség", "kiadósság")
            ):
                title = f"{title} {nxt}"
    return title


def brand_of(title: str) -> str | None:
    up = title.upper()
    for b in ("VALMOR", "COROR", "FACTOR", "7016", "IMMUNETEC"):
        if b in up:
            return b
    return None


def product_type_hint(title: str) -> str:
    t = title.lower()
    rules = [
        ("falfesték", "falfesték"),
        ("homlokzat", "homlokzatfesték"),
        ("lábazat", "lábazatfesték"),
        ("zománc", "zománc"),
        ("lazúr", "lazúr"),
        ("lakk", "lakk"),
        ("alapozó", "alapozó"),
        ("hígító", "hígító"),
        ("padló", "padlóbevonat"),
        ("ragasztó", "ragasztó"),
        ("vakolat", "vakolat"),
        ("fólia", "szigetelés"),
        ("vízsziget", "szigetelés"),
    ]
    for needle, label in rules:
        if needle in t:
            return label
    return "egyéb"


def slugify(title: str, invoice_id: int) -> str:
    n = _norm_name(title)
    parts = [p for p in n.split() if p][:6]
    base = "_".join(parts) if parts else "product"
    return f"prod_mi_{invoice_id}_{base}"[:80]


def discover_range(
    http: RateLimitedClient,
    start: int,
    end: int,
) -> list[dict]:
    found: list[dict] = []
    for inv in range(start, end + 1):
        url = datasheet_url(inv, "datasheet")
        res = http.get(url)
        if not res.ok or not res.body.startswith(b"%PDF"):
            continue
        try:
            reader = PdfReader(io.BytesIO(res.body))
            pages = len(reader.pages)
            p1 = reader.pages[0].extract_text() or ""
        except Exception:
            continue
        stub = any(m in p1 for m in STUB_MARKERS) and pages <= 1 and len(res.body) < 48000
        if stub:
            continue
        title = guess_title(p1)
        if not title or title.upper() in {"WEBSHOP KÉSZTERMÉK", "VIZES"}:
            continue
        found.append(
            {
                "invoice_id": inv,
                "title": title,
                "pages": pages,
                "bytes": len(res.body),
                "sha256": hashlib.sha256(res.body).hexdigest(),
                "tds_url": url,
            }
        )
        print(f"REAL {inv} {pages}p {title}", flush=True)
    return found


def _is_junk_title(title: str) -> bool:
    t = title.strip().upper()
    if t in {"WEBSHOP KÉSZTERMÉK", "VIZES", "TAPADÓHÍD", "TAPADOHID"}:
        return True
    if len(t) < 6:
        return True
    return False


def build_manifest(
    reals: list[dict],
    sitemap: dict[int, dict],
    existing_ids: set[str],
    existing_names: dict[str, str],
    target: int = 100,
    *,
    enrichment_invoice_ids: set[int] | None = None,
) -> list[dict]:
    """Build up to `target` import rows from real TDS invoices.

    Prefer titles absent from the live 53-name index. If fewer than `target`
    brand-new names exist on Festék Bázis, fill with additional unique
    invoiceId TDS documents (still under new prod_mi_* ids). Catalogue
    overlap is flagged later by the classifier as REVIEW — never published.
    """
    enrichment_invoice_ids = enrichment_invoice_ids or set()
    picked: list[dict] = []
    seen_names: set[str] = set()
    seen_inv: set[int] = set()

    def sort_key(r: dict) -> tuple:
        inv = int(r["invoice_id"])
        key = _norm_name(r.get("title") or "")
        novel = 0 if key and key not in existing_names else 1
        # Prefer sitemap pages (SDS pairing), then novel names, then invoice
        return (0 if inv in sitemap else 1, novel, inv)

    def make_entry(r: dict) -> dict | None:
        title = r["title"]
        if _is_junk_title(title):
            return None
        inv = int(r["invoice_id"])
        if inv in seen_inv:
            return None
        if inv in enrichment_invoice_ids:
            # Skip invoices already locked into live enrichment sources
            return None
        pid = slugify(title, inv)
        if pid in existing_ids:
            return None
        sm = sitemap.get(inv)
        entry = {
            "product_id": pid,
            "product_name": title,
            "brand": brand_of(title),
            "product_type_hint": product_type_hint(title),
            "invoice_id": inv,
            "documents": [
                {
                    "kind": "tds",
                    "source_id": f"src_mi_{inv}_tds",
                    "invoice_id": inv,
                    "url": r["tds_url"],
                }
            ],
        }
        if sm:
            entry["product_page_url"] = sm["product_page_url"]
            entry["slug"] = sm["slug"]
        else:
            entry["documents"].append(
                {
                    "kind": "sds",
                    "source_id": f"src_mi_{inv}_sds",
                    "invoice_id": inv,
                    "url": datasheet_url(inv, "safetydatasheet"),
                }
            )
        return entry

    # Pass 1: novel names only (unique title)
    for r in sorted(reals, key=sort_key):
        key = _norm_name(r.get("title") or "")
        if not key or key in seen_names or key in existing_names:
            continue
        entry = make_entry(r)
        if not entry:
            continue
        picked.append(entry)
        seen_names.add(key)
        seen_inv.add(int(r["invoice_id"]))
        if len(picked) >= target:
            return picked

    # Pass 2: fill with other unique titles / invoices (may overlap catalogue names)
    for r in sorted(reals, key=sort_key):
        if len(picked) >= target:
            break
        key = _norm_name(r.get("title") or "")
        if not key or key in seen_names:
            continue
        entry = make_entry(r)
        if not entry:
            continue
        entry["catalogue_name_overlap_risk"] = key in existing_names
        picked.append(entry)
        seen_names.add(key)
        seen_inv.add(int(r["invoice_id"]))

    # Pass 3: if still short, allow same title with different invoice (doc revision)
    if len(picked) < target:
        for r in sorted(reals, key=lambda x: int(x["invoice_id"])):
            if len(picked) >= target:
                break
            entry = make_entry(r)
            if not entry:
                continue
            entry["note"] = "additional_invoice_revision"
            picked.append(entry)
            seen_inv.add(int(r["invoice_id"]))

    return picked


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--catalogue-root", type=Path, required=True)
    p.add_argument("--cache-dir", type=Path, required=True)
    p.add_argument("--out-manifest", type=Path, required=True)
    p.add_argument("--out-discovery", type=Path, required=True)
    p.add_argument("--start", type=int, default=280)
    p.add_argument("--end", type=int, default=520)
    p.add_argument("--target", type=int, default=100)
    p.add_argument("--rate-limit", type=float, default=0.35)
    p.add_argument("--reuse-discovery", type=Path, default=None)
    args = p.parse_args(argv)

    sitemap = load_sitemap_products()
    existing_ids = load_existing_product_ids(args.catalogue_root)
    existing_names = load_existing_product_names(args.catalogue_root)
    http = RateLimitedClient(cache_dir=args.cache_dir, min_interval_s=args.rate_limit)

    enrichment_invoices: set[int] = set()
    blob = ""
    enr = args.catalogue_root / "lib/data/imports/festekBazisEnrichmentV1"
    if enr.exists():
        for f in enr.rglob("*.ts"):
            blob += f.read_text(encoding="utf-8", errors="replace")
        enrichment_invoices = {int(x) for x in re.findall(r"invoiceId=(\d+)", blob)}

    reals: list[dict] = []
    if args.reuse_discovery and args.reuse_discovery.exists():
        payload = json.loads(args.reuse_discovery.read_text(encoding="utf-8"))
        reals = list(payload.get("reals") or payload)

    t0 = time.perf_counter()
    scanned = discover_range(http, args.start, args.end)
    by_inv = {int(r["invoice_id"]): r for r in reals}
    for r in scanned:
        by_inv[int(r["invoice_id"])] = r
    reals = list(by_inv.values())
    print(f"discovery_seconds={time.perf_counter()-t0:.1f} reals={len(reals)}")

    args.out_discovery.parent.mkdir(parents=True, exist_ok=True)
    args.out_discovery.write_text(
        json.dumps(
            {
                "reals": reals,
                "sitemap_count": len(sitemap),
                "enrichment_invoice_ids": sorted(enrichment_invoices),
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    manifest = build_manifest(
        reals,
        sitemap,
        existing_ids,
        existing_names,
        target=args.target,
        enrichment_invoice_ids=enrichment_invoices,
    )
    args.out_manifest.parent.mkdir(parents=True, exist_ok=True)
    with args.out_manifest.open("w", encoding="utf-8") as f:
        for row in manifest:
            f.write(json.dumps(row, ensure_ascii=False) + "\n")
    print(f"manifest_products={len(manifest)} → {args.out_manifest}")
    if len(manifest) < args.target:
        print(
            f"WARNING: only {len(manifest)} new products found (target {args.target})",
            file=sys.stderr,
        )
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
