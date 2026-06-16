export const POWERUP_TYPES = {
  speed: { icon: '⚡', label: 'Velocidad', color: '#ffd23a', duration: 6000, kind: 'buff', weight: 3 },
  shield: { icon: '🛡️', label: 'Escudo', color: '#7ed4e0', duration: 0, kind: 'shield', weight: 2 },
  multiplier: { icon: '✖️2', label: 'Doble puntos', color: '#ff5da0', duration: 8000, kind: 'buff', weight: 2 },
  magnet: { icon: '🧲', label: 'Imán', color: '#c79bff', duration: 6000, kind: 'buff', weight: 2 },
  freeze: { icon: '❄️', label: 'Congelar', color: '#a0c4f0', duration: 5000, kind: 'buff', weight: 2 },
  gem: { icon: '💎', label: 'Gema', color: '#5dffb0', duration: 0, kind: 'instant', weight: 3 },
  purge: { icon: '🧹', label: 'Purga', color: '#ff8aa8', duration: 0, kind: 'purge', weight: 1 },
}

export const PORTAL = {
  icon: '🌀', label: 'Portal dimensional', duration: 60000, lifetime: 20000, spawnChance: 0.04,
}

const TYPE_KEYS = Object.keys(POWERUP_TYPES)

export function pickRandomPowerupType() {
  const total = TYPE_KEYS.reduce((sum, k) => sum + POWERUP_TYPES[k].weight, 0)
  let r = Math.random() * total
  for (const k of TYPE_KEYS) {
    r -= POWERUP_TYPES[k].weight
    if (r <= 0) return k
  }
  return TYPE_KEYS[0]
}

// One cell step toward target, used by the magnet buff to pull food/pickups closer to the snake head.
export function stepToward(pos, target) {
  const dx = target.x - pos.x, dy = target.y - pos.y
  if (dx === 0 && dy === 0) return pos
  if (Math.abs(dx) > Math.abs(dy)) return { x: pos.x + Math.sign(dx), y: pos.y }
  return { x: pos.x, y: pos.y + Math.sign(dy) }
}

export const GEM_BONUS_SCORE = 3
