import type { AnyEntity, RelatedEntity, Source } from "@/lib/data/types";
import {
  aggregateRelatedByTarget,
  getEntityHref,
  getCanonicalUrl,
  getRelatedEntities,
  getSourcesByIds,
  KIND_LABEL,
  TYPE_PATH,
} from "@/lib/data/repository";
import { evaluateIndexability } from "@/lib/seo/indexability";

export type Crumb = { name: string; path: string };

export type PageLink = {
  name: string;
  href: string;
  /** Aggregated relation roles */
  note?: string;
  /** Short verified blurb (e.g. product family) */
  blurb?: string;
};

export type ContentSection = {
  id: string;
  /** Semantic heading text (H2 unless noted) */
  heading: string;
  headingLevel: 2 | 3;
  paragraphs: string[];
  links: PageLink[];
};

export type RelationGroup = {
  label: string;
  items: PageLink[];
};

export type EntityPageModel = {
  entity: AnyEntity;
  kindLabel: string;
  listPath: string;
  listLabel: string;
  indexable: boolean;
  indexabilityReasons: string[];
  /** Primary search intent statement (not shown as H1) */
  searchIntent: string;
  h1: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  breadcrumbs: Crumb[];
  lead: string;
  overviewParagraphs: string[];
  sections: ContentSection[];
  relationGroups: RelationGroup[];
  categories: PageLink[];
  knowledgeLinks: PageLink[];
  sources: Source[];
  /** Latest verification date across entity + relations (ISO or display) */
  lastVerifiedAt?: string;
  contextualLinks: PageLink[];
};

const LIST_META: Record<
  AnyEntity["type"],
  { path: string; label: string; intentVerb: string }
> = {
  organization: {
    path: "/cegek",
    label: "Cégek",
    intentVerb: "festékipari cég / szervezet",
  },
  brand: {
    path: "/markak",
    label: "Márkák",
    intentVerb: "festékipari márka",
  },
  technology: {
    path: "/technologiak",
    label: "Technológiák",
    intentVerb: "festékipari technológia",
  },
  category: {
    path: "/kategoriak",
    label: "Kategóriák",
    intentVerb: "festékipari szakterület",
  },
  productFamily: {
    path: "/termekcsaladok",
    label: "Termékcsaládok",
    intentVerb: "festékipari termékcsalád / gépcsalád",
  },
  product: {
    path: "/termekek",
    label: "Termékek",
    intentVerb: "festékipari termék",
  },
  knowledge: {
    path: "/tudastar",
    label: "Tudástár",
    intentVerb: "festékipari szakmai tudásanyag",
  },
  comparison: {
    path: "/osszehasonlitas",
    label: "Összehasonlítások",
    intentVerb: "festékipari összehasonlítás",
  },
  surface: {
    path: "/feluletek",
    label: "Felületek",
    intentVerb: "festékipari felület / aljzat",
  },
};

function groupRelations(related: RelatedEntity[]): RelationGroup[] {
  const filtered = related.filter((item) => {
    if (item.entity.status !== "published") return false;
    if (item.relation.relationType === "relatedTo") return false;
    if (
      item.entity.type === "category" ||
      item.relation.relationType === "belongsToCategory"
    ) {
      return false;
    }
    if (
      item.entity.type === "knowledge" ||
      item.relation.relationType === "documents"
    ) {
      return false;
    }
    // Dedicated sections on product / family / surface pages
    if (
      item.relation.relationType === "applicableToSurface" ||
      item.relation.relationType === "partOfSystem"
    ) {
      return false;
    }
    return true;
  });

  const aggregated = aggregateRelatedByTarget(filtered);
  const byKind = new Map<string, PageLink[]>();

  for (const agg of aggregated) {
    const list = byKind.get(agg.kindLabel) ?? [];
    list.push({
      name: agg.entity.name,
      href: agg.href,
      note: agg.rolesSummary,
    });
    byKind.set(agg.kindLabel, list);
  }

  return [...byKind.entries()].map(([label, items]) => ({ label, items }));
}

