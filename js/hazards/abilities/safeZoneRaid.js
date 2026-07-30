import * as THREE from "three";
import { ARENA, ARENA_LIMIT } from "../../config.js";
import { hazardProgress } from "../telegraphProgress.js";
import { pointInCircle } from "../hazardCollision.js";

const SAFE_RADIUS = 1.3;

export const safeZoneRaid = {
  id: "safeZoneRaid",
  label: "Safe zone raid",
  windup: 5.0,

  start(hazard, ctx) {
    const safeX = (Math.random() * 2 - 1) * (ARENA_LIMIT - 3);
    const safeZ = (Math.random() * 2 - 1) * (ARENA_LIMIT - 3);

    const danger = new THREE.Mesh(
      new THREE.PlaneGeometry(ARENA * 2, ARENA * 2),
      new THREE.MeshBasicMaterial({
        color: 0xcc2233,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    danger.rotation.x = -Math.PI / 2;
    danger.position.y = 0.055;
    danger.renderOrder = 0;
    ctx.scene.add(danger);

    const safeRing = new THREE.Mesh(
      new THREE.RingGeometry(SAFE_RADIUS * 0.4, SAFE_RADIUS, 32),
      new THREE.MeshBasicMaterial({
        color: 0x44ff88,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    safeRing.rotation.x = -Math.PI / 2;
    safeRing.position.set(safeX, 0.08, safeZ);
    safeRing.renderOrder = 3;
    ctx.scene.add(safeRing);

    const safeFill = new THREE.Mesh(
      new THREE.CircleGeometry(SAFE_RADIUS * 0.38, 32),
      new THREE.MeshBasicMaterial({
        color: 0x88ffbb,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    safeFill.rotation.x = -Math.PI / 2;
    safeFill.position.set(safeX, 0.075, safeZ);
    safeFill.renderOrder = 2;
    ctx.scene.add(safeFill);

    hazard.data = { safeX, safeZ, danger, safeRing, safeFill };
  },

  updateTelegraph(hazard) {
    const progress = hazardProgress(hazard.elapsed, safeZoneRaid.windup);
    hazard.data.danger.material.opacity = 0.12 + progress * 0.35;
    const fillScale = 0.25 + progress;
    hazard.data.safeFill.scale.set(fillScale, fillScale, 1);
    hazard.data.safeRing.material.opacity = 0.45 + progress * 0.45;
  },

  resolve(hazard, ctx) {
    const { safeX, safeZ } = hazard.data;
    const { player } = ctx;
    hazard.resolvedHit = true;
    hazard.data.playerWasSafe =
      player.alive && pointInCircle(player.x, player.z, safeX, safeZ, SAFE_RADIUS);
  },

  checkResolveHit(hazard, player) {
    if (!hazard.resolvedHit || !player.alive) return false;
    return !hazard.data.playerWasSafe;
  },

  dispose(hazard, scene) {
    for (const key of ["danger", "safeRing", "safeFill"]) {
      const mesh = hazard.data[key];
      scene.remove(mesh);
      mesh.geometry.dispose();
      mesh.material.dispose();
    }
  },
};
