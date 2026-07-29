/**
 * Slice 0 — movement + camera + bounded arena.
 * build-isometric-arpg: first vertical slice only.
 */

import * as THREE from "three";

const canvas = document.getElementById("game");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d12);
scene.fog = new THREE.Fog(0x0b0d12, 20, 50);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
const cameraOffset = new THREE.Vector3(0, 12, 10);
const camPos = cameraOffset.clone();
const camLook = new THREE.Vector3();

const ARENA = 12;
const MOVE_SPEED = 6;

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

const player = new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 1.2, 0.8),
  new THREE.MeshStandardMaterial({ color: 0x5ecf7a, flatShading: true })
);
player.position.y = 0.6;
player.castShadow = true;
scene.add(player);

const keys = {};
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

const vel = { x: 0, z: 0 };
function readInput() {
  vel.x = vel.z = 0;
  if (keys.KeyA || keys.ArrowLeft) vel.x -= 1;
  if (keys.KeyD || keys.ArrowRight) vel.x += 1;
  if (keys.KeyW || keys.ArrowUp) vel.z -= 1;
  if (keys.KeyS || keys.ArrowDown) vel.z += 1;
  const len = Math.hypot(vel.x, vel.z);
  if (len > 0) { vel.x /= len; vel.z /= len; }
}

function clampPosition(obj) {
  const limit = ARENA - 0.6;
  obj.position.x = THREE.MathUtils.clamp(obj.position.x, -limit, limit);
  obj.position.z = THREE.MathUtils.clamp(obj.position.z, -limit, limit);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

let last = performance.now();
function tick(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  readInput();
  const moving = vel.x !== 0 || vel.z !== 0;

  player.position.x += vel.x * MOVE_SPEED * dt;
  player.position.z += vel.z * MOVE_SPEED * dt;
  clampPosition(player);

  if (moving) {
    player.rotation.y = Math.atan2(vel.x, vel.z);
  }

  const desired = new THREE.Vector3(
    player.position.x + cameraOffset.x,
    cameraOffset.y,
    player.position.z + cameraOffset.z
  );
  camPos.lerp(desired, 1 - Math.pow(0.001, dt));
  camera.position.copy(camPos);
  camLook.lerp(player.position, 1 - Math.pow(0.0005, dt));
  camera.lookAt(camLook);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
