/**
 * Canonical Surface IDs are the Hungarian repo IDs.
 * v0.1 Festék Bázis pack used English IDs — map at import, never rename repo IDs.
 */
export const SURFACE_ID_FROM_IMPORT: Record<string, string> = {
  surface_steel: "surface_acel",
  surface_galvanized_steel: "surface_horganyzott_acel",
  surface_aluminium: "surface_aluminium",
  surface_copper: "surface_rez",
  surface_wood: "surface_fa",
  surface_concrete: "surface_beton",
  surface_plaster: "surface_vakolat",
  surface_drywall: "surface_gipszkarton",
  surface_osb: "surface_osb",
  surface_plastic: "surface_muanyag",
  surface_ceramic: "surface_keramia_csempe",
  surface_mdf: "surface_mdf",
};

export function mapSurfaceId(importId: string): string {
  const mapped = SURFACE_ID_FROM_IMPORT[importId];
  if (!mapped) {
    throw new Error(`Unknown import Surface id: ${importId}`);
  }
  return mapped;
}
