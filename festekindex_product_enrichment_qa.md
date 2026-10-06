# FESTÉKINDEX — Product Enrichment v1 — Independent QA Export

Read-only audit export. No production data modified.
Generated from live repository merge (Festék Bázis Enrichment v1 overlay).
Export date context: accessedAt sources = 2026-10-06.

---

# 1. Three reference products (full dump)

## A) VALMOR AIR FLOW Lélegző Beltéri Falfesték

### PRODUCT

- **id:** `prod_valmor_airflow_interior`
- **exact name:** VALMOR AIR FLOW Lélegző Beltéri Falfesték
- **family:** VALMOR AIR FLOW (`pf_valmor_air_flow`)
- **brand:** VALMOR (`brand_valmor`)
- **productClass:** `architectural_coating`
- **officialUrl:** https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-lelegzo-belteri-falfestek-p-319
- **Product.sourceIds:** `['src_valmor_airflow_interior', 'src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior_sds']`

### SOURCES (from Product.sourceIds)

#### `src_valmor_airflow_interior`
- documentKind: `product_page`
- title: VALMOR AIR FLOW Lélegző Beltéri Falfesték — hivatalos termékoldal
- url: https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-air-flow-lelegzo-belteri-falfestek-p-319
- publishedAt: *(empty)*
- accessedAt: 2026-10-06

#### `src_valmor_airflow_interior_tds`
- documentKind: `tds`
- title: VALMOR AIR FLOW Lélegző Beltéri Falfesték — műszaki adatlap
- url: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=319&type=datasheet
- publishedAt: *(empty)*
- accessedAt: 2026-10-06

#### `src_valmor_airflow_interior_sds`
- documentKind: `sds`
- title: VALMOR AIR FLOW Lélegző Beltéri Falfesték — biztonsági adatlap
- url: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=7187&type=safetydatasheet
- publishedAt: 2024-03-03
- accessedAt: 2026-10-06

### SOURCE SUMMARY

- **sourceSummary:**

> VALMOR AIR FLOW Lélegző Beltéri Falfesték diszperziós jellegű, matt beltéri falfesték, magas páraáteresztő képességgel. A gyártói műszaki adatlap szerint vakolatra, betonra és gipszkartonra alkalmazható; felhordás ecsettel, hengerrel vagy szórással. Dokumentált kiadósság 4–5 m²/l két rétegben (fehér, glettelt felület), átvonhatóság 4 óra (25 °C).

- **sourceSummarySourceIds:** `['src_valmor_airflow_interior', 'src_valmor_airflow_interior_tds']`

### SPECIFICATIONS

