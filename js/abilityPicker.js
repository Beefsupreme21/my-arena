import { getAbility } from "./content/abilities/index.js";

/** Cycles through a boss slot's ability ids on a timer. */
export function createAbilityPicker({ abilityIds = [], cycleInterval = 4 } = {}) {
  let index = 0;
  let cycleTimer = 0;

  function currentId() {
    if (abilityIds.length === 0) return null;
    return abilityIds[index % abilityIds.length];
  }

  function current() {
    const id = currentId();
    return id ? getAbility(id) : null;
  }

  function advanceCycle(dt) {
    if (abilityIds.length <= 1) return;

    cycleTimer += dt;
    if (cycleTimer >= cycleInterval) {
      cycleTimer = 0;
      index = (index + 1) % abilityIds.length;
    }
  }

  function reset() {
    index = 0;
    cycleTimer = 0;
  }

  return { advanceCycle, currentId, current, reset };
}
