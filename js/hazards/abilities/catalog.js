import { markerVolley } from "./markerVolley.js";
import { safeZoneRaid } from "./safeZoneRaid.js";

export const HAZARD_IDS = ["markerVolley", "safeZoneRaid"];

export const HAZARDS = {
  markerVolley,
  safeZoneRaid,
};

export const HAZARD_LABELS = {
  markerVolley: markerVolley.label,
  safeZoneRaid: safeZoneRaid.label,
};
