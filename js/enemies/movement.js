import * as THREE from "three";
import { ARENA_LIMIT } from "../config.js";

export function distanceXZ(ax, az, bx, bz) {
  return Math.hypot(bx - ax, bz - az);
}

export function moveToward(entity, targetX, targetZ, speed, dt) {
  const dx = targetX - entity.x;
  const dz = targetZ - entity.z;
  const dist = Math.hypot(dx, dz);
  if (dist < 0.05) return dist;

  const step = speed * dt;
  const t = Math.min(1, step / dist);
  entity.x += dx * t;
  entity.z += dz * t;
  entity.x = THREE.MathUtils.clamp(entity.x, -ARENA_LIMIT, ARENA_LIMIT);
  entity.z = THREE.MathUtils.clamp(entity.z, -ARENA_LIMIT, ARENA_LIMIT);
  return distanceXZ(entity.x, entity.z, targetX, targetZ);
}

export function faceTarget(entity, targetX, targetZ) {
  entity.facing = Math.atan2(targetZ - entity.z, targetX - entity.x);
}

export function syncEnemyMesh(entity, y = 0.45) {
  entity.mesh.position.set(entity.x, y, entity.z);
  entity.mesh.rotation.y = entity.facing;
}