#### Spec 1: `coverage`
- normalized value:
```json
{
  "kind": "range_unit",
  "min": 4,
  "max": 5,
  "unit": "m2_per_l"
}
```
- condition:
```json
{
  "basis": "per_system",
  "note": "két réteg; fehér, glettelt felület"
}
```
- rawValue: `Kiadósság: 4-5 m2/liter két rétegben, fehér, glettelt minőségű felület esetén`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 2: `recoat_time`
- normalized value:
```json
{
  "kind": "duration",
  "value": 4,
  "unit": "h"
}
```
- condition:
```json
{
  "temperatureC": 25
}
```
- note: Átfesthetőség önmagával; magas páratartalom hosszabbíthatja.
- rawValue: `Átfesthetőségi idő: (25 °C-on): 4 óra`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 3: `dust_dry_time`
- normalized value:
```json
{
  "kind": "duration",
  "value": 2,
  "unit": "h"
}
```
- condition:
```json
{
  "temperatureC": 25,
  "note": "maximum; 1. száradási fokozat"
}
```
- rawValue: `Száradási idő: 25°C-on 1.fokozat max. 2 óra`
- sourceIds: `['src_valmor_airflow_interior_tds']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 4: `full_cure_time`
- normalized value:
```json
{
  "kind": "duration",
  "value": 24,
  "unit": "h"
}
```
- condition:
```json
{
  "temperatureC": 25,
  "note": "maximum; 5. száradási fokozat"
}
```
- rawValue: `Száradási idő: 25°C-on 5.fokozat max. 24 óra`
- sourceIds: `['src_valmor_airflow_interior_tds']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 5: `dilution`
- normalized value:
```json
{
  "kind": "percentage",
  "value": 10
}
```
- condition:
```json
{
  "note": "első réteg; hígítószer: víz; maximum"
}
```
- rawValue: `hígításképpen maximum 10%-ban vizet adhatunk hozzá`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 6: `dilution`
- normalized value:
```json
{
  "kind": "percentage",
  "value": 5
}
```
- condition:
```json
{
  "note": "fedőréteg; hígítószer: víz; maximum"
}
```
- rawValue: `fedőfestést max. 5% víz hozzáadásával végezzük`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 7: `coat_count`
- normalized value:
```json
{
  "kind": "number",
  "value": 2
}
```
- condition:
```json
null
```
- rawValue: `Javasolt rétegszám: 2 réteg`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 8: `gloss`
- normalized value:
```json
{
  "kind": "enum",
  "value": "matt"
}
```
- condition:
```json
null
```
- rawValue: `Fényesség: matt`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 9: `binder`
- normalized value:
```json
{
  "kind": "text",
  "text": "diszperziós"
}
```
- condition:
```json
null
```
- note: TDS: diszperziós jellegű; nem következett akril.
- rawValue: `diszperziós jellegű matt, hófehér légáteresztő beltéri falfesték`
- sourceIds: `['src_valmor_airflow_interior_tds']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 10: `application_environment`
- normalized value:
```json
{
  "kind": "enum",
  "value": "interior"
}
```
- condition:
```json
null
```
- rawValue: `beltéri falfesték`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

### PACKAGING

#### `pack_valmor_airflow_interior_5l`
- amount: `5`
- unit: `l`
- sku: `None`
- gtin: `None`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### `pack_valmor_airflow_interior_10l`
- amount: `10`
- unit: `l`
- sku: `None`
- gtin: `None`
- sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
- verifiedAt: `2026-10-06`
- status: `verified`

### RELATIONS (Surface / Technology / dilutedWith / compatibleWith / partOfSystem / hasProduct)

- `pf_valmor_air_flow` --**hasProduct**--> `prod_valmor_airflow_interior`
  - id: `rel_pf_valmor_air_flow_prod_valmor_airflow_interior`
  - description/metadata: None
  - sourceIds: `['src_valmor_airflow_interior']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_valmor_airflow_interior` --**applicableToSurface**--> `surface_vakolat`
  - id: `rel_prod_valmor_airflow_interior_applicableToSurface_surface_vakolat`
  - description/metadata: None
  - sourceIds: `['src_valmor_airflow_interior']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_valmor_airflow_interior` --**applicableToSurface**--> `surface_beton`
  - id: `rel_prod_valmor_airflow_interior_applicableToSurface_surface_beton`
  - description/metadata: None
  - sourceIds: `['src_valmor_airflow_interior']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_valmor_airflow_interior` --**applicableToSurface**--> `surface_gipszkarton`
  - id: `rel_prod_valmor_airflow_interior_applicableToSurface_surface_gipszkarton`
  - description/metadata: None
  - sourceIds: `['src_valmor_airflow_interior']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_valmor_airflow_interior` --**usesTechnology**--> `tech_ecset`
  - id: `rel_prod_valmor_airflow_interior_usesTechnology_tech_ecset`
  - description/metadata: TDS/termékoldal: felhordás ecsettel
  - sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
  - verifiedAt: `2026-10-06`
  - status: `active`
- `prod_valmor_airflow_interior` --**usesTechnology**--> `tech_henger`
  - id: `rel_prod_valmor_airflow_interior_usesTechnology_tech_henger`
  - description/metadata: TDS/termékoldal: felhordás hengerrel
  - sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
  - verifiedAt: `2026-10-06`
  - status: `active`
- `prod_valmor_airflow_interior` --**usesTechnology**--> `tech_szoras`
  - id: `rel_prod_valmor_airflow_interior_usesTechnology_tech_szoras`
  - description/metadata: TDS/termékoldal: szórható
  - sourceIds: `['src_valmor_airflow_interior_tds', 'src_valmor_airflow_interior']`
  - verifiedAt: `2026-10-06`
  - status: `active`

## B) COROR Rapid Korróziógátló Alapozó

### PRODUCT

- **id:** `prod_coror_rapid_primer`
- **exact name:** COROR Rapid Korróziógátló Alapozó
- **family:** COROR Rapid (`pf_coror_rapid`)
- **brand:** COROR (`brand_coror`)
- **productClass:** `primer`
- **officialUrl:** https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-korroziogatlo-alapozo-p-331
- **Product.sourceIds:** `['src_coror_rapid_primer', 'src_coror_rapid_primer_tds']`

### SOURCES (from Product.sourceIds)

#### `src_coror_rapid_primer`
- documentKind: `product_page`
- title: COROR Rapid Korróziógátló Alapozó — hivatalos termékoldal
- url: https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-korroziogatlo-alapozo-p-331
- publishedAt: *(empty)*
- accessedAt: 2026-10-06

#### `src_coror_rapid_primer_tds`
- documentKind: `tds`
- title: COROR Rapid Korróziógátló Alapozó — műszaki adatlap
- url: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet
- publishedAt: *(empty)*
- accessedAt: 2026-10-06

### SOURCE SUMMARY

- **sourceSummary:**

> COROR Rapid Korróziógátló Alapozó oldószeres, matt, bel- és kültéri fémalapozó. A műszaki adatlap szerint uretanizált alkid kötőanyagú; acélra, alumíniumra, horganyzottra és rézre alkalmazható. Dokumentált kiadósság 12–13 m²/l 40 μm száraz rétegvastagság esetén; érintésszáraz 20 perc (25 °C). Hígítás elsősorban COROR Szintetikus vagy Aromás Hígítóval.

- **sourceSummarySourceIds:** `['src_coror_rapid_primer', 'src_coror_rapid_primer_tds']`

### SPECIFICATIONS

#### Spec 1: `coverage`
- normalized value:
```json
{
  "kind": "range_unit",
  "min": 12,
  "max": 13,
  "unit": "m2_per_l"
}
```
- condition:
```json
{
  "note": "40 μm száraz rétegvastagság esetén"
}
```
- rawValue: `Kiadósság: 12-13 m2/liter 40 μm száraz rétegvastagság esetén`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 2: `touch_dry_time`
- normalized value:
```json
{
  "kind": "duration",
  "value": 20,
  "unit": "min"
}
```
- condition:
```json
{
  "temperatureC": 25
}
```
- rawValue: `Coror Szintetikus és Aromás Hígítóval vagy hígítás nélkül (25 °C-on): 20 perc – érintésszáraz`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 3: `dust_dry_time`
- normalized value:
```json
{
  "kind": "duration",
  "value": 1,
  "unit": "h"
}
```
- condition:
```json
{
  "temperatureC": 25,
  "note": "maximum; 1. száradási fokozat"
}
```
- rawValue: `Száradási idő: 25°C-on 1.fokozat max. 1 óra`
- sourceIds: `['src_coror_rapid_primer_tds']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 4: `full_cure_time`
- normalized value:
```json
{
  "kind": "duration",
  "value": 24,
  "unit": "h"
}
```
- condition:
```json
{
  "temperatureC": 25,
  "note": "maximum; 5. száradási fokozat"
}
```
- rawValue: `Száradási idő: 25°C-on 5.fokozat max. 24 óra`
- sourceIds: `['src_coror_rapid_primer_tds']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 5: `recoat_time`
- normalized value:
```json
{
  "kind": "duration",
  "value": 2,
  "unit": "h"
}
```
- condition:
```json
{
  "temperatureC": 25,
  "note": "önmagával; Szintetikus/Aromás hígítóval vagy hígítás nélkül; „száraz”"
}
```
- rawValue: `2 óra – száraz (átfesthetőség önmagával, 25 °C)`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 6: `dilution`
- normalized value:
```json
{
  "kind": "text",
  "text": "COROR Szintetikus vagy Aromás Hígító; alternatíva: lakkbenzin, nitrohígító"
}
```
- condition:
```json
null
```
- rawValue: `Elsősorban Coror Szintetikus és Aromás Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 7: `coat_count`
- normalized value:
```json
{
  "kind": "number",
  "value": 2
}
```
- condition:
```json
null
```
- rawValue: `Javasolt rétegszám 2 réteg`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 8: `coat_count`
- normalized value:
```json
{
  "kind": "range",
  "min": 2,
  "max": 3
}
```
- condition:
```json
{
  "note": "rozsdára festés esetén minimum"
}
```
- rawValue: `Rozsdára festés esetén minimum 2-3 réteg felhordása kötelező.`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 9: `gloss`
- normalized value:
```json
{
  "kind": "enum",
  "value": "matt"
}
```
- condition:
```json
null
```
- rawValue: `Fényesség: matt`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 10: `binder`
- normalized value:
```json
{
  "kind": "text",
  "text": "uretánizált alkid"
}
```
- condition:
```json
null
```
- note: TDS összetétel: Alkidgyanta; page: uretanizált alkid kötőanyag
- rawValue: `Uretanizált alkid kötőanyagának köszönhetően… Összetétel: Alkidgyanta…`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### Spec 11: `application_environment`
- normalized value:
```json
{
  "kind": "multi_enum",
  "values": [
    "interior",
    "exterior"
  ]
}
```
- condition:
```json
null
```
- rawValue: `bel- és kültéri`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

