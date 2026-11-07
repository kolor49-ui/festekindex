from mass_import.catalogue import CatalogueHit
from mass_import.claims import Claim
from mass_import.classify import classify
from mass_import.draft import ProductDraft


def _draft(**kwargs):
    base = dict(
        product_id="prod_x",
        product_name="X",
        brand=None,
        identity_from_tds="X",
        identity_from_sds=None,
        facts=[],
        gaps=[],
        warnings=[],
    )
    base.update(kwargs)
    return ProductDraft(**base)


def test_pass_is_never_publishable():
    c = classify(_draft(), [], duplicate=None, enrichment_ok=True)
    assert c.status == "PASS"
    assert c.publishable is False
    assert c.publish_gate == "NEVER_AUTO_PUBLISH"


def test_pass_requires_enrichment():
    c = classify(_draft(), [], duplicate=None, enrichment_ok=False)
    assert c.status == "REVIEW"
    assert c.publishable is False


def test_duplicate_is_review_not_pass():
    dup = CatalogueHit("prod_x", "id", "exists")
    c = classify(_draft(), [], duplicate=dup)
    assert c.status == "REVIEW"
    assert c.publishable is False
    assert any("catalogue_duplicate" in r for r in c.reasons)


def test_wrong_sds_identity_is_hold():
    d = _draft(warnings=["sds_title_name_mismatch"], identity_from_sds="OTHER")
    c = classify(d, [], duplicate=None)
    assert c.status == "HOLD"
    assert c.publishable is False


def test_cross_doc_contamination_is_hold():
    claim = Claim(
        claim_id="c1",
        field="coverage",
        text="8-11",
        source_id="sds",
        doc_kind="tds",
        sha256="abc",
        page=1,
        quote="Kiadósság",
        status="cross_doc_contamination",
    )
    c = classify(_draft(), [claim], duplicate=None)
    assert c.status == "HOLD"


def test_review_and_hold_never_publishable():
    for status_setup in (
        classify(_draft(gaps=["missing_tds"]), [], duplicate=None),
        classify(_draft(warnings=["tds_sds_identity_mismatch"]), [], duplicate=None),
    ):
        assert status_setup.publishable is False
