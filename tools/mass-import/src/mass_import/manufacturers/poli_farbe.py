"""Poli-Farbe (polifarbe.hu) official-source adapter."""

from __future__ import annotations

import re
from html import unescape
from typing import Any
from urllib.parse import urljoin

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

BASE = "https://www.polifarbe.hu/"
# NOTE: letoltheto-dokumentumok/adatlapok-2024-frissitesek is an SDS (biztonsági)
# library despite the generic "adatlap" name — never use it as TDS.
CATEGORIES = (
    "dekor-termekek",
    "falfestek-belterre",
    "falfestekek-kulterre",
    "favedelem",
    "higitok",
    "hoszigetelo-rendszer",
    "inntaler",
    "kiegeszitok",
    "oldoszeres-zomancok",
    "platinum",
    "ragasztok-glettek",
    "uj-cellkolor-termekcsalad",
    "vizes-bazisu-zomancok",
)

# Non-coating / utility pages that are not standalone coating products.
EXCLUDE_SLUGS = {
    "ioncserelt-viz",
    "poli-farbe-kezfertotlenito-gel-utantolto",
    "poli-farbe-feluletfertotlenito-szorofejes-es-utantolto",
}


def _slugify_id(slug: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", slug.lower()).strip("_")
    return f"prod_poli_farbe_{clean}"[:90]


def _brand_from_slug_name(slug: str, name: str) -> str:
    t = f"{slug} {name}".lower()
    if "inntaler" in t:
        return "Inntaler"
    if "platinum" in t:
        return "Platinum"
    if "boroka" in t or "boróka" in t:
        return "Boróka"
    if "cellkolor" in t:
        return "Cellkolor"
    if "prakticolor" in t:
        return "Prakticolor"
    return "Poli-Farbe"


def _type_hint(name: str, slug: str) -> str:
    t = f"{name} {slug}".lower()
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
    rules = [
        ("falfestek", "falfesték"),
        ("homlokzat", "homlokzatfesték"),
        ("vakolat", "vakolat"),
        ("lazur", "lazúr"),
        ("alapozo", "alapozó"),
        ("zomanc", "zománc"),
        ("parketta", "parkettalakk"),
        ("glett", "glett"),
        ("higito", "hígító"),
        ("ragaszto", "ragasztó"),
        ("lakk", "lakk"),
    ]
    for needle, label in rules:
        if needle in t:
            return label
    return "egyéb"


def _extract_h1(html: str) -> str | None:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if not m:
        return None
    text = re.sub(r"<[^>]+>", "", m.group(1))
    text = re.sub(r"\s+", " ", text).strip()
    return text or None


def _extract_pdf_docs(html: str, slug: str) -> list[dict[str, Any]]:
    """Map labeled PDF buttons to tds/sds when possible; never invent."""
    docs: list[dict[str, Any]] = []
    for href, label in re.findall(
        r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.I | re.S
    ):
        lab = re.sub(r"<[^>]+>", " ", label)
        lab = re.sub(r"\s+", " ", lab).strip().lower()
        url = urljoin(BASE, href)
        kind = None
        if "biztonsági" in lab or lab.startswith("sds") or "safety" in lab:
            kind = "sds"
        elif "műszaki" in lab or "muszaki" in lab or lab.startswith("tds") or "technikai" in lab:
            kind = "tds"
        if not kind:
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_poli_farbe_{slug}_{kind}",
                "url": url,
                "filename": f"src_poli_farbe_{slug}_{kind}.pdf",
                "label": lab,
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


def _strip_tags(chunk: str) -> str:
    text = unescape(chunk or "")
    text = re.sub(r"<br\s*/?>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract_page_lead(html: str) -> str | None:
    # Prefer first substantial product paragraph (not meta marketing fluff alone).
    for m in re.finditer(r"<p[^>]*>(.*?)</p>", html, re.I | re.S):
        text = _strip_tags(m.group(1))
        if len(text) < 60:
            continue
        low = text.lower()
        if "fesse ki otthoni" in low or "ideális választás minden" in low:
            continue
        return text[:900]
    patterns = (
        r'<meta[^>]+name="description"[^>]+content="([^"]{40,})"',
        r'<meta[^>]+content="([^"]{40,})"[^>]+name="description"',
    )
    for pat in patterns:
        m = re.search(pat, html, re.I | re.S)
        if not m:
            continue
        text = _strip_tags(m.group(1))
        if len(text) > 40:
            return text[:800]
    return None


def _extract_tab_block(html: str, tab_id: str) -> str | None:
    m = re.search(
        rf'<div id="{re.escape(tab_id)}"[^>]*>([\s\S]*?)(?:</div>\s*<div id=|</div>\s*</div>\s*<!--)',
        html,
        re.I,
    )
    if not m:
        m = re.search(rf'<div id="{re.escape(tab_id)}"[^>]*>([\s\S]*?)</div>', html, re.I)
    if not m:
        return None
    return m.group(1)


def _extract_structured_page_facts(html: str) -> dict[str, Any]:
    """Official product-page technical sections (Felhasználás / Adatok tabs)."""
    facts: dict[str, Any] = {}
    # Unescape early so headings like Alkalmaz&aacute;si match.
    html_u = unescape(html)
    use_tab = _extract_tab_block(html_u, "tab-861") or ""
    # Platinum / variant pages use other tab ids (tab-6, tab-691, …).
    if not use_tab or (
        "Alkalmazási" not in use_tab and "Előkészítés" not in use_tab
    ):
        for tid in re.findall(r'id="(tab-[^"]+)"', html_u):
            if tid in {"tab-container", "tab-galeria", "tab-youtube", "tab-szin"}:
                continue
            block = _extract_tab_block(html_u, tid) or ""
            if re.search(
                r"(?i)Alkalmazási\s+terület|Előkészítés\s*[:–\-]|Felhasználás",
                block,
            ):
                use_tab = block
                break
    if not use_tab or "Alkalmazási" not in use_tab:
        m = re.search(
            r"(?is)<h2[^>]*>\s*Alkalmazási(?:\s|&nbsp;)+terület\s*</h2>([\s\S]{20,4000}?)(?=<h2|</div>\s*<div id=)",
            html_u,
        )
        if m:
            use_tab = m.group(0)

    if use_tab:
        app_m = re.search(
            r"(?is)<h2[^>]*>\s*Alkalmazási(?:\s|&nbsp;)+terület\s*</h2>\s*(?:<p[^>]*>)?([\s\S]*?)(?=<h2|$)",
            use_tab,
        )
        if app_m:
            app = _strip_tags(app_m.group(1))
            if len(app) >= 40:
                facts["application_area"] = app[:1200]

        # Előkészítés / Festés inside Felhasználás
        full_use = _strip_tags(use_tab)
        prep_m = re.search(
            r"(?is)Előkészítés\s*[:–\-]\s*([\s\S]{40,1200}?)(?=(?:Festés|Lakkozás|Felhordás)\s*[:–\-]|$)",
            full_use,
        )
        if prep_m:
            facts["preparation"] = prep_m.group(1).strip()[:1200]
        steps_m = re.search(
            r"(?is)(?:Festés|Lakkozás|Felhordás)\s*[:–\-]\s*([\s\S]{40,1200})$",
            full_use,
        )
        if steps_m:
            facts["application_steps"] = steps_m.group(1).strip()[:1200]
        elif "Felhasználás" in full_use and "preparation" in facts:
            # remaining usage text after prep
            rest = full_use
            if facts["preparation"] in rest:
                rest = rest.split(facts["preparation"], 1)[-1]
            rest = re.sub(r"(?is)^.*?(?:Festés|Lakkozás)\s*[:–\-]?\s*", "", rest).strip()
            if len(rest) >= 40:
                facts["application_steps"] = rest[:1200]

        # If Alkalmazási h2 missing, first paragraph under Felhasználás tab may be scope
        if "application_area" not in facts:
            # Plain-text path after unescape/strip
            m_scope = re.search(
                r"(?is)Alkalmazási terület\s+([\s\S]{40,800}?)(?=Felhasználás|Előkészítés|$)",
                full_use,
            )
            if m_scope:
                facts["application_area"] = m_scope.group(1).strip()[:1200]

    attrs: list[dict[str, Any]] = []
    for name, val in re.findall(
        r"<li[^>]*>\s*<strong>(.*?)</strong>\s*(.*?)</li>", html_u, re.I | re.S
    ):
        n = _strip_tags(name).rstrip(":")
        v = _strip_tags(val)
        if not n or not v or len(v) < 2:
            continue
        if n.lower() in {"biztonság", "biztonsagi"}:
            continue
        attrs.append({"name": n, "values": [v[:240]]})
    if attrs:
        facts["attributes"] = attrs[:16]

    # Short pages: lead paragraph often states application scope.
    if "application_area" not in facts:
        lead = facts.get("page_lead")  # may be filled later by caller
        if not isinstance(lead, str):
            # try extract quickly from unescaped html first p
            for m in re.finditer(r"<p[^>]*>(.*?)</p>", html_u, re.I | re.S):
                text = _strip_tags(m.group(1))
                if len(text) >= 60 and re.search(
                    r"(?i)(?:alkalmazható|festésére|kül-?\s*és\s*beltér|beltéri|kültéri)",
                    text,
                ):
                    facts["application_area"] = text[:1200]
                    break
    return facts


class PoliFarbeAdapter:
    manufacturer_id = "poli_farbe"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        found: dict[str, DiscoveredProduct] = {}
        for cat in CATEGORIES:
            url = urljoin(BASE, f"termek/{cat}")
            res = http.get(url)
            if not res.ok:
                continue
            html = res.body.decode("utf-8", "replace")
            for slug in re.findall(r"termeklap/([a-zA-Z0-9_-]+)", html):
                if slug in EXCLUDE_SLUGS or slug in found:
                    continue
                name_guess = slug.replace("-", " ").strip()
                brand = _brand_from_slug_name(slug, name_guess)
                found[slug] = DiscoveredProduct(
                    product_id=_slugify_id(slug),
                    product_name=name_guess.title(),
                    brand=brand,
                    manufacturer="poli_farbe",
                    product_page_url=urljoin(BASE, f"termeklap/{slug}"),
                    product_code=slug,
                    product_type_hint=_type_hint(name_guess, slug),
                    extra={"slug": slug, "category": cat},
                )
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
            slug = page_url.rstrip("/").split("/")[-1]

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand")
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            if h1:
                name = unescape(h1)
                page_facts["resolved_name"] = name
            brand = _brand_from_slug_name(slug, str(name or ""))
            docs = _extract_pdf_docs(html, slug)
            kinds = {d["kind"] for d in docs}
            if "tds" not in kinds:
                warnings.append("tds_absent_on_product_page")
            if "sds" not in kinds:
                warnings.append("missing_sds_url")

            lead = _extract_page_lead(html)
            if lead:
                page_facts["page_lead"] = lead
                page_facts["short_marketing"] = lead

            structured = _extract_structured_page_facts(html)
            page_facts.update(structured)
            # If structured missed scope but lead is applicative, promote it.
            if (
                "application_area" not in page_facts
                and isinstance(lead, str)
                and re.search(
                    r"(?i)(?:alkalmazható|festésére|kül-?\s*és\s*beltér|impregnál)",
                    lead,
                )
            ):
                page_facts["application_area"] = lead[:1200]
            if (
                page_facts.get("application_area")
                or page_facts.get("preparation")
                or page_facts.get("attributes")
            ):
                page_facts["official_page_tech"] = True

        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
