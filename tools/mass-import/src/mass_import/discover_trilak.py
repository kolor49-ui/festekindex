"""Discover PPG Trilak Héra/Trinát/Lazurán products and write a JSONL manifest."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

_SRC = Path(__file__).resolve().parents[1]
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from mass_import.http_client import RateLimitedClient  # noqa: E402
from mass_import.manufacturers.ppg_trilak import PpgTrilakAdapter  # noqa: E402


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--out-manifest", type=Path, required=True)
    p.add_argument("--cache-dir", type=Path, required=True)
    p.add_argument("--limit", type=int, default=100)
    p.add_argument("--rate-limit", type=float, default=0.4)
    args = p.parse_args(argv)

    http = RateLimitedClient(cache_dir=args.cache_dir, min_interval_s=args.rate_limit)
    adapter = PpgTrilakAdapter()
    products = adapter.discover_products(http, limit=args.limit)
    args.out_manifest.parent.mkdir(parents=True, exist_ok=True)
    with args.out_manifest.open("w", encoding="utf-8") as f:
        for prod in products:
            f.write(json.dumps(prod.to_manifest_row(), ensure_ascii=False) + "\n")
    print(f"discovered={len(products)} → {args.out_manifest}")
    if len(products) < args.limit:
        print(
            f"NOTE: only {len(products)} Héra/Trinát/Lazurán products in official sitemap "
            f"(target {args.limit}).",
            file=sys.stderr,
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
