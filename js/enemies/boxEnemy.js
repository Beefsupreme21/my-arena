import * as THREE from "three";
import { createPatternPicker } from "../patterns/picker.js";
import { createHazardPicker } from "../hazards/hazardPicker.js";

const DEFAULT_EMITTER = {
  interval: 0.8,
  speed: 4,
  count: 12,
  phase: 0,
  timer: 0,
  phaseStep: 0.2,
  cycleInterval: 3,
  hazardInterval: 6,
  hazardTimer: 2,
};

export function createBoxEnemy(scene, { x, z }) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.9, 0.9),
    new THREE.MeshStandardMaterial({
      color: 0xe85d5d,
      emissive: 0x000000,
      flatShading: true,
    })
  );
  mesh.position.set(x, 0.45, z);
  mesh.castShadow = true;
  scene.add(mesh);

  return {
    mesh,
    x,
    z,
    alive: true,
    castPulse: 0,
    emitter: { ...DEFAULT_EMITTER },
    patternPicker: createPatternPicker({
      mode: "cycle",
      cycleInterval: DEFAULT_EMITTER.cycleInterval,
    }),
    hazardPicker: createHazardPicker({ cycleInterval: 5 }),
  };
}

function updateCastVisual(enemy, casting, dt) {
  const mat = enemy.mesh.material;

  if (!casting) {
    mat.emissive.setHex(0x000000);
    enemy.mesh.scale.set(1, 1, 1);
    return;
  }

  // Placeholder until cast animation is hooked up.
  enemy.castPulse += dt * 6;
  const pulse = 1 + Math.sin(enemy.castPulse) * 0.06;
  enemy.mesh.scale.set(pulse, pulse, pulse);
  mat.emissive.setHex(0x551111);
}

export function updateBoxEnemy(enemy, dt, bulletManager, player, hazardManager, scene) {
  if (!enemy.alive) return;

  const casting = hazardManager.isBusy();
  updateCastVisual(enemy, casting, dt);

  if (!casting) {
    enemy.patternPicker.advanceCycle(dt);
  }

  enemy.hazardPicker.advanceCycle(dt);

  const emitter = enemy.emitter;
  emitter.hazardTimer += dt;

  if (emitter.hazardTimer >= emitter.hazardInterval && hazardManager.canTrigger()) {
    emitter.hazardTimer = 0;
    enemy.castPulse = 0;
    const hazardDef = enemy.hazardPicker.currentDef();
    hazardManager.trigger(hazardDef.id, {
      enemy,
      player,
      scene,
      bulletManager,
      hazardDef,
    });
  }

  // No instant bullet patterns while casting a telegraph.
  if (casting) return;

  emitter.timer += dt;
  if (emitter.timer < emitter.interval) return;

  emitter.timer = 0;
  emitter.phase += emitter.phaseStep;

  const { specs } = enemy.patternPicker.emit({
    enemy,
    player,
    params: {
      count: emitter.count,
      speed: emitter.speed,
      phase: emitter.phase,
    },
  });

  bulletManager.spawn(specs);
}

export function getEnemyPatternId(enemy) {
  return enemy.patternPicker.getCurrentPatternId();
}

export function getEnemyHazardId(enemy) {
  return enemy.hazardPicker.currentId();
}

export function resetBoxEnemy(enemy) {
  enemy.emitter.timer = 0;
  enemy.emitter.hazardTimer = 0;
  enemy.emitter.phase = 0;
  enemy.castPulse = 0;
  enemy.patternPicker.reset();
  enemy.hazardPicker.reset();
  enemy.mesh.material.emissive.setHex(0x000000);
  enemy.mesh.scale.set(1, 1, 1);
}

export function disposeBoxEnemy(enemy, scene) {
  scene.remove(enemy.mesh);
  enemy.alive = false;
}
