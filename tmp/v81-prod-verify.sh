#!/usr/bin/env bash
set -euo pipefail
export PATH="/Users/macbookair/.local/bin:/usr/local/bin:/Applications/Cursor.app/Contents/Resources/app/node_modules/@vscode/ripgrep/bin:$PATH"
cd /Users/macbookair/Desktop/festekindex
PKG=review-packages/festekindex-catalogue-go-live-v8-1-production
mkdir -p "$PKG/live" "$PKG/gates"

npx tsx -e '
import { listProducts, listBrands, listOrganizations } from "./lib/data/repository";
import { evaluatePublicIndexability } from "./lib/seo/publicIndexability";
import { listPublishedForSitemap } from "./lib/seo/sitemapEntries";
import { getCanonicalProductBrand } from "./lib/navigation/entityNavigation";
const products = listProducts();
const trilak = products.filter((p) => p.id.startsWith("prod_trilak_"));
const brands = listBrands();
const orgs = listOrganizations();
const sm = listPublishedForSitemap();
console.log(
  JSON.stringify(
    {
      commit: "b3fd3f6 (contains c389819)",
      products: products.length,
      trilak: trilak.length,
      fb: products.length - trilak.length,
      brands: brands.length,
      orgs: orgs.length,
      productIndexable: products.filter((p) => evaluatePublicIndexability(p).indexable).length,
      brandIndexable: brands.filter((b) => evaluatePublicIndexability(b).indexable).map((b) => b.id),
      orgIndexable: orgs.filter((o) => evaluatePublicIndexability(o).indexable).map((o) => o.id),
      sitemap: sm.length,
      brandCounts: trilak.reduce((a, p) => {
        const b = getCanonicalProductBrand(p.id)?.id || "NONE";
        a[b] = (a[b] || 0) + 1;
        return a;
      }, {}),
      trilakSlugs: trilak.map((p) => p.slug),
    },
    null,
    2,
  ),
);
' > "$PKG/gates/INTEGRITY.json"

python3 <<'PY'
import json, subprocess, re, pathlib
pkg = pathlib.Path("review-packages/festekindex-catalogue-go-live-v8-1-production")
data = json.loads((pkg / "gates/INTEGRITY.json").read_text())
slugs = data["trilakSlugs"]
results = []
ok = 0
for slug in slugs:
    url = f"https://festekindex.hu/termekek/{slug}"
    html_path = pkg / "live" / f"prod_{slug}.html"
    p = subprocess.run(
        ["curl", "-sS", "-L", "--max-time", "25", "-o", str(html_path), "-w", "%{http_code}", url],
        capture_output=True,
        text=True,
    )
    code = p.stdout.strip()
    html = html_path.read_text(errors="ignore") if code == "200" else ""
    robots_m = re.search(r'name="robots" content="([^"]+)"', html)
    robots = robots_m.group(1) if robots_m else ""
    h1_m = re.search(r"<h1[^>]*>([^<]+)</h1>", html)
    h1 = h1_m.group(1) if h1_m else ""
    good = code == "200" and robots == "noindex, follow" and bool(h1)
    if good:
        ok += 1
    results.append({"slug": slug, "code": code, "robots": robots, "h1": h1, "ok": good})
summary = {"checked": len(slugs), "ok": ok, "fail": [r for r in results if not r["ok"]]}
print(json.dumps(summary, ensure_ascii=False, indent=2))
(pkg / "live/PPG42-LIVE-CHECK.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
(pkg / "live/PPG42-LIVE-SUMMARY.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2))
PY

curl -sS -L --max-time 25 -o "$PKG/live/sitemap.xml" https://festekindex.hu/sitemap.xml
echo -n "sitemap_product_detail_hits="
rg -c "/termekek/[a-z0-9-]+" "$PKG/live/sitemap.xml" || echo 0

echo "--- maker/list probes ---"
for u in \
  "https://festekindex.hu/markak/poli-farbe" \
  "https://festekindex.hu/markak/jub" \
  "https://festekindex.hu/cegek/jub-kft" \
  "https://festekindex.hu/cegek/egrokorr" \
  "https://festekindex.hu/termekek"
do
  code=$(curl -sS -o /tmp/x.html -w "%{http_code}" -L --max-time 25 "$u" || echo ERR)
  robots=$(rg -o 'name="robots" content="[^"]+"' /tmp/x.html | head -1 || true)
  echo "$code | $robots | $u"
done

shasum -a 256 review-packages/festekindex-final-four-release-closure-v7-3c.zip | awk '{print $1}' > "$PKG/gates/FINAL-FOUR.sha256"
cp review-packages/festekindex-final-four-release-closure-v7-3c.zip.sha256 "$PKG/gates/FINAL-FOUR.expected.sha256"
if diff -q "$PKG/gates/FINAL-FOUR.sha256" <(awk '{print $1}' "$PKG/gates/FINAL-FOUR.expected.sha256") >/dev/null; then
  echo FINAL_FOUR_MATCH
else
  echo FINAL_FOUR_MISMATCH
fi

if git diff --name-only f319091..HEAD | rg -q "catalogueClosureDescriptions|professionalDescriptionEnrichment|descriptionEnrichment"; then
  echo HOLD_PRESENT_IN_RANGE
else
  echo HOLD_ABSENT_IN_PUSHED_RANGE
fi

gh api repos/kolor49-ui/festekindex/deployments/7443854323/statuses --jq '.[0] | {state, environment, created_at, target_url, description}' > "$PKG/gates/DEPLOYMENT.json"
cat "$PKG/gates/DEPLOYMENT.json"
echo DONE
