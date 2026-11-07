"""Bind draft facts to sourceIds / SHA / page / quote."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from .draft import ProductDraft
from .editorial import find_banned_phrases
from .extract import ExtractedDoc, find_quote_page


@dataclass
class Claim:
    claim_id: str
    field: str
    text: str
    source_id: str
    doc_kind: str
    sha256: str
    page: int | None
    quote: str
    status: str  # ok | weak_quote | banned_phrase | cross_doc_contamination


def build_claims(draft: ProductDraft, docs: list[ExtractedDoc]) -> list[Claim]:
    by_id = {d.source_id: d for d in docs}
    claims: list[Claim] = []
    for i, fact in enumerate(draft.facts):
        doc = by_id.get(fact.source_id)
        sha = doc.sha256 if doc else ""
        page = fact.page
        status = "ok"

        if doc is None:
            status = "weak_quote"
        else:
            # TDS facts must not cite SDS and vice versa for technical paint fields
            if fact.doc_kind == "tds" and doc.kind != "tds":
                status = "cross_doc_contamination"
            if fact.doc_kind == "sds" and doc.kind != "sds":
                status = "cross_doc_contamination"
            if fact.key.startswith("sds_") and doc.kind != "sds":
                status = "cross_doc_contamination"
            if fact.key in (
                "color_range",
                "pack_sizes",
                "gloss",
                "coverage",
                "application_excerpt",
            ) and doc.kind != "tds":
                status = "cross_doc_contamination"

            verified = find_quote_page(doc, fact.quote)
            if verified is None:
                status = "weak_quote" if status == "ok" else status
            else:
                page = verified

        banned = find_banned_phrases(fact.value) + find_banned_phrases(fact.quote)
        if banned:
            status = "banned_phrase"

        claims.append(
            Claim(
                claim_id=f"{draft.product_id}::c{i:02d}::{fact.key}",
                field=fact.key,
                text=fact.value,
                source_id=fact.source_id,
                doc_kind=fact.doc_kind,
                sha256=sha,
                page=page,
                quote=fact.quote,
                status=status,
            )
        )
    return claims


def claims_to_dict(claims: list[Claim]) -> list[dict[str, Any]]:
    return [asdict(c) for c in claims]
