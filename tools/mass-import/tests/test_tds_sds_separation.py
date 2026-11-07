from mass_import.claims import build_claims
from mass_import.draft import ExtractedFact, ProductDraft, build_draft
from mass_import.extract import ExtractedDoc, PageText


def _doc(kind: str, source_id: str, text: str) -> ExtractedDoc:
    return ExtractedDoc(
        source_id=source_id,
        kind=kind,
        sha256="0" * 64,
        page_count=1,
        pages=[PageText(page=1, text=text)],
        full_text=f"--- PAGE 1 ---\n{text}",
    )


def test_tds_facts_do_not_cite_sds_source():
    tds = _doc(
        "tds",
        "src_tds",
        "Műszaki adatlap\nDemo Festék\nSzínválaszték: fehér\nKiszerelés: 1 l\n"
        "Kiadósság: 10 m2/liter\nAlkalmazás: Beltéri falakra alkalmas festék termék leírás szöveg. "
        "További részletek a gyártói lapon.\nMinőségi jellemzők:\n",
    )
    sds = _doc(
        "sds",
        "src_sds",
        "BIZTONSÁGI ADATLAP\nDemo Festék\nKeverék megnevezése: Demo Festék\nUFI: ABCD-1111-2222-3333\nH226",
    )
    draft = build_draft("prod_demo", "Demo Festék", None, [tds, sds])
    claims = build_claims(draft, [tds, sds])
    for c in claims:
        if c.field.startswith("sds_"):
            assert c.doc_kind == "sds"
            assert c.source_id == "src_sds"
        elif c.field in ("color_range", "pack_sizes", "coverage", "application_excerpt"):
            assert c.doc_kind == "tds"
            assert c.source_id == "src_tds"
            assert c.status != "cross_doc_contamination"


def test_forced_cross_contamination_flagged():
    draft = ProductDraft(
        product_id="prod_bad",
        product_name="X",
        brand=None,
        identity_from_tds="X",
        identity_from_sds="Y",
        facts=[
            ExtractedFact(
                key="coverage",
                value="10",
                source_id="src_sds",
                page=1,
                quote="Kiadósság: 10",
                doc_kind="tds",
            )
        ],
        warnings=["tds_sds_identity_mismatch"],
    )
    sds = _doc("sds", "src_sds", "Kiadósság: 10 m2 — should not back TDS claim")
    claims = build_claims(draft, [sds])
    assert claims[0].status == "cross_doc_contamination"


def test_no_invented_values_flag():
    tds = _doc("tds", "src_tds", "Műszaki adatlap\nOnly Title\n")
    draft = build_draft("prod_sparse", "Only Title", None, [tds])
    assert draft.to_dict()["invented_values"] is False
    assert "unextracted:coverage" in draft.gaps