### PACKAGING

#### `pack_coror_rapid_primer_0_25l`
- amount: `0.25`
- unit: `l`
- sku: `None`
- gtin: `None`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### `pack_coror_rapid_primer_0_75l`
- amount: `0.75`
- unit: `l`
- sku: `None`
- gtin: `None`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### `pack_coror_rapid_primer_2_5l`
- amount: `2.5`
- unit: `l`
- sku: `None`
- gtin: `None`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### `pack_coror_rapid_primer_4_5l`
- amount: `4.5`
- unit: `l`
- sku: `None`
- gtin: `None`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

#### `pack_coror_rapid_primer_20l`
- amount: `20`
- unit: `l`
- sku: `None`
- gtin: `None`
- sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
- verifiedAt: `2026-10-06`
- status: `verified`

### RELATIONS (Surface / Technology / dilutedWith / compatibleWith / partOfSystem / hasProduct)

- `pf_coror_rapid` --**hasProduct**--> `prod_coror_rapid_primer`
  - id: `rel_pf_coror_rapid_prod_coror_rapid_primer`
  - description/metadata: None
  - sourceIds: `['src_coror_rapid_primer']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_rapid_primer` --**applicableToSurface**--> `surface_acel`
  - id: `rel_prod_coror_rapid_primer_applicableToSurface_surface_acel`
  - description/metadata: None
  - sourceIds: `['src_coror_rapid_primer']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_rapid_primer` --**applicableToSurface**--> `surface_aluminium`
  - id: `rel_prod_coror_rapid_primer_applicableToSurface_surface_aluminium`
  - description/metadata: None
  - sourceIds: `['src_coror_rapid_primer']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_rapid_primer` --**applicableToSurface**--> `surface_horganyzott_acel`
  - id: `rel_prod_coror_rapid_primer_applicableToSurface_surface_horganyzott_acel`
  - description/metadata: None
  - sourceIds: `['src_coror_rapid_primer']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_rapid_primer` --**applicableToSurface**--> `surface_rez`
  - id: `rel_prod_coror_rapid_primer_applicableToSurface_surface_rez`
  - description/metadata: None
  - sourceIds: `['src_coror_rapid_primer']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_rapid_primer` --**partOfSystem**--> `prod_coror_rapid_enamel`
  - id: `rel_prod_coror_rapid_primer_partOfSystem_prod_coror_rapid_enamel`
  - description/metadata: None
  - sourceIds: `['src_coror_rapid_primer']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_aromatic` --**compatibleWith**--> `prod_coror_rapid_primer`
  - id: `rel_prod_coror_aromatic_compatibleWith_prod_coror_rapid_primer`
  - description/metadata: None
  - sourceIds: `['src_coror_aromatic']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_rapid_primer` --**dilutedWith**--> `prod_coror_aromatic`
  - id: `rel_prod_coror_rapid_primer_dilutedWith_prod_coror_aromatic`
  - description/metadata: TDS/page: hígítás elsősorban COROR Aromás Hígítóval (és Szintetikus Hígítóval)
  - sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
  - verifiedAt: `2026-10-06`
  - status: `active`
- `prod_coror_rapid_primer` --**dilutedWith**--> `prod_coror_synthetic`
  - id: `rel_prod_coror_rapid_primer_dilutedWith_prod_coror_synthetic`
  - description/metadata: TDS/page: hígítás elsősorban COROR Szintetikus Hígítóval (és Aromás Hígítóval)
  - sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
  - verifiedAt: `2026-10-06`
  - status: `active`
- `prod_coror_rapid_primer` --**usesTechnology**--> `tech_ecset`
  - id: `rel_prod_coror_rapid_primer_usesTechnology_tech_ecset`
  - description/metadata: Page/TDS: könnyen ecsetelhető
  - sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
  - verifiedAt: `2026-10-06`
  - status: `active`
- `prod_coror_rapid_primer` --**usesTechnology**--> `tech_szoras`
  - id: `rel_prod_coror_rapid_primer_usesTechnology_tech_szoras`
  - description/metadata: Page/TDS: jól szórható
  - sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
  - verifiedAt: `2026-10-06`
  - status: `active`

## C) COROR Aromás Hígító

### PRODUCT

- **id:** `prod_coror_aromatic`
- **exact name:** COROR Aromás Hígító
- **family:** *(none — no ProductFamily hasProduct edge)*
- **brand:** COROR (`brand_coror`)
- **productClass:** `thinner`
- **officialUrl:** https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-aromas-higito-p-335
- **Product.sourceIds:** `['src_coror_aromatic']`

### SOURCES (from Product.sourceIds)

#### `src_coror_aromatic`
- documentKind: `product_page`
- title: COROR Aromás Hígító — hivatalos termékoldal
- url: https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-aromas-higito-p-335
- publishedAt: *(empty)*
- accessedAt: 2026-10-06

### SOURCE SUMMARY

- **sourceSummary:**

> COROR Aromás Hígító nagy tisztaságú, vízmentes aromás szénhidrogén hígító. A hivatalos termékoldal szerint a COROR Rapid Korróziógátló Alapozó és más megnevezett termékek felhordási konzisztenciájának beállítására szolgál; zsírtalanításra és szerszámtisztításra is.

- **sourceSummarySourceIds:** `['src_coror_aromatic']`

### SPECIFICATIONS

#### Spec 1: `binder`
- normalized value:
```json
{
  "kind": "text",
  "text": "aromás szénhidrogének keveréke"
}
```
- condition:
```json
null
```
- rawValue: `Összetétel: aromás szénhidrogének keveréke`
- sourceIds: `['src_coror_aromatic']`
- verifiedAt: `2026-10-06`
- status: `verified`

### PACKAGING

*(none)*

### RELATIONS (Surface / Technology / dilutedWith / compatibleWith / partOfSystem / hasProduct)

