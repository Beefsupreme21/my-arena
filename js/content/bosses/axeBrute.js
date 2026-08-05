/** Axe Brute — chase + melee boss. Data only. */
export const axeBrute = {
  id: "axeBrute",
  label: "Ironjaw",
  spawn: { x: -5, z: -3 },
  visual: "axeBrute",
  movement: { kind: "chase", speed: 3.2, slowRange: 2.8, slowFactor: 0.35 },
  slots: {
    melee: {
      abilityIds: ["axeSwing"],
      interval: 2.2,
      range: 2.8,
      initialDelay: 1.5,
    },
  },
};
