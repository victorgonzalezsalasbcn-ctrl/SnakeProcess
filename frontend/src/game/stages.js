export const APPLES_PER_STAGE = 10

export const STAGES = [
  {
    name: 'Bosque',
    icon: '🌲',
    enemyType: 'wanderer',
    speedMs: 220,
    theme: {
      bg: '#0f1f17', grid: 'rgba(255,255,255,0.04)',
      snakeHead: '#5aab7e', snakeBodyA: '#3d8a5f', snakeBodyB: '#2a6444',
      food: '#e87a8a', foodStem: '#6aaa66',
      enemy: '#e8906a', enemyBorder: '#c45a3a', enemyEye: '#fff',
      particle: '#f4c880', accent: '#5aab7e',
      overlayBg: 'rgba(10,20,15,0.93)', overlayText: '#d4f0e0', overlayMuted: '#6aaa88',
    },
  },
  {
    name: 'Desierto',
    icon: '🏜️',
    enemyType: 'hunter',
    speedMs: 195,
    theme: {
      bg: '#241a0f', grid: 'rgba(255,255,255,0.04)',
      snakeHead: '#e0b25a', snakeBodyA: '#c4903d', snakeBodyB: '#8f652a',
      food: '#e85a5a', foodStem: '#a3742a',
      enemy: '#c45a3a', enemyBorder: '#7a2e1a', enemyEye: '#fff',
      particle: '#ffe0a0', accent: '#e0b25a',
      overlayBg: 'rgba(24,16,8,0.93)', overlayText: '#f0e0c0', overlayMuted: '#b89a6a',
    },
  },
  {
    name: 'Hielo',
    icon: '❄️',
    enemyType: 'sprinter',
    speedMs: 170,
    theme: {
      bg: '#0c1a26', grid: 'rgba(255,255,255,0.06)',
      snakeHead: '#7ed4e0', snakeBodyA: '#4fa6c4', snakeBodyB: '#336a8a',
      food: '#f06a8a', foodStem: '#5aa0c4',
      enemy: '#a0c4f0', enemyBorder: '#5a82c4', enemyEye: '#0c1a26',
      particle: '#d0f0ff', accent: '#7ed4e0',
      overlayBg: 'rgba(8,18,28,0.93)', overlayText: '#dff4fb', overlayMuted: '#7aa8c0',
    },
  },
  {
    name: 'Lava',
    icon: '🌋',
    enemyType: 'phantom',
    speedMs: 150,
    theme: {
      bg: '#1f0a0a', grid: 'rgba(255,255,255,0.05)',
      snakeHead: '#ff8a4a', snakeBodyA: '#e85a2a', snakeBodyB: '#a8341a',
      food: '#ffd23a', foodStem: '#c4500a',
      enemy: '#8a2be2', enemyBorder: '#5a1a9e', enemyEye: '#ffe0a0',
      particle: '#ff5a2a', accent: '#ff8a4a',
      overlayBg: 'rgba(28,8,8,0.93)', overlayText: '#ffe0d0', overlayMuted: '#c47a5a',
    },
  },
  {
    name: 'Noche Cósmica',
    icon: '🌌',
    enemyType: 'swarm',
    speedMs: 135,
    theme: {
      bg: '#0a0a1f', grid: 'rgba(255,255,255,0.06)',
      snakeHead: '#c79bff', snakeBodyA: '#9a6bd6', snakeBodyB: '#6a3fa0',
      food: '#ffe066', foodStem: '#7a5fc0',
      enemy: '#ff5d8f', enemyBorder: '#c4316a', enemyEye: '#fff',
      particle: '#a0d8ff', accent: '#c79bff',
      overlayBg: 'rgba(8,8,24,0.93)', overlayText: '#e4dcff', overlayMuted: '#9a8ac0',
    },
  },
  {
    name: 'Caos',
    icon: '🌀',
    enemyType: 'swarm',
    speedMs: 115,
    theme: {
      bg: '#180a1f', grid: 'rgba(255,255,255,0.07)',
      snakeHead: '#ff5da0', snakeBodyA: '#e0316a', snakeBodyB: '#a31a4a',
      food: '#5dffb0', foodStem: '#a31a4a',
      enemy: '#ffcc33', enemyBorder: '#c4931a', enemyEye: '#180a1f',
      particle: '#ff8df0', accent: '#ff5da0',
      overlayBg: 'rgba(20,8,24,0.93)', overlayText: '#ffe0f0', overlayMuted: '#c08aac',
    },
  },
]

export function getStageIndex(score) {
  return Math.floor(score / APPLES_PER_STAGE)
}

export function getStage(score) {
  const idx = getStageIndex(score)
  const cycle = Math.floor(idx / STAGES.length)
  const base = STAGES[idx % STAGES.length]
  const speedMs = Math.max(70, base.speedMs - cycle * 12)
  return { ...base, index: idx, cycle, speedMs }
}
