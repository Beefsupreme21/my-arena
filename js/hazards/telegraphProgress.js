export function hazardProgress(elapsed, windup) {
  if (windup <= 0) return 1;
  return Math.min(1, elapsed / windup);
}