function buildTypeSections(
  entity: AnyEntity,
  related: RelatedEntity[],
): ContentSection[] {
  const sections: ContentSection[] = [];
  const byType = (type: AnyEntity["type"], direction?: "in" | "out" | "both") =>
    related.filter((r) => {
      if (r.entity.type !== type) return false;
      if (direction === "in") return r.direction === "incoming";
      if (direction === "out") return r.direction === "outgoing";
      return true;
    });

  const linkify = (items: RelatedEntity[]): PageLink[] =>
    aggregateRelatedByTarget(items).map((agg) => ({
      name: agg.entity.name,
      href: agg.href,
      note: agg.rolesSummary,
      blurb:
        agg.entity.shortDescription?.trim() &&
        agg.entity.shortDescription.trim().length >= 20
          ? agg.entity.shortDescription.trim()
          : undefined,
    }));

  if (entity.type === "brand") {
    const body = entity.body?.trim();
    if (body) {
      sections.push({
        id: "mi-ez",
        heading: `Mi a ${entity.name}?`,
        headingLevel: 2,
        paragraphs: [body],
        links: [],
      });
    }

    const owners = byType("organization", "in").filter((r) =>
      ["owns"].includes(r.relation.relationType),
    );
    if (owners.length) {
      sections.push({
        id: "gyarto",
        heading: "Gyártói szervezet",
        headingLevel: 2,
        paragraphs: [
          "A márka és a gyártói / jogi szervezet a FESTÉKINDEX-en külön entitás. Az alábbi szervezet a tulajdonosi (owns) kapcsolat alapján kapcsolódik.",
        ],
        links: linkify(owners),
      });
    }

    const distributors = byType("organization", "in").filter((r) =>
      ["distributes", "officialDistributor", "represents", "services"].includes(
        r.relation.relationType,
      ),
    );
    if (distributors.length) {
      sections.push({
        id: "hu-kapcsolat",
        heading: `${entity.name} Magyarország: forgalmazás és szerviz`,
        headingLevel: 2,
        paragraphs: [
          `A ${entity.name} magyarországi forgalmazása, hivatalos forgalmazói státusza és szervizháttere az alábbi szervezet(ek)hez kapcsolódik.`,
        ],
        links: linkify(distributors),
      });
    }

    const techs = byType("technology").filter(
      (r) => r.relation.relationType !== "relatedTo",
    );
    if (techs.length) {
      sections.push({
        id: "technologiak",
        heading: "Kapcsolódó technológiák",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(techs),
      });
    }

    const families = byType("productFamily");
    if (families.length) {
      sections.push({
        id: "termekcsaladok",
        heading: "Gépcsaládok",
        headingLevel: 2,
        paragraphs: [
          `A ${entity.name} gépcsaládjai ProductFamily entitásokként. A rövid jellemzés csak ellenőrzött leírásból jelenik meg.`,
        ],
        links: linkify(families),
      });
    }

    const directProducts = related.filter(
      (r) =>
        r.direction === "outgoing" &&
        r.relation.relationType === "hasProduct" &&
        r.entity.type === "product",
    );
    if (directProducts.length) {
      sections.push({
        id: "termekek",
        heading: "Termékek",
        headingLevel: 2,
        paragraphs: [
          "Család nélküli (önálló) termékek — Brand → Product hasProduct él alapján.",
        ],
        links: linkify(directProducts),
      });
    }
  } else if (entity.type === "organization") {
    sections.push({
      id: "mi-ez",
      heading: `Mi a ${entity.name}?`,
      headingLevel: 2,
      paragraphs: [
        entity.body?.trim() ||
          `${entity.name} festékipari szervezet a FESTÉKINDEX-en.`,
      ],
      links: [],
    });
    const owned = related.filter(
      (r) =>
        r.direction === "outgoing" &&
        r.relation.relationType === "owns" &&
        r.entity.type === "brand",
    );
    if (owned.length) {
      sections.push({
        id: "markak",
        heading: "Tulajdonolt / képviselt márkák",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(owned),
      });
    }
    const distributed = related.filter(
      (r) =>
        r.direction === "outgoing" &&
        ["distributes", "officialDistributor", "services", "represents"].includes(
          r.relation.relationType,
        ) &&
        r.entity.type === "brand",
    );
    if (distributed.length) {
      sections.push({
        id: "forgalmazas",
        heading: "Forgalmazott / szervizelt márkák",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(distributed),
      });
    }
    const manufactured = related.filter(
      (r) =>
        r.direction === "outgoing" &&
        r.relation.relationType === "manufactures",
    );
    if (manufactured.length) {
      sections.push({
        id: "gyartas",
        heading: "Gyártott termékcsaládok",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(manufactured),
      });
    }
    const techs = byType("technology");
    if (techs.length) {
      sections.push({
        id: "technologiak",
        heading: "Kapcsolódó technológiák",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(techs),
      });
    }
  }

  if (entity.type === "technology") {
    sections.push({
      id: "mi-ez",
      heading: `Mi az a ${entity.name}?`,
      headingLevel: 2,
      paragraphs: [
        entity.body?.trim() ||
          `${entity.name} festékipari technológia / eljárás.`,
      ],
      links: [],
    });
    const brands = byType("brand");
    if (brands.length) {
      sections.push({
        id: "markak",
        heading: "Kapcsolódó márkák",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(brands),
      });
    }
    const families = byType("productFamily");
    if (families.length) {
      sections.push({
        id: "gepek",
        heading: "Kapcsolódó gép- / termékcsaládok",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(families),
      });
    }
    const orgs = byType("organization");
    if (orgs.length) {
      sections.push({
        id: "szervezetek",
        heading: "Kapcsolódó szervezetek",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(orgs),
      });
    }
  }

  if (entity.type === "productFamily") {
    sections.push({
      id: "mi-ez",
      heading: `Mi a ${entity.name}?`,
      headingLevel: 2,
      paragraphs: [
        entity.body?.trim() ||
          `${entity.name} termékcsalád / gépcsalád a FESTÉKINDEX-en.`,
      ],
      links: [],
    });
    const brands = byType("brand");
    if (brands.length) {
      sections.push({
        id: "marka",
        heading: "Márka",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(brands),
      });
    }
    const manufacturers = byType("organization");
    if (manufacturers.length) {
      sections.push({
        id: "gyarto",
        heading: "Gyártó szervezet",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(manufacturers),
      });
    }
    const techs = byType("technology");
    if (techs.length) {
      sections.push({
        id: "technologia",
        heading: "Technológia",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(techs),
      });
    }
    const surfaces = related.filter(
      (r) =>
        r.direction === "outgoing" &&
        r.relation.relationType === "applicableToSurface",
    );
    if (surfaces.length) {
      sections.push({
        id: "feluletek",
        heading: "Alkalmazható felületek",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(surfaces),
      });
    }
    const products = byType("product");
    if (products.length) {
      sections.push({
        id: "termekek",
        heading: "Termékek",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(products),
      });
    }
  }

  if (entity.type === "category") {
    sections.push({
      id: "mi-ez",
      heading: "A szakterület áttekintése",
      headingLevel: 2,
      paragraphs: [
        entity.body?.trim() ||
          `${entity.name} szakterület a FESTÉKINDEX kategóriarendszerében.`,
      ],
      links: [],
    });
    const members = related.filter(
      (r) =>
        r.direction === "incoming" &&
        r.relation.relationType === "belongsToCategory",
    );
    if (members.length) {
      sections.push({
        id: "entitasok",
        heading: "Kapcsolódó entitások ebben a kategóriában",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(members),
      });
    }
  }

  if (entity.type === "knowledge") {
    sections.push({
      id: "tartalom",
      heading: "Szakmai összefoglaló",
      headingLevel: 2,
      paragraphs: [
        entity.body?.trim() || entity.shortDescription,
      ],
      links: [],
    });
    const documented = related.filter(
      (r) =>
        r.direction === "outgoing" &&
        r.relation.relationType === "documents",
    );
    if (documented.length) {
      sections.push({
        id: "dokumentalt",
        heading: "Dokumentált entitások",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(documented),
      });
    }
  }

  if (entity.type === "product") {
    sections.push({
      id: "mi-ez",
      heading: entity.name,
      headingLevel: 2,
      paragraphs: [entity.body?.trim() || entity.shortDescription],
      links: [],
    });
    const surfaces = related.filter(
      (r) =>
        r.direction === "outgoing" &&
        r.relation.relationType === "applicableToSurface",
    );
    if (surfaces.length) {
      sections.push({
        id: "feluletek",
        heading: "Alkalmazható felületek",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(surfaces),
      });
    }
    const system = related.filter(
      (r) => r.relation.relationType === "partOfSystem",
    );
    if (system.length) {
      sections.push({
        id: "rendszer",
        heading: "Termékrendszer",
        headingLevel: 2,
        paragraphs: [],
        links: linkify(system),
      });
    }
  }

  if (entity.type === "surface") {
    sections.push({
      id: "mi-ez",
      heading: `${entity.name} felületek a festékiparban`,
      headingLevel: 2,
      paragraphs: [
        entity.body?.trim() ||
          `${entity.name} aljzat / felülettípus a FESTÉKINDEX-en.`,
      ],
      links: [],
    });
    const applicable = related.filter(
      (r) =>
        r.direction === "incoming" &&
        r.relation.relationType === "applicableToSurface",
    );
    if (applicable.length) {
      sections.push({
        id: "termekek",
        heading: "Kapcsolódó termékek és családok",
        headingLevel: 2,
        paragraphs: [
          "A lista applicableToSurface relation alapján épül — nem a márka marketing-navigációjából.",
        ],
        links: linkify(applicable),
      });
    }
  }

  return sections;
}

