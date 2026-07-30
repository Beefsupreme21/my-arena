/** 2D circle overlap on the XZ plane. */
export function circlesOverlap(ax, az, aRadius, bx, bz, bRadius) {
  const dx = ax - bx;
  const dz = az - bz;
  const combined = aRadius + bRadius;
  return dx * dx + dz * dz <= combined * combined;
}

/** Returns true if the player intersects any bullet. */
export function playerHitByBullets(player, bullets) {
  if (!player.alive) return false;

  for (const bullet of bullets) {
    if (
      circlesOverlap(
        player.x,
        player.z,
        player.radius,
        bullet.x,
        bullet.z,
        bullet.radius
      )
    ) {
      return true;
    }
  }

  return false;
}
