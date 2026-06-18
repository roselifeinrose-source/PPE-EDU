export const XP_PER_LEVEL = 300

export function getLevel(totalXP) {
  return Math.floor((Math.sqrt(1 + 8 * totalXP / XP_PER_LEVEL) - 1) / 2) + 1
}

export function getXPForLevel(level) {
  return XP_PER_LEVEL * level * (level - 1) / 2
}

export function getLevelProgress(totalXP) {
  const level = getLevel(totalXP)
  const current = totalXP - getXPForLevel(level)
  const needed = getXPForLevel(level + 1) - getXPForLevel(level)
  return { current, needed, progress: needed > 0 ? (current / needed) * 100 : 0 }
}
