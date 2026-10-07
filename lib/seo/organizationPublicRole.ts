/**
 * Public Organization role labels — presentation only.
 * Derives from Organization.roles; never invents hierarchy or relations.
 */

import type { Organization, OrganizationRole } from "@/lib/data/types";

const ROLE_PRIORITY: OrganizationRole[] = [
  "manufacturer",
  "distributor",
  "representation",
  "service",
  "other",
];

const ROLE_LABEL_HU: Record<OrganizationRole, string> = {
  manufacturer: "Gyártó",
  distributor: "Forgalmazó",
  representation: "Képviselet",
  service: "Szerviz",
  other: "Szakmai partner",
};

/**
 * Single concise public role for Hub kindLabel / Szerep chip.
 * Prefer manufacturer when present; otherwise first supported role by priority.
 */
export function resolveOrganizationPublicRole(
  organization: Pick<Organization, "roles">,
): string {
  const roles = new Set(organization.roles ?? []);
  for (const role of ROLE_PRIORITY) {
    if (roles.has(role)) return ROLE_LABEL_HU[role];
  }
  return ROLE_LABEL_HU.other;
}
