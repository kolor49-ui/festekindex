from mass_import.extract import ExtractedDoc, PageText
from mass_import.ppg_tds import extract_ppg_tds


SAMPLE = """--- PAGE 1 ---
Érvényes: 2021.02.26-tól
Héra Matt Fehér Beltéri Falfesték
Matt, extra fehér falfesték vakolt felületekre

Tulajdonságok:
A jó fedőképességű Héra Beltéri falfesték beltéri falakra készült.

Alkalmazási terület:
Vakolt, beton, gipszkarton belső falfelületek festésére.

FELÜLET ELŐKÉSZÍTÉS:
A festendő felület legyen száraz, hordképes. CMC-alapú glettanyagok használata nem javasolt.

Anyagelőkészítés, hígítás:
Az első réteghez maximum 10% vizet lehet adagolni.

Anyagszükséglet:
Javasolt rétegszám: 2-3 réteg
Egy rétegben: 0,12-0,14 l/m2

Száradási idő, átvonhatóság:
Átfesthetőség kb. 2 óra 20 °C-on.

Műszaki tulajdonságok*:
fedőképesség MSZ-EN 13300 2. osztály

Tárolás, raktározás:
A terméket +5 és +25 oC között kell tárolni.
Gipszfelületekre nem használható.
"""


def test_ppg_section_markers():
    doc = ExtractedDoc(
        source_id="src_tds",
        kind="tds",
        sha256="a" * 64,
        page_count=1,
        pages=[PageText(page=1, text=SAMPLE)],
        full_text=SAMPLE,
    )
    ex = extract_ppg_tds(doc)
    assert ex.title and "Héra" in ex.title
    assert "properties" in ex.sections
    assert "application" in ex.sections
    assert "surface_prep" in ex.sections
    assert "coverage" in ex.sections
    assert "drying" in ex.sections
    assert any("nem javasolt" in x.lower() or "nem használható" in x.lower() for x in ex.limitations)
