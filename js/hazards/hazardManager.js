import { HAZARD_LABELS } from "./abilities/catalog.js";

const GAP_AFTER_ATTACK = 1.0;

export function createHazardManager() {
  const active = [];
  let cooldown = 0;

  function trigger(id, ctx) {
    const def = ctx.hazardDef;
    if (!def || def.id !== id) return;

    const hazard = {
      id,
      def,
      elapsed: 0,
      phase: "windup",
      resolvedHit: false,
      data: {},
    };

    def.start(hazard, ctx);
    active.push(hazard);
  }

  function finishHazard(hazard, ctx) {
    let playerHit = false;

    hazard.phase = "resolve";
    hazard.def.resolve(hazard, ctx);

    if (hazard.def.checkResolveHit?.(hazard, ctx.player)) {
      playerHit = true;
    }

    hazard.def.dispose(hazard, ctx.scene);
    cooldown = GAP_AFTER_ATTACK;
    return playerHit;
  }

  function update(dt, ctx) {
    if (cooldown > 0) {
      cooldown = Math.max(0, cooldown - dt);
    }

    let playerHit = false;

    for (let i = active.length - 1; i >= 0; i--) {
      const hazard = active[i];
      hazard.elapsed += dt;

      if (hazard.phase !== "windup") continue;

      hazard.def.updateTelegraph(hazard, ctx);

      if (hazard.elapsed < hazard.def.windup) continue;

      if (finishHazard(hazard, ctx)) {
        playerHit = true;
      }

      active.splice(i, 1);
    }

    return playerHit;
  }

  function getActiveLabel() {
    if (active.length > 0) {
      return HAZARD_LABELS[active[0].id] ?? active[0].id;
    }
    if (cooldown > 0) return "breather";
    return "";
  }

  function canTrigger() {
    return active.length === 0 && cooldown <= 0;
  }

  function isBusy() {
    return active.length > 0;
  }

  function clear(scene) {
    for (const hazard of active) {
      hazard.def.dispose(hazard, scene);
    }
    active.length = 0;
    cooldown = 0;
  }

  return { trigger, update, getActiveLabel, canTrigger, isBusy, clear };
}