/**
 * Assembles a full SSR SEO page model from the normalized graph.
 * UI and generateMetadata should consume this — not raw seed files.
 */
export function buildEntityPageModel(entity: AnyEntity): EntityPageModel {
  const meta = LIST_META[entity.type];
  const related = getRelatedEntities(entity.id);
  const evaluation = evaluateIndexability(entity);

  const categories = related
    .filter(
      (r) =>
        r.direction === "outgoing" &&
        r.relation.relationType === "belongsToCategory" &&
        r.entity.type === "category",
    )
    .map((r) => ({
      name: r.entity.name,
      href: getEntityHref(r.entity),
    }));

  const knowledgeLinks = related
    .filter(
      (r) =>
        (r.direction === "incoming" &&
          r.relation.relationType === "documents" &&
          r.entity.type === "knowledge") ||
        (r.direction === "outgoing" &&
          r.relation.relationType === "documents" &&
          entity.type === "knowledge"),
    )
    .map((r) => ({
      name: r.entity.name,
      href: getEntityHref(r.entity),
      note: r.entity.shortDescription,
    }));

  // For non-knowledge pages, knowledge arrives as incoming documents
  const knowledgeForEntity =
    entity.type === "knowledge"
      ? []
      : related
          .filter(
            (r) =>
              r.direction === "incoming" &&
              r.relation.relationType === "documents" &&
              r.entity.type === "knowledge",
          )
          .map((r) => ({
            name: r.entity.name,
            href: getEntityHref(r.entity),
            note: r.entity.shortDescription,
          }));

  const sources = getSourcesByIds([
    ...entity.sourceIds,
    ...related.flatMap((r) => r.relation.sourceIds),
  ]);

  const verificationDates = [
    entity.verifiedAt,
    ...related.map((r) => r.relation.verifiedAt),
  ].filter((d): d is string => Boolean(d));
  const lastVerifiedAt =
    verificationDates.sort().reverse()[0] ?? entity.updatedAt;

  const path = `/${TYPE_PATH[entity.type]}/${entity.slug}`;
  const title =
    entity.seoTitle?.trim() || `${entity.name} | FESTÉKINDEX`;
  const metaDescription = (
    entity.seoDescription?.trim() ||
    `${entity.shortDescription} — ${meta.intentVerb} a FESTÉKINDEX szakmai indexében.`
  ).slice(0, 160);

  const searchIntent = `${entity.name} — ${meta.intentVerb}: gyártók, forgalmazók, technológiák és kapcsolatok Magyarországon`;

  const sections = buildTypeSections(entity, related).filter(
    (s) => s.paragraphs.length > 0 || s.links.length > 0,
  );

  // Brand hub: structured sections carry the graph — skip redundant chip dumps / relatedTo noise
  const relationGroups =
    entity.type === "brand" ? [] : groupRelations(related);

  const contextualLinks: PageLink[] =
    entity.type === "brand"
      ? []
      : (() => {
          const links = [
            ...categories.slice(0, 4),
            ...knowledgeForEntity.slice(0, 3),
            ...relationGroups.flatMap((g) => g.items).slice(0, 6),
          ];
          const seen = new Set<string>();
          return links.filter((l) => {
            if (seen.has(l.href)) return false;
            seen.add(l.href);
            return true;
          });
        })();

  return {
    entity,
    kindLabel: KIND_LABEL[entity.type],
    listPath: meta.path,
    listLabel: meta.label,
    indexable: evaluation.indexable,
    indexabilityReasons: evaluation.reasons,
    searchIntent,
    h1: entity.name,
    title,
    metaDescription,
    canonicalUrl: getCanonicalUrl(entity),
    breadcrumbs: [
      { name: "FESTÉKINDEX", path: "/" },
      { name: meta.label, path: meta.path },
      { name: entity.name, path },
    ],
    lead: entity.shortDescription,
    overviewParagraphs: entity.body ? [entity.body] : [entity.shortDescription],
    sections,
    relationGroups,
    categories,
    knowledgeLinks:
      entity.type === "knowledge" ? knowledgeLinks : knowledgeForEntity,
    sources,
    lastVerifiedAt,
    contextualLinks,
  };
}
