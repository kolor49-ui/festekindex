/**
 * FESTÉK BÁZIS 53-Product Color Audit v1 — classification only.
 * Decisions: NONE | GENERIC | SPECIFIC | UNRESOLVED
 */

export type ColorAuditDecision = "NONE" | "GENERIC" | "SPECIFIC" | "UNRESOLVED";

export type FestekBazisColorAuditRecord = {
  productId: string;
  invoiceId: string;
  decision: ColorAuditDecision;
  officialPaletteExcerpt?: string | null;
  officialTintExcerpt?: string | null;
  specificColorCount: number;
  hasGenericStatement: boolean;
  evidence: string;
};

export const festekBazisColorAuditV1: FestekBazisColorAuditRecord[] = [
  {
    "productId": "prod_valmor_airflow_interior",
    "invoiceId": "319",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 1% pasztamennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=319) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_airflow_primer",
    "invoiceId": "322",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=322) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_airflow_facade",
    "invoiceId": "437",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Lábazatfesték fehér, Lábazatfesték barna, Lábazatfesték középbarna, Lábazatfesték vörös, Lábazatfesték szürke, Lábazatfesték antracit, Lábazatfesték terrakotta, Lábazatfesték zöld",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 3% pasztamennyiséggel",
    "specificColorCount": 8,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=437) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_airflow_salt",
    "invoiceId": "354",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Lúgálló porpigmentekkel 1% erejéig",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=354) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_xclusive",
    "invoiceId": "467",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 3-5% pasztamennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=467) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_kontrol",
    "invoiceId": "315",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen, fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 5% pasztamennyiséggel",
    "specificColorCount": 2,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=315) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_deep_primer",
    "invoiceId": "313",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen 1:1, színtelen 1:4, színtelen 1:8",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=313) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_facade",
    "invoiceId": "317",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Gépi és kézi pasztákkal, fehér esetén max. 3-5% pasztamennyiséggel.",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=317) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_plinth",
    "invoiceId": "303",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Lábazatfesték antracit, Lábazatfesték barna, Lábazatfesték fehér, Lábazatfesték középbarna, Lábazatfesték szürke, Lábazatfesték terrakotta, Lábazatfesték vörös, Lábazatfesték zöld, TR bázis, egyedi szín, Lábazatfesték bazaltszürke",
    "officialTintExcerpt": "gépi és kézi pasztákkal, maximum 3% pasztamennyiséggel.",
    "specificColorCount": 10,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=303) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_textured",
    "invoiceId": "304",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Szemcsés zöld, Szemcsés vörös, Szemcsés fehér, egyedi szín, Szemcsés szürke, Szemcsés antracit, Szemcsés középbarna, Szemcsés terrakotta, Szemcsés barna",
    "officialTintExcerpt": "Gépi és kézi pasztákkal max. 3 % pasztamennyiséggel",
    "specificColorCount": 8,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=304) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_garage",
    "invoiceId": "305",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": ", Garázsfesték fehér, Garázs ezüstszürke Ral 7001, Garázs betonszürke Ral 7032, Garázs homoksárga Ral 1014, Garázs fekete Ral 9005, Garázs sárga Ral 1023, Garázs piros Ral 3020, TR bázis, Garázs kék Ral 5015",
    "officialTintExcerpt": "gépi és kézi pasztákkal max. 3% pasztamennyiséggel (Bázis esetén max. 10%)",
    "specificColorCount": 9,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=305) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_floor",
    "invoiceId": "302",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "TR bázis, Padlóbevonat zöld, Padlóbevonat vörös, Padlóbevonat sötétszürke, Padlóbevonat világosszürke, Padlóbevonat krém, Padlóbevonat fehér, Padlóbevonat barna, Padlóbevonat bazaltszürke, fekete",
    "officialTintExcerpt": "gépi és kézi pasztákkal, maximum 3% pasztamennyiséggel (Bázis esetén max. 10%)",
    "specificColorCount": 10,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=302) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_weather",
    "invoiceId": "311",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér EGYEDI, fehér, TR bázis",
    "officialTintExcerpt": "gépi és kézi pasztákkal max. 10% pasztamennyiséggel",
    "specificColorCount": 2,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=311) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_plaster",
    "invoiceId": "318",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "gépi és kézi pasztákkal, fehér szín esetén max. 3%",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=318) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_pergola",
    "invoiceId": "323",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Pergola fehér, Pergola szürke, Pergola juhar, Pergola fenyő, Pergola aranytölgy, Pergola teak, Pergola dió, Pergola gesztenye, Pergola zöld, Pergola mahagóni, Pergola cseresznye, Pergola wenge, TR bázis, zöld, Pergola mandula, Pergola oliva, Pergola ezüstnyír, Pergola berkenye",
    "officialTintExcerpt": "Érdeklődjön az egyedi színek felől értékesítőinknél!",
    "specificColorCount": 18,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=323) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_aqua_primer",
    "invoiceId": "324",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "matt színtelen",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=324) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_aqua_parquet",
    "invoiceId": "328",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "magasfényű színtelen, selyemfényű színtelen, matt színtelen",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi vízbázisú pasztákkal max. 3-5% pasztamennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=328) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_parquet",
    "invoiceId": "329",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "selyemfényű színtelen, magasfényű színtelen",
    "officialTintExcerpt": "FACTOR „2 in 1” Vékonylazúrral színezhetjük a lakkozás előtt a fa felületét.",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=329) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_boat",
    "invoiceId": "343",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "magasfényű színtelen",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=343) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_rapid_primer",
    "invoiceId": "331",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Korróziógátló bézs, Korróziógátló fehér, Korróziógátló fekete, Korróziógátló szürke, Korróziógátló vörös",
    "officialTintExcerpt": null,
    "specificColorCount": 5,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=331) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_rapid_enamel",
    "invoiceId": "332",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Rapid fehér, Rapid fekete Ral 9005, Rapid sötétbarna, Rapid világosbarna, Rapid bézs Ral 1015, Rapid piros Ral 3020, Rapid szürke Ral 7035, Rapid zöld Ral 6001, Rapid bazaltszürke, Rapid vörös, Rapid sárga, Rapid sötétszürke, TR bázis, Rapid antracit Ral 7016, Rapid földbarna, Ra",
    "officialTintExcerpt": "Egyedi RAL színek felől érdeklődjön http://festekbazis.hu/munkatársaink oldalon.",
    "specificColorCount": 22,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=332) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_rapid_stripper",
    "invoiceId": "333",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=333) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_ind_primer",
    "invoiceId": "442",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Ral 7044 szürke, Ral 7040 szürke, Ral 9002 fehér, Ral 7016 Antracit, vörös",
    "officialTintExcerpt": null,
    "specificColorCount": 5,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=442) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_ind_enamel",
    "invoiceId": "444",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Ral 7035 szürke, Ral 7016 Antracit, TR bázis, Ral 9002 fehér, fehér",
    "officialTintExcerpt": "Egyedi színek felől érdeklődjön http://festekbazis.hu/munkatársaink",
    "specificColorCount": 5,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=444) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_aromatic",
    "invoiceId": "335",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=335) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_synthetic",
    "invoiceId": "461",
    "decision": "NONE",
    "officialPaletteExcerpt": null,
    "officialTintExcerpt": null,
    "specificColorCount": 0,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=461) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_7016_wall",
    "invoiceId": "340",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "antracit",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=340) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_aqua_glaze",
    "invoiceId": "325",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Akril színtelen, Akril dió, Akril paliszander, Akril zöld, Akril gesztenye, Akril fenyő, Akril oregon, Akril teak, Akril aranytölgy, Akril cseresznye, Akril mahagóni, Akril antracit, Akril 47. szürke",
    "officialTintExcerpt": "a színek egymással keverhetők",
    "specificColorCount": 13,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=325) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_rapid_aqua_enamel",
    "invoiceId": "460",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Rapid fehér Ral 9003, Rapid szürke Ral 7035, Rapid ezüstszürke Ral 7001, Rapid antracit Ral 7016, Rapid fekete Ral 9005, Rapid mohazöld Ral 6005, Rapid ,,Bársonybarack\" 2024 Év színe, Rapid világosbarna Ral 8002, Rapid sötétbarna Ral 8017, Rapid gyöngyfehér Ral 1013, TR bázis, Ra",
    "officialTintExcerpt": "Egyedi RAL színek felől érdeklődjön http://festekbazis.hu/munkatársaink oldalon.",
    "specificColorCount": 13,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=460) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_ind_s31",
    "invoiceId": "443",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=443) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_vastaglazur",
    "invoiceId": "327",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Vastaglazúr színtelen, Vastaglazúr fenyő, Vastaglazúr oregon, Vastaglazúr teak, Vastaglazúr dió, Vastaglazúr paliszander, Vastaglazúr zöld, Vastaglazúr gesztenye, Vastaglazúr aranytölgy, Vastaglazúr cseresznye, Vastaglazúr mahagóni",
    "officialTintExcerpt": "A színek egymással keverhetők.",
    "specificColorCount": 11,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=327) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_airflow_heat_mirror_paint",
    "invoiceId": "356",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=356) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_airflow_heat_mirror_paste",
    "invoiceId": "321",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Kötőanyag nélküli kézi és gépi színező tintákkal, 3-5 % mennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=321) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_coror_chlorinated_rubber",
    "invoiceId": "334",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Klórkaucsuk kék, Klórkaucsuk fehér, TR bázis",
    "officialTintExcerpt": "Kérem, keresse a www.festekbazis.hu oldalon szaktanácsadóinkat, mert egyedi megoldásokat is kínálunk.",
    "specificColorCount": 3,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=334) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_safe_floor",
    "invoiceId": "306",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Biztonságos fekete, Biztonságos fehér, Biztonságos sárga, Biztonságos szürke, TR bázis",
    "officialTintExcerpt": "Kérjük, keresse a www.festekbazis.hu oldalon szaktanácsadóinkat, mert egyedi megoldásokat is kínálunk.",
    "specificColorCount": 5,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=306) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_2in1_lazur",
    "invoiceId": "326",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "2in1 színtelen, 2in1 dió, 2in1 paliszander, 2in1 zöld, 2in1 gesztenye, 2in1 fenyő, 2in1 oregon, 2in1 teak, 2in1 aranytölgy, 2in1 cseresznye, 2in1 mahagóni",
    "officialTintExcerpt": "A szinek egymással keverhetők.",
    "specificColorCount": 11,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=326) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_factor_floor_enamel",
    "invoiceId": "330",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Padlózománc barna, Padlózománc okker",
    "officialTintExcerpt": "A színek egymással keverhetők.",
    "specificColorCount": 2,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=330) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_airflow_fixative",
    "invoiceId": "355",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen",
    "officialTintExcerpt": "Lúgálló porpigmentekkel 1% erejéig",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=355) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_aqua_tech",
    "invoiceId": "310",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Aquatech világosszürke, Aquatech fehér",
    "officialTintExcerpt": null,
    "specificColorCount": 2,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=310) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_liquid_foil",
    "invoiceId": "308",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Fólia natúr",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=308) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_bridge_primer",
    "invoiceId": "342",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Kézi és gépi színezőpasztával maximum 5% erejéig",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=342) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_bond_bridge",
    "invoiceId": "309",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Tapadóhíd natúr",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=309) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_mold_paint",
    "invoiceId": "316",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 3% pasztamennyiséggel (A színtartósságról kérje szaktanácsadója segítségét!)",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=316) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_qlassique",
    "invoiceId": "314",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 3% pasztamennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=314) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_touchline",
    "invoiceId": "465",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=465) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_immunetec_standard",
    "invoiceId": "362",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 3% pasztamennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=362) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_immunetec_premium",
    "invoiceId": "363",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "fehér",
    "officialTintExcerpt": "Pasztellszínekre, gépi és kézi pasztákkal max. 3-5% pasztamennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=363) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_7016_enamel",
    "invoiceId": "345",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "antracit",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=345) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_7016_exterior",
    "invoiceId": "347",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "antracit",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=347) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_7016_pergola",
    "invoiceId": "344",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "Pergola antracit Ral 7016",
    "officialTintExcerpt": null,
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=344) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_7016_plaster",
    "invoiceId": "346",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "antracit, fehér",
    "officialTintExcerpt": null,
    "specificColorCount": 2,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=346) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_stone_balm",
    "invoiceId": "307",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen",
    "officialTintExcerpt": "pasztellszínekre, gépi és kézi kötőanyag nélküli pasztákkal max. 3-5% pasztamennyiséggel",
    "specificColorCount": 1,
    "hasGenericStatement": true,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=307) Színválaszték / Színezés fields."
  },
  {
    "productId": "prod_valmor_eps_adhesive",
    "invoiceId": "312",
    "decision": "SPECIFIC",
    "officialPaletteExcerpt": "színtelen",
    "officialTintExcerpt": "-",
    "specificColorCount": 1,
    "hasGenericStatement": false,
    "evidence": "Official FESTÉK BÁZIS TDS (invoiceId=312) Színválaszték / Színezés fields."
  }
];
