from pathlib import Path

from mass_import.catalogue import assert_no_enrichment_writes


def test_assert_detects_enrichment_touch(tmp_path: Path):
    root = Path(__file__).resolve().parents[1].parents[1]
    enrichment = root / "lib/data/imports/festekBazisEnrichmentV1/descriptionEnrichment.ts"
    violations = assert_no_enrichment_writes(root, [enrichment])
    assert violations


def test_run_dir_only_is_clean(tmp_path: Path):
    root = Path(__file__).resolve().parents[1].parents[1]
    violations = assert_no_enrichment_writes(root, [tmp_path / "RESULT.json"])
    assert violations == []
