"""JUB Hungary (jub.hu) official-source adapter."""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import quote, urlparse, urlsplit, urlunsplit

from ..http_client import RateLimitedClient
from .base import DiscoveredProduct, ResolvedDocuments

SITEMAP_PRODUCTS = "https://www.jub.hu/sitemap-products.xml"

# Pack / thickness SKU noise — keep base coating identities only.
_PACK_SKU_RE = re.compile(
    r"(?:-\d+(?:[.,]\d+)?-mm(?:-\d+(?:[.,]\d+)?-kg)?|-\d+(?:[.,]\d+)?-kg)/?$",
    re.I,
)

# Focus coating / protection families (user priority + related coatings).
_INCLUDE_RE = re.compile(
    r"(jupol|jubizol|jubin|acrylcolor|acryl-fas|takril|hydrosol|"
    r"alapozo|primer|lasur|lazur|fasade|homlokzat|falfest|"
    r"unixil|silicate|silikon|akrinol|jubolin|beton-kontakt|"
    r"decor-|jubosan)",
    re.I,
)

# Explicit non-coating lines for this intake wave.
_EXCLUDE_RE = re.compile(
    r"(sigill|pu-foam|fugamix|drytop-finish|"
    r"eps/|eps-|tomito|purhab)",
    re.I,
)


def _slug_from_url(url: str) -> str:
    path = urlparse(url).path.strip("/")
    parts = [p for p in path.split("/") if p]
    return parts[-1] if parts else path


def _slugify_id(slug: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "_", slug.lower()).strip("_")
    return f"prod_jub_{clean}"[:90]


def _brand_from_slug(slug: str) -> str:
    s = slug.lower()
    if s.startswith("jupol"):
        return "JUPOL"
    if s.startswith("jubizol"):
        return "JUBIZOL"
    if s.startswith("jubin"):
        return "JUBIN"
    if s.startswith("hydrosol"):
        return "HYDROSOL"
    if s.startswith("acryl"):
        return "Acrylcolor"
    if s.startswith("takril"):
        return "Takril"
    if s.startswith("jubolin"):
        return "Jubolin"
    if s.startswith("akrinol"):
        return "Akrinol"
    return "JUB"


def _type_hint(slug: str) -> str:
    s = slug.lower()
    if "alapozo" in s or "primer" in s or "kontakt" in s:
        return "alapozó"
    if "lasur" in s or "lazur" in s:
        return "lazúr"
    if "jubizol" in s or "unixil" in s or "fasade" in s or "acrylcolor" in s:
        return "homlokzatfesték"
    if "jupol" in s or "falfest" in s:
        return "falfesték"
    if "glett" in s or "jubolin" in s:
        return "glett"
    if "hydrosol" in s:
        return "vízszigetelés"
    return "egyéb"


def _keep_url(url: str) -> bool:
    if "/termekek/" not in url:
        return False
    slug = _slug_from_url(url)
    if _PACK_SKU_RE.search(slug):
        # Keep only if it is not a pure pack variant of a longer family —
        # for this wave, drop mm/kg SKU URLs entirely.
        return False
    if _EXCLUDE_RE.search(slug):
        return False
    return bool(_INCLUDE_RE.search(slug))


def _extract_h1(html: str) -> str | None:
    m = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.I | re.S)
    if not m:
        return None
    text = re.sub(r"<[^>]+>", "", m.group(1))
    text = re.sub(r"\s+", " ", text).strip()
    return text or None


def _safe_pdf_url(url: str) -> str:
    """Encode spaces/unsafe path chars so http client can fetch PIM PDFs."""
    parts = urlsplit(url.strip())
    path = quote(parts.path, safe="/%")
    return urlunsplit((parts.scheme, parts.netloc, path, parts.query, parts.fragment))


def _extract_docs(html: str, slug: str) -> list[dict[str, Any]]:
    docs: list[dict[str, Any]] = []
    # Anchor blocks: href=pdf ... nested label div
    for m in re.finditer(
        r'<a[^>]+href="(https?://[^"]+\.pdf)"[^>]*>(.*?)</a>',
        html,
        re.I | re.S,
    ):
        url, inner = m.group(1), m.group(2)
        lab = re.sub(r"<[^>]+>", " ", inner)
        lab = re.sub(r"\s+", " ", lab).strip().lower()
        kind = None
        if "/tds/" in url.lower() or "műszaki adatlap" in lab or "muszaki adatlap" in lab:
            kind = "tds"
        elif "/sds/" in url.lower() or "biztonsági adatlap" in lab:
            kind = "sds"
        if not kind:
            continue
        docs.append(
            {
                "kind": kind,
                "source_id": f"src_jub_{slug}_{kind}",
                "url": _safe_pdf_url(url),
                "filename": f"src_jub_{slug}_{kind}.pdf",
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


class JubAdapter:
    manufacturer_id = "jub"

    def discover_products(
        self, http: RateLimitedClient, *, limit: int = 500
    ) -> list[DiscoveredProduct]:
        res = http.get(SITEMAP_PRODUCTS)
        if not res.ok:
            return []
        xml = res.body.decode("utf-8", "replace")
        locs = re.findall(r"<loc>([^<]+)</loc>", xml)
        out: list[DiscoveredProduct] = []
        seen: set[str] = set()
        for loc in locs:
            if not _keep_url(loc):
                continue
            slug = _slug_from_url(loc)
            if slug in seen:
                continue
            seen.add(slug)
            brand = _brand_from_slug(slug)
            out.append(
                DiscoveredProduct(
                    product_id=_slugify_id(slug),
                    product_name=slug.replace("-", " ").strip().title(),
                    brand=brand,
                    manufacturer="jub",
                    product_page_url=loc if loc.endswith("/") else loc + "/",
                    product_code=slug,
                    product_type_hint=_type_hint(slug),
                    extra={"slug": slug},
                )
            )
            if len(out) >= limit:
                break
        return out

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
            slug = _slug_from_url(page_url)

        if html is None and page_url:
            page_res = http.get(page_url)
            if not page_res.ok:
                warnings.append(f"product_page_fetch_failed:{page_res.error}")
                return ResolvedDocuments(documents=[], warnings=warnings)
            html = page_res.body.decode("utf-8", "replace")

        name = product.get("product_name")
        brand = product.get("brand") or _brand_from_slug(slug)
        page_facts: dict[str, Any] = {"slug": slug}
        docs: list[dict[str, Any]] = []

        if html:
            h1 = _extract_h1(html)
            if h1:
                name = h1
                page_facts["resolved_name"] = h1
            docs = _extract_docs(html, slug)
            kinds = {d["kind"] for d in docs}
            if "tds" not in kinds:
                warnings.append("tds_absent_on_product_page")
            if "sds" not in kinds:
                warnings.append("missing_sds_url")

        return ResolvedDocuments(
            documents=docs,
            product_name=name,
            brand=brand,
            page_facts=page_facts,
            warnings=warnings,
        )
