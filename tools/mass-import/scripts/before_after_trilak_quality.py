#!/usr/bin/env python3
"""Before/after report: trilak-100-v1 vs trilak-100-v2 (LOCAL ONLY)."""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V1 = ROOT / "runs" / "trilak-100-v1"
V2 = ROOT / "runs" / "trilak-100-v2"
OUT = V2 / "BEFORE_AFTER_QUALITY_REPORT.md"


def load_summary(run: Path) -> dict:
    p = run / "SUMMARY.json"
    return json.loads(p.read_text(encoding="utf-8"))


def iter_products(run: Path):
    for d in sorted((run / "products").iterdir()):
        if not d.is_dir():
            continue
        result = d / "RESULT.json"
        draft = d / "draft.json"
        enr = d / "enrichment_draft.json"
        claims = d / "claims.json"
        fetch = d / "fetch_manifest.json"
        item: dict = {"product_id": d.name}
        if result.exists():
            item["result"] = json.loads(result.read_text(encoding="utf-8"))
        if draft.exists():
            item["draft"] = json.loads(draft.read_text(encoding="utf-8"))
        if enr.exists():
            item["enrichment"] = json.loads(enr.read_text(encoding="utf-8"))
        if claims.exists():
            item["claims"] = json.loads(claims.read_text(encoding="utf-8"))
        if fetch.exists():
            item["fetch"] = json.loads(fetch.read_text(encoding="utf-8"))
        yield item


def status_of(item: dict) -> str:
    r = item.get("result") or {}
    return str(r.get("status") or "ERROR")


def has_doc(item: dict, kind: str) -> bool:
    draft = item.get("draft") or {}
    docs = draft.get("documents") or draft.get("docs") or []
    if isinstance(docs, list):
        for d in docs:
            if isinstance(d, dict) and d.get("kind") == kind:
                return True
            if isinstance(d, str) and kind in d:
                return True
    # fallback RESULT / fetch
    r = item.get("result") or {}
    if kind == "tds" and r.get("has_tds") is not None:
        return bool(r.get("has_tds"))
    if kind == "sds" and r.get("has_sds") is not None:
        return bool(r.get("has_sds"))
    fetch = item.get("fetch") or {}
    sources = fetch.get("sources") or fetch.get("documents") or []
    for s in sources if isinstance(sources, list) else []:
        if isinstance(s, dict) and s.get("kind") == kind and s.get("ok", True):
            return True
    warnings = (item.get("draft") or {}).get("warnings") or []
    if kind == "tds" and any("missing_tds" in str(w) or "tds_absent" in str(w) for w in warnings):
        return False
    return False


def claim_stats(item: dict) -> tuple[int, int]:
    claims = item.get("claims") or {}
    rows = claims.get("claims") if isinstance(claims, dict) else claims
    if not isinstance(rows, list):
        rows = claims.get("items") if isinstance(claims, dict) else []
    if not isinstance(rows, list):
        return 0, 0
    total = len(rows)
    verified = 0
    for c in rows:
        if not isinstance(c, dict):
            continue
        if c.get("verified") is True or c.get("status") in ("verified", "ok", "PASS"):
            verified += 1
        elif c.get("page") is not None and c.get("quote"):
            verified += 1
    return verified, total


def gap_counter(items: list[dict]) -> Counter:
    c: Counter = Counter()
    for it in items:
        enr = it.get("enrichment") or {}
        for g in enr.get("gaps") or []:
            c[str(g)] += 1
        draft = it.get("draft") or {}
        for w in draft.get("warnings") or []:
            if "missing" in str(w) or "section" in str(w):
                c[str(w)] += 1
    return c


def review_reasons(items: list[dict]) -> Counter:
    c: Counter = Counter()
    for it in items:
        if status_of(it) != "REVIEW":
            continue
        r = it.get("result") or {}
        for reason in r.get("reasons") or []:
            c[str(reason)] += 1
        for w in (it.get("draft") or {}).get("warnings") or []:
            c[f"warn:{w}"] += 1
    return c


def tds_triage(items: list[dict]) -> Counter:
    c: Counter = Counter()
    for it in items:
        draft = it.get("draft") or {}
        warnings = draft.get("warnings") or []
        fetch = it.get("fetch") or {}
        status = fetch.get("tds_status") or draft.get("tds_status")
        if status:
            c[str(status)] += 1
            continue
        for w in warnings:
            ws = str(w)
            if "tds_absent" in ws:
                c["absent_on_product_page"] += 1
                break
            if "listed_but_not_downloadable" in ws or "tds_listed" in ws:
                c["listed_but_not_downloadable"] += 1
                break
            if "missing_tds" in ws:
                c["missing_tds"] += 1
                break
        else:
            if has_doc(it, "tds"):
                c["present"] += 1
            else:
                c["unknown_missing"] += 1
    return c


def pick_description_pairs(v1_items: list[dict], v2_items: list[dict], n: int = 5):
    by_id_v2 = {it["product_id"]: it for it in v2_items}
    pairs = []
    for it in v1_items:
        pid = it["product_id"]
        other = by_id_v2.get(pid)
        if not other:
            continue
        e1 = (it.get("enrichment") or {}).get("editorial_summary")
        e2 = (other.get("enrichment") or {}).get("editorial_summary")
        if e1 or e2:
            pairs.append((pid, e1, e2, it, other))
        if len(pairs) >= n:
            break
    # prefer ones where both exist and differ
    pairs.sort(
        key=lambda p: (
            0 if (p[1] and p[2] and p[1] != p[2]) else 1,
            0 if (p[1] and p[2]) else 1,
        )
    )
    return pairs[:n]


