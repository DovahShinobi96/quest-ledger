// Cumulative points needed to reach level L: 10 * L * (L + 1) / 2 (triangular
// growth), so each level costs a bit more than the last.
function pointsForLevel(level) {
  return 10 * (level * (level + 1)) / 2;
}

export function getLevelProgress(lifetimePoints) {
  let level = 1;
  while (pointsForLevel(level) <= lifetimePoints) {
    level += 1;
  }

  const currentLevelFloor = level === 1 ? 0 : pointsForLevel(level - 1);
  const nextLevelCeiling = pointsForLevel(level);

  return {
    level,
    pointsIntoLevel: lifetimePoints - currentLevelFloor,
    pointsForNextLevel: nextLevelCeiling - currentLevelFloor,
  };
}