- `brand_coror` --**hasProduct**--> `prod_coror_aromatic`
  - id: `rel_brand_coror_prod_coror_aromatic`
  - description/metadata: None
  - sourceIds: `['src_coror_aromatic']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_aromatic` --**compatibleWith**--> `prod_coror_rapid_primer`
  - id: `rel_prod_coror_aromatic_compatibleWith_prod_coror_rapid_primer`
  - description/metadata: None
  - sourceIds: `['src_coror_aromatic']`
  - verifiedAt: `2026-10-05`
  - status: `active`
- `prod_coror_rapid_primer` --**dilutedWith**--> `prod_coror_aromatic`
  - id: `rel_prod_coror_rapid_primer_dilutedWith_prod_coror_aromatic`
  - description/metadata: TDS/page: hígítás elsősorban COROR Aromás Hígítóval (és Szintetikus Hígítóval)
  - sourceIds: `['src_coror_rapid_primer_tds', 'src_coror_rapid_primer']`
  - verifiedAt: `2026-10-06`
  - status: `active`

---

# 2. dilutedWith audit (all 6 edges)

## `prod_coror_rapid_enamel` → `prod_coror_synthetic`
- FROM PRODUCT: COROR Rapid Zománcfesték (`prod_coror_rapid_enamel`)
- TO PRODUCT: COROR Szintetikus Hígító (`prod_coror_synthetic`)
- relation description (stored): TDS/page: hígítás elsősorban COROR Szintetikus Hígítóval
- SOURCE ID: `src_coror_rapid_enamel_tds`
  - documentKind: `tds`
  - URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=332&type=datasheet
  - title: COROR Rapid Zománcfesték — műszaki adatlap
- SOURCE ID: `src_coror_rapid_enamel`
  - documentKind: `product_page`
  - URL: https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-zomancfestek-p-332
  - title: COROR Rapid Zománcfesték — hivatalos termékoldal

**EXACT SUPPORTING SOURCE TEXT:**

```
Elsősorban Coror Szintetikus Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.
```

## `prod_coror_rapid_primer` → `prod_coror_aromatic`
- FROM PRODUCT: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- TO PRODUCT: COROR Aromás Hígító (`prod_coror_aromatic`)
- relation description (stored): TDS/page: hígítás elsősorban COROR Aromás Hígítóval (és Szintetikus Hígítóval)
- SOURCE ID: `src_coror_rapid_primer_tds`
  - documentKind: `tds`
  - URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet
  - title: COROR Rapid Korróziógátló Alapozó — műszaki adatlap
- SOURCE ID: `src_coror_rapid_primer`
  - documentKind: `product_page`
  - URL: https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-korroziogatlo-alapozo-p-331
  - title: COROR Rapid Korróziógátló Alapozó — hivatalos termékoldal

**EXACT SUPPORTING SOURCE TEXT:**

```
Elsősorban Coror Szintetikus és Aromás Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.
```

## `prod_coror_rapid_primer` → `prod_coror_synthetic`
- FROM PRODUCT: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- TO PRODUCT: COROR Szintetikus Hígító (`prod_coror_synthetic`)
- relation description (stored): TDS/page: hígítás elsősorban COROR Szintetikus Hígítóval (és Aromás Hígítóval)
- SOURCE ID: `src_coror_rapid_primer_tds`
  - documentKind: `tds`
  - URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet
  - title: COROR Rapid Korróziógátló Alapozó — műszaki adatlap
- SOURCE ID: `src_coror_rapid_primer`
  - documentKind: `product_page`
  - URL: https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-korroziogatlo-alapozo-p-331
  - title: COROR Rapid Korróziógátló Alapozó — hivatalos termékoldal

**EXACT SUPPORTING SOURCE TEXT:**

```
Elsősorban Coror Szintetikus és Aromás Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.
```

## `prod_factor_boat` → `prod_coror_synthetic`
- FROM PRODUCT: FACTOR Csónaklakk (`prod_factor_boat`)
- TO PRODUCT: COROR Szintetikus Hígító (`prod_coror_synthetic`)
- relation description (stored): TDS: hígítás / tisztítás COROR Szintetikus Hígítóval
- SOURCE ID: `src_factor_boat_tds`
  - documentKind: `tds`
  - URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=343&type=datasheet
  - title: FACTOR Csónaklakk — műszaki adatlap
- SOURCE ID: `src_factor_boat`
  - documentKind: `product_page`
  - URL: https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-csonaklakk-p-343
  - title: FACTOR Csónaklakk — hivatalos termékoldal

**EXACT SUPPORTING SOURCE TEXT:**

```
Hígítás, szerszámtisztítás közvetlen használat után: Coror Szintetikus Hígítóval
… Alapozó rétegként használjuk a FACTOR Csónaklakk 3:1 arányban Coror Szintetikus Hígítóval készült elegyét. … Az optimális felhordási konzisztencia eléréséhez használhatunk kb. 5% mértékben hígítót.
```

## `prod_factor_parquet` → `prod_coror_synthetic`
- FROM PRODUCT: FACTOR Parkettalakk (`prod_factor_parquet`)
- TO PRODUCT: COROR Szintetikus Hígító (`prod_coror_synthetic`)
- relation description (stored): TDS: hígítás / szerszámtisztítás COROR Szintetikus Hígítóval
- SOURCE ID: `src_factor_parquet_tds`
  - documentKind: `tds`
  - URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=329&type=datasheet
  - title: FACTOR Parkettalakk — műszaki adatlap
- SOURCE ID: `src_factor_parquet`
  - documentKind: `product_page`
  - URL: https://www.festekbazis.hu/hu/termekeink/factor-a-fara-factor-parkettalakk-p-329
  - title: FACTOR Parkettalakk — hivatalos termékoldal

**EXACT SUPPORTING SOURCE TEXT:**

```
Hígítás, szerszámtisztítás közvetlen használat után: Coror Szintetikus Hígítóval
Szerszámtisztítás közvetlen használat után Coror Szintetikus Hígítóval
```

## `prod_valmor_garage` → `prod_coror_synthetic`
- FROM PRODUCT: VALMOR Garázsfesték (`prod_valmor_garage`)
- TO PRODUCT: COROR Szintetikus Hígító (`prod_coror_synthetic`)
- relation description (stored): TDS: hígítás / szerszámtisztítás COROR Szintetikus Hígítóval
- SOURCE ID: `src_valmor_garage_tds`
  - documentKind: `tds`
  - URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=305&type=datasheet
  - title: VALMOR Garázsfesték — műszaki adatlap
- SOURCE ID: `src_valmor_garage`
  - documentKind: `product_page`
  - URL: https://www.festekbazis.hu/hu/termekeink/valmor-a-falra-valmor-garazsfestek-p-305
  - title: VALMOR Garázsfesték — hivatalos termékoldal

