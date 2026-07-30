import { HAZARD_IDS, HAZARDS } from "./abilities/catalog.js";

export function createHazardPicker({
  hazardIds = HAZARD_IDS,
  cycleInterval = 4,
} = {}) {
  let index = 0;
  let cycleTimer = 0;

  function currentId() {
    return hazardIds[index % hazardIds.length];
  }

  function advanceCycle(dt) {
    cycleTimer += dt;
    if (cycleTimer >= cycleInterval) {
      cycleTimer = 0;
      index = (index + 1) % hazardIds.length;
    }
  }

  function currentDef() {
    return HAZARDS[currentId()];
  }

  function reset() {
    index = 0;
    cycleTimer = 0;
  }

  return { advanceCycle, currentId, currentDef, reset };
}
