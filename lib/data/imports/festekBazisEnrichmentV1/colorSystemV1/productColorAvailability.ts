/**
 * Product-embedded Color availability overlays (FESTÉK BÁZIS pilot).
 * Specific Color links and generic statements are TDS-sourced only.
 */

import type { ProductColorAvailability } from "../../../types";

export type ProductColorAvailabilityPatch = {
  productId: string;
} & ProductColorAvailability;

export const productColorAvailabilityV1: ProductColorAvailabilityPatch[] = [
  {
    "productId": "prod_valmor_airflow_interior",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_airflow_interior",
          "src_valmor_airflow_interior_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_airflow_interior",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_airflow_interior",
          "src_valmor_airflow_interior_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_airflow_primer",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_szintelen",
        "sourceIds": [
          "src_valmor_airflow_primer",
          "src_valmor_airflow_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_airflow_facade",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_labazatfestek_feher",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_barna",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_kozepbarna",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_voros",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_szurke",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_antracit",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_terrakotta",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_zold",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_airflow_facade",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_airflow_facade",
          "src_valmor_airflow_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_airflow_salt",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_airflow_salt",
          "src_valmor_airflow_salt_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_airflow_salt",
        "text": "Lúgálló porpigmentekkel színezhető.",
        "sourceIds": [
          "src_valmor_airflow_salt",
          "src_valmor_airflow_salt_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_xclusive",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_xclusive",
          "src_valmor_xclusive_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_xclusive",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_xclusive",
          "src_valmor_xclusive_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_kontrol",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_szintelen",
        "sourceIds": [
          "src_valmor_kontrol",
          "src_valmor_kontrol_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_kontrol",
          "src_valmor_kontrol_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_kontrol",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_kontrol",
          "src_valmor_kontrol_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_deep_primer",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_szintelen",
        "sourceIds": [
          "src_valmor_deep_primer",
          "src_valmor_deep_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_facade",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_facade",
          "src_valmor_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_facade",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_facade",
          "src_valmor_facade_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_plinth",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_labazatfestek_antracit",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_barna",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_feher",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_kozepbarna",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_szurke",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_terrakotta",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_voros",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_zold",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_tr_bazis",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_labazatfestek_bazaltszurke",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_plinth",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_plinth",
          "src_valmor_plinth_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_textured",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_szemcses_zold",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_szemcses_voros",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_szemcses_feher",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_szemcses_szurke",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_szemcses_antracit",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_szemcses_kozepbarna",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_szemcses_terrakotta",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_szemcses_barna",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_textured",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_textured",
          "src_valmor_textured_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_garage",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_garazsfestek_feher",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_7001",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Garázs ezüstszürke"
      },
      {
        "colorId": "color_ral_7032",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Garázs betonszürke"
      },
      {
        "colorId": "color_ral_1014",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Garázs homoksárga"
      },
      {
        "colorId": "color_ral_9005",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Garázs fekete"
      },
      {
        "colorId": "color_ral_1023",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Garázs sárga"
      },
      {
        "colorId": "color_ral_3020",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Garázs piros"
      },
      {
        "colorId": "color_valmor_tr_bazis",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_5015",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Garázs kék"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_garage",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_garage",
          "src_valmor_garage_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_floor",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_tr_bazis",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_zold",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_voros",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_sotetszurke",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_vilagosszurke",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_krem",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_feher",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_barna",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_padlobevonat_bazaltszurke",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_fekete",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_floor",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_floor",
          "src_valmor_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_weather",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_weather",
          "src_valmor_weather_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_tr_bazis",
        "sourceIds": [
          "src_valmor_weather",
          "src_valmor_weather_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_weather",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_weather",
          "src_valmor_weather_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_plaster",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_plaster",
          "src_valmor_plaster_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_plaster",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_plaster",
          "src_valmor_plaster_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_pergola",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_pergola_feher",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_szurke",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_juhar",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_fenyo",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_aranytolgy",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_teak",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_dio",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_gesztenye",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_zold",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_mahagoni",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_cseresznye",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_wenge",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_tr_bazis",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_zold",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_mandula",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_oliva",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_ezustnyir",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_pergola_berkenye",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_factor_pergola",
        "text": "Egyedi színek rendelhetők.",
        "sourceIds": [
          "src_factor_pergola",
          "src_factor_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_aqua_primer",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_szintelen",
        "sourceIds": [
          "src_factor_aqua_primer",
          "src_factor_aqua_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_aqua_parquet",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_szintelen",
        "sourceIds": [
          "src_factor_aqua_parquet",
          "src_factor_aqua_parquet_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_factor_aqua_parquet",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_factor_aqua_parquet",
          "src_factor_aqua_parquet_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_parquet",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_szintelen",
        "sourceIds": [
          "src_factor_parquet",
          "src_factor_parquet_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_factor_parquet",
        "text": "FACTOR 2 in 1 Vékonylazúrral színezhető a lakkozás előtt.",
        "sourceIds": [
          "src_factor_parquet",
          "src_factor_parquet_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_boat",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_szintelen",
        "sourceIds": [
          "src_factor_boat",
          "src_factor_boat_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_rapid_primer",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_coror_korroziogatlo_bezs",
        "sourceIds": [
          "src_coror_rapid_primer",
          "src_coror_rapid_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_korroziogatlo_feher",
        "sourceIds": [
          "src_coror_rapid_primer",
          "src_coror_rapid_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_korroziogatlo_fekete",
        "sourceIds": [
          "src_coror_rapid_primer",
          "src_coror_rapid_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_korroziogatlo_szurke",
        "sourceIds": [
          "src_coror_rapid_primer",
          "src_coror_rapid_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_korroziogatlo_voros",
        "sourceIds": [
          "src_coror_rapid_primer",
          "src_coror_rapid_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_rapid_enamel",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_coror_rapid_feher",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_9005",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid fekete"
      },
      {
        "colorId": "color_coror_rapid_sotetbarna",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_vilagosbarna",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_1015",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid bézs"
      },
      {
        "colorId": "color_ral_3020",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid piros"
      },
      {
        "colorId": "color_ral_7035",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid szürke"
      },
      {
        "colorId": "color_ral_6001",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid zöld"
      },
      {
        "colorId": "color_coror_rapid_bazaltszurke",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_voros",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_sarga",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_sotetszurke",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_tr_bazis",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_7016",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid antracit"
      },
      {
        "colorId": "color_coror_rapid_foldbarna",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_csokoladebarna",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_cinksarga",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_oxidvoros",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_6005",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid mohazöld"
      },
      {
        "colorId": "color_ral_9006",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid ezüst"
      },
      {
        "colorId": "color_coror_rapid_kovacsoltvas_fekete",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_rapid_matt_fekete",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_coror_rapid_enamel",
        "text": "Egyedi RAL színek rendelhetők.",
        "sourceIds": [
          "src_coror_rapid_enamel",
          "src_coror_rapid_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_rapid_stripper",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_coror_szintelen",
        "sourceIds": [
          "src_coror_rapid_stripper",
          "src_coror_stripper"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_ind_primer",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_ral_7044",
        "sourceIds": [
          "src_coror_ind_primer",
          "src_coror_ind_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_7040",
        "sourceIds": [
          "src_coror_ind_primer",
          "src_coror_ind_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_9002",
        "sourceIds": [
          "src_coror_ind_primer",
          "src_coror_ind_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_7016",
        "sourceIds": [
          "src_coror_ind_primer",
          "src_coror_ind_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_voros",
        "sourceIds": [
          "src_coror_ind_primer",
          "src_coror_ind_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_ind_enamel",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_ral_7035",
        "sourceIds": [
          "src_coror_ind_enamel",
          "src_coror_ind_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_7016",
        "sourceIds": [
          "src_coror_ind_enamel",
          "src_coror_ind_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_tr_bazis",
        "sourceIds": [
          "src_coror_ind_enamel",
          "src_coror_ind_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_9002",
        "sourceIds": [
          "src_coror_ind_enamel",
          "src_coror_ind_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_feher",
        "sourceIds": [
          "src_coror_ind_enamel",
          "src_coror_ind_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_coror_ind_enamel",
        "text": "Egyedi színek rendelhetők.",
        "sourceIds": [
          "src_coror_ind_enamel",
          "src_coror_ind_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_aromatic",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_coror_szintelen",
        "sourceIds": [
          "src_coror_aromatic"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_7016_wall",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_7016_antracit",
        "sourceIds": [
          "src_7016_wall",
          "src_7016_wall_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_aqua_glaze",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_szintelen",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_dio",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_paliszander",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_zold",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_gesztenye",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_fenyo",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_oregon",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_teak",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_aranytolgy",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_cseresznye",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_mahagoni",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_antracit",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_akril_47_szurke",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_factor_aqua_glaze",
        "text": "A színek egymással keverhetők.",
        "sourceIds": [
          "src_factor_aqua_glaze",
          "src_factor_aqua_glaze_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_rapid_aqua_enamel",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_ral_9003",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid fehér"
      },
      {
        "colorId": "color_ral_7035",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid szürke"
      },
      {
        "colorId": "color_ral_7001",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid ezüstszürke"
      },
      {
        "colorId": "color_ral_7016",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid antracit"
      },
      {
        "colorId": "color_ral_9005",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid fekete"
      },
      {
        "colorId": "color_ral_6005",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid mohazöld"
      },
      {
        "colorId": "color_coror_rapid",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_barsonybarack_2024_ev_szine",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_ral_8002",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid világosbarna"
      },
      {
        "colorId": "color_ral_8017",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid sötétbarna"
      },
      {
        "colorId": "color_ral_1013",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Rapid gyöngyfehér"
      },
      {
        "colorId": "color_coror_tr_bazis",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_mocha_mousse_2025_ev_szine",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_coror_rapid_aqua_enamel",
        "text": "Egyedi RAL színek rendelhetők.",
        "sourceIds": [
          "src_coror_rapid_aqua_enamel",
          "src_coror_rapid_aqua_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_ind_s31",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_coror_szintelen",
        "sourceIds": [
          "src_coror_ind_s31",
          "src_coror_ind_s31_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_vastaglazur",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_szintelen",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_fenyo",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_oregon",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_teak",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_dio",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_paliszander",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_zold",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_gesztenye",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_aranytolgy",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_cseresznye",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_vastaglazur_mahagoni",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_factor_vastaglazur",
        "text": "A színek egymással keverhetők.",
        "sourceIds": [
          "src_factor_vastaglazur",
          "src_factor_vastaglazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_airflow_heat_mirror_paint",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_airflow_heat_mirror_paint",
          "src_valmor_airflow_heat_mirror_paint_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_airflow_heat_mirror_paint",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_airflow_heat_mirror_paint",
          "src_valmor_airflow_heat_mirror_paint_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_airflow_heat_mirror_paste",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_airflow_heat_mirror_paste",
          "src_valmor_airflow_heat_mirror_paste_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_airflow_heat_mirror_paste",
        "text": "Színező tintákkal színezhető.",
        "sourceIds": [
          "src_valmor_airflow_heat_mirror_paste",
          "src_valmor_airflow_heat_mirror_paste_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_coror_chlorinated_rubber",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_coror_klorkaucsuk_kek",
        "sourceIds": [
          "src_coror_chlorinated_rubber",
          "src_coror_chlorinated_rubber_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_klorkaucsuk_feher",
        "sourceIds": [
          "src_coror_chlorinated_rubber",
          "src_coror_chlorinated_rubber_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_coror_tr_bazis",
        "sourceIds": [
          "src_coror_chlorinated_rubber",
          "src_coror_chlorinated_rubber_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_coror_chlorinated_rubber",
        "text": "Kérem, keresse a www.festekbazis.hu oldalon szaktanácsadóinkat, mert egyedi megoldásokat is kínálunk.",
        "sourceIds": [
          "src_coror_chlorinated_rubber",
          "src_coror_chlorinated_rubber_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_safe_floor",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_biztonsagos_fekete",
        "sourceIds": [
          "src_valmor_safe_floor",
          "src_valmor_safe_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_biztonsagos_feher",
        "sourceIds": [
          "src_valmor_safe_floor",
          "src_valmor_safe_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_biztonsagos_sarga",
        "sourceIds": [
          "src_valmor_safe_floor",
          "src_valmor_safe_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_biztonsagos_szurke",
        "sourceIds": [
          "src_valmor_safe_floor",
          "src_valmor_safe_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_tr_bazis",
        "sourceIds": [
          "src_valmor_safe_floor",
          "src_valmor_safe_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_safe_floor",
        "text": "Kérjük, keresse a www.festekbazis.hu oldalon szaktanácsadóinkat, mert egyedi megoldásokat is kínálunk.",
        "sourceIds": [
          "src_valmor_safe_floor",
          "src_valmor_safe_floor_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_2in1_lazur",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_szintelen",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_dio",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_paliszander",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_zold",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_gesztenye",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_fenyo",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_oregon",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_teak",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_aranytolgy",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_cseresznye",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_2in1_mahagoni",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_factor_2in1_lazur",
        "text": "A színek egymással keverhetők.",
        "sourceIds": [
          "src_factor_2in1_lazur",
          "src_factor_2in1_lazur_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_factor_floor_enamel",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_factor_padlozomanc_barna",
        "sourceIds": [
          "src_factor_floor_enamel",
          "src_factor_floor_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_factor_padlozomanc_okker",
        "sourceIds": [
          "src_factor_floor_enamel",
          "src_factor_floor_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_factor_floor_enamel",
        "text": "A színek egymással keverhetők.",
        "sourceIds": [
          "src_factor_floor_enamel",
          "src_factor_floor_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_airflow_fixative",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_szintelen",
        "sourceIds": [
          "src_valmor_airflow_fixative",
          "src_valmor_airflow_fixative_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_airflow_fixative",
        "text": "Lúgálló porpigmentekkel színezhető.",
        "sourceIds": [
          "src_valmor_airflow_fixative",
          "src_valmor_airflow_fixative_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_aqua_tech",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_aquatech_vilagosszurke",
        "sourceIds": [
          "src_valmor_aqua_tech",
          "src_valmor_aqua_tech_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_valmor_aquatech_feher",
        "sourceIds": [
          "src_valmor_aqua_tech",
          "src_valmor_aqua_tech_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_liquid_foil",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_folia_natur",
        "sourceIds": [
          "src_valmor_liquid_foil",
          "src_valmor_liquid_foil_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_bridge_primer",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_bridge_primer",
          "src_valmor_bridge_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_bridge_primer",
        "text": "Gépi és kézi pasztákkal színezhető.",
        "sourceIds": [
          "src_valmor_bridge_primer",
          "src_valmor_bridge_primer_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_bond_bridge",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_tapadohid_natur",
        "sourceIds": [
          "src_valmor_bond_bridge",
          "src_valmor_bond_bridge_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_mold_paint",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_mold_paint",
          "src_valmor_mold_paint_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_mold_paint",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_mold_paint",
          "src_valmor_mold_paint_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_qlassique",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_qlassique",
          "src_valmor_qlassique_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_qlassique",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_qlassique",
          "src_valmor_qlassique_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_touchline",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_touchline",
          "src_valmor_touchline_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_immunetec_standard",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_immunetec_standard",
          "src_valmor_immunetec_standard_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_immunetec_standard",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_immunetec_standard",
          "src_valmor_immunetec_standard_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_immunetec_premium",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_feher",
        "sourceIds": [
          "src_valmor_immunetec_premium",
          "src_valmor_immunetec_premium_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_immunetec_premium",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_immunetec_premium",
          "src_valmor_immunetec_premium_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_7016_enamel",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_7016_antracit",
        "sourceIds": [
          "src_7016_enamel",
          "src_7016_enamel_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_7016_exterior",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_7016_antracit",
        "sourceIds": [
          "src_7016_exterior",
          "src_7016_exterior_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_7016_pergola",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_ral_7016",
        "sourceIds": [
          "src_7016_pergola",
          "src_7016_pergola_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified",
        "labelOverride": "Pergola antracit"
      }
    ]
  },
  {
    "productId": "prod_7016_plaster",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_7016_antracit",
        "sourceIds": [
          "src_7016_plaster",
          "src_7016_plaster_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      },
      {
        "colorId": "color_7016_feher",
        "sourceIds": [
          "src_7016_plaster",
          "src_7016_plaster_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_stone_balm",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_szintelen",
        "sourceIds": [
          "src_valmor_stone_balm",
          "src_valmor_stone_balm_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ],
    "genericStatements": [
      {
        "id": "pcg_valmor_stone_balm",
        "text": "Pasztellszínekre színezhető.",
        "sourceIds": [
          "src_valmor_stone_balm",
          "src_valmor_stone_balm_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  },
  {
    "productId": "prod_valmor_eps_adhesive",
    "status": "verified",
    "colors": [
      {
        "colorId": "color_valmor_szintelen",
        "sourceIds": [
          "src_valmor_eps_adhesive",
          "src_valmor_eps_adhesive_tds"
        ],
        "verifiedAt": "2026-10-07",
        "status": "verified"
      }
    ]
  }
];
