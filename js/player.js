import * as THREE from "three";
import { ARENA_LIMIT, INVULN_DURATION, MAX_HP, MOVE_SPEED } from "./config.js";

export function createPlayer(scene) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.8, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x5ecf7a, flatShading: true })
  );
  mesh.position.y = 0.4;
  mesh.castShadow = true;
  scene.add(mesh);

  return {
    mesh,
    x: 0,
    z: 4,
    radius: 0.4,
    alive: true,
    hp: MAX_HP,
    maxHp: MAX_HP,
    invulnTimer: 0,
    moveSpeed: MOVE_SPEED,
  };
}

export function resetPlayer(player) {
  player.x = 0;
  player.z = 4;
  player.alive = true;
  player.hp = player.maxHp;
  player.invulnTimer = 0;
  player.mesh.visible = true;
  player.mesh.material.color.setHex(0x5ecf7a);
  syncPlayerMesh(player);
}

export function updatePlayer(player, input, dt) {
  if (!player.alive) return;

  if (player.invulnTimer > 0) {
    player.invulnTimer = Math.max(0, player.invulnTimer - dt);
    const flash = Math.floor(player.invulnTimer * 12) % 2 === 0;
    player.mesh.material.color.setHex(flash ? 0xffffff : 0x5ecf7a);
  }

  player.x += input.x * player.moveSpeed * dt;
  player.z += input.z * player.moveSpeed * dt;
  player.x = THREE.MathUtils.clamp(player.x, -ARENA_LIMIT, ARENA_LIMIT);
  player.z = THREE.MathUtils.clamp(player.z, -ARENA_LIMIT, ARENA_LIMIT);
  syncPlayerMesh(player);
}

/** Returns true if this damage killed the player. */
export function damagePlayer(player) {
  if (!player.alive || player.invulnTimer > 0) return false;

  player.hp -= 1;
  player.invulnTimer = INVULN_DURATION;

  if (player.hp <= 0) {
    killPlayer(player);
    return true;
  }

  return false;
}

export function killPlayer(player) {
  player.alive = false;
  player.hp = 0;
  player.mesh.visible = false;
}

function syncPlayerMesh(player) {
  player.mesh.position.set(player.x, 0.4, player.z);
}
