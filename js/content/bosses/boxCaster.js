/** Box Caster — stationary bullet + hazard boss. Data only. */
export const boxCaster = {
  id: "boxCaster",
  label: "Cinder Vex",
  spawn: { x: 0, z: -4 },
  visual: "boxCaster",
  movement: { kind: "stationary" },
  slots: {
    pattern: {
      abilityIds: ["ringBurst", "aimedFan"],
      interval: 0.8,
      cycleInterval: 3,
      params: { count: 12, speed: 4, phaseStep: 0.2 },
    },
    hazard: {
      abilityIds: ["markerVolley", "safeZoneRaid"],
      interval: 6,
      cycleInterval: 5,
      initialDelay: 2,
    },
  },
};
