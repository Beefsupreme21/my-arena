/**
 * Pure pattern emitters — no Three.js.
 * Each returns bullet specs: { x, z, vx, vz, radius }.
 */

const BULLET_RADIUS = 0.15;

function bullet(x, z, vx, vz) {
  return { x, z, vx, vz, radius: BULLET_RADIUS };
}

export function ringBurst({ x, z, count = 12, speed = 4, phase = 0 }) {
  const bullets = [];
  for (let i = 0; i < count; i++) {
    const angle = phase + (i / count) * Math.PI * 2;
    bullets.push(bullet(x, z, Math.cos(angle) * speed, Math.sin(angle) * speed));
  }
  return bullets;
}

/** Three bullets aimed at the player. */
export function aimedFan({ x, z, targetX, targetZ, speed = 5, spread = 0.35 }) {
  const dx = targetX - x;
  const dz = targetZ - z;
  const baseAngle = Math.atan2(dz, dx);
  const bullets = [];

  for (const offset of [-spread, 0, spread]) {
    const angle = baseAngle + offset;
    bullets.push(bullet(x, z, Math.cos(angle) * speed, Math.sin(angle) * speed));
  }

  return bullets;
}

export const PATTERN_IDS = ["ring", "aimed"];

export const PATTERNS = {
  ring: ringBurst,
  aimed: aimedFan,
};

export const PATTERN_LABELS = {
  ring: "Ring burst",
  aimed: "Aimed fan",
};
