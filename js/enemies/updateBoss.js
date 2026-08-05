import { getPatternFn } from "../content/abilities/index.js";
import {
  distanceXZ,
  faceTarget,
  moveToward,
  syncEnemyMesh,
} from "./movement.js";

const MELEE_STATES = {
  windup: "windup",
  active: "attack",
  recover: "recover",
  breather: "breather",
};

function isBusy(hazardManager, meleeManager) {
  return hazardManager.isBusy() || meleeManager.isBusy();
}

function updateCastVisual(boss, busy, dt) {
  if (!busy) {
    boss.bodyMaterial.emissive.setHex(0x000000);
    boss.mesh.scale.set(1, 1, 1);
    return;
  }

  boss.castPulse += dt * (boss.slots.melee ? 8 : 6);
  const pulse = 1 + Math.sin(boss.castPulse) * (boss.slots.melee ? 0.08 : 0.06);
  boss.mesh.scale.set(pulse, pulse, pulse);
  boss.bodyMaterial.emissive.setHex(boss.slots.melee ? 0x442200 : 0x551111);
}

function syncMeleeState(boss, meleeManager) {
  const phase = meleeManager.getActivePhase();
  if (phase && MELEE_STATES[phase]) {
    boss.state = MELEE_STATES[phase];
    return;
  }
  boss.state = boss.slots.melee ? "pursue" : "idle";
}

function updateMovement(boss, player, dt, busy) {
  const { movement } = boss.def;
  if (!movement || movement.kind === "stationary" || busy) return;

  if (movement.kind === "chase") {
    faceTarget(boss, player.x, player.z);

    const meleeSlot = boss.slots.melee;
    const range = meleeSlot?.config.range ?? movement.slowRange ?? 2.8;
    const dist = distanceXZ(boss.x, boss.z, player.x, player.z);
    const inRange = dist <= range;
    const slowFactor = movement.slowFactor ?? 0.35;
    const speed = inRange ? movement.speed * slowFactor : movement.speed;

    moveToward(boss, player.x, player.z, speed, dt);
  }
}

function updatePatternSlot(boss, slot, dt, player, bulletManager, busy) {
  slot.picker.advanceCycle(dt);
  if (busy) return;

  slot.timer += dt;
  if (slot.timer < slot.config.interval) return;

  slot.timer = 0;
  slot.phase += slot.config.params?.phaseStep ?? 0;

  const ability = slot.picker.current();
  const patternFn = ability ? getPatternFn(ability) : null;
  if (!patternFn) return;

  const specs = patternFn({
    x: boss.x,
    z: boss.z,
    targetX: player.x,
    targetZ: player.z,
    ...slot.config.params,
    phase: slot.phase,
  });

  bulletManager.spawn(specs);
}

function updateHazardSlot(boss, slot, dt, player, hazardManager, scene, bulletManager) {
  slot.picker.advanceCycle(dt);
  slot.timer += dt;

  if (slot.timer < slot.config.interval || !hazardManager.canTrigger()) return;

  const ability = slot.picker.current();
  if (!ability?.def) return;

  slot.timer = 0;
  boss.castPulse = 0;

  hazardManager.trigger(ability.def.id, {
    enemy: boss,
    player,
    scene,
    bulletManager,
    hazardDef: ability.def,
  });
}

function updateMeleeSlot(boss, slot, dt, player, meleeManager, scene, busy) {
  if (busy) return;

  faceTarget(boss, player.x, player.z);

  const range = slot.config.range ?? 2.8;
  const dist = distanceXZ(boss.x, boss.z, player.x, player.z);
  const inRange = dist <= range;

  slot.timer += dt;
  if (slot.timer < slot.config.interval || !inRange) return;

  const ability = slot.picker.current();
  if (!ability?.def) return;

  slot.timer = 0;
  boss.castPulse = 0;

  meleeManager.trigger(ability.def.id, {
    enemy: boss,
    player,
    scene,
    meleeDef: ability.def,
  });
}

/** Single update loop for all bosses — driven by boss.def loadout. */
export function updateBoss(boss, dt, ctx) {
  if (!boss.alive) return;

  const { player, bulletManager, hazardManager, meleeManager, scene } = ctx;
  const busy = isBusy(hazardManager, meleeManager);

  if (boss.slots.melee) {
    syncMeleeState(boss, meleeManager);
  }

  updateCastVisual(boss, busy, dt);

  if (boss.slots.pattern) {
    updatePatternSlot(boss, boss.slots.pattern, dt, player, bulletManager, busy);
  }

  if (boss.slots.hazard) {
    updateHazardSlot(boss, boss.slots.hazard, dt, player, hazardManager, scene, bulletManager);
  }

  if (boss.slots.melee && !busy) {
    updateMeleeSlot(boss, boss.slots.melee, dt, player, meleeManager, scene, busy);
  }

  updateMovement(boss, player, dt, busy);
  syncEnemyMesh(boss, boss.meshY);
}

export function getBossHudLabels(boss, hazardManager, meleeManager) {
  let pattern = boss.state ?? "idle";

  if (boss.slots.pattern && !boss.slots.melee) {
    pattern = boss.slots.pattern.picker.current()?.label ?? pattern;
  }

  let hazard = hazardManager.getActiveLabel();
  if (hazard) return { pattern, hazard };

  hazard = meleeManager.getActiveLabel();
  if (hazard) return { pattern, hazard };

  if (boss.slots.hazard) {
    hazard = boss.slots.hazard.picker.current()?.label ?? "";
  } else if (boss.slots.melee) {
    hazard = "chasing";
  }

  return { pattern, hazard };
}
