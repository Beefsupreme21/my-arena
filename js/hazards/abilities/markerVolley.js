import * as THREE from "three";
import { ARENA_LIMIT } from "../../config.js";
import { hazardProgress } from "../telegraphProgress.js";
import { pointInCircle } from "../hazardCollision.js";

const MARKER_COUNT = 5;
const MARKER_RADIUS = 1.1;

function randomMarkers() {
  const markers = [];
  for (let i = 0; i < MARKER_COUNT; i++) {
    markers.push({
      x: (Math.random() * 2 - 1) * (ARENA_LIMIT - 2),
      z: (Math.random() * 2 - 1) * (ARENA_LIMIT - 2),
    });
  }
  return markers;
}

/** Danger markers — do NOT stand here when they pop. No extra bullets spawned. */
export const markerVolley = {
  id: "markerVolley",
  label: "Marker volley",
  windup: 1.2,

  start(hazard, ctx) {
    const markers = randomMarkers();
    const meshes = markers.map(({ x, z }) => {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(MARKER_RADIUS * 0.35, MARKER_RADIUS, 32),
        new THREE.MeshBasicMaterial({
          color: 0xff2222,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(x, 0.07, z);
      ring.renderOrder = 2;
      ctx.scene.add(ring);

      const fill = new THREE.Mesh(
        new THREE.CircleGeometry(MARKER_RADIUS * 0.34, 32),
        new THREE.MeshBasicMaterial({
          color: 0xff4444,
          transparent: true,
          opacity: 0.25,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      fill.rotation.x = -Math.PI / 2;
      fill.position.set(x, 0.065, z);
      fill.renderOrder = 1;
      ctx.scene.add(fill);

      return { x, z, ring, fill };
    });

    hazard.data = { markers, meshes };
  },

  updateTelegraph(hazard) {
    const progress = hazardProgress(hazard.elapsed, markerVolley.windup);
    for (const { ring, fill } of hazard.data.meshes) {
      ring.material.opacity = 0.35 + progress * 0.55;
      const fillScale = 0.2 + progress * 0.95;
      fill.scale.set(fillScale, fillScale, 1);
      fill.material.opacity = 0.2 + progress * 0.5;
    }
  },

  resolve(hazard) {
    hazard.resolvedHit = true;
    hazard.data.hitMarkers = hazard.data.markers.map((m) => ({ ...m }));
  },

  checkResolveHit(hazard, player) {
    if (!hazard.resolvedHit || !player.alive) return false;
    for (const { x, z } of hazard.data.hitMarkers ?? []) {
      if (pointInCircle(player.x, player.z, x, z, MARKER_RADIUS * 0.85)) {
        return true;
      }
    }
    return false;
  },

  dispose(hazard, scene) {
    for (const { ring, fill } of hazard.data.meshes) {
      scene.remove(ring);
      scene.remove(fill);
      ring.geometry.dispose();
      ring.material.dispose();
      fill.geometry.dispose();
      fill.material.dispose();
    }
  },
};
