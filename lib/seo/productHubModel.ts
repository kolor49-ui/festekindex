/**
 * SSR page model for Product hubs.
 * Graph data from repository + Entity Navigation Standard v1.
 * No product/brand/org hardcoding.
 */

import type {
  Brand,
  Organization,
  Product,
  ProductFamily,
} from "@/lib/data/types";
import {
  getCanonicalUrl,
  getEntityHref,
  SITE_ORIGIN,
} from "@/lib/data/repository";
import {
  getCategoriesForProduct,
  getTechnologiesForProduct,
  getSurfacesForProduct,
  getSystemRelationsForProduct,
  getKnowledgeForProduct,
  getSourcesForProduct,
  getTechnicalDataForProduct,
  getPackagingForProduct,
  getRelatedProductsForHub,
  systemRoleLabel,
  type ProductCategoryLink,
  type ProductTechLink,
  type ProductSurfaceLink,
  type ProductSystemPeer,
  type ProductKnowledgeLink,
  type ProductTechDataGroup,
  type ProductPackagingDisplay,
  type ProductRelatedLink,
} from "@/lib/data/productHub";
import {
  getCanonicalProductBrand,
  getCanonicalProductFamily,
  getCanonicalBrandOwner,
  getCanonicalFamilyManufacturer,
  getEntityNavigation,
  type NavContextItem,
  type NavCrumb,
} from "@/lib/navigation/entityNavigation";
import { evaluateIndexability } from "@/lib/seo/indexability";
import { formatHuVerifiedDate } from "@/lib/seo/organizationHubModel";

export type ProductFact = {
  label: string;
  value: string;
  href?: string;
};

export type ProductHubModel = {
  product: Product;
  kindLabel: string;
  h1: string;
  /** Undefined when no source-backed usable description. */
  lead?: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: NavCrumb[];
  indexable: boolean;
  headerFacts: ProductFact[];
  categories: ProductCategoryLink[];
  technologies: ProductTechLink[];
  surfaces: ProductSurfaceLink[];
  systemPeers: ProductSystemPeer[];
  /** Show sequenced system layout when any peer has sequence. */
  systemHasSequence: boolean;
  /** Diluted / compatible / system peers for related section (deduped). */
  relatedProducts: ProductRelatedLink[];
  technicalData: ProductTechDataGroup[];
  packaging: ProductPackagingDisplay[];
  knowledge: ProductKnowledgeLink[];
  /** Background section — only when blurbs add info beyond header facts. */
  background?: {
    heading: string;
    brand?: { name: string; href: string; blurb?: string };
    family?: { name: string; href: string; blurb?: string };
    organization?: {
      name: string;
      href: string;
      label: string;
      blurb?: string;
    };
  };
  sources: ReturnType<typeof getSourcesForProduct>["sources"];
  lastVerifiedAt?: string;
  lastVerifiedLabel?: string;
  /** Navigation context — typically unused in Product Hub UI (header facts cover it). */
  contextItems: NavContextItem[];
};

function isStructuralCopy(text: string): boolean {
  const t = text.trim();
  if (!t) return true;
  const lower = t.toLowerCase();
  if (lower.includes("a festékindex adatbázisában")) return true;
  if (lower.includes("festék bázis v0.")) return true;
  if (lower.includes("termékadatbázisában")) return true;
  if (lower.includes("konkrét termék / modell")) return true;
  if (lower === "termékadatlap") return true;
  if (lower === "termék") return true;
  return false;
}

function usableText(text: string | undefined): string | undefined {
  const t = text?.trim() ?? "";
  if (!t || isStructuralCopy(t)) return undefined;
  return t;
}

function orgLabel(role: "owner" | "manufacturer" | undefined): string {
  if (role === "manufacturer") return "Gyártó";
  return "Tulajdonos";
}

function buildTitle(product: Product, brand: Brand | undefined): string {
  const existing = usableText(product.seoTitle);
  if (existing) return existing;

  const name = product.name.trim();
  if (brand) {
    const brandName = brand.name.trim();
    // Avoid "VALMOR … | VALMOR | FESTÉKINDEX" when name already starts with brand
    if (name.toUpperCase().startsWith(brandName.toUpperCase())) {
      return `${name} | FESTÉKINDEX`;
    }
    return `${name} | ${brandName} | FESTÉKINDEX`;
  }
  return `${name} | FESTÉKINDEX`;
}

function buildMetaDescription(
  product: Product,
  lead: string | undefined,
  brand: Brand | undefined,
  family: ProductFamily | undefined,
  categories: ProductCategoryLink[],
): string {
  const existing = usableText(product.seoDescription);
  if (existing) return existing.slice(0, 160);

  if (lead) return lead.slice(0, 160);

  const parts: string[] = [product.name];
  if (brand) parts.push(brand.name);
  if (family) parts.push(family.name);
  if (categories[0]) parts.push(categories[0].name);
  const base = parts.join(" — ");
  return `${base} a FESTÉKINDEX-en.`.slice(0, 160);
}

