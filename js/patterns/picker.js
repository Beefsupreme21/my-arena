import { PATTERN_IDS, PATTERNS } from "./index.js";

/** Advance to the next pattern every `cycleInterval` seconds. */
export function createPatternPicker({
  patternIds = PATTERN_IDS,
  mode = "cycle",
  cycleInterval = 3,
} = {}) {
  let patternIndex = 0;
  let cycleTimer = 0;

  function currentPatternId() {
    return patternIds[patternIndex % patternIds.length];
  }

  function advanceCycle(dt) {
    if (mode !== "cycle") return;

    cycleTimer += dt;
    if (cycleTimer >= cycleInterval) {
      cycleTimer = 0;
      patternIndex = (patternIndex + 1) % patternIds.length;
    }
  }

  function emit({ enemy, player, params }) {
    const patternId = currentPatternId();
    const pattern = PATTERNS[patternId];

    const specs = pattern({
      x: enemy.x,
      z: enemy.z,
      targetX: player.x,
      targetZ: player.z,
      ...params,
    });

    return { patternId, specs };
  }

  function reset() {
    patternIndex = 0;
    cycleTimer = 0;
  }

  return {
    advanceCycle,
    emit,
    reset,
    getCurrentPatternId: currentPatternId,
  };
}
