# FESTÉKINDEX Editorial Standard v1

**Status:** Internal process standard  
**Scope:** Professional Product descriptions and editorial leads  
**Based on:** Content Editorial Rewrite Pilot v1 (accepted)  
**Not for public SEO publication**

---

## 1. Purpose

FESTÉKINDEX is an independent, manufacturer-neutral professional industry index.

Official manufacturer documentation is the **factual foundation**.

FESTÉKINDEX explanatory prose must have its own structure, wording and professional value.

This standard defines a reusable process for rewriting and accepting Product professional descriptions at scale.

---

## 2. Core principle

**Manufacturer documents are the factual source, not a writing template.**

Never create supposedly original content by changing manufacturer sentences word by word.

Required workflow:

1. Collect official Product documentation.
2. Extract technical facts into structured records.
3. Record source evidence and qualifications.
4. Draft independent Hungarian explanatory text from those facts.
5. Verify every material claim against the official source.
6. Check originality against manufacturer prose.
7. Review technical and editorial quality.
8. Approve only when all requirements pass.

---

## 3. Editorial tone

Writing must be:

- Natural Hungarian
- Professional and objective
- Accurate and understandable
- Informative
- Concise without omitting important conditions
- Consistent in terminology
- Free of unsupported recommendations
- Free of marketing exaggeration
- Free of generic AI filler
- Free of keyword stuffing

Avoid unsupported promotional phrases such as:

- „Tökéletes választás”
- „Forradalmi megoldás”
- „Páratlan minőség”
- „A legjobb termék”
- „Minden felhasználási területre ideális”

---

## 4. Content structure

Preserve the Product Professional Description data model:

`professionalDescription.sections[]`

Use existing section concepts where applicable:

- Termékleírás
- Alkalmazás
- Előkészítés
- Felhasználás
- Fényesség

Rules:

- Do not invent content merely to fill a template.
- Do not redesign Product Hub.
- Do not unnecessarily duplicate structured technical specifications.

`editorialSummary` (lead) is audited separately. Rewrite only when originality, accuracy or consistency requires it.

---

## 5. Source accuracy

Every material claim must be traceable to an applicable official manufacturer source.

Preserve exact technical meaning for:

- Numbers and units
- Application conditions
- Drying and recoating intervals
- Layer counts
- Substrate exclusions
- Surface preparation
- Dilution
- Primer and coating-system requirements
- Safety-related qualifications

Hard rules:

- Do not guess missing values.
- Do not present manufacturer-stated durability as an unconditional guarantee.
- Do not broaden an ambiguous technical statement beyond the source.
- If a safety-critical instruction is ambiguous, flag for human review rather than inventing clarity.

---

## 6. Originality requirements

Compare each final description against:

- Official Product page
- Official TDS
- Other applicable official Product documentation

Assess:

- Exact sentence matches
- Long identical passages
- Near-duplicate explanatory paragraphs
- Structural dependence on manufacturer prose
- Unnecessary promotional language

Low textual overlap is desirable.

**0% overlap is not a mandatory target and is not a legal safe harbor.**

Standard technical terminology, units, Product names and mandatory conditions may legitimately overlap.

---

## 7. Acceptance categories

| Status | Meaning |
|---|---|
| **PASS** | Independently written, technically supported, editorially acceptable |
| **REVIEW** | Specific unresolved questions requiring judgment or targeted corrections |
| **FAIL** | Substantial copied prose, material technical error, or unacceptable content |
| **UNVERIFIABLE** | Insufficient evidence for reliable acceptance |

A Product must not receive PASS solely because an automated similarity checker reports 0%.

---

## 8. Product acceptance gates

A Product may PASS only if:

1. Official sources have been inspected.
2. Explanatory prose is independently written.
3. No substantial copied manufacturer paragraphs remain.
4. All material technical claims are supported.
5. All important qualifications appear in the **public** text.
6. No unresolved safety-critical statements remain.
7. No contradictions and no fabricated claims.
8. Existing source relationships remain valid.
9. Public Hungarian text is clear and professional.
10. Product page renders correctly.
11. Protected data and SEO behavior remain unchanged.

An internal audit note is not sufficient if the published description omits a required qualification.

---

## 9. Batch governance

- Scale only after accepted pilots / batches.
- Fixed batch manifests must not be silently swapped for easier Products.
- If a selected Product cannot be processed reliably, mark it blocked and report why.
- Do not mass-generate unverified catalogue content.
- Quality first; scale only after acceptance.

---

## 10. Protected systems

Editorial rewrites must not alter:

- Product identity / SEO indexability
- Specifications, packaging, colors
- SearchDocuments / ranking
- Product Hub layout / UX shells
- Metadata, canonicals, robots, sitemap, JSON-LD

---

## 11. Pilot lessons carried forward

1. Disclose manufacturer data conflicts (e.g. 2 vs 2–3 coats) rather than inventing a distinction.
2. Clarify recoat intervals with reference temperature and humidity effects.
3. Durability claims need manufacturer attribution and limiting conditions in public text.
4. Moisture percentages must keep their substrate scope (e.g. plaster moisture ≠ universal wall moisture).
5. Solvent products should point to SDS rather than paraphrasing H/P catalogues.
6. Missing dedicated SDS sourceIds are source-integrity actions, not reasons to invent sources.
