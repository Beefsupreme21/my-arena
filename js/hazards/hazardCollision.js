/** Point inside a circle on the XZ plane. */
export function pointInCircle(px, pz, cx, cz, radius) {
  const dx = px - cx;
  const dz = pz - cz;
  return dx * dx + dz * dz <= radius * radius;
}

/** Point inside an oriented rectangle on the XZ plane. */
export function pointInRect(px, pz, cx, cz, halfWidth, halfLength, angle) {
  const dx = px - cx;
  const dz = pz - cz;
  const cos = Math.cos(-angle);
  const sin = Math.sin(-angle);
  const localX = dx * cos - dz * sin;
  const localZ = dx * sin + dz * cos;
  return Math.abs(localX) <= halfWidth && Math.abs(localZ) <= halfLength;
}
