/**
 * Display helpers for Product Data Model v2 specifications.
 * Pure formatting for Product Hub Műszaki adatok — never leaks raw enums/IDs.
 */

import type { SpecCondition, SpecValue, UnitCode } from "./types";
import {
  APPLICATION_ENVIRONMENT_LABEL_HU,
  GLOSS_LABEL_HU,
  getSpecificationDefinition,
  type ApplicationEnvironmentEnum,
  type GlossEnum,
} from "./specificationRegistry";
import { getSurfaceById, getTechnologyById } from "./repository";

const UNIT_LABEL_HU: Record<UnitCode, string> = {
  l: "l",
  ml: "ml",
  kg: "kg",
  g: "g",
  pcs: "db",
  m2_per_l: "m²/l",
  m2_per_kg: "m²/kg",
  g_per_m2: "g/m²",
  kg_per_m2: "kg/m²",
  ml_per_m2: "ml/m²",
  min: "perc",
  h: "óra",
  day: "nap",
  celsius: "°C",
  percent: "%",
  bar: "bar",
  mpa: "MPa",
  mm: "mm",
  um: "µm",
  l_per_min: "l/perc",
};

const UI_GROUP_LABEL_HU: Record<string, string> = {
  performance: "Teljesítmény",
  application: "Alkalmazás",
  appearance: "Megjelenés",
  chemical: "Összetétel",
  other: "Egyéb műszaki adatok",
};

/** Hungarian decimal display — does not mutate stored numbers. */
export function formatHuNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  // Avoid float noise: prefer short representation then swap separator
  const raw = String(n);
  if (raw.includes("e") || raw.includes("E")) {
    return n.toLocaleString("hu-HU");
  }
  return raw.replace(".", ",");
}

export function formatUnit(unit: UnitCode): string {
  return UNIT_LABEL_HU[unit] ?? unit;
}

export function formatSpecUiGroupLabel(uiGroup: string): string {
  return UI_GROUP_LABEL_HU[uiGroup] ?? "Egyéb műszaki adatok";
}

export function formatSpecValue(value: SpecValue): string {
  switch (value.kind) {
    case "text":
      return value.text;
    case "number":
      return formatHuNumber(value.value);
    case "range":
      return `${formatHuNumber(value.min)}–${formatHuNumber(value.max)}`;
    case "number_unit":
      return `${formatHuNumber(value.value)} ${formatUnit(value.unit)}`;
    case "range_unit":
      return `${formatHuNumber(value.min)}–${formatHuNumber(value.max)} ${formatUnit(value.unit)}`;
    case "duration":
      return `${formatHuNumber(value.value)} ${formatUnit(value.unit)}`;
    case "duration_range":
      return `${formatHuNumber(value.min)}–${formatHuNumber(value.max)} ${formatUnit(value.unit)}`;
    case "percentage":
      return `${formatHuNumber(value.value)}%`;
    case "percentage_range":
      return `${formatHuNumber(value.min)}–${formatHuNumber(value.max)}%`;
    case "boolean":
      return value.value ? "Igen" : "Nem";
    case "enum":
      return formatEnumDisplay(value.value);
    case "multi_enum":
      return formatMultiEnum(value.values);
    default: {
      const _exhaustive: never = value;
      return _exhaustive;
    }
  }
}

function formatEnumDisplay(code: string): string {
  if (code in GLOSS_LABEL_HU) {
    return GLOSS_LABEL_HU[code as GlossEnum];
  }
  if (code in APPLICATION_ENVIRONMENT_LABEL_HU) {
    return APPLICATION_ENVIRONMENT_LABEL_HU[
      code as ApplicationEnvironmentEnum
    ];
  }
  // Never invent: if unknown, return empty so Hub can skip — callers should filter
  return "";
}

function formatMultiEnum(values: string[]): string {
  const labels = values.map(formatEnumDisplay).filter(Boolean);
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0]!;
  if (labels.length === 2) return `${labels[0]} és ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} és ${labels[labels.length - 1]}`;
}

/**
 * Public-facing condition line. Resolves Technology/Surface IDs to names.
 * Never returns raw IDs or JSON.
 */
export function formatSpecCondition(
  condition: SpecCondition,
): string | undefined {
  const parts: string[] = [];

  if (typeof condition.temperatureC === "number") {
    parts.push(`${formatHuNumber(condition.temperatureC)} °C-on`);
  }
  if (typeof condition.relativeHumidityPct === "number") {
    parts.push(
      `${formatHuNumber(condition.relativeHumidityPct)}% relatív páratartalom mellett`,
    );
  }
  if (condition.basis === "per_coat") parts.push("rétegenként");
  if (condition.basis === "per_system") parts.push("teljes rendszerre");
  if (condition.basis === "typical") parts.push("jellemző érték");
  if (condition.basis === "max") parts.push("maximum");
  if (condition.basis === "min") parts.push("minimum");

  if (condition.applicationMethodTechIds?.length) {
    const names = condition.applicationMethodTechIds
      .map((id) => getTechnologyById(id)?.name)
      .filter((n): n is string => Boolean(n?.trim()));
    if (names.length) parts.push(names.join(", "));
  }

  if (condition.surfaceIds?.length) {
    const names = condition.surfaceIds
      .map((id) => getSurfaceById(id)?.name)
      .filter((n): n is string => Boolean(n?.trim()));
    if (names.length) parts.push(names.join(", "));
  }

  if (condition.note?.trim()) parts.push(condition.note.trim());

  return parts.length ? parts.join(", ") : undefined;
}

/** User-facing label for a specification key (from registry). */
export function formatSpecLabel(key: string): string {
  return getSpecificationDefinition(key)?.labelHu ?? key;
}

/** Packaging amount + unit for public display (e.g. 0,75 l). */
export function formatPackagingDisplay(amount: number, unit: UnitCode): string {
  return `${formatHuNumber(amount)} ${formatUnit(unit)}`;
}
