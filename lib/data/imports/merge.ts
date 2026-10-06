/** Shared ID-merge helpers for seed + import packs. */

export function mergeById<T extends { id: string }>(
  base: T[],
  extra: T[],
): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(item.id, item);
  for (const item of extra) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()];
}

/**
 * Surfaces: keep richer base content; always apply v0.2 indexable:false when pack touches the id.
 */
export function mergeSurfaces<
  T extends { id: string; indexable: boolean; aliases?: string[] },
>(base: T[], extra: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(item.id, item);
  for (const item of extra) {
    const cur = map.get(item.id);
    if (!cur) {
      map.set(item.id, item);
      continue;
    }
    map.set(item.id, {
      ...cur,
      indexable: false,
      aliases:
        cur.aliases && cur.aliases.length > 0 ? cur.aliases : item.aliases,
    });
  }
  return [...map.values()];
}

/**
 * Technologies present in the v0.2 pack: keep base body/kind, force indexable:false.
 */
export function mergeTechnologies<
  T extends { id: string; indexable: boolean; kind?: string },
>(base: T[], extra: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of base) map.set(item.id, item);
  for (const item of extra) {
    const cur = map.get(item.id);
    if (!cur) {
      map.set(item.id, item);
      continue;
    }
    map.set(item.id, {
      ...cur,
      indexable: false,
      kind: cur.kind ?? item.kind,
    });
  }
  return [...map.values()];
}

/** Relation dedupe: from + type + to (first wins). */
export function mergeRelationsByCanonicalKey<
  T extends {
    id: string;
    fromEntityId: string;
    toEntityId: string;
    relationType: string;
  },
>(base: T[], extra: T[]): T[] {
  const map = new Map<string, T>();
  const keyOf = (r: T) =>
    `${r.fromEntityId}|${r.relationType}|${r.toEntityId}`;
  for (const item of base) {
    map.set(keyOf(item), item);
  }
  for (const item of extra) {
    const k = keyOf(item);
    if (!map.has(k)) map.set(k, item);
  }
  return [...map.values()];
}
