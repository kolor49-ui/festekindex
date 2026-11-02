/**
 * Hub editorial SEO overrides — copy + implicit public-index permission keys.
 * Shared so Organization/Brand Hub models and public indexability use ONE map.
 */

export type OrgHubSeoOverride = {
  h1: string;
  title: string;
  lead: string;
  metaDescription?: string;
};

export type BrandHubSeoOverride = {
  h1?: string;
  title: string;
  lead?: string;
  metaDescription?: string;
};

/**
 * Verified editorial SEO for reference Organization hubs.
 * Presence of an entry is also the Organization public-index override signal
 * (after hard gates). Copy only — never product lists.
 */
export const ORG_HUB_SEO: Record<string, OrgHubSeoOverride> = {
  "festek-bazis-zrt": {
    h1: "Festék Bázis Zrt.",
    title:
      "Festék Bázis Zrt. – VALMOR, FACTOR és COROR festékek | FESTÉKINDEX",
    lead: "Magyar festék- és bevonóanyag-gyártó, VALMOR, FACTOR és COROR termékcsaládokkal. Portfóliója a beltéri és homlokzati festékektől a faipari bevonatokon és padlóbevonatokon át a korrózióvédelmi rendszerekig terjed.",
    metaDescription:
      "Festék Bázis Zrt.: VALMOR, FACTOR és COROR — magyar festékgyártó márkák, termékcsaládok és szakmai kapcsolatok a FESTÉKINDEX-en.",
  },
  "jub-kft": {
    h1: "JUB Kft.",
    title: "JUB Kft. – építőipari festékek és homlokzat | FESTÉKINDEX",
    lead: "A JUB Kft. (Celldömölk) a JUB építőipari festékek és homlokzati rendszerek magyarországi szervezete. A FESTÉKINDEX-en a szervezet, a JUB márka és a kapcsolódó szakmai kategóriák érhetők el.",
    metaDescription:
      "JUB Kft. (Celldömölk): JUB építőipari festékek és homlokzati rendszerek magyarországi szervezete a FESTÉKINDEX-en.",
  },
  "poli-farbe": {
    h1: "Poli-Farbe Kft.",
    title: "Poli-Farbe Kft. – festékek és vakolatok | FESTÉKINDEX",
    lead: "A Poli-Farbe Vegyipari Kft. bócsai székhelyű magyar festék- és vakolatgyártó. A FESTÉKINDEX-en a gyártói szervezet, a Poli-Farbe márka és a kapcsolódó szakmai kategóriák jelennek meg.",
    metaDescription:
      "Poli-Farbe Kft. (Bócsa): magyar festék- és vakolatgyártó, márkák és szakmai kapcsolatok a FESTÉKINDEX-en.",
  },
  "remmers-ungarn": {
    h1: "Remmers Ungarn Kft.",
    title: "Remmers Ungarn – épület- és faanyagvédelem | FESTÉKINDEX",
    lead: "A Remmers Ungarn Kft. (Biatorbágy) a Remmers épületvédelmi és faanyagvédelmi rendszerek magyarországi szervezete. A FESTÉKINDEX-en a szervezet és a Remmers márkahub érhető el.",
    metaDescription:
      "Remmers Ungarn Kft. (Biatorbágy): épület- és faanyagvédelem magyarországi szervezete a FESTÉKINDEX-en.",
  },
  "meffert-hungaria": {
    h1: "Meffert Hungária Kft.",
    title: "Meffert Hungária / Düfa | FESTÉKINDEX",
    lead: "A Meffert Hungária Kft. (Rétság) a Düfa festék- és vakolatmárka magyarországi szereplője. A FESTÉKINDEX-en a szervezet és a Düfa márkahub jelenik meg.",
    metaDescription:
      "Meffert Hungária Kft. (Rétság): Düfa festékek és vakolatok magyarországi szervezete a FESTÉKINDEX-en.",
  },
  baumit: {
    h1: "Baumit Kft.",
    title: "Baumit Kft. – építőanyagok és bevonatok | FESTÉKINDEX",
    lead: "A Baumit Kft. a Baumit építőanyag- és bevonatmárka magyarországi szervezete. A FESTÉKINDEX-en a gyártói hub és a Baumit márka érhető el.",
    metaDescription:
      "Baumit Kft.: építőanyagok és bevonatok magyarországi szervezete a FESTÉKINDEX-en.",
  },
};

/**
 * Verified editorial SEO for reference Brand hubs.
 * Presence of an entry is an additional Brand public-index signal
 * (after hard gates), alongside substantive portfolio.
 */
