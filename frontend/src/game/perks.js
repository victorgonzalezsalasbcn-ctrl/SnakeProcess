export const PERKS = [
  {
    id: 'thickSkin',
    name: 'Piel gruesa',
    desc: 'Ganas un escudo automático al empezar cada nueva etapa.',
    icon: '🪨',
    apply(run) { run.thickSkin = true },
  },
  {
    id: 'shortTail',
    name: 'Cola corta',
    desc: 'El snake crece más despacio: solo cada 2 manzanas.',
    icon: '✂️',
    apply(run) { run.growthEvery = (run.growthEvery || 1) + 1 },
  },
  {
    id: 'reflexes',
    name: 'Reflejos',
    desc: 'Buffer de giros ampliado: encadena direcciones sin perder ninguna.',
    icon: '🧠',
    apply(run) { run.inputBufferSize = (run.inputBufferSize || 1) + 1 },
  },
  {
    id: 'voracious',
    name: 'Hambre voraz',
    desc: '+50% puntos por cada manzana que comas.',
    icon: '🔥',
    apply(run) { run.scoreMultiplier = (run.scoreMultiplier || 1) * 1.5 },
  },
  {
    id: 'lightStep',
    name: 'Paso ligero',
    desc: 'Velocidad base permanentemente más lenta. Más control.',
    icon: '🪶',
    apply(run) { run.speedModMs = (run.speedModMs || 0) + 15 },
  },
  {
    id: 'enemySlower',
    name: 'Cazador',
    desc: 'Los enemigos se mueven más lento de forma permanente.',
    icon: '🎯',
    apply(run) { run.enemySlowFactor = (run.enemySlowFactor || 1) + 0.5 },
  },
  {
    id: 'greed',
    name: 'Avaricia',
    desc: 'Mayor probabilidad de que aparezcan power-ups en el tablero.',
    icon: '🪙',
    apply(run) { run.pickupChanceBonus = (run.pickupChanceBonus || 0) + 0.15 },
  },
]

export function pickRandomPerks(n) {
  const pool = [...PERKS]
  const picked = []
  while (picked.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length)
    picked.push(pool.splice(i, 1)[0])
  }
  return picked
}
