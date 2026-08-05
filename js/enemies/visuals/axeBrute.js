import * as THREE from "three";

export function createAxeBruteVisual(scene, { x, z }) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.1, 1.1),
    new THREE.MeshStandardMaterial({
      color: 0xc97a3a,
      emissive: 0x000000,
      flatShading: true,
    })
  );
  body.castShadow = true;

  const axe = new THREE.Mesh(
    new THREE.BoxGeometry(0.25, 0.9, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x888899, flatShading: true })
  );
  axe.position.set(0.55, 0.1, 0);
  body.add(axe);

  const mesh = new THREE.Group();
  mesh.add(body);
  mesh.position.set(x, 0.45, z);
  scene.add(mesh);

  return { mesh, bodyMaterial: body.material, meshY: 0.45 };
}
