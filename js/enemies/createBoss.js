import { createAbilityPicker } from "../abilityPicker.js";
import { VISUALS } from "./visuals/index.js";

function createSlot(config) {
  return {
    config,
    picker: createAbilityPicker({
      abilityIds: config.abilityIds,
      cycleInterval: config.cycleInterval ?? 4,
    }),
    timer: config.initialDelay ?? 0,
    phase: 0,
  };
}

/** Build a runtime boss instance from a content definition. */
export function createBoss(scene, bossDef) {
  const buildVisual = VISUALS[bossDef.visual];
  if (!buildVisual) {
    throw new Error(`Unknown boss visual: ${bossDef.visual}`);
  }

  const visual = buildVisual(scene, bossDef.spawn);
  const slots = {};

  for (const [name, slotConfig] of Object.entries(bossDef.slots ?? {})) {
    slots[name] = createSlot(slotConfig);
  }

  return {
    bossId: bossDef.id,
    label: bossDef.label,
    def: bossDef,
    mesh: visual.mesh,
    bodyMaterial: visual.bodyMaterial,
    meshY: visual.meshY ?? 0.45,
    x: bossDef.spawn.x,
    z: bossDef.spawn.z,
    facing: 0,
    alive: true,
    castPulse: 0,
    state: "idle",
    slots,
  };
}

export function resetBoss(boss) {
  boss.castPulse = 0;
  boss.state = "idle";

  for (const slot of Object.values(boss.slots)) {
    slot.timer = slot.config.initialDelay ?? 0;
    slot.phase = 0;
    slot.picker.reset();
  }

  boss.bodyMaterial.emissive.setHex(0x000000);
  boss.mesh.scale.set(1, 1, 1);
}

export function disposeBoss(boss, scene) {
  scene.remove(boss.mesh);
  boss.alive = false;
}
