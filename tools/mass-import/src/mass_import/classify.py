"""PASS / REVIEW / HOLD classifier. PASS ≠ publish licence. ERROR is separate."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any

from .catalogue import CatalogueHit
from .claims import Claim
from .draft import ProductDraft


PUBLISH_POLICY = "NEVER_AUTO_PUBLISH"

REQUIRED_ENRICHMENT_SECTIONS = {
    "Termékleírás",
    "Alkalmazás",
    "Előkészítés",
    "Felhasználás",
    "Műszaki adatok",
}


@dataclass
class Classification:
    product_id: str
    status: str  # PASS | REVIEW | HOLD
    reasons: list[str] = field(default_factory=list)
    publish_gate: str = PUBLISH_POLICY
    publishable: bool = False
    technical_ok: bool = False
    catalogue_duplicate: bool = False

    def to_dict(self) -> dict[str, Any]:
        d = asdict(self)
        d["note"] = (
            "PASS means local draft quality only; it is not a publish licence. "
            "REVIEW and HOLD are never publishable. ERROR is a technical state, not PASS."
        )
        return d


def classify(
    draft: ProductDraft,
    claims: list[Claim],
    *,
    duplicate: CatalogueHit | None,
    forced_hold_reason: str | None = None,
    enrichment_issues: list[str] | None = None,
    enrichment_ok: bool = False,
) -> Classification:
    reasons: list[str] = []
    status = "PASS"
    enrichment_issues = enrichment_issues or []

    if forced_hold_reason:
        return Classification(
            product_id=draft.product_id,
            status="HOLD",
            reasons=[forced_hold_reason],
            publishable=False,
            technical_ok=False,
            catalogue_duplicate=bool(duplicate),
        )

    hard_hold_warnings = {
        "sds_title_name_mismatch",
        "tds_sds_identity_mismatch",
        "sds_product_code_mismatch",
        "sds_identity_uncertain",
    }
    for w in draft.warnings:
        if w in hard_hold_warnings:
            reasons.append(f"hold:{w}")
            status = "HOLD"

    for c in claims:
        if c.status == "cross_doc_contamination":
            reasons.append(f"hold:cross_doc:{c.claim_id}")
            status = "HOLD"

    for issue in enrichment_issues:
        if issue.startswith("hold:"):
            reasons.append(issue)
            status = "HOLD"

    if status == "HOLD":
        return Classification(
            product_id=draft.product_id,
            status="HOLD",
            reasons=reasons,
            publishable=False,
            technical_ok=False,
            catalogue_duplicate=bool(duplicate),
        )

    if duplicate:
        reasons.append(f"review:catalogue_duplicate:{duplicate.match_kind}")
        status = "REVIEW"

    # Missing TDS PDF: still REVIEW unless an official alt tech source covers enrichment
    # (product_page / other official doc). Do not PASS on inventing missing prep/specs.
    has_alt_tech = "has_official_alt_tech_source" in draft.warnings
    if "missing_tds" in draft.gaps and not (has_alt_tech and enrichment_ok):
        reasons.append("review:missing_tds")
        status = "REVIEW"
    elif "missing_tds" in draft.gaps and has_alt_tech:
        reasons.append("info:tds_absent_alt_product_page")

    for w in draft.warnings:
        if w == "tds_title_name_mismatch":
            reasons.append(f"review:{w}")
            status = "REVIEW"

    weak = [c for c in claims if c.status == "weak_quote"]
    banned = [c for c in claims if c.status == "banned_phrase"]
    if weak:
        reasons.append(f"review:weak_quotes:{len(weak)}")
        status = "REVIEW"
    if banned:
        reasons.append(f"review:banned_phrase:{len(banned)}")
        status = "REVIEW"

    if "missing_sds" in draft.gaps:
        reasons.append("review:missing_sds")
        status = "REVIEW"

    material_gaps = [
        g
        for g in draft.gaps
        if g.startswith("unextracted:")
        and g.split(":", 1)[1] in ("coverage", "application_excerpt", "pack_sizes")
    ]
    if material_gaps and "missing_tds" not in draft.gaps:
        reasons.append(f"review:incomplete_extraction:{len(material_gaps)}")
        status = "REVIEW"

    for issue in enrichment_issues:
        if issue.startswith("review:"):
            reasons.append(issue)
            status = "REVIEW"

    if not enrichment_ok:
        reasons.append("review:enrichment_incomplete")
        status = "REVIEW"

    technical_ok = (
        ("missing_tds" not in draft.gaps or (has_alt_tech and enrichment_ok))
        and not weak
        and not banned
        and not any(c.status == "cross_doc_contamination" for c in claims)
        and "tds_sds_identity_mismatch" not in draft.warnings
        and "sds_title_name_mismatch" not in draft.warnings
        and enrichment_ok
    )

    # PASS only when all mandatory validations clear
    if status == "PASS":
        if not technical_ok or duplicate or weak or banned or not enrichment_ok:
            status = "REVIEW"
            reasons.append("review:pass_gate_failed")
        else:
            reasons.append("pass:local_draft_ready_all_gates")

    return Classification(
        product_id=draft.product_id,
        status=status,
        reasons=reasons,
        publishable=False,
        technical_ok=technical_ok,
        catalogue_duplicate=bool(duplicate),
    )
