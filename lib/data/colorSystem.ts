/**
 * Color System v1 accessors — non-EntityType catalog.
 */

import type { Color, ColorSystem, Product } from "./types";
import {
  colorSystemsV1,
  colorsV1,
} from "./imports/festekBazisEnrichmentV1/colorSystemV1";

const systemsById = new Map(colorSystemsV1.map((s) => [s.id, s]));
const colorsById = new Map(colorsV1.map((c) => [c.id, c]));

export function listColorSystems(): ColorSystem[] {
  return [...colorSystemsV1];
}

export function getColorSystemById(id: string): ColorSystem | undefined {
  return systemsById.get(id);
}

export function listColors(): Color[] {
  return [...colorsV1];
}

export function getColorById(id: string): Color | undefined {
  return colorsById.get(id);
}

export function formatColorPublicLabel(
  color: Color,
  labelOverride?: string,
): string {
  const system = getColorSystemById(color.colorSystemId);
  if (system?.id === "color_system_ral") {
    const ral = `RAL ${color.code}`;
    if (labelOverride?.trim()) return `${labelOverride.trim()} · ${ral}`;
    if (color.name?.trim()) return `${ral} · ${color.name.trim()}`;
    return ral;
  }
  if (labelOverride?.trim()) return labelOverride.trim();
  return color.name?.trim() || color.code;
}

export type ProductColorDisplayGroup = {
  systemId: string;
  systemName: string;
  items: { colorId: string; label: string }[];
};

export type ProductColorAvailabilityDisplay = {
  groups: ProductColorDisplayGroup[];
  genericStatements: string[];
};

/** Public hub presentation — only verified facts; omit when empty. */
export function buildColorAvailabilityDisplay(
  product: Product | undefined | null,
): ProductColorAvailabilityDisplay | null {
  if (!product?.colorAvailability) return null;
  const avail = product.colorAvailability;
  if (avail.status !== "verified") return null;

  const verifiedColors = (avail.colors ?? []).filter(
    (c) => c.status === "verified",
  );
  const verifiedGeneric = (avail.genericStatements ?? []).filter(
    (g) => g.status === "verified" && g.text.trim(),
  );

  if (!verifiedColors.length && !verifiedGeneric.length) return null;

  const groupMap = new Map<string, ProductColorDisplayGroup>();
  for (const entry of verifiedColors) {
    const color = getColorById(entry.colorId);
    if (!color) continue;
    const system = getColorSystemById(color.colorSystemId);
    if (!system) continue;
    let group = groupMap.get(system.id);
    if (!group) {
      group = { systemId: system.id, systemName: system.name, items: [] };
      groupMap.set(system.id, group);
    }
    group.items.push({
      colorId: color.id,
      label: formatColorPublicLabel(color, entry.labelOverride),
    });
  }

  // Stable order: RAL first, then brand systems by name
  const groups = [...groupMap.values()].sort((a, b) => {
    if (a.systemId === "color_system_ral") return -1;
    if (b.systemId === "color_system_ral") return 1;
    return a.systemName.localeCompare(b.systemName, "hu");
  });

  return {
    groups,
    genericStatements: verifiedGeneric.map((g) => g.text.trim()),
  };
}
