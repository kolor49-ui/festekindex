"""Mass-import pipeline CLI — LOCAL ONLY, per-product isolation, resumable."""

from __future__ import annotations

import argparse
import json
import sys
import time
import traceback
from pathlib import Path
from typing import Any

_SRC = Path(__file__).resolve().parents[1]
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from mass_import.catalogue import (  # noqa: E402
    assert_no_enrichment_writes,
    check_duplicate,
    load_existing_product_ids,
    load_existing_product_names,
)
from mass_import.claims import build_claims, claims_to_dict  # noqa: E402
from mass_import.classify import classify  # noqa: E402
from mass_import.draft import ExtractedFact, build_draft  # noqa: E402
from mass_import.enrichment import build_enrichment, enrichment_quality_issues  # noqa: E402
from mass_import.enrichment_jub import build_jub_enrichment  # noqa: E402
from mass_import.enrichment_poli import build_poli_enrichment  # noqa: E402
from mass_import.enrichment_ppg import build_ppg_enrichment  # noqa: E402
from mass_import.enrichment_remmers import build_remmers_enrichment  # noqa: E402
from mass_import.jub_tds import extract_jub_tds  # noqa: E402
from mass_import.extract import extract_pdf, write_extract  # noqa: E402
from mass_import.fetch import stage_sources  # noqa: E402
from mass_import.http_client import RateLimitedClient  # noqa: E402
from mass_import.poli_tds import extract_poli_tds  # noqa: E402
from mass_import.ppg_tds import extract_ppg_tds  # noqa: E402
from mass_import.remmers_tds import extract_remmers_tds  # noqa: E402
from mass_import.report import write_summary  # noqa: E402

STATE_NAME = "STATE.json"
RESULT_NAME = "RESULT.json"


def load_manifest(path: Path) -> list[dict[str, Any]]:
    products: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        try:
            obj = json.loads(line)
        except json.JSONDecodeError as e:
            raise SystemExit(f"manifest JSONL error line {line_no}: {e}") from e
        if "product_id" not in obj:
            raise SystemExit(f"manifest line {line_no}: missing product_id")
        products.append(obj)
    return products


