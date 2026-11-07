# Regression summary

- `09-seo-indexability`: exit 0
- `04-product-hub`: exit 0
- `10-typescript`: exit 2
- `10-typescript-scoped`: exit 2
- `12-production-build`: exit 1

Root tsc/build fail because tsconfig includes review-packages/local-hold-preserve (pre-existing dirty HOLD preserve artifacts). Scoped tsc excluding review-packages/tmp/tools is the relevant gate for app code. 42 PASS not applied to live catalogue — Product Hub still 53 products.
