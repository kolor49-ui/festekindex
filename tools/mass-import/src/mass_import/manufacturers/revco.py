"""REVCO / Saint-Gobain Hungary (revco.hu) official-source adapter."""

from __future__ import annotations

import re
from html import unescape
from typing import Any
from urllib.parse import urljoin, urlsplit

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://revco.hu/"

# Category / family hubs that list leaf product pages.
CATEGORY_SEEDS = (
    "homlokzati-szinezo-vakolatok",
    "labazati-vakolatok-labazatfestek-dekorvakolatok",
    "falfestekek",
    "falfestekek/belteri-falfestekek",
    "falfestekek/kulteri-falfestekek",
    "alapozok-feluletkezelo-anyagok-adalekok",
    "alapozok-feluletkezelo-anyagok-adalekok/alapozok",
    "alapozok-feluletkezelo-anyagok-adalekok/impregnalok",
    "hezagolo-es-simitoanyag",
    "portermekek",
    "deco-csillamos-adalekok",
    "hoszigetelo-rendszerek-ragasztok",
)

# Known leaf products also linked from navigation (fallback if hubs omit them).
LEAF_SEEDS = (
    "homlokzati-szinezo-vakolatok/neo-akril-vakolat",
    "homlokzati-szinezo-vakolatok/vario-akril-vakolat",
    "homlokzati-szinezo-vakolatok/silicon-vakolat",
    "homlokzati-szinezo-vakolatok/aura-premium-vakolat",
    "homlokzati-szinezo-vakolatok/silicate-vakolat",
    "labazati-vakolatok-labazatfestek-dekorvakolatok/remix-granit-labazati-vakolat",
    "labazati-vakolatok-labazatfestek-dekorvakolatok/remix-cover-labazat--es-betonfestek",
    "falfestekek/belteri-falfestekek/alfa-belteri-diszperzios-falfestek",
    "falfestekek/belteri-falfestekek/origo-belteri-diszperzios-falfestek",
    "falfestekek/kulteri-falfestekek/exterior-homlokzatfestek",
    "falfestekek/kulteri-falfestekek/silicate-homlokzatfestek",
    "falfestekek/kulteri-falfestekek/silicon-homlokzatfestek",
    "hezagolo-es-simitoanyag/optimix-glett",
    "hoszigetelo-rendszerek-ragasztok/fix-premium-ragaszto",
    "hoszigetelo-rendszerek-ragasztok/fix-vario-ragaszto",
)


def _fold(s: str) -> str:
    t = (s or "").lower()
    for a, b in (
        ("á", "a"),
        ("é", "e"),
        ("í", "i"),
        ("ó", "o"),
        ("ö", "o"),
        ("ő", "o"),
        ("ú", "u"),
        ("ü", "u"),
        ("ű", "u"),
    ):
        t = t.replace(a, b)
    return t


def _strip_tags(chunk: str) -> str:
    text = unescape(chunk or "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _slugify_id(slug: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")
    return f"prod_revco_{clean}"[:90]


def _type_hint(name: str, path: str) -> str:
    t = _fold(f"{name} {path}")
    rules = [
        ("belteri", "falfesték"),
        ("falfest", "falfesték"),
        ("homlokzatfest", "homlokzatfesték"),
        ("exterior", "homlokzatfesték"),
        ("vakolat", "vakolat"),
        ("alapozo", "alapozó"),
        ("impregnal", "alapozó"),
        ("glett", "glett"),
        ("ragaszto", "egyéb"),
        ("habarcs", "egyéb"),
    ]
    for needle, label in rules:
        if needle in t:
            return label
    return "egyéb"


def _extract_h1(html: str) -> str | None:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if not m:
        return None
    return _strip_tags(m.group(1)) or None


def _extract_pdf_docs(html: str, slug: str) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    for href, label in re.findall(
        r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.I | re.S
    ):
        lab = _strip_tags(label)
        lab_l = lab.lower()
        url = urljoin(BASE, href)
        if "adatkezelesi" in href.lower() or "adatvédelmi" in lab_l:
            continue
        kind = None
        if "biztonsági" in lab_l or "biztonsagi" in lab_l:
            kind = "sds"
        elif (
            "műszaki" in lab_l
            or "muszaki" in lab_l
            or "tájékoztató" in lab_l
            or "tajekoztato" in _fold(lab)
        ):
            # "Műszaki tájékoztató" is the REVCO TDS equivalent.
            if "teljesítmény" in lab_l or "teljesitmeny" in _fold(lab):
                continue
            kind = "tds"
        if not kind:
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_revco_{slug}_{kind}",
                "url": url,
                "filename": f"src_revco_{slug}_{kind}.pdf",
                "label": lab[:120],
            }
        )
    seen: set[str] = set()
    out: list[dict[str, Any]] = []
    for d in docs:
        if d["kind"] in seen:
            continue
        seen.add(d["kind"])
        out.append(d)
    return out


