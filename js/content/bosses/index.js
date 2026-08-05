import { boxCaster } from "./boxCaster.js";
import { axeBrute } from "./axeBrute.js";

/** Default encounter boss — override with ?boss=boxCaster|axeBrute */
export const ACTIVE_BOSS_ID = "axeBrute";

/** Review order for the Next Boss button. */
export const BOSS_ORDER = ["boxCaster", "axeBrute"];

export const BOSSES = {
  boxCaster,
  axeBrute,
};

export function resolveInitialBossId() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("boss") ?? ACTIVE_BOSS_ID;
  return BOSSES[id] ? id : ACTIVE_BOSS_ID;
}

export function getBossDefById(id) {
  return BOSSES[id] ?? BOSSES[ACTIVE_BOSS_ID] ?? BOSSES.axeBrute;
}

export function getNextBossId(currentId) {
  const index = BOSS_ORDER.indexOf(currentId);
  const next = index === -1 ? 0 : (index + 1) % BOSS_ORDER.length;
  return BOSS_ORDER[next];
}

/** @deprecated use resolveInitialBossId + getBossDefById */
export function getActiveBossDef() {
  return getBossDefById(resolveInitialBossId());
}