**EXACT SUPPORTING SOURCE TEXT:**

```
Hígítás, szerszámtisztítás közvetlen használat után: Coror Szintetikus Hígítóval
… A nedvszívó felületek alapozását 20% Coror Szintetikus Hígító hozzáadásával és intenzív ecsetelésével végezzük!
```

---

# 3. Deterministic spec/packaging audit sample (30 items)

Selection rule: products sorted by id ascending; first occurrence per product per key until 5 items each.

## Sample key: `coverage`

### Audit item 1
- Product: 7016™ Antracit Egyrétegű Beltéri Falfesték (`prod_7016_wall`)
- Field/key: `coverage`
- Normalized value:
```json
{
  "kind": "range_unit",
  "min": 10,
  "max": 11,
  "unit": "m2_per_l"
}
```
- Condition:
```json
{
  "note": "glettelt minőségű felület esetén"
}
```
- Raw value: `Kiadósság: 10-11 m2/liter, glettelt minőségű felület esetén`
- Source ID: `src_7016_wall_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=340&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Kiadósság: 10-11 m2/liter, glettelt minőségű felület esetén
```

### Audit item 2
- Product: COROR Rapid Zománcfesték (`prod_coror_rapid_enamel`)
- Field/key: `coverage`
- Normalized value:
```json
{
  "kind": "range_unit",
  "min": 9,
  "max": 11,
  "unit": "m2_per_l"
}
```
- Condition:
```json
{
  "basis": "per_coat"
}
```
- Raw value: `Kiadósság: 9-11 m2/liter egy rétegben`
- Source ID: `src_coror_rapid_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=332&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Kiadósság: 9-11 m2/liter egy rétegben
```

### Audit item 3
- Product: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- Field/key: `coverage`
- Normalized value:
```json
{
  "kind": "range_unit",
  "min": 12,
  "max": 13,
  "unit": "m2_per_l"
}
```
- Condition:
```json
{
  "note": "40 μm száraz rétegvastagság esetén"
}
```
- Raw value: `Kiadósság: 12-13 m2/liter 40 μm száraz rétegvastagság esetén`
- Source ID: `src_coror_rapid_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Kiadósság: 12-13 m2/liter 40 μm száraz rétegvastagság esetén
```

### Audit item 4
- Product: COROR Rapid Festéklemaró (`prod_coror_rapid_stripper`)
- Field/key: `coverage`
- Normalized value:
```json
{
  "kind": "range_unit",
  "min": 5,
  "max": 10,
  "unit": "m2_per_l"
}
```
- Condition:
```json
{
  "note": "eltávolítandó festék fajtája és rétegszámai befolyásolhatják"
}
```
- Raw value: `Kiadósság: 5-10 m2/liter`
- Source ID: `src_coror_rapid_stripper`
- Source URL: https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-rapid-festeklemaro-p-333

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Kiadósság: 5-10 m2/liter
```

### Audit item 5
- Product: FACTOR Aqua Parkettalakk (`prod_factor_aqua_parquet`)
- Field/key: `coverage`
- Normalized value:
```json
{
  "kind": "range_unit",
  "min": 10,
  "max": 12,
  "unit": "m2_per_l"
}
```
- Condition:
```json
{
  "basis": "per_coat"
}
```
- Raw value: `Kiadósság: 10-12 m2/liter egy rétegben`
- Source ID: `src_factor_aqua_parquet_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=328&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Kiadósság: 10-12 m2/liter egy rétegben
```

## Sample key: `recoat_time`

### Audit item 6
- Product: 7016™ Antracit Egyrétegű Beltéri Falfesték (`prod_7016_wall`)
- Field/key: `recoat_time`
- Normalized value:
```json
{
  "kind": "duration",
  "value": 4,
  "unit": "h"
}
```
- Condition:
```json
{
  "temperatureC": 25
}
```
- Raw value: `Átfesthetőségi idő: (25 °C–on): 4 óra`
- Source ID: `src_7016_wall_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=340&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Átfesthetőségi idő: (25 °C–on): 4 óra
```

### Audit item 7
- Product: COROR Industry Ipari Zománc (`prod_coror_ind_enamel`)
- Field/key: `recoat_time`
- Normalized value:
```json
{
  "kind": "duration",
  "value": 0.5,
  "unit": "h"
}
```
- Condition:
```json
{
  "temperatureC": 25
}
```
- Raw value: `Átfesthetőség: 25 Celsius fokon 0,5 óra`
- Source ID: `src_coror_ind_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Átfesthetőség: 25 Celsius fokon 0,5 óra
```

### Audit item 8
- Product: COROR Industry Korróziógátló Alapozó (`prod_coror_ind_primer`)
- Field/key: `recoat_time`
- Normalized value:
```json
{
  "kind": "duration_range",
  "min": 12,
  "max": 30,
  "unit": "min"
}
```
- Condition:
```json
{
  "note": "hőmérséklet- és páratartalom-függő"
}
```
- Raw value: `rétegek között 12-30 perc száradási idő`
- Source ID: `src_coror_ind_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=442&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
rétegek között 12-30 perc száradási idő
```

### Audit item 9
- Product: COROR Rapid Zománcfesték (`prod_coror_rapid_enamel`)
- Field/key: `recoat_time`
- Normalized value:
```json
{
  "kind": "duration",
  "value": 2,
  "unit": "h"
}
```
- Condition:
```json
{
  "temperatureC": 25,
  "note": "önmagával; „száraz”"
}
```
- Raw value: `2 óra száraz / átfesthetőség önmagával (25 °C)`
- Source ID: `src_coror_rapid_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=332&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
2 óra száraz / átfesthetőség önmagával (25 °C)
```

### Audit item 10
- Product: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- Field/key: `recoat_time`
- Normalized value:
```json
{
  "kind": "duration",
  "value": 2,
  "unit": "h"
}
```
- Condition:
```json
{
  "temperatureC": 25,
  "note": "önmagával; Szintetikus/Aromás hígítóval vagy hígítás nélkül; „száraz”"
}
```
- Raw value: `2 óra – száraz (átfesthetőség önmagával, 25 °C)`
- Source ID: `src_coror_rapid_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
2 óra – száraz (átfesthetőség önmagával, 25 °C)
```

## Sample key: `dilution`

### Audit item 11
- Product: 7016™ Antracit Egyrétegű Beltéri Falfesték (`prod_7016_wall`)
- Field/key: `dilution`
- Normalized value:
```json
{
  "kind": "percentage",
  "value": 10
}
```
- Condition:
```json
{
  "note": "első réteg; maximum; víz"
}
```
- Raw value: `hígításképpen maximum 10%-ban vizet adhatunk hozzá`
- Source ID: `src_7016_wall_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=340&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
hígításképpen maximum 10%-ban vizet adhatunk hozzá
```

### Audit item 12
- Product: COROR Industry Ipari Zománc (`prod_coror_ind_enamel`)
- Field/key: `dilution`
- Normalized value:
```json
{
  "kind": "text",
  "text": "COROR Industry S-31 Hígítóval (felhordási konzisztenciára)"
}
```
- Condition:
```json
null
```
- Raw value: `Hígítás: COROR INDUSTRY S-31 Hígítóval`
- Source ID: `src_coror_ind_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Hígítás: COROR INDUSTRY S-31 Hígítóval
```

### Audit item 13
- Product: COROR Industry Korróziógátló Alapozó (`prod_coror_ind_primer`)
- Field/key: `dilution`
- Normalized value:
```json
{
  "kind": "text",
  "text": "COROR Industry S-31 Hígítóval"
}
```
- Condition:
```json
null
```
- Raw value: `Hígítás: COROR INDUSTRY S-31 Hígítóval`
- Source ID: `src_coror_ind_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=442&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Hígítás: COROR INDUSTRY S-31 Hígítóval
```

### Audit item 14
- Product: COROR Rapid Zománcfesték (`prod_coror_rapid_enamel`)
- Field/key: `dilution`
- Normalized value:
```json
{
  "kind": "text",
  "text": "COROR Szintetikus Hígító; alternatíva: lakkbenzin, nitrohígító"
}
```
- Condition:
```json
null
```
- Raw value: `Elsősorban Coror Szintetikus Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.`
- Source ID: `src_coror_rapid_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=332&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Elsősorban Coror Szintetikus Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.
```

### Audit item 15
- Product: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- Field/key: `dilution`
- Normalized value:
```json
{
  "kind": "text",
  "text": "COROR Szintetikus vagy Aromás Hígító; alternatíva: lakkbenzin, nitrohígító"
}
```
- Condition:
```json
null
```
- Raw value: `Elsősorban Coror Szintetikus és Aromás Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.`
- Source ID: `src_coror_rapid_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Elsősorban Coror Szintetikus és Aromás Hígítóval, vagy megfelelő minőségű lakkbenzinnel, nitrohígítóval.
```

## Sample key: `gloss`

### Audit item 16
- Product: 7016™ Antracit Egyrétegű Beltéri Falfesték (`prod_7016_wall`)
- Field/key: `gloss`
- Normalized value:
```json
{
  "kind": "enum",
  "value": "matt"
}
```
- Condition:
```json
null
```
- Raw value: `Matt (termékoldal tulajdonság)`
- Source ID: `src_7016_wall`
- Source URL: https://www.festekbazis.hu/hu/webaruhaz-7016-7016-antracit-egyretegu-belteri-falfestek-p-340

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Matt (termékoldal tulajdonság)
```

