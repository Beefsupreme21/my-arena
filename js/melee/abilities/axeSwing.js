import * as THREE from "three";
import { hazardProgress } from "../../hazards/telegraphProgress.js";
import { pointInArc } from "../meleeCollision.js";

const SWING_RADIUS = 2.6;
const SWING_HALF_ANGLE = Math.PI * 0.45;

export const axeSwing = {
  id: "axeSwing",
  label: "Axe sweep",
  windup: 0.75,
  active: 0.18,
  recover: 0.55,

  start(attack, ctx) {
    const { enemy, player } = ctx;
    attack.lockedFacing = Math.atan2(player.z - enemy.z, player.x - enemy.x);
    enemy.facing = attack.lockedFacing;

    const arc = new THREE.Mesh(
      new THREE.RingGeometry(SWING_RADIUS * 0.35, SWING_RADIUS, 24, 1, -SWING_HALF_ANGLE, SWING_HALF_ANGLE * 2),
      new THREE.MeshBasicMaterial({
        color: 0xff8844,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    arc.rotation.x = -Math.PI / 2;
    arc.rotation.z = -attack.lockedFacing - SWING_HALF_ANGLE;
    arc.position.set(enemy.x, 0.08, enemy.z);
    arc.renderOrder = 2;
    ctx.scene.add(arc);

    attack.data = {
      lockedFacing: attack.lockedFacing,
      arc,
      hitPlayer: false,
      disposed: false,
    };
  },

  updateTelegraph(attack, ctx) {
    if (attack.data.disposed) return;
    const { enemy } = ctx;
    attack.data.arc.position.set(enemy.x, 0.08, enemy.z);
    const progress = hazardProgress(attack.elapsed, axeSwing.windup);
    attack.data.arc.material.opacity = 0.25 + progress * 0.55;
    attack.data.arc.scale.set(0.4 + progress * 0.65, 0.4 + progress * 0.65, 1);
  },

  updateActive(attack, ctx) {
    const { enemy, player } = ctx;
    if (attack.data.disposed) return;

    attack.data.arc.position.set(enemy.x, 0.08, enemy.z);
    attack.data.arc.material.color.setHex(0xff4422);
    attack.data.arc.material.opacity = 0.85;
    attack.data.arc.scale.set(1, 1, 1);

    if (attack.data.hitPlayer || !player.alive) return;

    if (
      pointInArc(
        player.x,
        player.z,
        enemy.x,
        enemy.z,
        attack.data.lockedFacing,
        SWING_RADIUS,
        SWING_HALF_ANGLE
      )
    ) {
      attack.data.hitPlayer = true;
    }
  },

  updateRecover(attack) {
    if (attack.data.disposed) return;
    const progress = hazardProgress(attack.elapsed, axeSwing.recover);
    attack.data.arc.material.color.setHex(0xff8844);
    attack.data.arc.material.opacity = 0.85 * (1 - progress);
    attack.data.arc.scale.set(1 - progress * 0.3, 1 - progress * 0.3, 1);
  },

  checkHit(attack) {
    return attack.data.hitPlayer === true;
  },

  dispose(attack, scene) {
    if (attack.data.disposed) return;
    scene.remove(attack.data.arc);
    attack.data.arc.geometry.dispose();
    attack.data.arc.material.dispose();
    attack.data.disposed = true;
  },
};
