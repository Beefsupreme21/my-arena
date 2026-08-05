import * as THREE from "three";

export function createBoxCasterVisual(scene, { x, z }) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.9, 0.9),
    new THREE.MeshStandardMaterial({
      color: 0xe85d5d,
      emissive: 0x000000,
      flatShading: true,
    })
  );
  mesh.position.set(x, 0.45, z);
  mesh.castShadow = true;
  scene.add(mesh);

  return { mesh, bodyMaterial: mesh.material, meshY: 0.45 };
}