def process_one(
    product: dict[str, Any],
    *,
    run_dir: Path,
    fixtures_root: Path,
    existing_ids: set[str],
    existing_names: dict[str, str],
    allow_fetch: bool,
    touch_log: list[Path],
    http: RateLimitedClient | None,
) -> dict[str, Any]:
    product_id = product["product_id"]
    product_dir = run_dir / "products" / product_id
    product_dir.mkdir(parents=True, exist_ok=True)
    touch_log.append(product_dir)

    state_path = product_dir / STATE_NAME
    result_path = product_dir / RESULT_NAME

    try:
        staged, stage_errors, fetch_meta = stage_sources(
            product,
            product_dir,
            fixtures_root,
            allow_fetch=allow_fetch,
            http=http,
        )
        for s in staged:
            touch_log.append(s.path)

        docs = []
        extract_dir = product_dir / "extracts"
        for src in staged:
            if src.kind not in ("tds", "sds"):
                continue
            # Encrypted / missing-crypto PDFs must not hard-ERROR the product:
            # page-only REVIEW is valid (TDS optional).
            try:
                doc = extract_pdf(src)
            except Exception as e:  # noqa: BLE001
                stage_errors.append(
                    f"pdf_extract_failed:{src.kind}:{type(e).__name__}:{e}"
                )
                continue
            src.page_count = doc.page_count
            # Reject SDS PDFs mislabeled/linked as TDS (common on Poli-Farbe libraries).
            if doc.kind == "tds":
                head = (doc.pages[0].text if doc.pages else doc.full_text)[:2500].lower()
                looks_sds = (
                    "biztonsági adatlap" in head
                    or "biztonsagi adatlap" in head
                    or "safety data sheet" in head
                )
                looks_tds = (
                    "műszaki adatlap" in head
                    or "muszaki adatlap" in head
                    or "jellemzés" in head
                    or "jellemzes" in head
                    or "technical data" in head
                )
                if looks_sds and not looks_tds:
                    stage_errors.append("tds_content_is_sds")
                    continue
            write_extract(doc, extract_dir)
            docs.append(doc)

        draft = build_draft(
            product_id=product_id,
            product_name=str(product.get("product_name") or product_id),
            brand=product.get("brand"),
            docs=docs,
            expected_product_code=(
                str(product.get("product_code"))
                if product.get("product_code")
                else None
            ),
        )
        mfr = str(product.get("manufacturer") or "").lower()
        is_ppg = mfr in {
            "ppg_trilak",
            "ppg-trilak",
            "trilak",
            "ppg trilak",
        }
        is_jub = mfr in {"jub", "jub_hu", "jub-hu"}
        is_poli = mfr in {"poli_farbe", "poli-farbe", "polifarbe", "poli farbe"}
        is_remmers = mfr in {"remmers", "remmers_hu", "remmers-hu", "remmers ungarn"}
        is_dufa = mfr in {
            "dufa",
            "düfa",
            "meffert",
            "meffert_hungaria",
            "meffert-hungaria",
        }
        is_akzo = mfr in {
            "akzo",
            "akzo_nobel",
            "akzonobel",
            "akzo-nobel",
            "dulux",
            "sadolin",
            "hammerite",
        }
        is_caparol = mfr in {"caparol", "daw", "daw_caparol"}
        is_baumit = mfr in {"baumit", "baumit_hu", "baumit-hu"}
        is_egrokorr = mfr in {"egrokorr", "egro", "egrokorr_zrt"}
        is_kemikal = mfr in {"kemikal", "kemikál", "kemikal_zrt", "kemikalrt"}
        is_revco = mfr in {"revco", "saint_gobain_revco", "saint-gobain-revco"}



        tds_doc = next((d for d in docs if d.kind == "tds"), None)
        if is_ppg and tds_doc is not None:
            ppg = extract_ppg_tds(tds_doc)
            for key, sec in ppg.sections.items():
                draft.facts.append(
                    ExtractedFact(
                        key=f"ppg_{key}",
                        value=sec.text[:400],
                        source_id=tds_doc.source_id,
                        page=sec.page,
                        quote=sec.quote[:200],
                        doc_kind="tds",
                    )
                )
            draft.gaps = [
                g for g in draft.gaps if not g.startswith("unextracted:")
            ]
        elif is_jub and tds_doc is not None:
            jub = extract_jub_tds(tds_doc)
            for key, sec in jub.sections.items():
                draft.facts.append(
                    ExtractedFact(
                        key=f"jub_{key}",
                        value=sec.text[:400],
                        source_id=tds_doc.source_id,
                        page=sec.page,
                        quote=sec.quote[:200],
                        doc_kind="tds",
                    )
                )
            draft.gaps = [
                g for g in draft.gaps if not g.startswith("unextracted:")
            ]
        elif is_poli and tds_doc is not None:
            poli = extract_poli_tds(tds_doc)
            for key, sec in poli.sections.items():
                draft.facts.append(
                    ExtractedFact(
                        key=f"poli_{key}",
                        value=sec.text[:400],
                        source_id=tds_doc.source_id,
                        page=sec.page,
                        quote=sec.quote[:200],
                        doc_kind="tds",
                    )
                )
            draft.gaps = [
                g for g in draft.gaps if not g.startswith("unextracted:")
            ]
        elif is_remmers and tds_doc is not None:
            remmers = extract_remmers_tds(tds_doc)
            for key, sec in remmers.sections.items():
                draft.facts.append(
                    ExtractedFact(
                        key=f"remmers_{key}",
                        value=sec.text[:400],
                        source_id=tds_doc.source_id,
                        page=sec.page,
                        quote=sec.quote[:200],
                        doc_kind="tds",
                    )
                )
            draft.gaps = [
                g for g in draft.gaps if not g.startswith("unextracted:")
            ]
        claims = build_claims(draft, docs)
        page_facts = (fetch_meta or {}).get("page_facts") or {}
        if is_ppg:
            enrichment = build_ppg_enrichment(draft, docs, page_facts=page_facts)
        elif is_jub:
            enrichment = build_jub_enrichment(draft, docs, page_facts=page_facts)
        elif is_poli:
            enrichment = build_poli_enrichment(draft, docs, page_facts=page_facts)
        elif is_remmers:
            enrichment = build_remmers_enrichment(draft, docs, page_facts=page_facts)
        else:
            enrichment = build_enrichment(draft, docs, page_facts=page_facts)
        enr_issues = enrichment_quality_issues(enrichment)
        enrichment_ok = not any(
            i.startswith("review:enrichment_missing:")
            or i.startswith("review:enrichment_banned:")
            or i.startswith("hold:")
            for i in enr_issues
        ) and bool(enrichment.editorial_summary)

        # Korlátozások is optional for PASS (often absent); required set handled in enrichment_quality_issues
        # Adjust: Korlátozások missing should not block PASS if other required OK
        enr_issues = [
            i
            for i in enr_issues
            if not i.endswith(":Korlátozások")
        ]
        enrichment_ok = not any(
            i.startswith("review:enrichment_missing:")
            or i.startswith("review:enrichment_banned:")
            or i.startswith("hold:")
            for i in enr_issues
        ) and bool(enrichment.editorial_summary)

        duplicate = check_duplicate(
            product_id,
            str(product.get("product_name") or draft.identity_from_tds or ""),
            existing_ids,
            existing_names,
        )
        # Also soft-duplicate by name against existing catalogue names if provided
        forced = product.get("forced_hold_reason")
        classification = classify(
            draft,
            claims,
            duplicate=duplicate,
            forced_hold_reason=str(forced) if forced else None,
            enrichment_issues=enr_issues,
            enrichment_ok=enrichment_ok,
        )

        # Düfa/Meffert + Akzo HU: marketing names vs SDS/TDS titles often diverge.
        # With official product_page present, demote pure identity HOLDs → REVIEW
        # (still never auto-publish; HOLD reserved for contamination / invention).
        if (
            is_dufa
            or is_akzo
            or is_caparol
            or is_baumit
            or is_egrokorr
            or is_kemikal
            or is_revco
        ) and classification.status == "HOLD":
            identity_hold_prefixes = (
                "hold:sds_title_name_mismatch",
                "hold:tds_title_name_mismatch",
                "hold:tds_sds_identity_mismatch",
                "hold:sds_identity_uncertain",
            )
            hard = [
                r
                for r in classification.reasons
                if r.startswith("hold:")
                and not any(r.startswith(p) for p in identity_hold_prefixes)
            ]
            if not hard and page_facts:
                classification.status = "REVIEW"
                classification.publishable = False
                classification.reasons = [
                    (
                        r.replace("hold:", "review:identity:", 1)
                        if any(r.startswith(p) for p in identity_hold_prefixes)
                        else r
                    )
                    for r in classification.reasons
                ]
                tag = next(
                    (
                        t
                        for flag, t in (
                            (is_dufa, "dufa"),
                            (is_akzo, "akzo"),
                            (is_caparol, "caparol"),
                            (is_baumit, "baumit"),
                            (is_egrokorr, "egrokorr"),
                            (is_kemikal, "kemikal"),
                            (is_revco, "revco"),
                        )
                        if flag
                    ),
                    "identity",
                )
                classification.reasons.append(f"info:{tag}_identity_soft_review")



        if stage_errors and classification.status != "HOLD":
            for err in stage_errors:
                if any(
                    err.startswith(p)
                    for p in (
                        "missing_local_pdf",
                        "fetch_failed",
                        "fetch_disabled",
                        "not_pdf",
                        "product_page_fetch_failed",
                    )
                ):
                    classification.reasons.append(f"review:{err}")
                    classification.status = "REVIEW"
                    classification.publishable = False

        (product_dir / "enrichment.json").write_text(
            json.dumps(enrichment.to_dict(), ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

        sources_meta = [
            {
                "source_id": s.source_id,
                "kind": s.kind,
                "sha256": s.sha256,
                "page_count": s.page_count,
                "filename": s.path.name,
                "url": s.url,
                "from_cache": s.from_cache,
            }
            for s in staged
        ]

        result = {
            "product_id": product_id,
            "product_name": product.get("product_name"),
            "brand": product.get("brand"),
            "product_type_hint": product.get("product_type_hint"),
            "status": classification.status,
            "publishable": False,
            "publish_gate": classification.publish_gate,
            "reasons": classification.reasons,
            "technical_ok": classification.technical_ok,
            "catalogue_duplicate": classification.catalogue_duplicate,
            "stage_errors": stage_errors,
            "fetch_meta": fetch_meta,
            "sources": sources_meta,
            "draft": draft.to_dict(),
            "claims": claims_to_dict(claims),
            "enrichment": enrichment.to_dict(),
            "classification": classification.to_dict(),
            "auto_published": False,
            "enrichment_path_written": None,
        }

        result_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        state_path.write_text(
            json.dumps(
                {
                    "product_id": product_id,
                    "status": classification.status,
                    "completed": True,
                    "error": None,
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        return result

    except Exception as e:  # noqa: BLE001
        err = {
            "product_id": product_id,
            "product_name": product.get("product_name"),
            "status": "ERROR",
            "publishable": False,
            "publish_gate": "NEVER_AUTO_PUBLISH",
            "reasons": [f"error:{type(e).__name__}:{e}"],
            "technical_ok": False,
            "catalogue_duplicate": product_id in existing_ids,
            "traceback": traceback.format_exc(),
            "auto_published": False,
            "enrichment_path_written": None,
        }
        result_path.write_text(
            json.dumps(err, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        state_path.write_text(
            json.dumps(
                {
                    "product_id": product_id,
                    "status": "ERROR",
                    "completed": True,
                    "error": str(e),
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
        return err


def already_completed(product_dir: Path) -> bool:
    state_path = product_dir / STATE_NAME
    if not state_path.exists():
        return False
    try:
        st = json.loads(state_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return False
    return bool(st.get("completed")) and (product_dir / RESULT_NAME).exists()


def run(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Festékindex mass-import (LOCAL ONLY)")
    parser.add_argument("--manifest", required=True, type=Path)
    parser.add_argument("--run-dir", required=True, type=Path)
    parser.add_argument(
        "--catalogue-root",
        type=Path,
        default=Path(__file__).resolve().parents[4],
    )
    parser.add_argument("--fixtures-root", type=Path, default=None)
    parser.add_argument("--allow-fetch", action="store_true", default=False)
    parser.add_argument("--no-fetch", action="store_true", default=False)
    parser.add_argument("--resume", action="store_true", default=False)
    parser.add_argument("--rate-limit", type=float, default=0.6)
    parser.add_argument("--limit", type=int, default=0, help="Process only first N products")
    args = parser.parse_args(argv)

    allow_fetch = bool(args.allow_fetch) and not bool(args.no_fetch)

    run_dir = args.run_dir
    run_dir.mkdir(parents=True, exist_ok=True)
    fixtures_root = args.fixtures_root or (
        Path(__file__).resolve().parents[2] / "fixtures"
    )
    catalogue_root = args.catalogue_root.resolve()
    cache_dir = run_dir / "http-cache"

    products = load_manifest(args.manifest)
    if args.limit and args.limit > 0:
        products = products[: args.limit]
    existing_ids = load_existing_product_ids(catalogue_root)
    existing_names = load_existing_product_names(catalogue_root)
    touch_log: list[Path] = [run_dir]
    http = RateLimitedClient(cache_dir=cache_dir, min_interval_s=args.rate_limit) if allow_fetch else None

    t0 = time.perf_counter()
    results: list[dict[str, Any]] = []

    for product in products:
        pid = product["product_id"]
        product_dir = run_dir / "products" / pid
        if args.resume and already_completed(product_dir):
            cached = json.loads((product_dir / RESULT_NAME).read_text(encoding="utf-8"))
            results.append(cached)
            continue
        results.append(
            process_one(
                product,
                run_dir=run_dir,
                fixtures_root=fixtures_root,
                existing_ids=existing_ids,
                existing_names=existing_names,
                allow_fetch=allow_fetch,
                touch_log=touch_log,
                http=http,
            )
        )

    elapsed = time.perf_counter() - t0
    violations = assert_no_enrichment_writes(catalogue_root, touch_log)
    meta = {
        "manifest": str(args.manifest),
        "catalogue_root": str(catalogue_root),
        "fixtures_root": str(fixtures_root),
        "product_count": len(products),
        "elapsed_seconds": round(elapsed, 3),
        "resume": bool(args.resume),
        "allow_fetch": allow_fetch,
        "enrichment_write_violations": violations,
        "existing_catalogue_ids": len(existing_ids),
        "existing_catalogue_names": len(existing_names),
    }
    write_summary(run_dir, results, meta)

    if violations:
        print("FATAL: enrichment write violations:", violations, file=sys.stderr)
        return 2

    print(f"Done: {len(results)} products in {elapsed:.2f}s → {run_dir / 'SUMMARY.md'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(run())
