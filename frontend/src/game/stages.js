export const APPLES_PER_STAGE = 10

export const STAGES = [
  {
    name: 'Bosque',
    icon: '🌲',
    enemyType: 'wanderer',
    speedMs: 220,
    theme: {
      bg: '#0d1a17', grid: 'rgba(255,255,255,0.05)',
      snakeHead: '#9dffd6', snakeBodyA: '#6df0c0', snakeBodyB: '#45c9a0',
      food: '#ff9ecf', foodStem: '#7df0c0',
      enemy: '#ffb8e6', enemyBorder: '#ff6fc6', enemyEye: '#1a0d17',
      particle: '#c8fff0', accent: '#6df0c0',
      overlayBg: 'rgba(13,26,23,0.93)', overlayText: '#e8fff5', overlayMuted: '#8be0c0',
    },
  },
  {
    name: 'Desierto',
    icon: '🏜️',
    enemyType: 'hunter',
    speedMs: 195,
    theme: {
      bg: '#1f160d', grid: 'rgba(255,255,255,0.05)',
      snakeHead: '#ffe39d', snakeBodyA: '#ffcf6d', snakeBodyB: '#f0a94a',
      food: '#ff8ab0', foodStem: '#f0c468',
      enemy: '#ffb6e0', enemyBorder: '#ff70c0', enemyEye: '#1f160d',
      particle: '#fff3c8', accent: '#ffcf6d',
      overlayBg: 'rgba(31,22,13,0.93)', overlayText: '#fff3e0', overlayMuted: '#e0b888',
    },
  },
  {
    name: 'Hielo',
    icon: '❄️',
    enemyType: 'sprinter',
    speedMs: 170,
    theme: {
      bg: '#0d1a1f', grid: 'rgba(255,255,255,0.07)',
      snakeHead: '#bdfbff', snakeBodyA: '#8fe4ff', snakeBodyB: '#5cb8e0',
      food: '#ff9ecf', foodStem: '#8fd4ff',
      enemy: '#c8b6ff', enemyBorder: '#9a7aff', enemyEye: '#0d1a1f',
      particle: '#e0fbff', accent: '#8fe4ff',
      overlayBg: 'rgba(13,26,31,0.93)', overlayText: '#e8feff', overlayMuted: '#8fc8d8',
    },
  },
  {
    name: 'Lava',
    icon: '🌋',
    enemyType: 'phantom',
    speedMs: 150,
    theme: {
      bg: '#1f0d17', grid: 'rgba(255,255,255,0.05)',
      snakeHead: '#ffb3d9', snakeBodyA: '#ff7ab8', snakeBodyB: '#e0489a',
      food: '#fff27a', foodStem: '#ff7ab8',
      enemy: '#c89dff', enemyBorder: '#9a5fff', enemyEye: '#fff3d0',
      particle: '#ff9ed0', accent: '#ff7ab8',
      overlayBg: 'rgba(31,13,23,0.93)', overlayText: '#ffe0f0', overlayMuted: '#e09abf',
    },
  },
  {
    name: 'Noche Cósmica',
    icon: '🌌',
    enemyType: 'swarm',
    speedMs: 135,
    theme: {
      bg: '#130d1f', grid: 'rgba(255,255,255,0.07)',
      snakeHead: '#e0c3ff', snakeBodyA: '#c79bff', snakeBodyB: '#9a6bd6',
      food: '#fff27a', foodStem: '#b18aff',
      enemy: '#ff9ec2', enemyBorder: '#ff5fa0', enemyEye: '#fff',
      particle: '#d8c0ff', accent: '#c79bff',
      overlayBg: 'rgba(19,13,31,0.93)', overlayText: '#f0e4ff', overlayMuted: '#b89adf',
    },
  },
  {
    name: 'Caos',
    icon: '🌀',
    enemyType: 'swarm',
    speedMs: 115,
    theme: {
      bg: '#1f0d1a', grid: 'rgba(255,255,255,0.08)',
      snakeHead: '#ff9ee8', snakeBodyA: '#ff6fd6', snakeBodyB: '#d63fb0',
      food: '#9effe0', foodStem: '#ff6fd6',
      enemy: '#ffe98a', enemyBorder: '#ffcc33', enemyEye: '#1f0d1a',
      particle: '#bafff0', accent: '#ff6fd6',
      overlayBg: 'rgba(31,13,26,0.93)', overlayText: '#ffe8fb', overlayMuted: '#d9a0c8',
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
