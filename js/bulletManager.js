import * as THREE from "three";

const BULLET_Y = 0.25;
const BULLET_TTL = 8;

export function createBulletManager(scene) {
  const bullets = [];
  const geometry = new THREE.SphereGeometry(0.15, 8, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff5566,
    emissive: 0x551122,
    flatShading: true,
  });

  function spawn(specs) {
    for (const spec of specs) {
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(spec.x, BULLET_Y, spec.z);
      scene.add(mesh);

      bullets.push({
        x: spec.x,
        z: spec.z,
        vx: spec.vx,
        vz: spec.vz,
        radius: spec.radius,
        mesh,
        ttl: BULLET_TTL,
      });
    }
  }

  function update(dt, arenaLimit) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const bullet = bullets[i];
      bullet.x += bullet.vx * dt;
      bullet.z += bullet.vz * dt;
      bullet.ttl -= dt;
      bullet.mesh.position.set(bullet.x, BULLET_Y, bullet.z);

      const outOfBounds =
        Math.abs(bullet.x) > arenaLimit || Math.abs(bullet.z) > arenaLimit;

      if (bullet.ttl <= 0 || outOfBounds) {
        scene.remove(bullet.mesh);
        bullets.splice(i, 1);
      }
    }
  }

  function clear() {
    for (const bullet of bullets) {
      scene.remove(bullet.mesh);
    }
    bullets.length = 0;
  }

  return {
    spawn,
    update,
    clear,
    getActive: () => bullets,
  };
}
