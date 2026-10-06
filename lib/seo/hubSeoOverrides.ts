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
};

/**
 * Verified editorial SEO for reference Brand hubs.
 * Presence of an entry is an additional Brand public-index signal
 * (after hard gates), alongside substantive portfolio.
 */
export const BRAND_HUB_SEO: Record<string, BrandHubSeoOverride> = {
  valmor: {
    title: "VALMOR festékek és bevonatok | FESTÉKINDEX",
    lead: "Festék- és bevonatmárka a Festék Bázis Zrt. portfóliójában.",
    metaDescription:
      "VALMOR festékek és bevonatok: termékcsaládok, termékek és szakmai kapcsolatok a FESTÉKINDEX-en.",
  },
};

export function hasOrganizationEditorialIndexOverride(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(ORG_HUB_SEO, slug);
}

export function hasBrandEditorialIndexOverride(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(BRAND_HUB_SEO, slug);
}