def _extract_page_lead(html: str) -> str | None:
    m = re.search(r'property="og:description"\s+content="([^"]+)"', html, re.I)
    if m:
        text = _strip_tags(m.group(1))
        if len(text) >= 40:
            return text[:900]
    for m in re.finditer(r"<p[^>]*>(.*?)</p>", html, re.I | re.S):
        text = _strip_tags(m.group(1))
        if len(text) < 60:
            continue
        low = text.lower()
        if "cookie" in low or "adatvédelmi" in low or "adatkezelési" in low:
            continue
        return text[:900]
    return None


def _is_leaf_candidate(path: str) -> bool:
    parts = [p for p in path.strip("/").split("/") if p]
    if len(parts) < 2:
        return False
    # Skip pure hubs / tools
    last = parts[-1]
    if last in {
        "termekeink",
        "termekek",
        "termekdokumentaciok",
        "termekmatrix",
        "vakolatvalaszto",
        "homlokzatfestek-valaszto",
        "falfestekek",
        "homlokzati-szinezo-vakolatok",
        "portermekek",
    }:
        return False
    return True


class RevcoAdapter:
    manufacturer_id = "revco"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}

        def add_path(path: str) -> None:
            path = path.strip("/")
            if not path or not _is_leaf_candidate(path):
                return
            slug = path.rstrip("/").split("/")[-1]
            if slug in found:
                return
            name_guess = slug.replace("--", " ").replace("-", " ").strip()
            found[slug] = DiscoveredProduct(
                product_id=_slugify_id(slug),
                product_name=name_guess,
                brand="REVCO",
                manufacturer="revco",
                product_page_url=urljoin(BASE, path + "/"),
                product_code=slug,
                product_type_hint=_type_hint(name_guess, path),
                extra={"slug": slug, "path": "/" + path},
            )

        for seed in LEAF_SEEDS:
            add_path(seed)
            if len(found) >= limit:
                return list(found.values())

        for cat in CATEGORY_SEEDS:
            url = urljoin(BASE, cat)
            res = http.get(url)
            if not res.ok:
                continue
            html = res.body.decode("utf-8", "replace")
            # Child links under this category
            for href in re.findall(r'href="(/[^"#?]+)"', html):
                if href.startswith("/frontend") or href.startswith("/module"):
                    continue
                # Prefer paths that continue the category prefix or look like products
                if cat.split("/")[0] in href or href.count("/") >= 2:
                    if _is_leaf_candidate(href):
                        add_path(href)
                        if len(found) >= limit:
                            return list(found.values())

        return list(found.values())

    def resolve_documents(
        self,
        product: dict[str, Any],
        http: RateLimitedClient,
        html: str | None = None,
    ) -> ResolvedDocuments:
        warnings: list[str] = []
        page_url = str(product.get("product_page_url") or "")
        slug = str(product.get("product_code") or product.get("slug") or "")
        if not slug and page_url:
            slug = urlsplit(page_url).path.rstrip("/").split("/")[-1]
        slug_id = re.sub(r"[^a-z0-9]+", "_", _fold(slug)).strip("_")

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand") or "REVCO"
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            # Prefer more specific name from slug if H1 is a family title
            if h1 and len(h1) < 80 and "HOMLOKZATI" not in h1.upper():
                name = h1
                page_facts["resolved_name"] = name
            elif not name or name.islower():
                name = slug.replace("-", " ").replace("--", " ").title()
            docs = _extract_pdf_docs(html, slug_id)
            kinds = {d["kind"] for d in docs}
            if "tds" not in kinds:
                warnings.append("tds_absent_on_product_page")
            if "sds" not in kinds:
                warnings.append("missing_sds_url")

            lead = _extract_page_lead(html)
            if lead:
                page_facts["page_lead"] = lead
                page_facts["short_marketing"] = lead
            if isinstance(lead, str) and re.search(
                r"(?i)(?:alkalmazható|festésére|kül-?\s*és\s*beltér|beltéri|kültéri|vakolat)",
                lead,
            ):
                page_facts["application_area"] = lead[:1200]
                page_facts["official_page_tech"] = True

        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
