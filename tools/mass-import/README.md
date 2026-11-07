# Festékindex mass-import MVP (LOCAL ONLY)

Isolated intake pipeline for TDS/SDS → draft → claims → PASS/REVIEW/HOLD.

**Does not** write live enrichment, publish products, commit, push, or deploy.

## Layout

```
tools/mass-import/
  src/mass_import/   # pipeline modules
  manifests/         # intake JSONL
  fixtures/pdfs/     # local reference PDFs (real manufacturer docs)
  tests/             # unit + safety tests
  runs/              # local run outputs (gitignored)
```

## Quick start (dry-run)

```bash
cd tools/mass-import
python3 -m mass_import.pipeline \
  --manifest manifests/dry-run-v1.jsonl \
  --run-dir runs/dry-run-v1 \
  --catalogue-root ../.. \
  --no-fetch
```

Resume after interruption (skips completed products):

```bash
python3 -m mass_import.pipeline \
  --manifest manifests/dry-run-v1.jsonl \
  --run-dir runs/dry-run-v1 \
  --catalogue-root ../.. \
  --no-fetch \
  --resume
```

Tests:

```bash
cd tools/mass-import && python3 -m pytest tests/ -q
```

## Safety

- `PASS` = local draft quality only — **not** a publish licence.
- `REVIEW` / `HOLD` are never publishable.
- Pipeline never mutates `lib/data/imports/festekBazisEnrichmentV1/*`.
- Outputs stay under `tools/mass-import/runs/` only.
