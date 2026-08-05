/**
 * Master ability catalog — every boss ability registers here once.
 * channel: pattern | hazard | melee
 */
import { PATTERNS } from "../../patterns/index.js";
import { HAZARDS } from "../../hazards/abilities/catalog.js";
import { MELEE } from "../../melee/abilities/catalog.js";

export const ABILITIES = {
  ringBurst: {
    id: "ringBurst",
    channel: "pattern",
    label: "Ring burst",
    patternKey: "ring",
  },
  aimedFan: {
    id: "aimedFan",
    channel: "pattern",
    label: "Aimed fan",
    patternKey: "aimed",
  },
  markerVolley: {
    id: "markerVolley",
    channel: "hazard",
    label: "Marker volley",
    def: HAZARDS.markerVolley,
  },
  safeZoneRaid: {
    id: "safeZoneRaid",
    channel: "hazard",
    label: "Safe zone raid",
    def: HAZARDS.safeZoneRaid,
  },
  axeSwing: {
    id: "axeSwing",
    channel: "melee",
    label: "Axe sweep",
    def: MELEE.axeSwing,
  },
};

export function getAbility(id) {
  return ABILITIES[id] ?? null;
}

export function getPatternFn(ability) {
  return PATTERNS[ability.patternKey] ?? null;
}