### Audit item 17
- Product: COROR Industry Ipari Zománc (`prod_coror_ind_enamel`)
- Field/key: `gloss`
- Normalized value:
```json
{
  "kind": "enum",
  "value": "satin"
}
```
- Condition:
```json
null
```
- Raw value: `Fényesség: selyemfényű`
- Source ID: `src_coror_ind_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Fényesség: selyemfényű
```

### Audit item 18
- Product: COROR Industry Korróziógátló Alapozó (`prod_coror_ind_primer`)
- Field/key: `gloss`
- Normalized value:
```json
{
  "kind": "enum",
  "value": "matt"
}
```
- Condition:
```json
null
```
- Raw value: `Fényesség: matt`
- Source ID: `src_coror_ind_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=442&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Fényesség: matt
```

### Audit item 19
- Product: COROR Rapid Zománcfesték (`prod_coror_rapid_enamel`)
- Field/key: `gloss`
- Normalized value:
```json
{
  "kind": "enum",
  "value": "satin"
}
```
- Condition:
```json
null
```
- Raw value: `Fényesség: selyemfényű`
- Source ID: `src_coror_rapid_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=332&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Fényesség: selyemfényű
```

### Audit item 20
- Product: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- Field/key: `gloss`
- Normalized value:
```json
{
  "kind": "enum",
  "value": "matt"
}
```
- Condition:
```json
null
```
- Raw value: `Fényesség: matt`
- Source ID: `src_coror_rapid_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Fényesség: matt
```

## Sample key: `binder`

