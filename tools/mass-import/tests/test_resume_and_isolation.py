import json
from pathlib import Path

from mass_import.pipeline import already_completed, load_manifest, process_one, run


def test_manifest_loads_dry_run(tmp_path: Path):
    root = Path(__file__).resolve().parents[1]
    products = load_manifest(root / "manifests" / "dry-run-v1.jsonl")
    assert len(products) >= 5
    ids = [p["product_id"] for p in products]
    assert "prod_hold_wrong_sds_demo" in ids
    assert "prod_error_isolation_demo" in ids


def test_error_product_does_not_raise(tmp_path: Path):
    root = Path(__file__).resolve().parents[1]
    catalogue_root = root.parents[1]
    product = {
        "product_id": "prod_error_isolation_demo",
        "product_name": "Broken",
        "documents": [
            {
                "kind": "tds",
                "source_id": "src_broken_pdf",
                "local_path": "pdfs/broken/not-a-pdf.pdf",
            }
        ],
    }
    touch: list[Path] = []
    result = process_one(
        product,
        run_dir=tmp_path,
        fixtures_root=root / "fixtures",
        existing_ids=set(),
        existing_names={},
        allow_fetch=False,
        touch_log=touch,
        http=None,
    )
    assert result["status"] == "ERROR"
    assert result["publishable"] is False
    assert result["auto_published"] is False


def test_resume_skips_completed(tmp_path: Path):
    product_dir = tmp_path / "products" / "prod_x"
    product_dir.mkdir(parents=True)
    (product_dir / "STATE.json").write_text(
        json.dumps({"product_id": "prod_x", "status": "REVIEW", "completed": True}),
        encoding="utf-8",
    )
    (product_dir / "RESULT.json").write_text(
        json.dumps({"product_id": "prod_x", "status": "REVIEW"}),
        encoding="utf-8",
    )
    assert already_completed(product_dir) is True


def test_pipeline_dry_run_smoke(tmp_path: Path):
    root = Path(__file__).resolve().parents[1]
    run_dir = tmp_path / "run"
    rc = run(
        [
            "--manifest",
            str(root / "manifests" / "dry-run-v1.jsonl"),
            "--run-dir",
            str(run_dir),
            "--catalogue-root",
            str(root.parents[1]),
            "--fixtures-root",
            str(root / "fixtures"),
            "--no-fetch",
        ]
    )
    assert rc == 0
    summary = json.loads((run_dir / "SUMMARY.json").read_text(encoding="utf-8"))
    assert summary["auto_published"] is False
    assert summary["enrichment_writes"] == 0
    assert summary["meta"]["enrichment_write_violations"] == []
    by_id = {p["product_id"]: p for p in summary["products"]}
    assert by_id["prod_hold_wrong_sds_demo"]["status"] == "HOLD"
    assert by_id["prod_error_isolation_demo"]["status"] == "ERROR"
    # Known catalogue products must not PASS as new imports
    for pid in (
        "prod_7016_enamel",
        "prod_coror_aromatic",
        "prod_factor_aqua_glaze",
        "prod_valmor_eps_adhesive",
    ):
        assert by_id[pid]["status"] in ("REVIEW", "HOLD")
        assert by_id[pid]["publishable"] is False
        assert by_id[pid]["auto_published"] is False
