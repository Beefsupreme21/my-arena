import { MELEE_LABELS } from "./abilities/catalog.js";

const GAP_AFTER_ATTACK = 0.4;

export function createMeleeManager() {
  const active = [];
  let cooldown = 0;

  function trigger(id, ctx) {
    const def = ctx.meleeDef;
    if (!def || def.id !== id) return;

    const attack = {
      id,
      def,
      phase: "windup",
      elapsed: 0,
      data: {},
      enemy: ctx.enemy,
    };

    def.start(attack, ctx);
    active.push(attack);
  }

  function update(dt, ctx) {
    if (cooldown > 0) cooldown = Math.max(0, cooldown - dt);

    let playerHit = false;

    for (let i = active.length - 1; i >= 0; i--) {
      const attack = active[i];
      attack.elapsed += dt;
      const def = attack.def;

      if (attack.phase === "windup") {
        def.updateTelegraph?.(attack, { ...ctx, enemy: attack.enemy });
        if (attack.elapsed >= def.windup) {
          attack.phase = "active";
          attack.elapsed = 0;
        }
        continue;
      }

      if (attack.phase === "active") {
        def.updateActive?.(attack, { ...ctx, enemy: attack.enemy });
        if (attack.elapsed >= def.active) {
          if (def.checkHit?.(attack)) playerHit = true;
          attack.phase = "recover";
          attack.elapsed = 0;
        }
        continue;
      }

      if (attack.phase === "recover") {
        def.updateRecover?.(attack, { ...ctx, enemy: attack.enemy });
        if (attack.elapsed >= def.recover) {
          def.dispose(attack, ctx.scene);
          active.splice(i, 1);
          cooldown = GAP_AFTER_ATTACK;
        }
      }
    }

    return playerHit;
  }

  function getActiveLabel() {
    if (active.length === 0) return cooldown > 0 ? "breather" : "";
    return MELEE_LABELS[active[0].id] ?? active[0].id;
  }

  function getActivePhase() {
    if (active.length === 0) return cooldown > 0 ? "breather" : null;
    return active[0].phase;
  }

  function isBusy() {
    return active.length > 0;
  }

  function clear(scene) {
    for (const attack of active) {
      attack.def.dispose(attack, scene);
    }
    active.length = 0;
    cooldown = 0;
  }

  return { trigger, update, getActiveLabel, getActivePhase, isBusy, clear };
}