### Audit item 21
- Product: COROR Aromás Hígító (`prod_coror_aromatic`)
- Field/key: `binder`
- Normalized value:
```json
{
  "kind": "text",
  "text": "aromás szénhidrogének keveréke"
}
```
- Condition:
```json
null
```
- Raw value: `Összetétel: aromás szénhidrogének keveréke`
- Source ID: `src_coror_aromatic`
- Source URL: https://www.festekbazis.hu/hu/termekeink/coror-a-femre-coror-aromas-higito-p-335

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Összetétel: aromás szénhidrogének keveréke
```

### Audit item 22
- Product: COROR Industry Ipari Zománc (`prod_coror_ind_enamel`)
- Field/key: `binder`
- Normalized value:
```json
{
  "kind": "text",
  "text": "módosított poliészter"
}
```
- Condition:
```json
null
```
- Raw value: `Összetétel: módosított poliészter`
- Source ID: `src_coror_ind_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Összetétel: módosított poliészter
```

### Audit item 23
- Product: COROR Rapid Zománcfesték (`prod_coror_rapid_enamel`)
- Field/key: `binder`
- Normalized value:
```json
{
  "kind": "text",
  "text": "uretánizált alkid"
}
```
- Condition:
```json
null
```
- Raw value: `Uretanizált alkid kötőanyagának köszönhetően…`
- Source ID: `src_coror_rapid_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=332&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Uretanizált alkid kötőanyagának köszönhetően…
```

### Audit item 24
- Product: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- Field/key: `binder`
- Normalized value:
```json
{
  "kind": "text",
  "text": "uretánizált alkid"
}
```
- Condition:
```json
null
```
- Raw value: `Uretanizált alkid kötőanyagának köszönhetően… Összetétel: Alkidgyanta…`
- Source ID: `src_coror_rapid_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
Uretanizált alkid kötőanyagának köszönhetően… Összetétel: Alkidgyanta…
```

### Audit item 25
- Product: FACTOR Aqua Parkettalakk (`prod_factor_aqua_parquet`)
- Field/key: `binder`
- Normalized value:
```json
{
  "kind": "text",
  "text": "poliuretán és akrilgyanta"
}
```
- Condition:
```json
null
```
- Raw value: `polyuretan és akrilgyanta bázisú`
- Source ID: `src_factor_aqua_parquet_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=328&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
polyuretan és akrilgyanta bázisú
```

## Sample key: `packaging`

### Audit item 26
- Product: 7016™ Antracit Egyrétegű Beltéri Falfesték (`prod_7016_wall`)
- Field/key: `packaging`
- Normalized value:
```json
{
  "id": "pack_7016_wall_1l",
  "amount": 1,
  "unit": "l",
  "sku": null,
  "gtin": null
}
```
- Condition:
```json
null
```
- Raw value: `1 l`
- Source ID: `src_7016_wall_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=340&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
1 l
```

### Audit item 27
- Product: COROR Industry Ipari Zománc (`prod_coror_ind_enamel`)
- Field/key: `packaging`
- Normalized value:
```json
{
  "id": "pack_coror_ind_enamel_5_1kg",
  "amount": 5.1,
  "unit": "kg",
  "sku": null,
  "gtin": null
}
```
- Condition:
```json
null
```
- Raw value: `5.1 kg`
- Source ID: `src_coror_ind_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
5.1 kg
```

### Audit item 28
- Product: COROR Industry Korróziógátló Alapozó (`prod_coror_ind_primer`)
- Field/key: `packaging`
- Normalized value:
```json
{
  "id": "pack_coror_ind_primer_7kg",
  "amount": 7,
  "unit": "kg",
  "sku": null,
  "gtin": null
}
```
- Condition:
```json
null
```
- Raw value: `7 kg`
- Source ID: `src_coror_ind_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=442&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
7 kg
```

### Audit item 29
- Product: COROR Rapid Zománcfesték (`prod_coror_rapid_enamel`)
- Field/key: `packaging`
- Normalized value:
```json
{
  "id": "pack_coror_rapid_enamel_0_25l",
  "amount": 0.25,
  "unit": "l",
  "sku": null,
  "gtin": null
}
```
- Condition:
```json
null
```
- Raw value: `0.25 l`
- Source ID: `src_coror_rapid_enamel_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=332&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
0.25 l
```

### Audit item 30
- Product: COROR Rapid Korróziógátló Alapozó (`prod_coror_rapid_primer`)
- Field/key: `packaging`
- Normalized value:
```json
{
  "id": "pack_coror_rapid_primer_0_25l",
  "amount": 0.25,
  "unit": "l",
  "sku": null,
  "gtin": null
}
```
- Condition:
```json
null
```
- Raw value: `0.25 l`
- Source ID: `src_coror_rapid_primer_tds`
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=331&type=datasheet

**EXACT SUPPORTING SOURCE TEXT** (stored `rawValue` / packaging amount as recorded from official source):

```
0.25 l
```

---

# 4. Conflict audit (Phase 3 reported)

## VALMOR Univerzális Mélyalapozó (prod_valmor_deep_primer) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=313&type=datasheet
- Exact source text A:
```
Kiszerelés: 1 l, 5 l, 10 l
```
- Normalized interpretation A: packaging options 1 l, 5 l, 10 l
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=313&type=datasheet
- Exact source text B:
```
Csomagolás: 1 l, 5 literes műanyag flakonban és kannában.
```
- Normalized interpretation B: packaging options 1 l, 5 l (no 10 l)
- Current stored production value: verified: 1 l, 5 l only (10 l not stored)
- Current status: UNRESOLVED conflict — intersection stored
- Why that value was or was not stored: Same TDS document lists different packaging sets in Kiszerelés vs Csomagolás. Only sizes present in both interpretations as safe intersection were stored as verified.

## VALMOR Garázsfesték (prod_valmor_garage) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=305&type=datasheet
- Exact source text A:
```
Kiszerelés: 0.75 l, 2.5 l, 5 l, 20 l
```
- Normalized interpretation A: 0.75 / 2.5 / 5 / 20 l
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=305&type=datasheet
- Exact source text B:
```
Csomagolás: 0,75 l, 2,5 l fémdobozban
```
- Normalized interpretation B: 0.75 / 2.5 l
- Current stored production value: verified: 0.75 l, 2.5 l only
- Current status: UNRESOLVED — 5 l and 20 l not stored
- Why that value was or was not stored: Intra-TDS conflict Kiszerelés vs Csomagolás; only intersection verified.

## VALMOR Flexibilis Padlóbevonat (prod_valmor_floor) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=302&type=datasheet
- Exact source text A:
```
Kiszerelés: 0.9 l, 1 l, 4 l, 8 l
```
- Normalized interpretation A: 0.9 / 1 / 4 / 8 l
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=302&type=datasheet
- Exact source text B:
```
Csomagolás: 1 l, 4 l, 8 l műanyag dobozban
```
- Normalized interpretation B: 1 / 4 / 8 l
- Current stored production value: verified: 1 l, 4 l, 8 l
- Current status: UNRESOLVED — 0.9 l not stored
- Why that value was or was not stored: Intra-TDS conflict; intersection stored.

## VALMOR Időjárásálló és Szigetelőfesték (prod_valmor_weather) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=311&type=datasheet
- Exact source text A:
```
Kiszerelés: 0.9 l, 1 l, 4 l, 8 l
```
- Normalized interpretation A: 0.9 / 1 / 4 / 8 l
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=311&type=datasheet
- Exact source text B:
```
Csomagolás: 1 l, 4 l, 8 l műanyag dobozban
```
- Normalized interpretation B: 1 / 4 / 8 l
- Current stored production value: verified: 1 l, 4 l, 8 l
- Current status: UNRESOLVED — 0.9 l not stored
- Why that value was or was not stored: Intra-TDS conflict; intersection stored.

## VALMOR Vakolat (prod_valmor_plaster) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=318&type=datasheet
- Exact source text A:
```
Kiszerelés: 25 kg
```
- Normalized interpretation A: 25 kg packaging option
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=318&type=datasheet
- Exact source text B:
```
Csomagolás: 18 literes műanyag dobozban
```
- Normalized interpretation B: 18 l packaging option
- Current stored production value: no packaging options stored (0)
- Current status: UNRESOLVED — nothing verified
- Why that value was or was not stored: Unit and amount conflict (kg vs liter / 25 vs 18). No packaging published as verified.

## FACTOR Pergola Kültéri Fafesték (prod_factor_pergola) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=323&type=datasheet
- Exact source text A:
```
Kiszerelés: 0.75 l, 0.9 l, 1 l, 2.25 l, 2.5 l, 9 l, 10 l
```
- Normalized interpretation A: wide packaging list
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=323&type=datasheet
- Exact source text B:
```
Csomagolás: 0,75 liter; 2,5 liter; 10 liter
```
- Normalized interpretation B: 0.75 / 2.5 / 10 l
- Current stored production value: verified: 0.75 l, 2.5 l, 10 l
- Current status: UNRESOLVED — other Kiszerelés sizes not stored
- Why that value was or was not stored: Intra-TDS conflict; intersection with Csomagolás stored.

## FACTOR Aqua Parkettalakk (prod_factor_aqua_parquet) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=328&type=datasheet
- Exact source text A:
```
Kiszerelés: 0.25 l, 0.75 l, 2.5 l, 20 l
```
- Normalized interpretation A: 0.25 / 0.75 / 2.5 / 20 l
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=328&type=datasheet
- Exact source text B:
```
Csomagolás: 0,75 l, 2,5, 20 literes fémdobozban
```
- Normalized interpretation B: 0.75 / 2.5 / 20 l
- Current stored production value: verified: 0.75 l, 2.5 l, 20 l
- Current status: UNRESOLVED — 0.25 l not stored
- Why that value was or was not stored: Intra-TDS conflict; intersection stored.

## FACTOR Parkettalakk (prod_factor_parquet) — packaging
- Field: `packaging`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=329&type=datasheet
- Exact source text A:
```
Kiszerelés: 0.75 l, 2.5 l, 5 l
```
- Normalized interpretation A: 0.75 / 2.5 / 5 l
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=329&type=datasheet
- Exact source text B:
```
Csomagolás: 0,75 l, 2,5 l, 5 l és 20 literes fémdobozban
```
- Normalized interpretation B: 0.75 / 2.5 / 5 / 20 l
- Current stored production value: verified: 0.75 l, 2.5 l, 5 l
- Current status: UNRESOLVED — 20 l not stored
- Why that value was or was not stored: Intra-TDS conflict; sizes present in both lists stored (20 l only in Csomagolás).

## COROR Industry Ipari Zománc (prod_coror_ind_enamel) — binder
- Field: `binder`
- Source A URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet
- Exact source text A:
```
A COROR INDUSTRY Ipari Zománc egy módosított alkid-akril bázisú, gyorsan száradó…
```
- Normalized interpretation A: binder text: módosított alkid-akril
- Source B URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet
- Exact source text B:
```
Összetétel: módosított poliészter
```
- Normalized interpretation B: binder text: módosított poliészter
- Current stored production value: verified binder = { kind: text, text: "módosított poliészter" } from Összetétel line
- Current status: UNRESOLVED wording conflict within same TDS
- Why that value was or was not stored: Application paragraph and Összetétel line disagree. Összetétel preferred for binder fact; conflict documented, not silently merged.

---

# 5. Data model gap / review audit

## VALMOR Flexibilis Padlóbevonat (prod_valmor_floor)
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=302&type=datasheet
- Exact source text:
```
Kiadósság: ~3 m2/liter alapozás + két réteg, glettelt minőségű felület esetén
```
- Current representation: coverage number_unit value=3 unit=m2_per_l + condition.note "kb. (~); alapozás + két réteg; glettelt"
- Why gap/review: DATA MODEL GAP / approximate: model has no first-class approximate flag; tilde semantics only in condition.note.

## COROR Industry Ipari Zománc (prod_coror_ind_enamel)
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=444&type=datasheet
- Exact source text:
```
Kiadósság: 20-25g/m2/10mikron száraz, színtől függően
```
- Current representation: consumption range_unit 20–25 g_per_m2 + condition.note "10 µm száraz rétegvastagság; színtől függően"
- Why gap/review: DATA MODEL GAP: consumption tied to film thickness not a first-class dimension; thickness only in condition.note.

## VALMOR Flexibilis Padlóbevonat (prod_valmor_floor)
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=302&type=datasheet
- Exact source text:
```
Javasolt rétegvastagság: Járófelület esetén 330 mikron nedves rétegvastagság
```
- Current representation: NOT STORED as ProductSpecification
- Why gap/review: DATA MODEL GAP / review: wet film thickness (µm wet) not loaded; would need um + wet/dry film semantics.

## VALMOR Univerzális Mélyalapozó (prod_valmor_deep_primer) (+ related ratio dilutions on Plinth/Weather)
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=313&type=datasheet
- Exact source text:
```
1:1, 1:4 koncentrátum, 1:8 eszencia … Homlokzatok… 1:3 rész víz… 1:2 arányú hígítást… 1:6 rész víz… 1:4 arányú hígítást…
```
- Current representation: dilution kind=text: "vízzel, felülettől és változattól függő arányban (1:1 / 1:4 / 1:8)"
- Why gap/review: DATA MODEL GAP: no structured dilution-ratio value kind; stored as free text.

## COROR Industry Korróziógátló Alapozó (prod_coror_ind_primer)
- Source URL: https://www.festekbazis.hu/tools/packages/etalon_gyartas/print?invoiceId=442&type=datasheet
- Exact source text:
```
Teljes száradási idő: 4. fokozat max. 50 perc *A levegő páratartalma és hőmérséklete befolyásolhatja
```
- Current representation: NOT STORED as dust_dry_time / touch_dry_time / full_cure_time
- Why gap/review: REVIEW REQUIRED / AMBIGUOUS DRYING TERM: FB grade 4 is not clearly mapped to canonical keys; not forced into full_cure_time.

---

# 6. Source coverage (overlay enrichment sources)

- Overlay Source count: **52**
- Duplicate URL count: **0**
- Unreachable/failed source count: **not stored** in Phase 3 dataset (`not stored in Phase 3 dataset`)
- Sources not referenced on any Product.sourceIds / fact / relation / summary: **0** → `[]`
- Sources never used by fact/relation/summary (may still be on Product.sourceIds): **1** → `['src_valmor_airflow_interior_sds']`

Note: `src_valmor_airflow_interior_sds` is on Product.sourceIds / additionalSourceIds but no specification/relation/summary cites it as fact provenance.

---

# 7. Assertions

- Product count = **27** ✓
- Indexable Product count = **0** ✓
- Specification count = **205** ✓
- Packaging count = **68** ✓
- Source count = **52** ✓
- dilutedWith count = **6** ✓

All listed assertions match live repository.

---

# STOP

QA export complete. No production files modified.