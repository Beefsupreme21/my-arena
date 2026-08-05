import {
  getBossDefById,
  getNextBossId,
  resolveInitialBossId,
} from "./content/bosses/index.js";
import { createBoss, disposeBoss, resetBoss } from "./enemies/createBoss.js";
import { getBossHudLabels, updateBoss } from "./enemies/updateBoss.js";

export function createSpawner(scene, hazardManager, meleeManager) {
  let enemies = [];
  let currentBossId = resolveInitialBossId();
  let bossDef = getBossDefById(currentBossId);

  function spawnInitial() {
    enemies = [createBoss(scene, bossDef)];
  }

  function update(dt, bulletManager, player) {
    const ctx = { player, bulletManager, hazardManager, meleeManager, scene };

    for (const boss of enemies) {
      updateBoss(boss, dt, ctx);
    }
  }

  function getHudLabels() {
    const boss = enemies[0];
    if (!boss) return { boss: "", pattern: "", hazard: "" };

    const labels = getBossHudLabels(boss, hazardManager, meleeManager);
    return {
      boss: bossDef.label,
      pattern: labels.pattern,
      hazard: labels.hazard,
    };
  }

  function getCurrentBossId() {
    return currentBossId;
  }

  function reset() {
    for (const boss of enemies) {
      resetBoss(boss);
    }
  }

  function dispose() {
    for (const boss of enemies) {
      disposeBoss(boss, scene);
    }
    enemies = [];
  }

  function respawn() {
    dispose();
    spawnInitial();
  }

  function cycleBoss() {
    currentBossId = getNextBossId(currentBossId);
    bossDef = getBossDefById(currentBossId);

    const url = new URL(window.location.href);
    url.searchParams.set("boss", currentBossId);
    history.replaceState(null, "", url);

    respawn();
    return bossDef;
  }

  spawnInitial();

  return { update, reset, respawn, dispose, cycleBoss, getHudLabels, getCurrentBossId };
}
