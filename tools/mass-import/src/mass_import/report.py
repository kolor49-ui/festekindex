"""SUMMARY.json / SUMMARY.md writers."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def write_summary(run_dir: Path, results: list[dict[str, Any]], meta: dict[str, Any]) -> None:
    counts = {"PASS": 0, "REVIEW": 0, "HOLD": 0, "ERROR": 0}
    for r in results:
        st = r.get("status", "ERROR")
        counts[st] = counts.get(st, 0) + 1

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "run_dir": str(run_dir),
        "meta": meta,
        "counts": counts,
        "publish_policy": "NEVER_AUTO_PUBLISH",
        "auto_published": False,
        "enrichment_writes": 0,
        "products": results,
    }
    (run_dir / "SUMMARY.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    lines = [
        "# Mass-import SUMMARY",
        "",
        f"- Generated: `{payload['generated_at']}`",
        f"- Run dir: `{run_dir}`",
        f"- Counts: PASS={counts.get('PASS',0)} REVIEW={counts.get('REVIEW',0)} "
        f"HOLD={counts.get('HOLD',0)} ERROR={counts.get('ERROR',0)}",
        "- Publish policy: **NEVER_AUTO_PUBLISH** (PASS ≠ publish licence)",
        f"- Auto-published: `{payload['auto_published']}`",
        f"- Enrichment writes: `{payload['enrichment_writes']}`",
        "",
        "| product_id | status | publishable | reasons |",
        "|---|---|---|---|",
    ]
    for r in results:
        reasons = "; ".join(r.get("reasons") or [])[:120]
        lines.append(
            f"| `{r.get('product_id')}` | {r.get('status')} | {r.get('publishable')} | {reasons} |"
        )
    lines.append("")
    (run_dir / "SUMMARY.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
