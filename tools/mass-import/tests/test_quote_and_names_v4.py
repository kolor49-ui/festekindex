"""v4: hazard quote proof + TDS title / name variants (no PASS relaxation)."""

from mass_import.draft import _guess_title_from_tds, _names_compatible, build_draft
from mass_import.extract import ExtractedDoc, PageText, find_quote_page


def test_hazard_code_word_boundary_is_verified():
    doc = ExtractedDoc(
        source_id="sds",
        kind="sds",
        sha256="a" * 64,
        page_count=1,
        pages=[PageText(page=1, text="Figyelmeztető mondatok: H226 Gyúlékony folyadék és gőz.")],
        full_text="Figyelmeztető mondatok: H226 Gyúlékony folyadék és gőz.",
    )
    assert find_quote_page(doc, "H226") == 1
    assert find_quote_page(doc, "H999") is None


def test_short_non_hazard_still_rejected():
    doc = ExtractedDoc(
        source_id="tds",
        kind="tds",
        sha256="a" * 64,
        page_count=1,
        pages=[PageText(page=1, text="Kiszerelés: 0,75 l")],
        full_text="Kiszerelés: 0,75 l",
    )
    assert find_quote_page(doc, "0,75") is None  # too short, not H-code


def test_names_polyurethan_alias():
    assert _names_compatible(
        "Lazurán Aqua Polyurethan EXTRA",
        "LAZURAN AQUA PU EXTRA",
    )


def test_disclaimer_title_not_compatible():
    assert not _names_compatible(
        "Héra Gold Beltéri falfesték",
        "A jelen dokumentumban szereplő információk tájékoztató jellegűek",
    )


def test_tds_title_skips_disclaimer():
    text = """--- PAGE 1 ---
Érvényes: 2021.02.26-tól
A jelen dokumentumban szereplő információk tájékoztató jellegűek, alkalmazási esetekre kiterjedően.
Héra Gold Beltéri falfesték
Tulajdonságok:
Matt beltéri falfesték.
"""
    doc = ExtractedDoc(
        source_id="tds",
        kind="tds",
        sha256="a" * 64,
        page_count=1,
        pages=[PageText(page=1, text=text)],
        full_text=text,
    )
    title = _guess_title_from_tds(doc)
    assert title and "Gold" in title
    assert "tájékoztató" not in title.lower()


def test_hazard_fact_gets_contextual_quote():
    sds = ExtractedDoc(
        source_id="sds1",
        kind="sds",
        sha256="b" * 64,
        page_count=1,
        pages=[
            PageText(
                page=1,
                text="1.1 Terméknév\nTRINÁT\n...\nH226 Gyúlékony folyadék és gőz. P210 Hőtől távol tartandó.",
            )
        ],
        full_text="1.1 Terméknév\nTRINÁT\n...\nH226 Gyúlékony folyadék és gőz. P210 Hőtől távol tartandó.",
    )
    draft = build_draft("p1", "Trinát teszt", "Trinát", [sds], expected_product_code=None)
    haz = next(f for f in draft.facts if f.key == "sds_hazard_code_sample")
    assert haz.value == "H226"
    assert len(haz.quote) >= 12
    assert "H226" in haz.quote
