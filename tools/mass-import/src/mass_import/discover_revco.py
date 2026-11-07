"""Discover REVCO products from revco.hu → JSONL."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_SRC = Path(__file__).resolve().parents[1]
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from mass_import.http_client import RateLimitedClient  # noqa: E402
from mass_import.manufacturers.revco import RevcoAdapter  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--out-manifest", type=Path, required=True)
    p.add_argument("--cache-dir", type=Path, required=True)
    p.add_argument("--limit", type=int, default=200)
    p.add_argument("--rate-limit", type=float, default=0.35)
    args = p.parse_args(argv)

    http = RateLimitedClient(cache_dir=args.cache_dir, min_interval_s=args.rate_limit)
    adapter = RevcoAdapter()
    products = adapter.discover_products(http, limit=args.limit)
    args.out_manifest.parent.mkdir(parents=True, exist_ok=True)
    with args.out_manifest.open("w", encoding="utf-8") as f:
        for prod in products:
            f.write(json.dumps(prod.to_manifest_row(), ensure_ascii=False) + "\n")
    brands: dict[str, int] = {}
    types: dict[str, int] = {}
    for prod in products:
        brands[prod.brand or "?"] = brands.get(prod.brand or "?", 0) + 1
        types[prod.product_type_hint or "?"] = types.get(prod.product_type_hint or "?", 0) + 1
    print(f"discovered={len(products)} → {args.out_manifest}")
    print("brands=", brands)
    print("types=", types)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
