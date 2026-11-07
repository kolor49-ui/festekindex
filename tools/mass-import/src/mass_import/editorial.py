"""Editorial Standard v1 checks used by mass-import (LOCAL ONLY)."""

from __future__ import annotations

import re

# From FESTEKINDEX-EDITORIAL-STANDARD-v1.md + prior batch bans
BANNED_MARKETING = [
    re.compile(r"tökéletes\s+választás", re.I),
    re.compile(r"forradalmi\s+megoldás", re.I),
    re.compile(r"páratlan\s+minőség", re.I),
    re.compile(r"a\s+legjobb\s+termék", re.I),
    re.compile(r"minden\s+felhasználási\s+területre\s+ideális", re.I),
    re.compile(r"\bprémium\b", re.I),
    re.compile(r"kimagasl[oó]", re.I),
]


def find_banned_phrases(text: str) -> list[str]:
    hits: list[str] = []
    for pat in BANNED_MARKETING:
        m = pat.search(text or "")
        if m:
            hits.append(m.group(0))
    return hits
