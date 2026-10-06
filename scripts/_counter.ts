/** Tiny counter helper for validate-graph CLI (avoid extra deps). */
export function Counter(items: string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    out[item] = (out[item] ?? 0) + 1;
  }
  return out;
}
