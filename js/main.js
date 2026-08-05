/**
 * Dodge-only bullet hell — instant patterns + telegraphed hazards.
 */

import * as THREE from "three";
import { ARENA, ARENA_LIMIT } from "./config.js";
import { createPlayer, damagePlayer, resetPlayer, updatePlayer } from "./player.js";
import { createBulletManager } from "./bulletManager.js";
import { createSpawner } from "./spawner.js";
import { createHazardManager } from "./hazards/hazardManager.js";
import { createMeleeManager } from "./melee/meleeManager.js";
import { playerHitByBullets } from "./collision.js";

const canvas = document.getElementById("game");
const hudTitle = document.getElementById("hud-title");
const hudStatus = document.getElementById("hud-status");
const nextBossButton = document.getElementById("next-boss");

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d12);

const VIEW_HEIGHT = 14;
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
camera.position.set(0, 20, 0);
camera.lookAt(0, 0, 0);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(ARENA * 2, ARENA * 2),
  new THREE.MeshStandardMaterial({ color: 0x2a3038, roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
scene.add(new THREE.GridHelper(ARENA * 2, 24, 0x3a4560, 0x252b3a));

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(6, 12, 4);
sun.castShadow = true;
scene.add(sun);

const player = createPlayer(scene);
const bulletManager = createBulletManager(scene);
const hazardManager = createHazardManager();
const meleeManager = createMeleeManager();
const spawner = createSpawner(scene, hazardManager, meleeManager);

const keys = {};
window.addEventListener("keydown", (event) => {
  keys[event.code] = true;
  if (event.code === "KeyR") {
    resetRun();
  }
});
window.addEventListener("keyup", (event) => {
  keys[event.code] = false;
});

let gameState = "playing";
let timeAlive = 0;
let last = performance.now();

function readMovementInput() {
  let x = 0;
  let z = 0;
  if (keys.KeyA || keys.ArrowLeft) x -= 1;
  if (keys.KeyD || keys.ArrowRight) x += 1;
  if (keys.KeyW || keys.ArrowUp) z -= 1;
  if (keys.KeyS || keys.ArrowDown) z += 1;
  const length = Math.hypot(x, z);
  if (length > 0) {
    x /= length;
    z /= length;
  }
  return { x, z };
}

function updateHud() {
  if (gameState === "playing") {
    const { boss, pattern, hazard } = spawner.getHudLabels();
    hudTitle.textContent = `Arena 2 · ${timeAlive.toFixed(1)}s · HP ${player.hp}/${player.maxHp}`;
    hudStatus.textContent = `${boss} · ${pattern} · ${hazard}`;
    return;
  }

  hudTitle.textContent = `Game over · ${timeAlive.toFixed(1)}s survived`;
  hudStatus.textContent = "Press R to restart";
}

function resetRun() {
  gameState = "playing";
  timeAlive = 0;
  resetPlayer(player);
  bulletManager.clear();
  hazardManager.clear(scene);
  meleeManager.clear(scene);
  spawner.respawn();
  updateHud();
}

function cycleBoss() {
  gameState = "playing";
  timeAlive = 0;
  resetPlayer(player);
  bulletManager.clear();
  hazardManager.clear(scene);
  meleeManager.clear(scene);
  spawner.cycleBoss();
  updateHud();
}

nextBossButton.addEventListener("click", cycleBoss);

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);

  const aspect = width / height;
  if (aspect >= 1) {
    camera.left = -VIEW_HEIGHT * aspect;
    camera.right = VIEW_HEIGHT * aspect;
    camera.top = VIEW_HEIGHT;
    camera.bottom = -VIEW_HEIGHT;
  } else {
    camera.left = -VIEW_HEIGHT;
    camera.right = VIEW_HEIGHT;
    camera.top = VIEW_HEIGHT / aspect;
    camera.bottom = -VIEW_HEIGHT / aspect;
  }
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
resize();
updateHud();

function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (gameState === "playing") {
    timeAlive += dt;
    updatePlayer(player, readMovementInput(), dt);
    spawner.update(dt, bulletManager, player);
    bulletManager.update(dt, ARENA_LIMIT);

    const hazardHit = hazardManager.update(dt, {
      player,
      scene,
      bulletManager,
    });

    const meleeHit = meleeManager.update(dt, { player, scene });

    if (hazardHit || meleeHit || playerHitByBullets(player, bulletManager.getActive())) {
      if (damagePlayer(player)) {
        gameState = "dead";
      }
    }
  }

  updateHud();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
