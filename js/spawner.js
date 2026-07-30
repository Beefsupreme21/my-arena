import {
  createBoxEnemy,
  disposeBoxEnemy,
  getEnemyHazardId,
  getEnemyPatternId,
  resetBoxEnemy,
  updateBoxEnemy,
} from "./enemies/boxEnemy.js";
import { PATTERN_LABELS } from "./patterns/index.js";
import { HAZARD_LABELS } from "./hazards/abilities/catalog.js";

const SLICE1_ENEMY = { x: 0, z: -4 };

export function createSpawner(scene, hazardManager) {
  let enemies = [];

  function spawnInitial() {
    enemies.push(createBoxEnemy(scene, SLICE1_ENEMY));
  }

  function update(dt, bulletManager, player) {
    for (const enemy of enemies) {
      updateBoxEnemy(enemy, dt, bulletManager, player, hazardManager, scene);
    }
  }

  function getHudLabels() {
    const enemy = enemies[0];
    if (!enemy) return { pattern: "", hazard: "" };

    const patternId = getEnemyPatternId(enemy);
    const hazardId = getEnemyHazardId(enemy);
    const activeHazard = hazardManager.getActiveLabel();

    return {
      pattern: PATTERN_LABELS[patternId] ?? patternId,
      hazard: activeHazard || HAZARD_LABELS[hazardId] || hazardId,
    };
  }

  function reset() {
    for (const enemy of enemies) {
      resetBoxEnemy(enemy);
    }
  }

  function dispose() {
    for (const enemy of enemies) {
      disposeBoxEnemy(enemy, scene);
    }
    enemies = [];
  }

  function respawn() {
    dispose();
    spawnInitial();
  }

  spawnInitial();

  return { update, reset, respawn, dispose, getHudLabels };
}
