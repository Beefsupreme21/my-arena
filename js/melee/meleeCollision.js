/** Player inside a frontal arc on the XZ plane. */
export function pointInArc(px, pz, cx, cz, facing, radius, halfAngle) {
  const dx = px - cx;
  const dz = pz - cz;
  const distSq = dx * dx + dz * dz;
  if (distSq > radius * radius) return false;

  const angle = Math.atan2(dz, dx);
  let diff = angle - facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return Math.abs(diff) <= halfAngle;
}