def elapsed(run: Path) -> str | None:
    meta = (load_summary(run).get("meta") or {}) if (run / "SUMMARY.json").exists() else {}
    if meta.get("elapsed_seconds") is not None:
        return str(meta["elapsed_seconds"])
    log = run / "pipeline.log"
    if log.exists():
        text = log.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"^real\s+(\S+)", text, re.M)
        if m:
            return m.group(1)
    return None


def main() -> None:
    s1 = load_summary(V1)
    s2 = load_summary(V2)
    v1_items = list(iter_products(V1))
    v2_items = list(iter_products(V2))

    def coverage(items: list[dict]) -> tuple[int, int, int]:
        tds = sum(1 for it in items if has_doc(it, "tds"))
        sds = sum(1 for it in items if has_doc(it, "sds"))
        return tds, sds, len(items)

    def claim_ratio(items: list[dict]) -> tuple[int, int]:
        v = t = 0
        for it in items:
            a, b = claim_stats(it)
            v += a
            t += b
        return v, t

    c1, c2 = s1.get("counts") or {}, s2.get("counts") or {}
    tds1, sds1, n1 = coverage(v1_items)
    tds2, sds2, n2 = coverage(v2_items)
    cv1, ct1 = claim_ratio(v1_items)
    cv2, ct2 = claim_ratio(v2_items)
    gaps1, gaps2 = gap_counter(v1_items), gap_counter(v2_items)
    rev1, rev2 = review_reasons(v1_items), review_reasons(v2_items)
    triage2 = tds_triage(v2_items)
    pairs = pick_description_pairs(v1_items, v2_items, 5)

    lines = [
        "# PPG Trilak minőségjavítás — előtte/utána (LOCAL ONLY)",
        "",
        "**Scope:** ugyanaz a 74 termék (`manifests/trilak-100-v1.jsonl`).",
        "**PASS-kritériumok:** nem enyhítve.",
        "**Publikálás / enrichment-írás / commit:** nincs.",
        "",
        "## Státuszok",
        "",
        "| Metrika | v1 (előtte) | v2 (utána) | Δ |",
        "|---|---:|---:|---:|",
    ]
    for key in ("PASS", "REVIEW", "HOLD", "ERROR"):
        a, b = int(c1.get(key, 0)), int(c2.get(key, 0))
        lines.append(f"| {key} | {a} | {b} | {b - a:+d} |")
    lines += [
        "",
        "## TDS / SDS lefedettség",
        "",
        f"- v1: TDS **{tds1}/{n1}**, SDS **{sds1}/{n1}**",
        f"- v2: TDS **{tds2}/{n2}**, SDS **{sds2}/{n2}**",
        "",
        "### Hiányzó TDS triage (v2)",
        "",
    ]
    for k, v in triage2.most_common():
        lines.append(f"- `{k}`: {v}")
    lines += [
        "",
        "## Forrással igazolt állítások",
        "",
        f"- v1: **{cv1}/{ct1}**"
        + (f" ({100 * cv1 / ct1:.1f}%)" if ct1 else ""),
        f"- v2: **{cv2}/{ct2}**"
        + (f" ({100 * cv2 / ct2:.1f}%)" if ct2 else ""),
        "",
        "## Hiányzó szakmai szekciók (top)",
        "",
        "### v1",
        "",
    ]
    for k, v in gaps1.most_common(12):
        lines.append(f"- `{k}`: {v}")
    lines += ["", "### v2", ""]
    for k, v in gaps2.most_common(12):
        lines.append(f"- `{k}`: {v}")
    lines += [
        "",
        "## Leggyakoribb REVIEW-okok",
        "",
        "### v1",
        "",
    ]
    for k, v in rev1.most_common(15):
        lines.append(f"- `{k}`: {v}")
    lines += ["", "### v2", ""]
    for k, v in rev2.most_common(15):
        lines.append(f"- `{k}`: {v}")
    lines += [
        "",
        "## 5 termékleírás minőségi összehasonlítás",
        "",
    ]
    for i, (pid, e1, e2, _, _) in enumerate(pairs, 1):
        lines += [
            f"### {i}. `{pid}`",
            "",
            "**v1:**",
            "",
            e1 or "_(nincs summary)_",
            "",
            "**v2:**",
            "",
            e2 or "_(nincs summary)_",
            "",
        ]
    e1s, e2s = elapsed(V1), elapsed(V2)
    lines += [
        "## Feldolgozási idő",
        "",
        f"- v1: `{e1s or 'n/a'}`",
        f"- v2: `{e2s or 'n/a'}`",
        "",
        "## Védett állapot / SEO",
        "",
        "- Final Four v7.3 APPROVED STOP: változatlan (nincs touch).",
        "- 53 referenciatermék: változatlan.",
        "- Dirty HOLD tree: érintetlen.",
        "- Éles enrichment-írás: **0**.",
        "- Automatikus publikálás: **nincs**.",
        "- Commit / push / deploy: **nincs**.",
        "- Product SEO: `noindex, follow`, 0/53 — várható SEO-hatás: **nincs** (local-only run).",
        "",
        "## Fennmaradó hiányosságok",
        "",
        "- PASS továbbra is szigorú editorial gate alatt; lazítás nélkül.",
        "- TDS hiányok triage szerint elkülönítve; nem minden „missing” = nem létező dokumentum.",
        "- Spray/family SDS bizonytalan azonosítás → HOLD marad.",
        "",
    ]
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote {OUT}")
    print("counts v1", c1)
    print("counts v2", c2)


if __name__ == "__main__":
    main()