export function buildProductHubModel(
  product: Product,
): ProductHubModel | null {
  if (product.status !== "published") return null;

  const navigation = getEntityNavigation(product);
  const evaluation = evaluateIndexability(product);

  const family = getCanonicalProductFamily(product.id);
  const brand = getCanonicalProductBrand(product.id);
  // Canonical org only: Brand --owns--> Org, else Family --manufactures--> Org.
  // Never invent Brand (7016) or treat distributors as owner.
  let owner: Organization | undefined;
  let organizationRole: "owner" | "manufacturer" | undefined;
  if (brand) {
    const brandOwner = getCanonicalBrandOwner(brand.id);
    if (brandOwner) {
      owner = brandOwner;
      organizationRole = "owner";
    }
  } else if (family) {
    const mfr = getCanonicalFamilyManufacturer(family.id);
    if (mfr) {
      owner = mfr;
      organizationRole = "manufacturer";
    }
  }

  const categories = getCategoriesForProduct(product.id);
  const technologies = getTechnologiesForProduct(product.id);
  const surfaces = getSurfacesForProduct(product.id);
  const systemPeers = getSystemRelationsForProduct(product.id);
  const relatedProducts = getRelatedProductsForHub(product.id);
  const technicalData = getTechnicalDataForProduct(product.id);
  const packaging = getPackagingForProduct(product.id);
  const knowledge = getKnowledgeForProduct(product.id);
  const { sources, lastVerifiedAt } = getSourcesForProduct(product.id);

  const lead =
    usableText(product.editorialSummary) ??
    usableText(product.sourceSummary) ??
    usableText(product.body) ??
    usableText(product.shortDescription);

  const headerFacts: ProductFact[] = [];
  if (brand) {
    headerFacts.push({
      label: "Márka",
      value: brand.name,
      href: getEntityHref(brand),
    });
  }
  if (family) {
    headerFacts.push({
      label: "Termékcsalád",
      value: family.name,
      href: getEntityHref(family),
    });
  }
  if (owner) {
    headerFacts.push({
      label: orgLabel(organizationRole),
      value: owner.name,
      href: getEntityHref(owner),
    });
  }
  if (categories[0]) {
    headerFacts.push({
      label: "Szakmai terület",
      value: categories[0].name,
      href: categories[0].href,
    });
  }

  const brandBlurb = brand
    ? usableText(brand.shortDescription) ?? usableText(brand.body)
    : undefined;
  const familyBlurb = family
    ? usableText(family.shortDescription) ?? usableText(family.body)
    : undefined;
  const orgBlurb = owner
    ? usableText(owner.shortDescription) ?? usableText(owner.body)
    : undefined;

  let background: ProductHubModel["background"];
  if (brandBlurb || familyBlurb || orgBlurb) {
    const hasBrand = !!(brand && brandBlurb);
    const hasFamily = !!(family && familyBlurb);
    const hasOrg = !!(owner && orgBlurb);
    // Heading must match rendered blocks — never imply Brand when none exists (7016).
    let heading: string;
    if (hasBrand && hasFamily && hasOrg) heading = "Márka és gyártói háttér";
    else if (hasBrand && hasFamily) heading = "Márka és termékcsalád";
    else if (hasBrand && hasOrg) heading = "Márka és gyártói háttér";
    else if (hasFamily && hasOrg) heading = "Termékcsalád és gyártói háttér";
    else if (hasBrand) heading = "Márka";
    else if (hasFamily) heading = "Termékcsalád";
    else heading = "Gyártói háttér";

    background = {
      heading,
      brand: hasBrand
        ? { name: brand!.name, href: getEntityHref(brand!), blurb: brandBlurb! }
        : undefined,
      family: hasFamily
        ? {
            name: family!.name,
            href: getEntityHref(family!),
            blurb: familyBlurb!,
          }
        : undefined,
      organization: hasOrg
        ? {
            name: owner!.name,
            href: getEntityHref(owner!),
            label: orgLabel(organizationRole),
            blurb: orgBlurb!,
          }
        : undefined,
    };
  }

  const title = buildTitle(product, brand);
  const metaDescription = buildMetaDescription(
    product,
    lead,
    brand,
    family,
    categories,
  );

  return {
    product,
    kindLabel: "Termék",
    h1: product.name,
    lead,
    title,
    metaDescription,
    canonicalUrl: getCanonicalUrl(product),
    breadcrumbs: navigation.breadcrumbs,
    // Keep SEO policy — do NOT flip noindex → index just because hub UI improved
    indexable: evaluation.indexable,
    headerFacts,
    categories,
    technologies,
    surfaces,
    systemPeers,
    systemHasSequence: systemPeers.some(
      (p) => typeof p.sequence === "number",
    ),
    relatedProducts,
    technicalData,
    packaging,
    knowledge,
    background,
    sources,
    lastVerifiedAt,
    lastVerifiedLabel: lastVerifiedAt
      ? formatHuVerifiedDate(lastVerifiedAt)
      : undefined,
    contextItems: navigation.contextItems,
  };
}

export function productHubMetadata(model: ProductHubModel) {
  return {
    title: { absolute: model.title },
    description: model.metaDescription,
    alternates: { canonical: model.canonicalUrl },
    openGraph: {
      title: model.title,
      description: model.metaDescription,
      url: model.canonicalUrl,
      siteName: "FESTÉKINDEX",
      locale: "hu_HU",
      type: "website" as const,
    },
    robots: model.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
  };
}

export function buildProductHubJsonLd(model: ProductHubModel) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: model.breadcrumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_ORIGIN}${c.path}`,
    })),
  };

  const productLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: model.product.name,
    url: model.canonicalUrl,
  };

  if (model.lead) productLd.description = model.lead;

  const brandFact = model.headerFacts.find((f) => f.label === "Márka");
  if (brandFact) {
    productLd.brand = {
      "@type": "Brand",
      name: brandFact.value,
      ...(brandFact.href
        ? {
            url: brandFact.href.startsWith("http")
              ? brandFact.href
              : `${SITE_ORIGIN}${brandFact.href}`,
          }
        : {}),
    };
  }

  if (model.categories.length) {
    productLd.category = model.categories.map((c) => c.name).join(", ");
  }

  return [breadcrumb, productLd];
}

export { systemRoleLabel };
