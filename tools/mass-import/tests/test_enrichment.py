from mass_import.draft import build_draft
from mass_import.enrichment import build_enrichment, enrichment_quality_issues
from mass_import.extract import ExtractedDoc, PageText


def test_enrichment_does_not_invent_missing_sections():
    doc = ExtractedDoc(
        source_id="src_tds",
        kind="tds",
        sha256="a" * 64,
        page_count=1,
        pages=[
            PageText(
                page=1,
                text=(
                    "Műszaki adatlap\nDemo Festék\n"
                    "Termék: Felhasználásra kész beltéri festék.\n"
                    "Színválaszték: fehér\nKiszerelés: 1 l\nKiadósság: 8 m2/liter\n"
                    "Alkalmazás: Beltéri falakra alkalmas termék leírás részletekkel.\n"
                    "Minőségi jellemzők:\nx\n"
                ),
            )
        ],
        full_text="",
    )
    doc.full_text = f"--- PAGE 1 ---\n{doc.pages[0].text}"
    draft = build_draft("prod_demo", "Demo Festék", None, [doc])
    enr = build_enrichment(draft, [doc])
    assert enr.invented_values is False
    headings = {s.heading for s in enr.sections}
    assert "Termékleírás" in headings
    assert "Alkalmazás" in headings
    # Előkészítés / Felhasználás absent → gaps, not fabricated paragraphs
    assert "enrichment:missing_section:Előkészítés" in enr.gaps
    assert "Előkészítés" not in headings
    issues = enrichment_quality_issues(enr)
    assert any("Előkészítés" in i for i in issues)
