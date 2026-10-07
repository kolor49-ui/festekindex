import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Phase B presentation primitives — visual hierarchy only.
 * No data derivation; callers supply already-resolved public links.
 */

export function HubPrimarySection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="seo-section hub-primary-section" id={id}>
      <h2 className="seo-heading hub-primary-heading">{heading}</h2>
      {children}
    </section>
  );
}

/** Secondary exploration: families, brands, companies, partners. */
export function HubSecondaryCluster({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <div className="hub-secondary-cluster">{children}</div>;
}

/** Supporting navigation: technologies, surfaces, knowledge. */
export function HubSupportingCluster({
  children,
  note,
}: {
  children: ReactNode;
  note?: string;
}) {
  if (!children) return null;
  return (
    <div className="hub-supporting-cluster">
      {note ? <p className="org-section-note">{note}</p> : null}
      {children}
    </div>
  );
}

export function HubSecondarySection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="seo-section hub-secondary-section" id={id}>
      <h2 className="seo-heading hub-secondary-heading">{heading}</h2>
      {children}
    </section>
  );
}

export function HubSupportingSection({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className="seo-section hub-supporting-section" id={id}>
      <h2 className="seo-heading hub-supporting-heading">{heading}</h2>
      {children}
    </section>
  );
}

/** Compact pill group for secondary/supporting navigation. */
export function RelatedPillGroup({
  items,
}: {
  items: { id: string; href: string; name: string }[];
}) {
  if (!items.length) return null;
  return (
    <div className="seo-links org-category-chips hub-related-pills">
      {items.map((item) => (
        <Link key={item.id} href={item.href} className="pill pill-link">
          {item.name}
        </Link>
      ))}
    </div>
  );
}

/**
 * Knowledge-style explore block: one parent section, typed subgroups.
 * Avoids equal-weight h2 cloud after the article.
 */
export function RelatedExploreSection({
  groups,
}: {
  groups: {
    id: string;
    heading: string;
    items: { id: string; href: string; name: string }[];
  }[];
}) {
  const present = groups.filter((g) => g.items.length > 0);
  if (!present.length) return null;
  return (
    <section className="seo-section hub-related-explore" id="tovabbi-kapcsolatok">
      <h2 className="seo-heading hub-supporting-heading">
        További szakmai kapcsolatok
      </h2>
      <div className="hub-related-explore-groups">
        {present.map((g) => (
          <div key={g.id} className="hub-related-explore-group" id={g.id}>
            <h3 className="hub-related-explore-title">{g.heading}</h3>
            <RelatedPillGroup items={g.items} />
          </div>
        ))}
      </div>
    </section>
  );
}