export const BRAND_HUB_SEO: Record<string, BrandHubSeoOverride> = {
  valmor: {
    title: "VALMOR festékek és bevonatok | FESTÉKINDEX",
    lead: "Festék- és bevonatmárka a Festék Bázis Zrt. portfóliójában. A FESTÉKINDEX-en termékcsaládokkal, termékekkel és szakmai kapcsolatokkal jelenik meg; a gyártói háttér a Festék Bázis Zrt. adatlapján érhető el.",
    metaDescription:
      "VALMOR festékek és bevonatok: termékcsaládok, termékek és szakmai kapcsolatok a Festék Bázis Zrt. portfóliójában — FESTÉKINDEX.",
  },
  coror: {
    title: "COROR ipari bevonatok | FESTÉKINDEX",
    lead: "Ipari és korrózióvédelmi bevonatmárka a Festék Bázis Zrt. portfóliójában. A FESTÉKINDEX-en termékekkel, kategóriákkal és szakmai kapcsolatokkal jelenik meg; a gyártói háttér a Festék Bázis Zrt. adatlapján érhető el.",
    metaDescription:
      "COROR ipari bevonatok a Festék Bázis Zrt. portfóliójában: termékek, kategóriák és szakmai kapcsolatok a FESTÉKINDEX-en.",
  },
  factor: {
    title: "FACTOR faipari bevonatok | FESTÉKINDEX",
    lead: "Faipari bevonatmárka a Festék Bázis Zrt. portfóliójában. A FESTÉKINDEX-en termékekkel, felületekkel és szakmai kapcsolatokkal jelenik meg; a gyártói háttér a Festék Bázis Zrt. adatlapján érhető el.",
    metaDescription:
      "FACTOR faipari bevonatok a Festék Bázis Zrt. portfóliójában: termékek, felületek és szakmai kapcsolatok a FESTÉKINDEX-en.",
  },
  jub: {
    title: "JUB építőipari festékek | FESTÉKINDEX",
    lead: "Építőipari festék- és homlokzati rendszermárka. A FESTÉKINDEX-en a JUB Kft. magyarországi szervezetéhez és a kapcsolódó szakmai kategóriákhoz kötődik.",
    metaDescription:
      "JUB: építőipari festék- és homlokzati rendszermárka a JUB Kft. szervezetével — FESTÉKINDEX.",
  },
  "poli-farbe": {
    title: "Poli-Farbe festékek és vakolatok | FESTÉKINDEX",
    lead: "Dekoratív festék- és vakolatmárka a Poli-Farbe Kft. portfóliójában. A FESTÉKINDEX-en a gyártói szervezethez és a szakmai kategóriákhoz kapcsolódik.",
    metaDescription:
      "Poli-Farbe: dekoratív festék- és vakolatmárka a Poli-Farbe Kft. portfóliójában — FESTÉKINDEX.",
  },
  remmers: {
    title: "Remmers épület- és faanyagvédelem | FESTÉKINDEX",
    lead: "Épület- és faanyagvédelmi bevonatmárka. A FESTÉKINDEX-en a Remmers Ungarn Kft. szervezetéhez kapcsolódik.",
    metaDescription:
      "Remmers: épület- és faanyagvédelmi bevonatmárka a Remmers Ungarn Kft. szervezetével — FESTÉKINDEX.",
  },
  dufa: {
    title: "Düfa festékek és vakolatok | FESTÉKINDEX",
    lead: "Festék- és vakolatmárka a Meffert Hungária Kft. szervezetével. A FESTÉKINDEX-en a gyártói hubhoz és a szakmai kategóriákhoz kapcsolódik.",
    metaDescription:
      "Düfa: festék- és vakolatmárka a Meffert Hungária Kft. szervezetével — FESTÉKINDEX.",
  },
  caparol: {
    title: "Caparol építőipari festékek | FESTÉKINDEX",
    lead: "Építőipari festék- és bevonatmárka. Magyarországi képviseleti kapcsolat: thenordicmark Kft. A FESTÉKINDEX-en a képviseleti szervezethez kapcsolódik.",
    metaDescription:
      "Caparol: építőipari festék- és bevonatmárka, HU képviselet: thenordicmark Kft. — FESTÉKINDEX.",
  },
  baumit: {
    title: "Baumit építőanyagok és bevonatok | FESTÉKINDEX",
    lead: "Építőanyag- és bevonatmárka a Baumit Kft. szervezetével. A FESTÉKINDEX-en a gyártói hubhoz és a szakmai kategóriákhoz kapcsolódik.",
    metaDescription:
      "Baumit: építőanyag- és bevonatmárka a Baumit Kft. szervezetével — FESTÉKINDEX.",
  },
  revco: {
    title: "REVCO vakolatok és festékek | FESTÉKINDEX",
    lead: "Vakolat- és festékmárka a Saint-Gobain Hungary REVCO Divízióval. A FESTÉKINDEX-en a gyártói szervezethez kapcsolódik.",
    metaDescription:
      "REVCO: vakolat- és festékmárka a Saint-Gobain Hungary REVCO Divízióval — FESTÉKINDEX.",
  },
  trinat: {
    title: "Trinát zománcok és fémfestékek | FESTÉKINDEX",
    lead: "Zománc-, alapozó- és fémfesték márka a PPG TRILAK portfóliójában. A FESTÉKINDEX-en a PPG TRILAK szervezethez kapcsolódik.",
    metaDescription:
      "Trinát: zománc- és fémfesték márka a PPG TRILAK portfóliójában — FESTÉKINDEX.",
  },
  lazuran: {
    title: "Lazurán faanyagvédelem | FESTÉKINDEX",
    lead: "Faanyagvédő és lazúr márka a PPG TRILAK portfóliójában. A FESTÉKINDEX-en a PPG TRILAK szervezethez kapcsolódik.",
    metaDescription:
      "Lazurán: faanyagvédő és lazúr márka a PPG TRILAK portfóliójában — FESTÉKINDEX.",
  },
};

export function hasOrganizationEditorialIndexOverride(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(ORG_HUB_SEO, slug);
}

export function hasBrandEditorialIndexOverride(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(BRAND_HUB_SEO, slug);
}
